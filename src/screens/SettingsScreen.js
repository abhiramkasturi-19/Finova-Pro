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
import { useApp } from '../context/AppContext';
import { lightColors, darkColors, spacing, radius, fonts } from '../theme/theme';

const { width, height } = Dimensions.get('window');

const CURRENCIES = [
  { sym: '$', label: 'USD' },
  { sym: '₹', label: 'INR' },
  { sym: '€', label: 'EUR' },
  { sym: '£', label: 'GBP' },
];

// ─── XOR Encryption helpers ──────────────────────────────────────────────────
// encryptJson → 'FINOVA_ENC:<hex>' · decryptJson → original JSON string or null
function encryptJson(jsonStr, password) {
  try {
    const key     = Array.from(password).map(c => c.charCodeAt(0));
    const encoded = encodeURIComponent(jsonStr);   // safe ASCII
    const hex     = Array.from(encoded).map((c, i) =>
      (c.charCodeAt(0) ^ key[i % key.length]).toString(16).padStart(2, '0')
    ).join('');
    return 'FINOVA_ENC:' + hex;
  } catch { return null; }
}

function decryptJson(encStr, password) {
  if (!encStr || !encStr.startsWith('FINOVA_ENC:')) return null;
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
      <Path d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── PIN Setup Modal ──────────────────────────────────────────────────────────
function PinSetupModal({ visible, onCancel, onSave }) {
  const [step,    setStep   ] = useState(1); // 1=enter new, 2=confirm
  const [pin1,    setPin1   ] = useState('');
  const [pin2,    setPin2   ] = useState('');
  const [error,   setError  ] = useState('');

  const reset = () => { setStep(1); setPin1(''); setPin2(''); setError(''); };

  const handleNext = () => {
    if (pin1.length !== 4) { setError('PIN must be exactly 4 digits'); return; }
    setStep(2); setPin2(''); setError('');
  };
  const handleConfirm = () => {
    if (pin2 !== pin1) { setError('PINs do not match. Try again.'); setPin2(''); return; }
    onSave(pin1);
    reset();
  };
  const handleCancel = () => { reset(); onCancel(); };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={handleCancel}>
      <View style={cm.backdrop}>
        <View style={cm.sheet}>
          <View style={cm.handle} />
          <View style={cm.iconRing}>
            <Text style={cm.iconEmoji}>🔒</Text>
          </View>
          <Text style={cm.title}>{step === 1 ? 'Set a PIN' : 'Confirm PIN'}</Text>
          <Text style={cm.body}>
            {step === 1
              ? 'Choose a 4-digit PIN. You\'ll need this every time you open Finova.'
              : 'Enter your PIN again to confirm.'}
          </Text>
          <TextInput
            style={cm.pinInput}
            value={step === 1 ? pin1 : pin2}
            onChangeText={step === 1 ? setPin1 : setPin2}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            placeholder="····"
            placeholderTextColor="rgba(255,255,255,0.25)"
            autoFocus
          />
          {!!error && <Text style={cm.errorText}>{error}</Text>}
          <TouchableOpacity
            style={[cm.primaryBtn, { opacity: (step === 1 ? pin1 : pin2).length === 4 ? 1 : 0.4 }]}
            onPress={step === 1 ? handleNext : handleConfirm}
            disabled={(step === 1 ? pin1 : pin2).length !== 4}
          >
            <Text style={cm.primaryBtnText}>{step === 1 ? 'Next →' : 'Enable Lock'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cm.ghostBtn} onPress={handleCancel}>
            <Text style={cm.ghostBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Passcode Export Modal ────────────────────────────────────────────────────
function PasscodeExportModal({ visible, onCancel, onExport }) {
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm ] = useState('');
  const [error,    setError   ] = useState('');
  const reset = () => { setPassword(''); setConfirm(''); setError(''); };

  const handleExport = () => {
    if (password.length < 4) { setError('Password must be at least 4 characters.'); return; }
    if (password !== confirm)  { setError('Passwords do not match.'); return; }
    onExport(password);
    reset();
  };
  const handleCancel = () => { reset(); onCancel(); };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={handleCancel}>
      <View style={cm.backdrop}>
        <View style={cm.sheet}>
          <View style={cm.handle} />
          <View style={cm.iconRing}>
            <Text style={cm.iconEmoji}>🔐</Text>
          </View>
          <Text style={cm.title}>Passcode Export</Text>
          <Text style={cm.body}>Set a password to protect your backup. You'll need it to restore the file.</Text>
          <TextInput
            style={cm.pinInput}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="rgba(255,255,255,0.25)"
            secureTextEntry
            autoFocus
          />
          <TextInput
            style={[cm.pinInput, { marginTop: 10 }]}
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Confirm password"
            placeholderTextColor="rgba(255,255,255,0.25)"
            secureTextEntry
          />
          {!!error && <Text style={cm.errorText}>{error}</Text>}
          <TouchableOpacity
            style={[cm.primaryBtn, { opacity: password && confirm ? 1 : 0.4 }]}
            onPress={handleExport}
            disabled={!password || !confirm}
          >
            <Text style={cm.primaryBtnText}>Encrypt & Export</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cm.ghostBtn} onPress={handleCancel}>
            <Text style={cm.ghostBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Decrypt Import Modal ─────────────────────────────────────────────────────
function DecryptImportModal({ visible, onCancel, onDecrypt }) {
  const [password, setPassword] = useState('');
  const [error,    setError   ] = useState('');
  const reset = () => { setPassword(''); setError(''); };

  const handleTry = () => {
    if (!password) { setError('Enter the password used when exporting.'); return; }
    const success = onDecrypt(password);
    if (!success) { setError('Wrong password. Try again.'); setPassword(''); }
    else reset();
  };
  const handleCancel = () => { reset(); onCancel(); };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={handleCancel}>
      <View style={cm.backdrop}>
        <View style={cm.sheet}>
          <View style={cm.handle} />
          <View style={cm.iconRing}>
            <Text style={cm.iconEmoji}>🔑</Text>
          </View>
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
          <TouchableOpacity
            style={[cm.primaryBtn, { opacity: password ? 1 : 0.4 }]}
            onPress={handleTry}
            disabled={!password}
          >
            <Text style={cm.primaryBtnText}>Restore</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cm.ghostBtn} onPress={handleCancel}>
            <Text style={cm.ghostBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Log Out Modal ────────────────────────────────────────────────────────────
function LogoutModal({ visible, onCancel, onLogoutOnly, onDownloadLogout }) {
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onCancel}>
      <View style={cm.backdrop}>
        <View style={cm.sheet}>
          <View style={cm.handle} />
          <View style={cm.iconRing}><Text style={cm.iconEmoji}>🚪</Text></View>
          <Text style={cm.title}>Log Out</Text>
          <Text style={cm.body}>Your data lives only on this device. Download a backup before logging out so you can restore your account later.</Text>
          <TouchableOpacity style={cm.primaryBtn} onPress={onDownloadLogout} activeOpacity={0.84}>
            <Text style={cm.primaryBtnText}>📥  Download & Log Out</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cm.destructiveBtn} onPress={onLogoutOnly} activeOpacity={0.84}>
            <Text style={cm.destructiveBtnText}>Log Out Without Saving</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cm.ghostBtn} onPress={onCancel} activeOpacity={0.75}>
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
          <Text style={cm.body}>
            This permanently erases every transaction you have recorded. Your profile and preferences will be kept, but this action{' '}
            <Text style={cm.bodyBold}>cannot be undone</Text>.
          </Text>
          <View style={cm.warningPill}>
            <Text style={cm.warningText}>⚠️  Download a backup first.</Text>
          </View>
          <TouchableOpacity style={cm.destructiveBtn} onPress={onConfirm} activeOpacity={0.84}>
            <Text style={cm.destructiveBtnText}>Yes, Clear Everything</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cm.ghostBtn} onPress={onCancel} activeOpacity={0.75}>
            <Text style={cm.ghostBtnText}>Cancel</Text>
          </TouchableOpacity>
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
    updateSettings, toggleDarkMode, updatePro, importData, dispatch, isPro,
  } = useApp();

  const [showDataManager,     setShowDataManager    ] = useState(false);
  const [editMode,            setEditMode           ] = useState(false);
  const [editName,            setEditName           ] = useState('');
  const [editAge,             setEditAge            ] = useState('');
  const [editImage,           setEditImage          ] = useState('');
  const [editCurrency,        setEditCurrency       ] = useState('');
  const [logoutModalOpen,     setLogoutModalOpen    ] = useState(false);
  const [clearModalOpen,      setClearModalOpen     ] = useState(false);
  const [pinSetupOpen,        setPinSetupOpen       ] = useState(false);
  const [passExportOpen,      setPassExportOpen     ] = useState(false);
  const [decryptModalOpen,    setDecryptModalOpen   ] = useState(false);
  const [pendingEncContent,   setPendingEncContent  ] = useState('');

  const colors      = settings.darkMode ? darkColors : lightColors;
  const overlayColor = settings.darkMode ? 'rgba(0,0,0,0.82)' : 'rgba(44,51,32,0.55)';
  const s = makeStyles(colors);

  // Profile edit
  const openEdit  = () => { setEditName(settings.name || ''); setEditAge(settings.age || ''); setEditImage(settings.profileImage || ''); setEditCurrency(settings.currency || '₹'); setEditMode(true); };
  const saveEdit  = () => { updateSettings({ name: editName.trim(), age: editAge.trim(), profileImage: editImage, currency: editCurrency }); setEditMode(false); };
  const cancelEdit = () => setEditMode(false);

  const pickProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Allow photo access to change your profile picture.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.45, base64: true });
    if (!result.canceled && result.assets[0].base64) setEditImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
  };

  // ── Data handlers ────────────────────────────────────────────────────────────

  const handleDownload = async () => {
    try {
      const data    = JSON.stringify({ transactions, settings, customCategories, wallets, activeWalletId }, null, 2);
      const fileUri = FileSystem.cacheDirectory + 'finova_backup.json';
      await FileSystem.writeAsStringAsync(fileUri, data);
      const ok = await Sharing.isAvailableAsync();
      if (ok) await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Save your Finova backup', UTI: 'public.json' });
      else Alert.alert('Error', 'Sharing is not available on this device');
    } catch { Alert.alert('Error', 'Failed to generate backup file'); }
  };

  const handleCsvExport = async () => {
    try {
      const header = 'Date,Type,Category,Amount,Note,Wallet\n';
      const rows = transactions.map(t => {
        const w    = (wallets || []).find(w => w.id === (t.walletId || 'default'))?.name || 'Personal';
        const cat  = (t.customCategory?.trim() || t.category).replace(/"/g, '""');
        const note = (t.note || '').replace(/"/g, '""');
        const date = new Date(t.date).toLocaleDateString('en-IN');
        return `"${date}","${t.type}","${cat}","${t.amount}","${note}","${w}"`;
      }).join('\n');
      const csv     = header + rows;
      const fileUri = FileSystem.cacheDirectory + 'finova_transactions.csv';
      await FileSystem.writeAsStringAsync(fileUri, csv);
      const ok = await Sharing.isAvailableAsync();
      if (ok) await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Export Finova transactions' });
    } catch { Alert.alert('Error', 'Failed to export CSV'); }
  };

  const handlePasscodeExport = async (password) => {
    setPassExportOpen(false);
    try {
      const raw     = JSON.stringify({ transactions, settings, customCategories, wallets, activeWalletId });
      const enc     = encryptJson(raw, password);
      if (!enc) { Alert.alert('Error', 'Encryption failed. Try a simpler password.'); return; }
      const fileUri = FileSystem.cacheDirectory + 'finova_backup.enc';
      await FileSystem.writeAsStringAsync(fileUri, enc);
      const ok = await Sharing.isAvailableAsync();
      if (ok) await Sharing.shareAsync(fileUri, { mimeType: 'application/octet-stream', dialogTitle: 'Save encrypted Finova backup' });
    } catch { Alert.alert('Error', 'Failed to create encrypted backup'); }
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (result.canceled) return;
      const content = await FileSystem.readAsStringAsync(result.assets[0].uri);

      // Encrypted file?
      if (content.startsWith('FINOVA_ENC:')) {
        setPendingEncContent(content);
        setDecryptModalOpen(true);
        return;
      }

      const imported = JSON.parse(content);
      if (!imported.transactions || !Array.isArray(imported.transactions)) throw new Error('Invalid');
      Alert.alert('Restore Data', 'This will replace all your current data with the backup. Continue?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restore', onPress: () => { importData(imported); Alert.alert('Success', 'Data restored successfully'); } },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to import backup file. Make sure it is a valid Finova backup.');
    }
  };

  const handleDecryptImport = (password) => {
    const decrypted = decryptJson(pendingEncContent, password);
    if (!decrypted) return false;
    try {
      const imported = JSON.parse(decrypted);
      if (!imported.transactions || !Array.isArray(imported.transactions)) return false;
      setDecryptModalOpen(false);
      setPendingEncContent('');
      importData(imported);
      Alert.alert('Success', 'Encrypted backup restored successfully');
      return true;
    } catch { return false; }
  };

  const executeClear = async () => {
    setClearModalOpen(false);
    const clearedData = {
      transactions: [],
      settings: {
        name:           settings.name,
        age:            settings.age,
        currency:       settings.currency,
        darkMode:       settings.darkMode,
        profileImage:   settings.profileImage || '',
        isPro:          settings.isPro,
        appLockEnabled: settings.appLockEnabled,
        appLockPin:     settings.appLockPin,
      },
      customCategories,
      wallets,
      activeWalletId,
    };
    await AsyncStorage.setItem('@flo_data', JSON.stringify(clearedData));
    dispatch({ type: 'LOAD_DATA', payload: clearedData });
  };

  const performLogout = async () => {
    setLogoutModalOpen(false);
    await AsyncStorage.clear();
    dispatch({
      type: 'LOAD_DATA', payload: {
        transactions: [],
        settings: { name: '', age: '', currency: '₹', darkMode: false, profileImage: '', isPro: false, appLockEnabled: false, appLockPin: '' },
        customCategories: { expense: [], income: [] },
        wallets: [{ id: 'default', name: 'Personal', icon: '💳', archived: false }],
        activeWalletId: 'default',
      }
    });
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  const handleDownloadThenLogout = async () => {
    setLogoutModalOpen(false);
    try {
      const data    = JSON.stringify({ transactions, settings, customCategories, wallets, activeWalletId }, null, 2);
      const fileUri = FileSystem.cacheDirectory + 'finova_backup.json';
      await FileSystem.writeAsStringAsync(fileUri, data);
      const ok = await Sharing.isAvailableAsync();
      if (ok) await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Save your Finova backup', UTI: 'public.json' });
    } catch (e) { console.error('[Logout] Download failed:', e); }
    await performLogout();
  };

  // ── App Lock handlers ────────────────────────────────────────────────────────
  const handleLockToggle = (value) => {
    if (!isPro) { navigation.navigate('ProPaywall'); return; }
    if (value) {
      // Turning ON — open PIN setup
      setPinSetupOpen(true);
    } else {
      // Turning OFF
      updateSettings({ appLockEnabled: false, appLockPin: '' });
    }
  };

  const handlePinSave = (pin) => {
    setPinSetupOpen(false);
    updateSettings({ appLockEnabled: true, appLockPin: pin });
  };

  const displayName  = settings.name || 'Your Name';
  const displayMeta  = `${settings.age ? `Age ${settings.age}` : 'Age not set'} · ${settings.currency} ${CURRENCIES.find(c => c.sym === settings.currency)?.label ?? ''}`;
  const profileImage = settings.profileImage || '';
  const initials     = (settings.name || 'A')[0].toUpperCase();
  const activeWallet = (wallets || []).find(w => w.id === activeWalletId);

  return (
    <View style={s.root}>
      <ImageBackground source={require('../../assets/splash-icon.png')} style={s.bg} resizeMode="cover">
        <View style={[s.overlay, { backgroundColor: overlayColor }]} />

        <SafeAreaView style={s.safe}>
          <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

            <Text style={s.title}>Settings</Text>
            <Text style={s.subtitle}>Your profile & preferences</Text>

            {/* ── Profile Card ── */}
            <View style={s.profileCard}>
              {!editMode && (
                <>
                  <View style={s.profileRow}>
                    <View style={s.avatarWrap}>
                      {profileImage
                        ? <Image source={{ uri: profileImage }} style={s.avatarImg} />
                        : <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>
                      }
                    </View>
                    <View style={s.profileInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={s.profileName}>{displayName}</Text>
                        {isPro && (
                          <View style={s.proBadge}><Text style={s.proBadgeText}>👑 PRO</Text></View>
                        )}
                      </View>
                      <Text style={s.profileMeta}>{displayMeta}</Text>
                      {activeWallet && activeWalletId !== 'default' && (
                        <Text style={s.profileWallet}>
                          {activeWallet.icon} {activeWallet.name}
                        </Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity style={s.editIconBtn} onPress={openEdit} activeOpacity={0.7}>
                    <EditIcon color={colors.textMuted} size={17} />
                    <Text style={s.editIconLabel}>Edit Profile</Text>
                  </TouchableOpacity>
                </>
              )}

              {editMode && (
                <>
                  <Text style={s.editModeTitle}>Edit Profile</Text>
                  <TouchableOpacity style={s.editAvatarBtn} onPress={pickProfileImage} activeOpacity={0.8}>
                    {editImage
                      ? <Image source={{ uri: editImage }} style={s.editAvatarImg} />
                      : <View style={s.editAvatarPlaceholder}>
                          <Text style={s.editAvatarInitials}>{editName ? editName[0].toUpperCase() : initials}</Text>
                        </View>
                    }
                    <View style={s.cameraBadge}><CameraIcon color={colors.activePill} /></View>
                  </TouchableOpacity>
                  <Text style={s.editAvatarHint}>Tap photo to change</Text>

                  <Text style={s.editLabel}>NAME</Text>
                  <TextInput style={s.editInput} value={editName} onChangeText={setEditName} placeholder="Your name" placeholderTextColor={colors.textMuted} autoCapitalize="words" maxLength={24} />
                  <Text style={s.editLabel}>AGE</Text>
                  <TextInput style={s.editInput} value={editAge} onChangeText={v => setEditAge(v.replace(/[^0-9]/g, ''))} placeholder="Your age" placeholderTextColor={colors.textMuted} keyboardType="number-pad" maxLength={3} />
                  <Text style={s.editLabel}>CURRENCY</Text>
                  <View style={s.currencyChipsRow}>
                    {CURRENCIES.map(c => (
                      <TouchableOpacity key={c.sym} style={[s.currencyChip, editCurrency === c.sym && s.currencyChipActive]} onPress={() => setEditCurrency(c.sym)} activeOpacity={0.75}>
                        <Text style={[s.currencyChipText, editCurrency === c.sym && s.currencyChipTextActive]}>{c.sym} {c.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={s.editActions}>
                    <TouchableOpacity style={s.cancelBtn} onPress={cancelEdit} activeOpacity={0.8}><Text style={s.cancelBtnText}>Cancel</Text></TouchableOpacity>
                    <TouchableOpacity style={s.saveBtn}   onPress={saveEdit}   activeOpacity={0.8}><Text style={s.saveBtnText}>Save</Text></TouchableOpacity>
                  </View>
                </>
              )}
            </View>

            {/* ── Preferences ── */}
            <Text style={s.sectionLabel}>PREFERENCES</Text>
            <View style={s.card}>
              <View style={s.row}>
                <View style={[s.iconBox, { backgroundColor: colors.surface2 }]}><Text>🌙</Text></View>
                <View style={s.rowInfo}>
                  <Text style={s.rowLabel}>Dark Mode</Text>
                  <Text style={s.rowHint}>{settings.darkMode ? 'On — dark olive theme' : 'Off — warm cream theme'}</Text>
                </View>
                <Switch value={settings.darkMode} onValueChange={toggleDarkMode} trackColor={{ false: colors.border, true: colors.accentDark }} thumbColor={settings.darkMode ? colors.accent : colors.surface2} />
              </View>
              {/* App Lock row */}
              <TouchableOpacity
                style={[s.row, { borderBottomWidth: 0 }]}
                onPress={() => !isPro && navigation.navigate('ProPaywall')}
                activeOpacity={isPro ? 1 : 0.7}
              >
                <View style={[s.iconBox, { backgroundColor: colors.surface2 }]}><Text>🔒</Text></View>
                <View style={s.rowInfo}>
                  <Text style={s.rowLabel}>App Lock</Text>
                  <Text style={s.rowHint}>
                    {isPro
                      ? (settings.appLockEnabled ? 'PIN lock is active' : 'Require PIN on open')
                      : '🔒 Pro feature — tap to unlock'}
                  </Text>
                </View>
                {isPro
                  ? <Switch
                      value={settings.appLockEnabled}
                      onValueChange={handleLockToggle}
                      trackColor={{ false: colors.border, true: colors.accentDark }}
                      thumbColor={settings.appLockEnabled ? colors.accent : colors.surface2}
                    />
                  : <Text style={s.rowMuted}>›</Text>
                }
              </TouchableOpacity>
            </View>

            {/* ── Data Management ── */}
            <TouchableOpacity style={s.sectionHeader} onPress={() => setShowDataManager(!showDataManager)} activeOpacity={0.7}>
              <Text style={s.sectionLabel}>DATA MANAGEMENT</Text>
              <Text style={s.chevron}>{showDataManager ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {showDataManager && (
              <View style={s.card}>
                {/* Download Data — Pro gated */}
                <TouchableOpacity
                  style={s.row}
                  onPress={isPro ? handleDownload : () => navigation.navigate('ProPaywall')}
                >
                  <View style={[s.iconBox, { backgroundColor: colors.surface2 }]}><Text>📥</Text></View>
                  <View style={s.rowInfo}>
                    <Text style={s.rowLabel}>Download Data</Text>
                    <Text style={s.rowHint}>{isPro ? 'Export all data to a JSON file' : '🔒 Pro feature — tap to unlock'}</Text>
                  </View>
                  {!isPro && <Text style={s.rowMuted}>›</Text>}
                </TouchableOpacity>

                {/* CSV Export — Pro gated */}
                <TouchableOpacity
                  style={s.row}
                  onPress={isPro ? handleCsvExport : () => navigation.navigate('ProPaywall')}
                >
                  <View style={[s.iconBox, { backgroundColor: colors.surface2 }]}><Text>📊</Text></View>
                  <View style={s.rowInfo}>
                    <Text style={s.rowLabel}>CSV Export</Text>
                    <Text style={s.rowHint}>{isPro ? 'Export transactions for Excel / Sheets' : '🔒 Pro feature — tap to unlock'}</Text>
                  </View>
                  {!isPro && <Text style={s.rowMuted}>›</Text>}
                </TouchableOpacity>

                {/* Passcode Export — Pro gated */}
                <TouchableOpacity
                  style={s.row}
                  onPress={isPro ? () => setPassExportOpen(true) : () => navigation.navigate('ProPaywall')}
                >
                  <View style={[s.iconBox, { backgroundColor: colors.surface2 }]}><Text>🔐</Text></View>
                  <View style={s.rowInfo}>
                    <Text style={s.rowLabel}>Passcode Export</Text>
                    <Text style={s.rowHint}>{isPro ? 'Password-encrypt your backup file' : '🔒 Pro feature — tap to unlock'}</Text>
                  </View>
                  {!isPro && <Text style={s.rowMuted}>›</Text>}
                </TouchableOpacity>

                {/* Upload Data */}
                <TouchableOpacity style={s.row} onPress={handleUpload}>
                  <View style={[s.iconBox, { backgroundColor: colors.surface2 }]}><Text>📤</Text></View>
                  <View style={s.rowInfo}><Text style={s.rowLabel}>Upload Data</Text><Text style={s.rowHint}>Restore data from a JSON or encrypted backup</Text></View>
                </TouchableOpacity>

                {/* Clear All */}
                <TouchableOpacity style={[s.row, { borderBottomWidth: 0 }]} onPress={() => setClearModalOpen(true)}>
                  <View style={[s.iconBox, { backgroundColor: colors.wineRed + '33' }]}><Text>🗑️</Text></View>
                  <View style={s.rowInfo}><Text style={[s.rowLabel, { color: colors.wineRed }]}>Clear All Data</Text><Text style={s.rowHint}>Erase all transactions permanently</Text></View>
                </TouchableOpacity>
              </View>
            )}

            {/* ── App ── */}
            <Text style={s.sectionLabel}>APP</Text>
            <View style={s.card}>
              <View style={s.row}>
                <View style={[s.iconBox, { backgroundColor: colors.surface2 }]}><Text>📊</Text></View>
                <View style={s.rowInfo}><Text style={s.rowLabel}>Version</Text></View>
                <Text style={s.rowMuted}>3.0.0</Text>
              </View>

              {/* Wallets */}
              <TouchableOpacity style={s.row} onPress={() => navigation.navigate('Wallets')} activeOpacity={0.7}>
                <View style={[s.iconBox, { backgroundColor: colors.surface2 }]}><Text>👛</Text></View>
                <View style={s.rowInfo}>
                  <Text style={s.rowLabel}>Wallets</Text>
                  <Text style={s.rowHint}>Manage your spending contexts</Text>
                </View>
                <Text style={s.rowMuted}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[s.row, { borderBottomWidth: isPro ? 0 : 1 }]} onPress={() => navigation.navigate('AppGuide')} activeOpacity={0.7}>
                <View style={[s.iconBox, { backgroundColor: colors.surface2 }]}><Text>📖</Text></View>
                <View style={s.rowInfo}><Text style={s.rowLabel}>App Guide</Text><Text style={s.rowHint}>How to use Finova</Text></View>
                <Text style={s.rowMuted}>›</Text>
              </TouchableOpacity>

              {/* Upgrade to Pro — visible only when free */}
              {!isPro && (
                <TouchableOpacity style={[s.row, { borderBottomWidth: 0 }]} onPress={() => navigation.navigate('ProPaywall')} activeOpacity={0.8}>
                  <View style={[s.iconBox, { backgroundColor: '#AEB78433' }]}><Text>👑</Text></View>
                  <View style={s.rowInfo}>
                    <Text style={[s.rowLabel, { color: '#AEB784' }]}>Upgrade to Pro — ₹199 →</Text>
                    <Text style={s.rowHint}>Unlock all features, one time</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* ── Log Out ── */}
            <TouchableOpacity style={s.logoutBtn} onPress={() => setLogoutModalOpen(true)} activeOpacity={0.8}>
              <Text style={s.logoutText}>Log Out</Text>
            </TouchableOpacity>

            {/* ── Creator Credit ── */}
            <View style={s.creditBlock}>
              <View style={s.creditDivider} />
              <Text style={s.creditMadeBy}>crafted by</Text>
              <Text style={s.creditName}>Abhiram Kasturi</Text>
              <Text style={s.creditFinova}>Finova · 2026</Text>
            </View>

          </ScrollView>
        </SafeAreaView>
      </ImageBackground>

      {/* Modals */}
      <LogoutModal
        visible={logoutModalOpen}
        onCancel={() => setLogoutModalOpen(false)}
        onLogoutOnly={performLogout}
        onDownloadLogout={handleDownloadThenLogout}
      />
      <ClearDataModal
        visible={clearModalOpen}
        onCancel={() => setClearModalOpen(false)}
        onConfirm={executeClear}
      />
      <PinSetupModal
        visible={pinSetupOpen}
        onCancel={() => setPinSetupOpen(false)}
        onSave={handlePinSave}
      />
      <PasscodeExportModal
        visible={passExportOpen}
        onCancel={() => setPassExportOpen(false)}
        onExport={handlePasscodeExport}
      />
      <DecryptImportModal
        visible={decryptModalOpen}
        onCancel={() => { setDecryptModalOpen(false); setPendingEncContent(''); }}
        onDecrypt={handleDecryptImport}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const makeStyles = (colors) => StyleSheet.create({
  root: { flex: 1 },
  bg:   { width, height: '100%', flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject },
  safe:    { flex: 1, paddingBottom: -100, paddingTop: -50 },
  content: { padding: spacing.lg, paddingTop: spacing.xl + 50, paddingBottom: 60 },

  title:    { fontSize: 26, color: colors.white, fontFamily: fonts.heavy },
  subtitle: { fontSize: 13, color: colors.white, marginBottom: spacing.lg, fontFamily: fonts.regular },

  profileCard:   { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.accent },
  profileRow:    { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarWrap:    { flexShrink: 0 },
  avatarImg:     { width: 80, height: 80, borderRadius: 40 },
  avatar:        { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText:    { fontSize: 24, color: colors.activePill, fontFamily: fonts.bold },
  profileInfo:   { flex: 1 },
  profileName:   { fontSize: 18, color: colors.textPrimary, fontFamily: fonts.heavy },
  profileMeta:   { fontSize: 12, color: colors.textMuted, marginTop: 3, fontFamily: fonts.regular },
  profileWallet: { fontSize: 11, color: colors.accent, marginTop: 4, fontFamily: fonts.bold },

  proBadge:     { backgroundColor: '#AEB78422', borderWidth: 1, borderColor: '#AEB78466', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  proBadgeText: { fontFamily: fonts.bold, fontSize: 10, color: '#AEB784' },

  editIconBtn:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, alignSelf: 'flex-start' },
  editIconLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },

  editModeTitle:          { fontFamily: fonts.heavy, fontSize: 16, color: colors.textPrimary, marginBottom: 18 },
  editAvatarBtn:          { alignSelf: 'center', position: 'relative', marginBottom: 8 },
  editAvatarImg:          { width: 80, height: 80, borderRadius: 40 },
  editAvatarPlaceholder:  { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  editAvatarInitials:     { fontFamily: fonts.heavy, fontSize: 28, color: colors.activePill },
  cameraBadge:            { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.surface },
  editAvatarHint:         { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, textAlign: 'center', marginBottom: 20 },
  editLabel:              { fontFamily: fonts.bold, fontSize: 10, color: colors.textMuted, letterSpacing: 1.5, marginBottom: 6 },
  editInput:              { backgroundColor: colors.surface2, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 11, fontFamily: fonts.bold, fontSize: 14, color: colors.textPrimary, marginBottom: 16 },
  currencyChipsRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  currencyChip:           { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface2 },
  currencyChipActive:     { backgroundColor: colors.accent, borderColor: colors.accent },
  currencyChipText:       { fontFamily: fonts.bold, fontSize: 13, color: colors.accentLight },
  currencyChipTextActive: { color: colors.activePill },
  editActions:            { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn:              { flex: 1, paddingVertical: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  cancelBtnText:          { fontFamily: fonts.bold, fontSize: 13, color: colors.textMuted },
  saveBtn:                { flex: 1, paddingVertical: 12, borderRadius: radius.md, backgroundColor: colors.accent, alignItems: 'center' },
  saveBtnText:            { fontFamily: fonts.bold, fontSize: 13, color: colors.activePill },

  sectionLabel:   { fontSize: 11, color: colors.white, letterSpacing: 1, paddingBottom: 10, fontFamily: fonts.bold },
  sectionHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: spacing.sm },
  chevron:        { fontSize: 10, color: colors.white },

  card:     { backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: spacing.lg, overflow: 'hidden' },
  row:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 },
  iconBox:  { width: 38, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  rowInfo:  { flex: 1 },
  rowLabel: { fontSize: 13, color: colors.textPrimary, fontFamily: fonts.bold },
  rowHint:  { fontSize: 11, color: colors.textMuted, marginTop: 2, fontFamily: fonts.regular },
  rowMuted: { fontSize: 13, color: colors.textMuted, fontFamily: fonts.regular },

  logoutBtn:  { marginTop: 4, marginBottom: 28, borderRadius: radius.lg, paddingVertical: 15, alignItems: 'center', backgroundColor: colors.wineRed },
  logoutText: { fontFamily: fonts.bold, fontSize: 15, color: '#FFFFFF', letterSpacing: 0.4 },

  creditBlock:   { alignItems: 'center', paddingBottom: 16 },
  creditDivider: { width: 36, height: 2, borderRadius: 1, backgroundColor: 'rgba(174,183,132,0.30)', marginBottom: 16 },
  creditMadeBy:  { fontFamily: fonts.regular, fontSize: 11, color: colors.white, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  creditName:    { fontFamily: fonts.heavy,   fontSize: 18, color: '#AEB784', letterSpacing: 0.3, marginBottom: 4 },
  creditFinova:  { fontFamily: fonts.regular, fontSize: 11, color: colors.white, letterSpacing: 0.5, paddingBottom: 50 },
});

const cm = StyleSheet.create({
  backdrop:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet:        { backgroundColor: '#2C3020', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 28, borderWidth: 1, borderColor: 'rgba(174,183,132,0.18)', borderBottomWidth: 0 },
  handle:       { width: 38, height: 4, borderRadius: 2, backgroundColor: 'rgba(174,183,132,0.35)', alignSelf: 'center', marginTop: 12, marginBottom: 24 },
  iconRing:     { alignSelf: 'center', width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(174,183,132,0.12)', borderWidth: 1.5, borderColor: 'rgba(174,183,132,0.30)', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  iconRingDanger: { backgroundColor: 'rgba(158,90,90,0.15)', borderColor: 'rgba(158,90,90,0.35)' },
  iconEmoji:    { fontSize: 28 },
  title:        { fontFamily: 'Fungis-Heavy', fontSize: 22, color: '#FFFFFF', textAlign: 'center', marginBottom: 12 },
  body:         { fontFamily: 'Fungis-Regular', fontSize: 13, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  bodyBold:     { fontFamily: 'Fungis-Bold', color: 'rgba(255,255,255,0.80)' },
  warningPill:  { backgroundColor: 'rgba(158,90,90,0.15)', borderWidth: 1, borderColor: 'rgba(158,90,90,0.30)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 20 },
  warningText:  { fontFamily: 'Fungis-Regular', fontSize: 12, color: 'rgba(255,180,180,0.80)', textAlign: 'center', lineHeight: 18 },
  pinInput:     { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontFamily: 'Fungis-Bold', fontSize: 20, color: '#FFFFFF', letterSpacing: 6, textAlign: 'center', borderWidth: 1, borderColor: 'rgba(174,183,132,0.20)', marginBottom: 8 },
  errorText:    { fontFamily: 'Fungis-Regular', fontSize: 12, color: '#D4918F', textAlign: 'center', marginBottom: 16 },
  primaryBtn:   { backgroundColor: '#AEB784', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 12 },
  primaryBtnText: { fontFamily: 'Fungis-Bold', fontSize: 15, color: '#222629', letterSpacing: 0.4 },
  destructiveBtn: { backgroundColor: 'rgba(158,90,90,0.18)', borderWidth: 1, borderColor: 'rgba(158,90,90,0.45)', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 12 },
  destructiveBtnText: { fontFamily: 'Fungis-Bold', fontSize: 15, color: '#D4918F', letterSpacing: 0.3 },
  ghostBtn:     { borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  ghostBtnText: { fontFamily: 'Fungis-Regular', fontSize: 14, color: 'rgba(255,255,255,0.40)' },
});
