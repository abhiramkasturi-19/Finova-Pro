// src/screens/SettingsScreen.js
// Finova v3.0 — Pro badge · App Lock · CSV Export · Passcode Export · Wallets · Upgrade row

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Switch, Image, ImageBackground, Dimensions, Modal, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path } from 'react-native-svg';
import { useApp, DEFAULT_WALLET } from '../context/AppContext';
import { lightColors, darkColors, spacing, radius, fonts } from '../theme/theme';

const { width, height } = Dimensions.get('window');

const CURRENCIES = [
  { sym: '$', label: 'USD' },
  { sym: '₹', label: 'INR' },
  { sym: '€', label: 'EUR' },
  { sym: '£', label: 'GBP' },
];

// ─── XOR Encryption helpers ──────────────────────────────────────────────────
function encryptJson(jsonStr, password) {
  try {
    const salt = Math.random().toString(36).substring(2, 8).padEnd(6, '0');
    let hash = 0;
    for (let i = 0; i < password.length; i++) hash = (hash << 5) - hash + password.charCodeAt(i);
    const key = Array.from(password + salt + hash).map(c => c.charCodeAt(0));

    const encoded = encodeURIComponent(jsonStr);
    const hex = Array.from(encoded).map((c, i) => {
      const k = key[i % key.length];
      const shifted = (c.charCodeAt(0) + i) % 256;
      return (shifted ^ k).toString(16).padStart(2, '0');
    }).join('');
    return 'FINOVA_ENC2:' + salt + hex;
  } catch { return null; }
}

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
      const hex = encStr.slice(18);
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
const parseCsvBackup = (csvStr, existingWallets = []) => {
  const lines = csvStr.split('\n').filter(l => l.trim());
  if (lines.length < 2) return null;
  const transactions = [];
  const wallets = [...existingWallets];

  if (wallets.length === 0) wallets.push(DEFAULT_WALLET);

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
        date = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T12:00:00Z`).toISOString();
      } else {
        date = new Date(dateRaw).toISOString();
      }
    } catch (e) { }

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
    settings: null,
    wallets,
    activeWalletId: 'default',
    customCategories: { expense: [], income: [] }
  };
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function EditIcon({ color, size = 18 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 18L19.9999 19.094C19.4695 19.6741 18.7502 20 18.0002 20C17.2501 20 16.5308 19.6741 16.0004 19.094C15.4693 18.5151 14.75 18.1901 14.0002 18.1901C13.2504 18.1901 12.5312 18.5151 12 19.094M3.00003 20H4.67457C5.16376 20 5.40835 20 5.63852 19.9447C5.84259 19.8957 6.03768 19.8149 6.21663 19.7053C6.41846 19.5816 6.59141 19.4086 6.93732 19.0627L19.5001 6.49998C20.3285 5.67156 20.3285 4.32841 19.5001 3.49998C18.6716 2.67156 17.3285 2.67156 16.5001 3.49998L3.93729 16.0627C3.59139 16.4086 3.41843 16.5816 3.29475 16.7834C3.18509 16.9624 3.10428 17.1574 3.05529 17.3615C3.00003 17.5917 3.00003 17.8363 3.00003 18.3255V20Z"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function CameraIcon({ color }) {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 17a4 4 0 1 0 0-8 4 4 0 1 0 0 8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── PIN Setup Modal ──────────────────────────────────────────────────────────
function PinSetupModal({ visible, onCancel, onSave }) {
  const [step, setStep] = useState(1);
  const [pin1, setPin1] = useState('');
  const [pin2, setPin2] = useState('');
  const [error, setError] = useState('');
  const reset = () => { setStep(1); setPin1(''); setPin2(''); setError(''); };
  const handleNext = () => {
    if (pin1.length !== 4) { setError('PIN must be 4 digits'); return; }
    setStep(2); setPin2(''); setError('');
  };
  const handleConfirm = () => {
    if (pin2 !== pin1) { setError('PINs do not match'); setPin2(''); return; }
    onSave(pin1); reset();
  };
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onCancel}>
      <View style={cm.backdrop}>
        <View style={cm.sheet}>
          <View style={cm.handle} />
          <View style={cm.iconRing}><Text style={cm.iconEmoji}>🔒</Text></View>
          <Text style={cm.title}>{step === 1 ? 'Set App PIN' : 'Confirm PIN'}</Text>
          <Text style={cm.body}>{step === 1 ? 'Enter a 4-digit PIN to lock Finova.' : 'Re-enter your PIN to verify.'}</Text>
          <TextInput style={cm.pinInput} value={step === 1 ? pin1 : pin2} onChangeText={step === 1 ? setPin1 : setPin2} keyboardType="number-pad" maxLength={4} secureTextEntry placeholder="····" placeholderTextColor="rgba(255,255,255,0.2)" autoFocus />
          {!!error && <Text style={cm.errorText}>{error}</Text>}
          <TouchableOpacity style={[cm.primaryBtn, { opacity: (step === 1 ? pin1 : pin2).length === 4 ? 1 : 0.5 }]} onPress={step === 1 ? handleNext : handleConfirm} disabled={(step === 1 ? pin1 : pin2).length !== 4}>
            <Text style={cm.primaryBtnText}>{step === 1 ? 'Next' : 'Enable Lock'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cm.ghostBtn} onPress={() => { reset(); onCancel(); }}><Text style={cm.ghostBtnText}>Cancel</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Passcode Export Modal ────────────────────────────────────────────────────
function PasscodeExportModal({ visible, onCancel, onExport }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const reset = () => { setPassword(''); setConfirm(''); setError(''); };
  const handleExport = () => {
    if (password.length < 4) { setError('Minimum 4 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    onExport(password); reset();
  };
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onCancel}>
      <View style={cm.backdrop}>
        <View style={cm.sheet}>
          <View style={cm.handle} />
          <View style={cm.iconRing}><Text style={cm.iconEmoji}>🔐</Text></View>
          <Text style={cm.title}>Secure Export</Text>
          <Text style={cm.body}>Set a password to encrypt your backup file.</Text>
          <TextInput style={cm.pinInput} value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="rgba(255,255,255,0.2)" secureTextEntry autoFocus />
          <TextInput style={[cm.pinInput, { marginTop: 10 }]} value={confirm} onChangeText={setConfirm} placeholder="Confirm" placeholderTextColor="rgba(255,255,255,0.2)" secureTextEntry />
          {!!error && <Text style={cm.errorText}>{error}</Text>}
          <TouchableOpacity style={[cm.primaryBtn, { opacity: password && confirm ? 1 : 0.5 }]} onPress={handleExport} disabled={!password || !confirm}>
            <Text style={cm.primaryBtnText}>Encrypt & Export</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cm.ghostBtn} onPress={() => { reset(); onCancel(); }}><Text style={cm.ghostBtnText}>Cancel</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Decrypt Import Modal ─────────────────────────────────────────────────────
function DecryptImportModal({ visible, onCancel, onDecrypt }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const handleTry = () => {
    const success = onDecrypt(password);
    if (!success) { setError('Incorrect password'); setPassword(''); }
    else { setPassword(''); setError(''); }
  };
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onCancel}>
      <View style={cm.backdrop}>
        <View style={cm.sheet}>
          <View style={cm.handle} />
          <View style={cm.iconRing}><Text style={cm.iconEmoji}>🔑</Text></View>
          <Text style={cm.title}>Encrypted Backup</Text>
          <Text style={cm.body}>Enter the password used to encrypt this file.</Text>
          <TextInput style={cm.pinInput} value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="rgba(255,255,255,0.2)" secureTextEntry autoFocus />
          {!!error && <Text style={cm.errorText}>{error}</Text>}
          <TouchableOpacity style={[cm.primaryBtn, { opacity: password ? 1 : 0.5 }]} onPress={handleTry} disabled={!password}>
            <Text style={cm.primaryBtnText}>Restore</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cm.ghostBtn} onPress={() => { setPassword(''); setError(''); onCancel(); }}><Text style={cm.ghostBtnText}>Cancel</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Log Out Modal ────────────────────────────────────────────────────────────
function LogoutModal({ visible, onCancel, onLogoutOnly, onDownloadLogout, isPro, onUpgrade }) {
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onCancel}>
      <View style={cm.backdrop}>
        <View style={cm.sheet}>
          <View style={cm.handle} />
          <View style={cm.iconRing}><Text style={cm.iconEmoji}>🚪</Text></View>
          <Text style={cm.title}>Log Out</Text>
          <Text style={{ fontFamily: 'Fungis-Regular', fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 24, paddingHorizontal: 12 }}>
            Your data is only stored locally. How would you like to proceed?
          </Text>

          <TouchableOpacity
            style={[cm.primaryBtn, { flexDirection: 'column', alignItems: 'center', marginBottom: 12, paddingVertical: 14 }]}
            onPress={() => isPro ? onDownloadLogout() : onUpgrade()}
          >
            <Text style={cm.primaryBtnText}>📥 Log Out with Download {!isPro && '👑'}</Text>
            <Text style={{ fontFamily: 'Fungis-Regular', fontSize: 11, color: 'rgba(34,38,41,0.65)', marginTop: 2 }}>
              Saves a backup JSON file before logging out.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[cm.destructiveBtn, { flexDirection: 'column', alignItems: 'center', marginBottom: 16, paddingVertical: 14 }]}
            onPress={onLogoutOnly}
          >
            <Text style={cm.destructiveBtnText}>Log Out without Download</Text>
            <Text style={{ fontFamily: 'Fungis-Regular', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
              Returns you to the welcome screen instantly.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={cm.ghostBtn} onPress={onCancel}>
            <Text style={cm.ghostBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Clear All Data Modal ─────────────────────────────────────────────────────
function ClearDataModal({ visible, onCancel, onConfirm }) {
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onCancel}>
      <View style={cm.backdrop}>
        <View style={cm.sheet}>
          <View style={cm.handle} />
          <View style={[cm.iconRing, cm.iconRingDanger]}><Text style={cm.iconEmoji}>🗑️</Text></View>
          <Text style={cm.title}>Clear All Data</Text>
          <Text style={cm.body}>This will permanently delete all transactions. Your profile and settings will remain.</Text>
          <TouchableOpacity style={cm.destructiveBtn} onPress={onConfirm}><Text style={cm.destructiveBtnText}>Yes, Clear Everything</Text></TouchableOpacity>
          <TouchableOpacity style={cm.ghostBtn} onPress={onCancel}><Text style={cm.ghostBtnText}>Cancel</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Message Modal ────────────────────────────────────────────────────────────
function MessageModal({ visible, type, title, message, onOk }) {
  const isError = type === 'error';
  const ringStyle = isError ? cm.iconRingDanger : cm.iconRing;
  const icon = isError ? '⚠️' : '✅';
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onOk}>
      <View style={[cm.backdrop, { justifyContent: 'center', padding: 28 }]}>
        <View style={[cm.sheet, { borderRadius: 28, paddingBottom: 28, width: '100%', paddingTop: 28 }]}>
          <View style={ringStyle}><Text style={cm.iconEmoji}>{icon}</Text></View>
          <Text style={cm.title}>{title}</Text>
          <Text style={cm.body}>{message}</Text>
          <TouchableOpacity style={[cm.primaryBtn, { width: '100%', marginBottom: 0 }]} onPress={onOk}>
            <Text style={cm.primaryBtnText}>Okay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Restore Confirm Modal ────────────────────────────────────────────────────
function RestoreConfirmModal({ visible, onCancel, onConfirm }) {
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onCancel}>
      <View style={cm.backdrop}>
        <View style={cm.sheet}>
          <View style={cm.handle} />
          <View style={[cm.iconRing, { backgroundColor: 'rgba(174,183,132,0.15)', borderColor: 'rgba(174,183,132,0.35)' }]}><Text style={cm.iconEmoji}>📂</Text></View>
          <Text style={cm.title}>Restore Data</Text>
          <Text style={cm.body}>Replace your current data with this backup?</Text>
          <TouchableOpacity style={[cm.primaryBtn, { marginBottom: 12 }]} onPress={onConfirm}><Text style={cm.primaryBtnText}>Yes, Restore</Text></TouchableOpacity>
          <TouchableOpacity style={cm.ghostBtn} onPress={onCancel}><Text style={cm.ghostBtnText}>Cancel</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SettingsScreen({ navigation }) {
  const {
    transactions, settings, customCategories,
    wallets, activeWalletId,
    updateSettings, toggleDarkMode, updatePro, importData, dispatch, isPro, state,
  } = useApp();

  const [showDataManager, setShowDataManager] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editCurrency, setEditCurrency] = useState('');
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [pinSetupOpen, setPinSetupOpen] = useState(false);
  const [passExportOpen, setPassExportOpen] = useState(false);
  const [decryptModalOpen, setDecryptModalOpen] = useState(false);
  const [pendingEncContent, setPendingEncContent] = useState('');
  const [restoreConfirmData, setRestoreConfirmData] = useState(null);
  const [messageModal, setMessageModal] = useState(null);

  const colors = settings.darkMode ? darkColors : lightColors;
  const overlayColor = settings.darkMode ? 'rgba(0,0,0,0.82)' : 'rgba(44,51,32,0.55)';
  const s = makeStyles(colors);

  const openEdit = () => { setEditName(settings.name || ''); setEditAge(settings.age || ''); setEditImage(settings.profileImage || ''); setEditCurrency(settings.currency || '₹'); setEditMode(true); };
  const saveEdit = () => { updateSettings({ name: editName.trim(), age: editAge.trim(), profileImage: editImage, currency: editCurrency }); setEditMode(false); };
  const cancelEdit = () => setEditMode(false);

  const pickProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { setMessageModal({ type: 'error', title: 'Permission needed', message: 'Allow photo access to change your profile picture.' }); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.45, base64: true });
    if (!result.canceled && result.assets[0].base64) setEditImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
  };

  const handleDownload = async () => {
    try {
      const data = JSON.stringify({ transactions, settings, customCategories, wallets, activeWalletId }, null, 2);
      const fileUri = FileSystem.cacheDirectory + 'finova_backup.json';
      await FileSystem.writeAsStringAsync(fileUri, data);
      await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Save Finova backup' });
    } catch { setMessageModal({ type: 'error', title: 'Error', message: 'Failed to generate backup' }); }
  };

  const handleCsvExport = async () => {
    try {
      const header = 'Date,Type,Category,Amount,Note,Wallet\n';
      const rows = transactions.map(t => {
        const w = (wallets || []).find(w => w.id === (t.walletId || 'default'))?.name || 'Personal';
        const cat = (t.customCategory?.trim() || t.category).replace(/"/g, '""');
        const note = (t.note || '').replace(/"/g, '""');
        const date = new Date(t.date).toLocaleDateString('en-IN');
        return `"${date}","${t.type}","${cat}","${t.amount}","${note}","${w}"`;
      }).join('\n');
      const fileUri = FileSystem.cacheDirectory + 'finova_transactions.csv';
      await FileSystem.writeAsStringAsync(fileUri, header + rows);
      await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Export CSV' });
    } catch { setMessageModal({ type: 'error', title: 'Error', message: 'Failed to export CSV' }); }
  };

  const handlePasscodeExport = async (password) => {
    setPassExportOpen(false);
    try {
      const raw = JSON.stringify({ transactions, settings, customCategories, wallets, activeWalletId });
      const enc = encryptJson(raw, password);
      if (!enc) throw new Error();
      const fileUri = FileSystem.cacheDirectory + 'finova_backup.enc';
      await FileSystem.writeAsStringAsync(fileUri, enc);
      await Sharing.shareAsync(fileUri, { mimeType: 'application/octet-stream', dialogTitle: 'Save encrypted backup' });
    } catch { setMessageModal({ type: 'error', title: 'Error', message: 'Encryption failed' }); }
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (result.canceled) return;
      const content = await FileSystem.readAsStringAsync(result.assets[0].uri);

      if (content.startsWith('FINOVA_ENC:')) {
        setPendingEncContent(content);
        setDecryptModalOpen(true);
        return;
      }

      let imported = null;
      if (result.assets[0].name.toLowerCase().endsWith('.csv') || content.includes('Date,Type,Category,Amount')) {
        imported = parseCsvBackup(content, wallets);
      } else {
        imported = JSON.parse(content);
      }

      if (!imported || !Array.isArray(imported.transactions)) throw new Error();

      setRestoreConfirmData(imported);
    } catch { setMessageModal({ type: 'error', title: 'Error', message: 'Invalid backup file' }); }
  };

  const confirmRestore = () => {
    const imported = restoreConfirmData;
    setRestoreConfirmData(null);
    if (!imported.settings) {
      dispatch({
        type: 'LOAD_DATA',
        payload: {
          ...state,
          transactions: [...transactions, ...imported.transactions],
          wallets: imported.wallets
        }
      });
      setMessageModal({ type: 'success', title: 'Success', message: 'Transactions imported from CSV' });
    } else {
      importData(imported);
      setMessageModal({ type: 'success', title: 'Success', message: 'Data restored successfully' });
    }
  };

  const handleDecryptImport = (password) => {
    const decrypted = decryptJson(pendingEncContent, password);
    if (!decrypted) return false;
    try {
      const imported = JSON.parse(decrypted);
      if (!imported.transactions) return false;
      setDecryptModalOpen(false);
      setPendingEncContent('');
      importData(imported);
      setMessageModal({ type: 'success', title: 'Success', message: 'Encrypted backup restored' });
      return true;
    } catch { return false; }
  };

  const executeClear = async () => {
    setClearModalOpen(false);
    const cleared = {
      transactions: [],
      settings: { ...settings },
      customCategories,
      wallets,
      activeWalletId,
    };
    await AsyncStorage.setItem('@flo_data', JSON.stringify(cleared));
    dispatch({ type: 'LOAD_DATA', payload: cleared });
  };

  const performLogout = async () => {
    setLogoutModalOpen(false);
    await AsyncStorage.clear();
    dispatch({ type: 'RESET_APP' });
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  const handleDownloadThenLogout = async () => {
    await handleDownload();
    await performLogout();
  };

  const displayName = settings.name || 'Your Name';
  const displayMeta = `${settings.age ? `Age ${settings.age}` : 'Age not set'} · ${settings.currency} ${CURRENCIES.find(c => c.sym === settings.currency)?.label ?? ''}`;
  const profileImage = settings.profileImage || '';
  const initials = (settings.name || 'A')[0].toUpperCase();
  const activeWallet = (wallets || []).find(w => w.id === activeWalletId);

  return (
    <View style={s.root}>
      <ImageBackground source={require('../../assets/background.png')} style={s.bg} resizeMode="cover">
        <View style={[s.overlay, { backgroundColor: overlayColor }]} />
        <SafeAreaView style={s.safe}>
          <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
            <Text style={s.title}>Settings</Text>
            <Text style={s.subtitle}>Your profile & preferences</Text>

            <View style={s.profileCard}>
              {!editMode ? (
                <>
                  <View style={s.profileRow}>
                    <View style={s.avatarWrap}>
                      {profileImage ? <Image source={{ uri: profileImage }} style={s.avatarImg} /> : <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>}
                    </View>
                    <View style={s.profileInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={s.profileName}>{displayName}</Text>
                        {isPro && <View style={s.proBadge}><Text style={s.proBadgeText}>👑 PRO</Text></View>}
                      </View>
                      <Text style={s.profileMeta}>{displayMeta}</Text>
                      {activeWallet && activeWalletId !== 'default' && <Text style={s.profileWallet}>{activeWallet.icon} {activeWallet.name}</Text>}
                    </View>
                  </View>
                  <TouchableOpacity style={s.editIconBtn} onPress={openEdit} activeOpacity={0.7}><EditIcon color={colors.textMuted} size={17} /><Text style={s.editIconLabel}>Edit Profile</Text></TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={s.editModeTitle}>Edit Profile</Text>
                  <TouchableOpacity style={s.editAvatarBtn} onPress={pickProfileImage} activeOpacity={0.8}>
                    {editImage ? <Image source={{ uri: editImage }} style={s.editAvatarImg} /> : <View style={s.editAvatarPlaceholder}><Text style={s.editAvatarInitials}>{initials}</Text></View>}
                    <View style={s.cameraBadge}><CameraIcon color={colors.activePill} /></View>
                  </TouchableOpacity>
                  <TextInput style={s.editInput} value={editName} onChangeText={setEditName} placeholder="Name" placeholderTextColor={colors.textMuted} />
                  <TextInput style={s.editInput} value={editAge} onChangeText={v => setEditAge(v.replace(/[^0-9]/g, ''))} placeholder="Age" keyboardType="number-pad" placeholderTextColor={colors.textMuted} />
                  <View style={s.currencyChipsRow}>
                    {CURRENCIES.map(c => (
                      <TouchableOpacity key={c.sym} style={[s.currencyChip, editCurrency === c.sym && s.currencyChipActive]} onPress={() => setEditCurrency(c.sym)}>
                        <Text style={[s.currencyChipText, editCurrency === c.sym && s.currencyChipTextActive]}>{c.sym}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={s.editActions}>
                    <TouchableOpacity style={s.cancelBtn} onPress={cancelEdit}><Text style={s.cancelBtnText}>Cancel</Text></TouchableOpacity>
                    <TouchableOpacity style={s.saveBtn} onPress={saveEdit}><Text style={s.saveBtnText}>Save</Text></TouchableOpacity>
                  </View>
                </>
              )}
            </View>

            <Text style={s.sectionLabel}>PREFERENCES</Text>
            <View style={s.card}>
              <View style={s.row}>
                <View style={[s.iconBox, { backgroundColor: colors.surface2 }]}><Text>🌙</Text></View>
                <View style={s.rowInfo}><Text style={s.rowLabel}>Dark Mode</Text></View>
                <Switch value={settings.darkMode} onValueChange={toggleDarkMode} trackColor={{ false: colors.border, true: colors.accentDark }} thumbColor={settings.darkMode ? colors.accent : colors.surface2} />
              </View>
              <TouchableOpacity style={[s.row, { borderBottomWidth: 0 }]} onPress={() => !isPro && navigation.navigate('ProPaywall')} activeOpacity={0.7}>
                <View style={[s.iconBox, { backgroundColor: colors.surface2 }]}><Text>🔒</Text></View>
                <View style={s.rowInfo}><Text style={s.rowLabel}>App Lock</Text><Text style={s.rowHint}>{settings.appLockEnabled ? 'Active' : 'Locked'}</Text></View>
                {isPro ? <Switch value={settings.appLockEnabled} onValueChange={v => v ? setPinSetupOpen(true) : updateSettings({ appLockEnabled: false, appLockPin: '' })} /> : <Text style={s.rowMuted}>›</Text>}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.sectionHeader} onPress={() => setShowDataManager(!showDataManager)} activeOpacity={0.7}>
              <Text style={s.sectionLabel}>DATA MANAGEMENT</Text>
              <Text style={s.chevron}>{showDataManager ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {showDataManager && (
              <View style={s.card}>
                <TouchableOpacity style={s.row} onPress={isPro ? handleDownload : () => navigation.navigate('ProPaywall')} activeOpacity={0.7}>
                  <View style={[s.iconBox, { backgroundColor: colors.surface2 }]}><Text>📥</Text></View>
                  <View style={s.rowInfo}><Text style={s.rowLabel}>Backup (JSON)</Text><Text style={s.rowHint}>Full account recovery</Text></View>
                  {!isPro && <Text style={s.rowMuted}>›</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={s.row} onPress={isPro ? handleCsvExport : () => navigation.navigate('ProPaywall')} activeOpacity={0.7}>
                  <View style={[s.iconBox, { backgroundColor: colors.surface2 }]}><Text>📊</Text></View>
                  <View style={s.rowInfo}><Text style={s.rowLabel}>Export CSV</Text><Text style={s.rowHint}>For Excel / Sheets</Text></View>
                  {!isPro && <Text style={s.rowMuted}>›</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={s.row} onPress={isPro ? () => setPassExportOpen(true) : () => navigation.navigate('ProPaywall')} activeOpacity={0.7}>
                  <View style={[s.iconBox, { backgroundColor: colors.surface2 }]}><Text>🔐</Text></View>
                  <View style={s.rowInfo}><Text style={s.rowLabel}>Passcode Export</Text><Text style={s.rowHint}>Encrypted .enc file</Text></View>
                  {!isPro && <Text style={s.rowMuted}>›</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={s.row} onPress={handleUpload} activeOpacity={0.7}>
                  <View style={[s.iconBox, { backgroundColor: colors.surface2 }]}><Text>📤</Text></View>
                  <View style={s.rowInfo}><Text style={s.rowLabel}>Upload / Restore</Text><Text style={s.rowHint}>JSON, CSV, or Encrypted</Text></View>
                </TouchableOpacity>
                <TouchableOpacity style={[s.row, { borderBottomWidth: 0 }]} onPress={() => setClearModalOpen(true)} activeOpacity={0.7}>
                  <View style={[s.iconBox, { backgroundColor: colors.wineRed + '22' }]}><Text>🗑️</Text></View>
                  <View style={s.rowInfo}><Text style={[s.rowLabel, { color: colors.wineRed }]}>Clear Transactions</Text></View>
                </TouchableOpacity>
              </View>
            )}

            <Text style={s.sectionLabel}>APP</Text>
            <View style={s.card}>
              <TouchableOpacity style={s.row} onPress={() => navigation.navigate('Wallets')} activeOpacity={0.7}>
                <View style={[s.iconBox, { backgroundColor: colors.surface2 }]}><Text>👛</Text></View>
                <View style={s.rowInfo}><Text style={s.rowLabel}>Wallets</Text></View>
                <Text style={s.rowMuted}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.row} onPress={() => navigation.navigate('AppGuide')} activeOpacity={0.7}>
                <View style={[s.iconBox, { backgroundColor: colors.surface2 }]}><Text>📖</Text></View>
                <View style={s.rowInfo}><Text style={s.rowLabel}>App Guide</Text></View>
                <Text style={s.rowMuted}>›</Text>
              </TouchableOpacity>
              {!isPro && (
                <TouchableOpacity style={[s.row, { borderBottomWidth: 0 }]} onPress={() => navigation.navigate('ProPaywall')} activeOpacity={0.7}>
                  <View style={[s.iconBox, { backgroundColor: '#AEB78422' }]}><Text>👑</Text></View>
                  <View style={s.rowInfo}><Text style={[s.rowLabel, { color: '#AEB784' }]}>Upgrade to Pro</Text></View>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity style={s.logoutBtn} onPress={() => setLogoutModalOpen(true)} activeOpacity={0.8}><Text style={s.logoutText}>Log Out</Text></TouchableOpacity>

            <View style={s.creditBlock}>
              <Text style={s.creditMadeBy}>crafted by</Text>
              <Text style={s.creditName}>Abhiram Kasturi</Text>
              <Text style={s.creditFinova}>Finova · v3.0.2</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>

      <LogoutModal
        visible={logoutModalOpen}
        onCancel={() => setLogoutModalOpen(false)}
        onLogoutOnly={performLogout}
        onDownloadLogout={handleDownloadThenLogout}
        isPro={isPro}
        onUpgrade={() => {
          setLogoutModalOpen(false);
          navigation.navigate('ProPaywall');
        }}
      />
      <ClearDataModal visible={clearModalOpen} onCancel={() => setClearModalOpen(false)} onConfirm={executeClear} />
      <PinSetupModal visible={pinSetupOpen} onCancel={() => setPinSetupOpen(false)} onSave={p => { updateSettings({ appLockEnabled: true, appLockPin: p }); setPinSetupOpen(false); }} />
      <PasscodeExportModal visible={passExportOpen} onCancel={() => setPassExportOpen(false)} onExport={handlePasscodeExport} />
      <DecryptImportModal visible={decryptModalOpen} onCancel={() => { setDecryptModalOpen(false); setPendingEncContent(''); }} onDecrypt={handleDecryptImport} />
      <RestoreConfirmModal visible={!!restoreConfirmData} onCancel={() => setRestoreConfirmData(null)} onConfirm={confirmRestore} />
      <MessageModal
        visible={!!messageModal}
        type={messageModal?.type}
        title={messageModal?.title}
        message={messageModal?.message}
        onOk={() => setMessageModal(null)}
      />
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg: { width, height: '100%', flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject },
  safe: { flex: 1, paddingBottom: -100, paddingTop: -50 },
  content: { padding: spacing.lg, paddingTop: spacing.xl + 50, paddingBottom: 100 },
  title: { fontSize: 26, color: colors.white, fontFamily: fonts.heavy },
  subtitle: { fontSize: 13, color: colors.white, marginBottom: spacing.lg, fontFamily: fonts.regular },
  profileCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.accent },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarWrap: { flexShrink: 0 },
  avatarImg: { width: 80, height: 80, borderRadius: 40 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, color: colors.activePill, fontFamily: fonts.bold },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, color: colors.textPrimary, fontFamily: fonts.heavy },
  profileMeta: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
  profileWallet: { fontSize: 11, color: colors.accent, marginTop: 4, fontFamily: fonts.bold },
  proBadge: { backgroundColor: '#AEB78422', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: '#AEB78466' },
  proBadgeText: { fontSize: 10, color: '#AEB784', fontFamily: fonts.bold },
  editIconBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  editIconLabel: { fontSize: 12, color: colors.textMuted },
  editModeTitle: { fontSize: 16, color: colors.textPrimary, fontFamily: fonts.heavy, marginBottom: 18 },
  editAvatarBtn: { alignSelf: 'center', position: 'relative', marginBottom: 20 },
  editAvatarImg: { width: 80, height: 80, borderRadius: 40 },
  editAvatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  editAvatarInitials: { fontSize: 28, color: colors.activePill, fontFamily: fonts.heavy },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.surface },
  editInput: { backgroundColor: colors.surface2, borderRadius: radius.md, padding: 12, color: colors.textPrimary, fontFamily: fonts.bold, marginBottom: 12 },
  currencyChipsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  currencyChip: { padding: 10, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, width: 44, alignItems: 'center' },
  currencyChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  currencyChipText: { color: colors.textMuted, fontFamily: fonts.bold },
  currencyChipTextActive: { color: colors.activePill },
  editActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  cancelBtnText: { color: colors.textMuted, fontFamily: fonts.bold },
  saveBtn: { flex: 1, padding: 12, borderRadius: radius.md, backgroundColor: colors.accent, alignItems: 'center' },
  saveBtnText: { color: colors.activePill, fontFamily: fonts.bold },
  sectionLabel: { fontSize: 11, color: colors.white, letterSpacing: 1, paddingBottom: 10, fontFamily: fonts.bold },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  chevron: { fontSize: 10, color: colors.white },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: spacing.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 },
  iconBox: { width: 38, height: 38, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 13, color: colors.textPrimary, fontFamily: fonts.bold },
  rowHint: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  rowMuted: { fontSize: 14, color: colors.textMuted },
  logoutBtn: { backgroundColor: colors.wineRed, padding: 15, borderRadius: radius.lg, alignItems: 'center', marginBottom: 32 },
  logoutText: { color: '#fff', fontFamily: fonts.bold, fontSize: 15 },
  creditBlock: { alignItems: 'center', paddingBottom: 40 },
  creditMadeBy: { fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 },
  creditName: { fontSize: 16, color: '#AEB784', fontFamily: fonts.heavy, marginTop: 4 },
  creditFinova: { fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 },
});

const cm = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#2C3020', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingBottom: 32, borderWidth: 1, borderColor: 'rgba(174,183,132,0.18)' },
  handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: 'rgba(174,183,132,0.35)', alignSelf: 'center', marginTop: 12, marginBottom: 24 },
  iconRing: { alignSelf: 'center', width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(174,183,132,0.12)', borderWidth: 1.5, borderColor: 'rgba(174,183,132,0.30)', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  iconRingDanger: { backgroundColor: 'rgba(158,90,90,0.15)', borderColor: 'rgba(158,90,90,0.35)' },
  iconEmoji: { fontSize: 28 },
  title: { fontFamily: 'Fungis-Heavy', fontSize: 22, color: '#FFFFFF', textAlign: 'center', marginBottom: 12 },
  body: { fontFamily: 'Fungis-Regular', fontSize: 13, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  pinInput: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 14, fontFamily: 'Fungis-Bold', fontSize: 18, color: '#FFFFFF', textAlign: 'center', borderWidth: 1, borderColor: 'rgba(174,183,132,0.2)' },
  errorText: { fontFamily: 'Fungis-Regular', fontSize: 12, color: '#D4918F', textAlign: 'center', marginTop: 8, marginBottom: 16 },
  primaryBtn: { backgroundColor: '#AEB784', borderRadius: 14, padding: 15, alignItems: 'center', marginTop: 20, marginBottom: 12 },
  primaryBtnText: { fontFamily: 'Fungis-Bold', fontSize: 15, color: '#222629' },
  destructiveBtn: { backgroundColor: 'rgba(158,90,90,0.18)', borderWidth: 1, borderColor: 'rgba(158,90,90,0.45)', borderRadius: 14, padding: 15, alignItems: 'center', marginBottom: 12 },
  destructiveBtnText: { fontFamily: 'Fungis-Bold', fontSize: 15, color: '#D4918F' },
  ghostBtn: { padding: 14, alignItems: 'center' },
  ghostBtnText: { fontFamily: 'Fungis-Regular', fontSize: 14, color: 'rgba(255,255,255,0.4)' },
});
