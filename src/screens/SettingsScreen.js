// src/screens/SettingsScreen.js
// Finova v2.7 — currency in Edit Profile, removed from Preferences

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, Switch, Image, ImageBackground, Dimensions,
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

function EditIcon({ color, size = 18 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 18L19.9999 19.094C19.4695 19.6741 18.7502 20 18.0002 20C17.2501 20 16.5308 19.6741 16.0004 19.094C15.4693 18.5151 14.75 18.1901 14.0002 18.1901C13.2504 18.1901 12.5312 18.5151 12 19.094M3.00003 20H4.67457C5.16376 20 5.40835 20 5.63852 19.9447C5.84259 19.8957 6.03768 19.8149 6.21663 19.7053C6.41846 19.5816 6.59141 19.4086 6.93732 19.0627L19.5001 6.49998C20.3285 5.67156 20.3285 4.32841 19.5001 3.49998C18.6716 2.67156 17.3285 2.67156 16.5001 3.49998L3.93729 16.0627C3.59139 16.4086 3.41843 16.5816 3.29475 16.7834C3.18509 16.9624 3.10428 17.1574 3.05529 17.3615C3.00003 17.5917 3.00003 17.8363 3.00003 18.3255V20Z"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

function CameraIcon({ color }) {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export default function SettingsScreen({ navigation }) {
  const {
    transactions, settings, customCategories,
    updateSettings, toggleDarkMode, importData, dispatch,
  } = useApp();

  const [showDataManager, setShowDataManager] = useState(false);
  const [editMode,        setEditMode        ] = useState(false);
  const [editName,        setEditName        ] = useState('');
  const [editAge,         setEditAge         ] = useState('');
  const [editImage,       setEditImage       ] = useState('');
  const [editCurrency,    setEditCurrency    ] = useState('');   // NEW — currency in edit form

  const colors = settings.darkMode ? darkColors : lightColors;
  const overlayColor = settings.darkMode
    ? 'rgba(0,0,0,0.82)'
    : 'rgba(44,51,32,0.55)';
  const s = makeStyles(colors);

  const openEdit = () => {
    setEditName(settings.name  || '');
    setEditAge(settings.age    || '');
    setEditImage(settings.profileImage || '');
    setEditCurrency(settings.currency  || '₹');
    setEditMode(true);
  };

  const saveEdit = () => {
    updateSettings({
      name:         editName.trim(),
      age:          editAge.trim(),
      profileImage: editImage,
      currency:     editCurrency,
    });
    setEditMode(false);
  };

  const cancelEdit = () => setEditMode(false);

  const pickProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to change your profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.45, base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      setEditImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  // ─── Data handlers ───────────────────────────────────────────────────────────

  const handleDownload = async () => {
    try {
      const data    = JSON.stringify({ transactions, settings, customCategories }, null, 2);
      const fileUri = FileSystem.cacheDirectory + 'finova_backup.json';
      await FileSystem.writeAsStringAsync(fileUri, data);
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Save your Finova backup', UTI: 'public.json' });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch { Alert.alert('Error', 'Failed to generate backup file'); }
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
      if (result.canceled) return;
      const content  = await FileSystem.readAsStringAsync(result.assets[0].uri);
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

  const handleReset = () => {
    Alert.alert('Clear All Data', 'This will permanently erase all your transactions. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear Everything', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          dispatch({ type: 'LOAD_DATA', payload: {
            transactions: [],
            settings: { name: settings.name, age: settings.age, currency: settings.currency, darkMode: settings.darkMode, profileImage: settings.profileImage || '' },
          }});
        },
      },
    ]);
  };

  const performLogout = async () => {
    await AsyncStorage.clear();
    dispatch({ type: 'LOAD_DATA', payload: {
      transactions:     [],
      settings:         { name: '', age: '', currency: '₹', darkMode: false, profileImage: '' },
      customCategories: { expense: [], income: [] },
    }});
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Do you want to download your data before logging out?\nYour data will be cleared from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download & Log Out',
          onPress: async () => {
            try {
              const data    = JSON.stringify({ transactions, settings, customCategories }, null, 2);
              const fileUri = FileSystem.cacheDirectory + 'finova_backup.json';
              await FileSystem.writeAsStringAsync(fileUri, data);
              const isAvailable = await Sharing.isAvailableAsync();
              if (isAvailable) await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Save your Finova backup before logging out', UTI: 'public.json' });
            } catch (err) { console.error('[Logout] Download failed:', err); }
            await performLogout();
          },
        },
        { text: 'Log Out Without Saving', style: 'destructive', onPress: performLogout },
      ]
    );
  };

  const displayName  = settings.name || 'Your Name';
  const displayMeta  = `${settings.age ? `Age ${settings.age}` : 'Age not set'} · ${settings.currency} ${CURRENCIES.find(c => c.sym === settings.currency)?.label ?? ''}`;
  const profileImage = settings.profileImage || '';
  const initials     = (settings.name || 'A')[0].toUpperCase();

  return (
    <View style={s.root}>
      <ImageBackground
        source={require('../../assets/splash-icon.png')}
        style={s.bg}
        resizeMode="cover"
      >
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
                      <Text style={s.profileName}>{displayName}</Text>
                      <Text style={s.profileMeta}>{displayMeta}</Text>
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

                  {/* Avatar */}
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

                  {/* Name */}
                  <Text style={s.editLabel}>NAME</Text>
                  <TextInput
                    style={s.editInput}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Your name"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="words"
                    maxLength={24}
                  />

                  {/* Age */}
                  <Text style={s.editLabel}>AGE</Text>
                  <TextInput
                    style={s.editInput}
                    value={editAge}
                    onChangeText={v => setEditAge(v.replace(/[^0-9]/g, ''))}
                    placeholder="Your age"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={3}
                  />

                  {/* ── Currency — moved here from Preferences ── */}
                  <Text style={s.editLabel}>CURRENCY</Text>
                  <View style={s.currencyChipsRow}>
                    {CURRENCIES.map(c => (
                      <TouchableOpacity
                        key={c.sym}
                        style={[s.currencyChip, editCurrency === c.sym && s.currencyChipActive]}
                        onPress={() => setEditCurrency(c.sym)}
                        activeOpacity={0.75}
                      >
                        <Text style={[s.currencyChipText, editCurrency === c.sym && s.currencyChipTextActive]}>
                          {c.sym} {c.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Actions */}
                  <View style={s.editActions}>
                    <TouchableOpacity style={s.cancelBtn} onPress={cancelEdit} activeOpacity={0.8}>
                      <Text style={s.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.saveBtn} onPress={saveEdit} activeOpacity={0.8}>
                      <Text style={s.saveBtnText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>

            {/* ── Preferences — Dark Mode only (currency moved to Edit Profile) ── */}
            <Text style={s.sectionLabel}>PREFERENCES</Text>
            <View style={s.card}>
              <View style={[s.row, { borderBottomWidth: 0 }]}>
                <View style={[s.iconBox, { backgroundColor: colors.surface2 }]}><Text>🌙</Text></View>
                <View style={s.rowInfo}>
                  <Text style={s.rowLabel}>Dark Mode</Text>
                  <Text style={s.rowHint}>{settings.darkMode ? 'On — dark olive theme' : 'Off — warm cream theme'}</Text>
                </View>
                <Switch
                  value={settings.darkMode}
                  onValueChange={toggleDarkMode}
                  trackColor={{ false: colors.border, true: colors.accentDark }}
                  thumbColor={settings.darkMode ? colors.accent : colors.surface2}
                />
              </View>
            </View>

            {/* ── Data Management ── */}
            <TouchableOpacity style={s.sectionHeader} onPress={() => setShowDataManager(!showDataManager)} activeOpacity={0.7}>
              <Text style={s.sectionLabel}>DATA MANAGEMENT</Text>
              <Text style={s.chevron}>{showDataManager ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {showDataManager && (
              <View style={s.card}>
                <TouchableOpacity style={s.row} onPress={handleDownload}>
                  <View style={[s.iconBox, { backgroundColor: colors.surface2 }]}><Text>📥</Text></View>
                  <View style={s.rowInfo}><Text style={s.rowLabel}>Download Data</Text><Text style={s.rowHint}>Export all data to a JSON file</Text></View>
                </TouchableOpacity>
                <TouchableOpacity style={s.row} onPress={handleUpload}>
                  <View style={[s.iconBox, { backgroundColor: colors.surface2 }]}><Text>📤</Text></View>
                  <View style={s.rowInfo}><Text style={s.rowLabel}>Upload Data</Text><Text style={s.rowHint}>Restore data from a JSON backup</Text></View>
                </TouchableOpacity>
                <TouchableOpacity style={[s.row, { borderBottomWidth: 0 }]} onPress={handleReset}>
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
                <Text style={s.rowMuted}>2.7.0</Text>
              </View>
              <TouchableOpacity style={[s.row, { borderBottomWidth: 0 }]} onPress={() => navigation.navigate('AppGuide')} activeOpacity={0.7}>
                <View style={[s.iconBox, { backgroundColor: colors.surface2 }]}><Text>📖</Text></View>
                <View style={s.rowInfo}><Text style={s.rowLabel}>App Guide</Text><Text style={s.rowHint}>How to use Finova</Text></View>
                <Text style={s.rowMuted}>›</Text>
              </TouchableOpacity>
            </View>

            {/* ── Log Out ── */}
            <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
              <Text style={s.logoutText}>Log Out</Text>
            </TouchableOpacity>

          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  root:    { flex: 1 },
  bg:      { width, height: '100%', flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject },
  safe:    { flex: 1 },
  content: { padding: spacing.lg, paddingTop: spacing.xl + 10, paddingBottom: 100 },

  title:    { fontSize: 26, color: '#FFFFFF', fontFamily: fonts.heavy },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: spacing.lg, fontFamily: fonts.regular },

  // Profile card
  profileCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.accent },
  profileRow:  { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarWrap:  { flexShrink: 0 },
  avatarImg:   { width: 60, height: 60, borderRadius: 30 },
  avatar:      { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontSize: 24, color: colors.activePill, fontFamily: fonts.bold },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, color: colors.textPrimary, fontFamily: fonts.heavy },
  profileMeta: { fontSize: 12, color: colors.textMuted, marginTop: 3, fontFamily: fonts.regular },

  editIconBtn:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, alignSelf: 'flex-start' },
  editIconLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },

  editModeTitle:         { fontFamily: fonts.heavy, fontSize: 16, color: colors.textPrimary, marginBottom: 18 },
  editAvatarBtn:         { alignSelf: 'center', position: 'relative', marginBottom: 8 },
  editAvatarImg:         { width: 80, height: 80, borderRadius: 40 },
  editAvatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  editAvatarInitials:    { fontFamily: fonts.heavy, fontSize: 28, color: colors.activePill },
  cameraBadge:           { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.surface },
  editAvatarHint:        { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, textAlign: 'center', marginBottom: 20 },
  editLabel:             { fontFamily: fonts.bold, fontSize: 10, color: colors.textMuted, letterSpacing: 1.5, marginBottom: 6 },
  editInput:             { backgroundColor: colors.surface2, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 11, fontFamily: fonts.bold, fontSize: 14, color: colors.textPrimary, marginBottom: 16 },

  // Currency chips inside Edit Profile
  currencyChipsRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  currencyChip:        { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface2 },
  currencyChipActive:  { backgroundColor: colors.accent, borderColor: colors.accent },
  currencyChipText:    { fontFamily: fonts.bold, fontSize: 13, color: colors.accentLight },
  currencyChipTextActive: { color: colors.activePill },

  editActions:   { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn:     { flex: 1, paddingVertical: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  cancelBtnText: { fontFamily: fonts.bold, fontSize: 13, color: colors.textMuted },
  saveBtn:       { flex: 1, paddingVertical: 12, borderRadius: radius.md, backgroundColor: colors.accent, alignItems: 'center' },
  saveBtnText:   { fontFamily: fonts.bold, fontSize: 13, color: colors.activePill },

  sectionLabel:  { fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: 1, paddingBottom: 10, fontFamily: fonts.bold },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: spacing.sm },
  chevron:       { fontSize: 10, color: colors.textMuted },

  card:    { backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: spacing.lg, overflow: 'hidden' },
  row:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 },
  iconBox: { width: 38, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  rowInfo: { flex: 1 },
  rowLabel:{ fontSize: 13, color: colors.textPrimary, fontFamily: fonts.bold },
  rowHint: { fontSize: 11, color: colors.textMuted, marginTop: 2, fontFamily: fonts.regular },
  rowMuted:{ fontSize: 13, color: colors.textMuted, fontFamily: fonts.regular },

  logoutBtn:  { marginTop: 4, marginBottom: 16, borderWidth: 0, borderRadius: radius.lg, paddingVertical: 15, alignItems: 'center', backgroundColor: colors.wineRed },
  logoutText: { fontFamily: fonts.bold, fontSize: 15, color: '#FFFFFF', letterSpacing: 0.4 },
});
