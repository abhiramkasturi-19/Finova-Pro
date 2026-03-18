// src/screens/CreateAccountScreen.js
// Finova v2.6 — Onboarding Page 2 — with profile picture upload

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ImageBackground, TouchableOpacity,
  TextInput, ScrollView, Dimensions, StatusBar,
  KeyboardAvoidingView, Platform, Image, Alert,
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

// Camera/edit icon for avatar overlay
function CameraIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="#222629" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="#222629" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export default function CreateAccountScreen({ navigation }) {
  const { updateSettings } = useApp();

  const [profileImage,     setProfileImage    ] = useState(null); // base64 data URI
  const [username,         setUsername        ] = useState('');
  const [age,              setAge             ] = useState('');
  const [selectedTheme,    setSelectedTheme   ] = useState('dark');
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [agreed,           setAgreed          ] = useState(false);

  const canProceed = username.trim().length > 0 && age.trim().length > 0 && agreed;

  const pickProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to set a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.45,
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
      <ImageBackground source={require('../../assets/splash-icon.png')} style={styles.bg} resizeMode="cover">
        <View style={styles.fullOverlay} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

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
                {/* Camera badge */}
                <View style={styles.cameraBadge}>
                  <CameraIcon />
                </View>
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
                <TouchableOpacity key={t.value} style={[styles.chip, selectedTheme === t.value && styles.chipActive]} onPress={() => setSelectedTheme(t.value)} activeOpacity={0.8}>
                  <Text style={[styles.chipText, selectedTheme === t.value && styles.chipTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Currency ── */}
            <Text style={styles.label}>Currency</Text>
            <View style={styles.chipsRow}>
              {CURRENCIES.map(c => (
                <TouchableOpacity key={c.code} style={[styles.chip, selectedCurrency === c.code && styles.chipActive]} onPress={() => setSelectedCurrency(c.code)} activeOpacity={0.8}>
                  <Text style={[styles.chipText, selectedCurrency === c.code && styles.chipTextActive]}>{c.symbol} {c.code}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Terms ── */}
            <TouchableOpacity style={styles.termsRow} onPress={() => setAgreed(v => !v)} activeOpacity={0.8}>
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {/* ── Continue ── */}
            <TouchableOpacity style={[styles.btn, !canProceed && styles.btnDisabled]} onPress={handleContinue} disabled={!canProceed} activeOpacity={0.84}>
              <Text style={[styles.btnText, !canProceed && styles.btnTextDisabled]}>Continue</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#222629' },
  bg:   { flex: 1, width, height },
  fullOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.89)' },
  kav:  { flex: 1 },
  scroll: { paddingHorizontal: 28, paddingTop: 56 },

  backBtn:  { marginBottom: 28 },
  backText: { fontFamily: 'Fungis-Regular', fontSize: 15, color: 'rgba(255,255,255,0.55)' },

  title: { fontFamily: 'Fungis-Heavy', fontSize: 46, color: '#FFFFFF', lineHeight: 54, marginBottom: 14 },
  titleAccent: { width: 44, height: 3, backgroundColor: '#AEB784', borderRadius: 2, marginBottom: 32 },

  label: { fontFamily: 'Fungis-Bold', fontSize: 11, color: '#AEB784', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },

  // Avatar
  avatarRow:     { flexDirection: 'row', alignItems: 'center', gap: 18, marginBottom: 28 },
  avatarWrap:    { position: 'relative' },
  avatarImg:     { width: 80, height: 80, borderRadius: 40 },
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
  avatarHint:    { fontFamily: 'Fungis-Bold', fontSize: 14, color: '#FFFFFF', marginBottom: 4 },
  avatarHintSub: { fontFamily: 'Fungis-Regular', fontSize: 12, color: 'rgba(255,255,255,0.40)', lineHeight: 18 },

  input: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(174,183,132,0.28)',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontFamily: 'Fungis-Regular', fontSize: 16, color: '#FFFFFF', marginBottom: 26,
  },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 26 },
  chip:     { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(174,183,132,0.35)', backgroundColor: 'rgba(255,255,255,0.04)' },
  chipActive:    { backgroundColor: '#AEB784', borderColor: '#AEB784' },
  chipText:      { fontFamily: 'Fungis-Regular', fontSize: 14, color: 'rgba(255,255,255,0.65)' },
  chipTextActive:{ fontFamily: 'Fungis-Bold', color: '#222629' },

  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 30 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: 'rgba(174,183,132,0.45)', backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 },
  checkboxChecked: { backgroundColor: '#AEB784', borderColor: '#AEB784' },
  checkmark: { fontSize: 13, color: '#222629', fontWeight: '700' },
  termsText: { flex: 1, fontFamily: 'Fungis-Regular', fontSize: 13, color: 'rgba(255,255,255,0.50)', lineHeight: 21 },
  termsLink: { fontFamily: 'Fungis-Bold', color: '#AEB784' },

  btn:          { backgroundColor: '#AEB784', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  btnDisabled:  { backgroundColor: 'rgba(174,183,132,0.22)' },
  btnText:      { fontFamily: 'Fungis-Bold', fontSize: 16, color: '#222629', letterSpacing: 0.6 },
  btnTextDisabled: { color: 'rgba(255,255,255,0.30)' },
});
