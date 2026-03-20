// src/screens/LoginScreen.js
// Finova v3.0 — Log In via JSON, Encrypted, or CSV backup

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ImageBackground, Modal, TextInput,
  TouchableOpacity, Dimensions, StatusBar, ActivityIndicator, Alert, Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp, DEFAULT_WALLET } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

// ─── XOR Encryption helpers ──────────────────────────────────────────────────
function decryptJson(encStr, password) {
  if (!encStr) return null;
  
  if (encStr.startsWith('FINOVA_ENC:')) {
    try {
      const key = Array.from(password).map(c => c.charCodeAt(0));
      const hex = encStr.slice(11);
      const chars = [];
      for (let i = 0; i < hex.length; i += 2) {
        const byte = parseInt(hex.slice(i, i + 2), 16);
        chars.push(String.fromCharCode(byte ^ key[(i / 2) % key.length]));
      }
      return decodeURIComponent(chars.join(''));
    } catch { return null; }
  }
  
  if (encStr.startsWith('FINOVA_ENC2:')) {
    try {
      const salt = encStr.slice(12, 18);
      const hex  = encStr.slice(18);
      let hash = 0;
      for (let i = 0; i < password.length; i++) hash = (hash << 5) - hash + password.charCodeAt(i);
      const key = Array.from(password + salt + hash).map(c => c.charCodeAt(0));
      
      const chars = [];
      for (let i = 0; i < hex.length; i += 2) {
        const byte = parseInt(hex.slice(i, i + 2), 16);
        const k = key[(i / 2) % key.length];
        const unshifted = (byte ^ k) - (i / 2);
        const c = (unshifted + 256000) % 256;
        chars.push(String.fromCharCode(c));
      }
      return decodeURIComponent(chars.join(''));
    } catch { return null; }
  }
  return null;
}

// ─── CSV Parser ──────────────────────────────────────────────────────────────
const parseCsvBackup = (csvStr) => {
  const lines = csvStr.split('\n').filter(l => l.trim());
  if (lines.length < 2) return null;
  const transactions = [];
  const wallets = [DEFAULT_WALLET];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const row = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
    if (!row || row.length < 4) continue;
    
    const [dateRaw, type, catRaw, amount, noteRaw, walletRaw] = row.map(s => s ? s.replace(/^"|"$/g, '').trim() : '');

    const wName = walletRaw || 'Personal';
    let wObj = wallets.find(w => w.name.toLowerCase() === wName.toLowerCase());
    if (!wObj) {
      wObj = { id: 'w_' + Date.now() + '_' + i, name: wName, icon: '💼', archived: false };
      wallets.push(wObj);
    }

    let date = new Date().toISOString();
    try {
      if (dateRaw.includes('/')) {
        const [d, m, y] = dateRaw.split('/');
        date = new Date(`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}T12:00:00Z`).toISOString();
      } else {
        date = new Date(dateRaw).toISOString();
      }
    } catch(e) {}

    transactions.push({
      id: (Date.now() + i).toString(),
      type: type.toLowerCase() === 'income' ? 'income' : 'expense',
      category: 'others',
      customCategory: catRaw,
      amount: parseFloat(amount) || 0,
      note: noteRaw || '',
      date,
      walletId: wObj.id
    });
  }
  return {
    transactions,
    settings: { name: 'Restored User', currency: '₹', darkMode: false, isPro: false },
    wallets,
    activeWalletId: 'default',
    customCategories: { expense: [], income: [] }
  };
};

// ─── Decrypt Modal ───────────────────────────────────────────────────────────
function DecryptModal({ visible, onCancel, onDecrypt }) {
  const [password, setPassword] = useState('');
  const [error,    setError   ] = useState('');
  const handleTry = () => {
    const success = onDecrypt(password);
    if (!success) { setError('Wrong password. Try again.'); setPassword(''); }
    else { setPassword(''); setError(''); }
  };
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onCancel}>
      <View style={cm.backdrop}>
        <View style={cm.sheet}>
          <View style={cm.handle} />
          <View style={cm.iconRing}><Text style={cm.iconEmoji}>🔑</Text></View>
          <Text style={cm.title}>Encrypted Backup</Text>
          <Text style={cm.body}>This backup is password-protected. Enter the password to restore.</Text>
          <TextInput
            style={cm.pinInput}
            value={password}
            onChangeText={setPassword}
            placeholder="Backup password"
            placeholderTextColor="rgba(255,255,255,0.25)"
            secureTextEntry
            autoFocus
          />
          {!!error && <Text style={cm.errorText}>{error}</Text>}
          <TouchableOpacity style={[cm.primaryBtn, { opacity: password ? 1 : 0.5 }]} onPress={handleTry} disabled={!password}>
            <Text style={cm.primaryBtnText}>Restore</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cm.ghostBtn} onPress={onCancel}>
            <Text style={cm.ghostBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function LoginScreen({ navigation }) {
  const { importData } = useApp();
  const [loading, setLoading] = useState(false);
  const [decryptOpen, setDecryptOpen] = useState(false);
  const [pendingEnc,  setPendingEnc ] = useState('');

  const finalizeImport = async (data) => {
    importData(data);
    await AsyncStorage.setItem('hasOnboarded', 'true');
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (result.canceled) { setLoading(false); return; }

      const fileUri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(fileUri);

      if (content.startsWith('FINOVA_ENC:')) {
        setPendingEnc(content);
        setDecryptOpen(true);
        setLoading(false);
        return;
      }

      if (result.assets[0].name.toLowerCase().endsWith('.csv') || content.includes('Date,Type,Category,Amount')) {
        const data = parseCsvBackup(content);
        if (data) { finalizeImport(data); return; }
      }

      const data = JSON.parse(content);
      if (!Array.isArray(data.transactions)) throw new Error('Invalid');
      finalizeImport(data);

    } catch (err) {
      setLoading(false);
      Alert.alert('Login Failed', 'Make sure you\'re using a valid Finova backup file (.json, .enc, or .csv).');
    }
  };

  const onDecrypt = (pw) => {
    const decrypted = decryptJson(pendingEnc, pw);
    if (!decrypted) return false;
    try {
      const data = JSON.parse(decrypted);
      if (!Array.isArray(data.transactions)) return false;
      setDecryptOpen(false);
      finalizeImport(data);
      return true;
    } catch { return false; }
  };

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground source={require('../../assets/background.png')} style={styles.bg} resizeMode="cover">
        <View style={styles.fullOverlay} />
        <View style={styles.content}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.iconWrap}><Text style={styles.iconEmoji}>🔐</Text></View>
          <Text style={styles.title}>Log In</Text>
          <View style={styles.titleAccent} />
          <Text style={styles.body}>Restore your Finova account from a previously downloaded backup file (JSON, Encrypted, or CSV).</Text>
          <View style={styles.callout}>
            <Text style={styles.calloutIcon}>📂</Text>
            <Text style={styles.calloutText}>Upload any <Text style={styles.calloutBold}>Finova backup file</Text> to recover your transactions and profile.</Text>
          </View>
          <TouchableOpacity style={[styles.btn, loading && styles.btnLoading]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#222629" /> : <Text style={styles.btnText}>Upload Backup File</Text>}
          </TouchableOpacity>
        </View>
      </ImageBackground>
      <DecryptModal visible={decryptOpen} onCancel={() => setDecryptOpen(false)} onDecrypt={onDecrypt} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg:   { flex: 1, width, height },
  fullOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.89)' },
  content: { flex: 1, paddingHorizontal: 32, paddingTop: 56, paddingBottom: 44, justifyContent: 'center' },
  backBtn:  { position: 'absolute', top: 56, left: 32 },
  backText: { fontFamily: 'Fungis-Regular', fontSize: 15, color: 'rgba(255,255,255,0.55)' },
  iconWrap:  { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(174,183,132,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  iconEmoji: { fontSize: 32 },
  title: { fontFamily: 'Fungis-Heavy', fontSize: 42, color: '#FFFFFF', marginBottom: 12 },
  titleAccent: { width: 44, height: 3, backgroundColor: '#AEB784', borderRadius: 2, marginBottom: 24 },
  body: { fontFamily: 'Fungis-Regular', fontSize: 15, color: 'rgba(255,255,255,0.62)', lineHeight: 25, marginBottom: 28 },
  callout: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: 'rgba(174,183,132,0.10)', borderWidth: 1, borderColor: 'rgba(174,183,132,0.28)', borderRadius: 14, padding: 16, marginBottom: 40 },
  calloutIcon: { fontSize: 20, marginTop: 1 },
  calloutText: { flex: 1, fontFamily: 'Fungis-Regular', fontSize: 13, color: 'rgba(255,255,255,0.60)', lineHeight: 21 },
  calloutBold: { fontFamily: 'Fungis-Bold', color: '#AEB784' },
  btn: { backgroundColor: '#AEB784', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  btnLoading: { opacity: 0.7 },
  btnText: { fontFamily: 'Fungis-Bold', fontSize: 16, color: '#222629', letterSpacing: 0.6 },
});

const cm = StyleSheet.create({
  backdrop:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  sheet:        { backgroundColor: '#2C3020', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 28, borderWidth: 1, borderColor: 'rgba(174,183,132,0.18)' },
  handle:       { width: 38, height: 4, borderRadius: 2, backgroundColor: 'rgba(174,183,132,0.35)', alignSelf: 'center', marginTop: 12, marginBottom: 24 },
  iconRing:     { alignSelf: 'center', width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(174,183,132,0.12)', borderWidth: 1.5, borderColor: 'rgba(174,183,132,0.30)', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  iconEmoji:    { fontSize: 28 },
  title:        { fontFamily: 'Fungis-Heavy', fontSize: 22, color: '#FFFFFF', textAlign: 'center', marginBottom: 12 },
  body:         { fontFamily: 'Fungis-Regular', fontSize: 13, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  pinInput:     { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontFamily: 'Fungis-Bold', fontSize: 16, color: '#FFFFFF', textAlign: 'center', borderWidth: 1, borderColor: 'rgba(174,183,132,0.20)', marginBottom: 8 },
  errorText:    { fontFamily: 'Fungis-Regular', fontSize: 12, color: '#D4918F', textAlign: 'center', marginBottom: 16 },
  primaryBtn:   { backgroundColor: '#AEB784', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 12 },
  primaryBtnText: { fontFamily: 'Fungis-Bold', fontSize: 15, color: '#222629' },
  ghostBtn:     { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  ghostBtnText: { fontFamily: 'Fungis-Regular', fontSize: 14, color: 'rgba(255,255,255,0.40)' },
});
