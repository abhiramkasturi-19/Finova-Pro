// src/screens/CreateAccountScreen.js
// Finova v2.8 — Onboarding Page 2 — custom crop modal

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ImageBackground, TouchableOpacity,
  TextInput, ScrollView, Dimensions, StatusBar,
  KeyboardAvoidingView, Platform, Image, Alert, Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path } from 'react-native-svg';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };
const CURRENCIES = [
  { symbol: '₹', code: 'INR' }, { symbol: '$', code: 'USD' },
  { symbol: '€', code: 'EUR' }, { symbol: '£', code: 'GBP' },
  { symbol: '¥', code: 'JPY' },
];
const THEMES = [
  { label: '☀️  Light', value: 'light' },
  { label: '🌙  Dark',  value: 'dark'  },
];

// Crop circle size and canvas dimensions

// ── Terms content ────────────────────────────────────────────────────────────
const TERMS_SECTIONS = [
  {
    heading: 'Terms of Service',
    body: [
      'By creating a Finova account, you agree to use the app for personal, non-commercial financial tracking only.',
      'Finova is provided "as-is" without warranties of any kind. We reserve the right to update these terms at any time.',
      'Misuse of the app, including attempts to exploit, reverse-engineer, or redistribute it, is strictly prohibited.',
    ],
  },
  {
    heading: 'Data Storage & Responsibility',
    body: [
      'All your financial data — transactions, categories, and profile information — is stored entirely on your own device. Finova does not operate any servers, databases, or cloud services.',
      'We are not responsible for any loss of data caused by device failure, accidental deletion, app uninstallation, OS updates, factory resets, or any other circumstance.',
      'It is your sole responsibility to back up your data regularly using the Export / Download feature in Settings. We strongly recommend doing this before switching devices or reinstalling the app.',
    ],
  },
  {
    heading: 'Personal Information',
    body: [
      'Any personal information you enter — including your name, age, and profile picture — is stored locally on your device only and is never transmitted to Finova or any third party.',
      'You provide this information voluntarily and entirely at your own risk. Finova has no access to, and assumes no liability for, the personal information you choose to enter.',
      'If you share your device or your exported backup file with others, your personal information may be visible to them. Exercise caution accordingly.',
    ],
  },
  {
    heading: 'Privacy Policy',
    body: [
      'Finova does not collect, transmit, or sell any user data. There is no analytics tracking, no advertising SDK, and no network calls made by the app.',
      'Your exported JSON backup file contains all app data in plain text. Keep it secure and do not share it with untrusted parties.',
      'Finova does not use cookies, device identifiers, or any form of usage profiling.',
    ],
  },
  {
    heading: 'Enforcement & Consequences',
    body: [
      'Violation of any of these terms — including unauthorized use, redistribution, reverse-engineering, or misuse of the app — will result in immediate termination of your right to use Finova.',
      'Any individual or entity found to be in breach of these terms may be subject to legal action under applicable laws. We reserve the right to pursue all available legal remedies.',
      'Finova is provided for personal use only. Commercial exploitation, resale, or use in any product or service without explicit written permission from the developer is a direct violation of these terms and will be acted upon accordingly.',
    ],
  },
  {
    icon: '⚖️',
    heading: 'No Liability & Disclaimer',
    body: [
      'Finova is a personal project provided "as-is" without any warranties. The developer assumes no liability for any financial decisions, data loss, or legal damages resulting from the use of this app.',
      'This app is not a certified financial tool. By using Finova, you agree that you are solely responsible for your financial tracking, data management, and usage.',
    ],
  },
  {
    heading: 'Copyright & Intellectual Property',
    body: [
      '© 2026 Abhiram Kasturi. All rights reserved. Finova, its name, design, logo, codebase, and all associated assets are the exclusive intellectual property of the developer.',
      'You may not copy, reproduce, modify, distribute, or create derivative works from any part of Finova — including its UI design, source code, or branding — without prior written consent.',
      'Unauthorized reproduction or distribution of Finova or any of its components constitutes copyright infringement and will be pursued under applicable intellectual property laws.',
    ],
  },
];

// ── Camera icon ───────────────────────────────────────────────────────────────
function CameraIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
        stroke="#222629" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <Path
        d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
        stroke="#222629" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Terms Modal ───────────────────────────────────────────────────────────────
function TermsModal({ visible, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={modal.backdrop}>
        <View style={modal.sheet}>
          <View style={modal.handle} />
          <View style={modal.header}>
            <Text style={modal.headerTitle}>Terms & Privacy</Text>
            <TouchableOpacity onPress={onClose} style={modal.closeBtn} activeOpacity={0.75}>
              <Text style={modal.closeX}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={modal.accentBar} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={modal.scrollContent}>
            <Text style={modal.intro}>
              Please read the following carefully before using Finova. These terms govern your use of the app and explain how your data is handled.
            </Text>
            {TERMS_SECTIONS.map((section, i) => (
              <View key={i} style={modal.section}>
                <Text style={modal.sectionHeading}>{section.heading}</Text>
                {section.body.map((para, j) => (
                  <View key={j} style={modal.bulletRow}>
                    <Text style={modal.bullet}>›</Text>
                    <Text style={modal.para}>{para}</Text>
                  </View>
                ))}
              </View>
            ))}
            <View style={modal.footerNote}>
              <Text style={modal.footerText}>
                Last updated · March 21, 2026 · Finova v3.0.2{'\n'}© 2026 Abhiram Kasturi. All rights reserved.
              </Text>
            </View>
            <View style={{ height: 8 }} />
          </ScrollView>
          <TouchableOpacity style={modal.agreeBtn} onPress={onClose} activeOpacity={0.84}>
            <Text style={modal.agreeBtnText}>I Understand</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function CreateAccountScreen({ navigation }) {
  const { updateSettings } = useApp();

  const [profileImage,     setProfileImage    ] = useState(null);
  const [username,         setUsername        ] = useState('');
  const [age,              setAge             ] = useState('');
  const [selectedTheme,    setSelectedTheme   ] = useState('dark');
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [agreed,           setAgreed          ] = useState(false);
  const [termsVisible,     setTermsVisible    ] = useState(false);

  const canProceed = username.trim().length > 0 && age.trim().length > 0 && agreed;

  const pickProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to set a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      setProfileImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleContinue = () => {
    updateSettings({
      name:         username.trim(),
      age:          age.trim(),
      darkMode:     selectedTheme === 'dark',
      currency:     CURRENCY_SYMBOLS[selectedCurrency],
      profileImage: profileImage || '',
    });
    navigation.navigate('DataInfo');
  };

  const initials = username.trim() ? username.trim()[0].toUpperCase() : '?';

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground source={require('../../assets/background.png')} style={styles.bg} resizeMode="cover">
        <View style={styles.fullOverlay} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Create{'\n'}Account</Text>
            <View style={styles.titleAccent} />

            {/* ── Profile Picture ── */}
            <Text style={styles.label}>Profile Picture</Text>
            <View style={styles.avatarRow}>
              <TouchableOpacity style={styles.avatarWrap} onPress={pickProfileImage} activeOpacity={0.8}>
                {profileImage
                  ? <Image source={{ uri: profileImage }} style={styles.avatarImg} />
                  : <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarInitials}>{initials}</Text>
                    </View>
                }
                <View style={styles.cameraBadge}><CameraIcon /></View>
              </TouchableOpacity>
              <View style={styles.avatarHintWrap}>
                <Text style={styles.avatarHint}>Tap to upload a photo</Text>
                <Text style={styles.avatarHintSub}>Optional — you can add or change this later in Settings.</Text>
              </View>
            </View>

            {/* ── Username ── */}
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input} value={username} onChangeText={setUsername}
              placeholder="What should we call you?" placeholderTextColor="rgba(255,255,255,0.30)"
              autoCapitalize="words" maxLength={24} returnKeyType="next"
            />

            {/* ── Age ── */}
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input} value={age} onChangeText={v => setAge(v.replace(/[^0-9]/g, ''))}
              placeholder="Your age" placeholderTextColor="rgba(255,255,255,0.30)"
              keyboardType="number-pad" maxLength={3} returnKeyType="done"
            />

            {/* ── Theme ── */}
            <Text style={styles.label}>Theme</Text>
            <View style={styles.chipsRow}>
              {THEMES.map(t => (
                <TouchableOpacity
                  key={t.value}
                  style={[styles.chip, selectedTheme === t.value && styles.chipActive]}
                  onPress={() => setSelectedTheme(t.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, selectedTheme === t.value && styles.chipTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Currency ── */}
            <Text style={styles.label}>Currency</Text>
            <View style={styles.chipsRow}>
              {CURRENCIES.map(c => (
                <TouchableOpacity
                  key={c.code}
                  style={[styles.chip, selectedCurrency === c.code && styles.chipActive]}
                  onPress={() => setSelectedCurrency(c.code)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, selectedCurrency === c.code && styles.chipTextActive]}>
                    {c.symbol} {c.code}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Terms ── */}
            <TouchableOpacity style={styles.termsRow} onPress={() => setAgreed(v => !v)} activeOpacity={0.75}>
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink} onPress={() => setTermsVisible(true)}>Terms & Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {/* ── Continue ── */}
            <TouchableOpacity
              style={[styles.btn, !canProceed && styles.btnDisabled]}
              onPress={handleContinue}
              disabled={!canProceed}
              activeOpacity={0.84}
            >
              <Text style={[styles.btnText, !canProceed && styles.btnTextDisabled]}>Continue</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>

      {/* ── Modals ── */}
      <TermsModal visible={termsVisible} onClose={() => setTermsVisible(false)} />

    </View>
  );
}

// ── Screen Styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#222629' },
  bg:   { flex: 1, width, height },
  fullOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.90)' },
  kav:  { flex: 1 },
  scroll: { paddingHorizontal: 28, paddingTop: 56 },

  backBtn:  { marginBottom: 28 },
  backText: { fontFamily: 'Fungis-Regular', fontSize: 15, color: 'rgba(255,255,255,0.55)' },

  title:       { fontFamily: 'Fungis-Heavy', fontSize: 46, color: '#FFFFFF', lineHeight: 54, marginBottom: 14 },
  titleAccent: { width: 44, height: 3, backgroundColor: '#AEB784', borderRadius: 2, marginBottom: 32 },

  label: { fontFamily: 'Fungis-Bold', fontSize: 11, color: '#AEB784', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },

  avatarRow:  { flexDirection: 'row', alignItems: 'center', gap: 18, marginBottom: 28 },
  avatarWrap: { position: 'relative' },
  avatarImg:  { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(174,183,132,0.20)',
    borderWidth: 1.5, borderColor: 'rgba(174,183,132,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: { fontFamily: 'Fungis-Heavy', fontSize: 30, color: '#AEB784' },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#AEB784',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(0,0,0,0.80)',
  },
  avatarHintWrap: { flex: 1 },
  avatarHint:     { fontFamily: 'Fungis-Bold', fontSize: 14, color: '#FFFFFF', marginBottom: 4 },
  avatarHintSub:  { fontFamily: 'Fungis-Regular', fontSize: 12, color: 'rgba(255,255,255,0.40)', lineHeight: 18 },

  input: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(174,183,132,0.28)',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontFamily: 'Fungis-Regular', fontSize: 16, color: '#FFFFFF', marginBottom: 26,
  },

  chipsRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 26 },
  chip:           { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(174,183,132,0.35)', backgroundColor: 'rgba(255,255,255,0.04)' },
  chipActive:     { backgroundColor: '#AEB784', borderColor: '#AEB784' },
  chipText:       { fontFamily: 'Fungis-Regular', fontSize: 14, color: 'rgba(255,255,255,0.65)' },
  chipTextActive: { fontFamily: 'Fungis-Bold', color: '#222629' },

  termsRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 },
  checkbox:        { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: 'rgba(174,183,132,0.45)', backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  checkboxChecked: { backgroundColor: '#AEB784', borderColor: '#AEB784' },
  checkmark:       { fontSize: 12, color: '#222629', fontWeight: '700' },
  termsText:       { fontFamily: 'Fungis-Regular', fontSize: 13, color: 'rgba(255,255,255,0.45)' },
  termsLink:       { fontFamily: 'Fungis-Bold', color: '#AEB784' },

  btn:             { backgroundColor: '#AEB784', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  btnDisabled:     { backgroundColor: 'rgba(174,183,132,0.22)' },
  btnText:         { fontFamily: 'Fungis-Bold', fontSize: 16, color: '#222629', letterSpacing: 0.6 },
  btnTextDisabled: { color: 'rgba(255,255,255,0.30)' },
});

// ── Terms Modal Styles ────────────────────────────────────────────────────────
const modal = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#2C3020',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: height * 0.82,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    borderWidth: 1, borderColor: 'rgba(174,183,132,0.18)', borderBottomWidth: 0,
  },
  handle: {
    width: 38, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(174,183,132,0.35)',
    alignSelf: 'center', marginTop: 12, marginBottom: 20,
  },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  headerTitle: { fontFamily: 'Fungis-Heavy', fontSize: 22, color: '#FFFFFF' },
  closeBtn:    { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  closeX:      { fontFamily: 'Fungis-Bold', fontSize: 13, color: 'rgba(255,255,255,0.55)' },
  accentBar:   { width: 36, height: 3, backgroundColor: '#AEB784', borderRadius: 2, marginBottom: 20 },
  scrollContent: { paddingBottom: 8 },
  intro:         { fontFamily: 'Fungis-Regular', fontSize: 13, color: 'rgba(255,255,255,0.50)', lineHeight: 21, marginBottom: 24 },
  section:       { marginBottom: 24 },
  sectionHeading:{ fontFamily: 'Fungis-Bold', fontSize: 11, color: '#AEB784', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  bulletRow:     { flexDirection: 'row', gap: 10, marginBottom: 10 },
  bullet:        { fontFamily: 'Fungis-Bold', fontSize: 16, color: '#AEB784', lineHeight: 22, marginTop: 1 },
  para:          { flex: 1, fontFamily: 'Fungis-Regular', fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 21 },
  footerNote:    { paddingTop: 16, borderTopWidth: 1, borderColor: 'rgba(174,183,132,0.15)', marginTop: 4, marginBottom: 20 },
  footerText:    { fontFamily: 'Fungis-Regular', fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', letterSpacing: 0.5 },
  agreeBtn:      { marginTop: 12, backgroundColor: '#AEB784', paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  agreeBtnText:  { fontFamily: 'Fungis-Bold', fontSize: 16, color: '#222629', letterSpacing: 0.6 },
});