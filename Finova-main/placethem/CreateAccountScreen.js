// screens/CreateAccountScreen.js
// Finova v2.5 — Onboarding Page 2
// Username, Age, Theme, Currency, Terms checkbox → links to AppContext

import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AppContext } from '../AppContext';

const { width, height } = Dimensions.get('window');

const CURRENCIES = [
  { symbol: '₹', code: 'INR' },
  { symbol: '$', code: 'USD' },
  { symbol: '€', code: 'EUR' },
  { symbol: '£', code: 'GBP' },
  { symbol: '¥', code: 'JPY' },
];

const THEMES = [
  { label: '☀️  Light', value: 'light' },
  { label: '🌙  Dark',  value: 'dark'  },
];

export default function CreateAccountScreen({ navigation }) {
  const { setIsDark, setUserProfile } = useContext(AppContext);

  const [username,         setUsername        ] = useState('');
  const [age,              setAge             ] = useState('');
  const [selectedTheme,    setSelectedTheme   ] = useState('dark');
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [agreed,           setAgreed          ] = useState(false);

  // All required fields filled AND terms accepted
  const canProceed = username.trim().length > 0 && age.trim().length > 0 && agreed;

  const handleContinue = () => {
    // Push to context — theme applied immediately, rest stored in userProfile
    const isDarkChoice = selectedTheme === 'dark';
    setIsDark(isDarkChoice);
    setUserProfile({
      username:  username.trim(),
      age:       age.trim(),
      theme:     selectedTheme,
      currency:  selectedCurrency,
    });
    navigation.navigate('DataInfo');
  };

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ImageBackground
        source={require('../assets/splash-icon.png')}
        style={styles.bg}
        resizeMode="cover"
      >
        {/* Heavy full-screen overlay so form is readable */}
        <View style={styles.fullOverlay} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >

            {/* Back */}
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.title}>Create{'\n'}Account</Text>
            <View style={styles.titleAccent} />

            {/* ── Username ── */}
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="What should we call you?"
              placeholderTextColor="rgba(255,255,255,0.30)"
              autoCapitalize="words"
              maxLength={24}
              returnKeyType="next"
            />

            {/* ── Age ── */}
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={v => setAge(v.replace(/[^0-9]/g, ''))}
              placeholder="Your age"
              placeholderTextColor="rgba(255,255,255,0.30)"
              keyboardType="number-pad"
              maxLength={3}
              returnKeyType="done"
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

            {/* ── Terms Checkbox ── */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreed(v => !v)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {/* ── Continue Button ── */}
            <TouchableOpacity
              style={[styles.btn, !canProceed && styles.btnDisabled]}
              onPress={handleContinue}
              disabled={!canProceed}
              activeOpacity={0.84}
            >
              <Text style={[styles.btnText, !canProceed && styles.btnTextDisabled]}>
                Continue
              </Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#222629',
  },
  bg: {
    flex: 1,
    width,
    height,
  },
  fullOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.86)',
  },
  kav: { flex: 1 },
  scroll: {
    paddingHorizontal: 28,
    paddingTop: 56,
  },

  /* Back */
  backBtn: { marginBottom: 28 },
  backText: {
    fontFamily: 'FUNGIS-Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.55)',
  },

  /* Title */
  title: {
    fontFamily: 'FUNGIS-Heavy',
    fontSize: 46,
    color: '#FFFFFF',
    lineHeight: 54,
    marginBottom: 14,
  },
  titleAccent: {
    width: 44,
    height: 3,
    backgroundColor: '#AEB784',
    borderRadius: 2,
    marginBottom: 32,
  },

  /* Labels */
  label: {
    fontFamily: 'FUNGIS-Bold',
    fontSize: 11,
    color: '#AEB784',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  /* Inputs */
  input: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(174, 183, 132, 0.28)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'FUNGIS-Regular',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 26,
  },

  /* Chips */
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 26,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(174, 183, 132, 0.35)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  chipActive: {
    backgroundColor: '#AEB784',
    borderColor: '#AEB784',
  },
  chipText: {
    fontFamily: 'FUNGIS-Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
  },
  chipTextActive: {
    fontFamily: 'FUNGIS-Bold',
    color: '#222629',
  },

  /* Terms */
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 30,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(174, 183, 132, 0.45)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: '#AEB784',
    borderColor: '#AEB784',
  },
  checkmark: {
    fontSize: 13,
    color: '#222629',
    fontWeight: '700',
  },
  termsText: {
    flex: 1,
    fontFamily: 'FUNGIS-Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.50)',
    lineHeight: 21,
  },
  termsLink: {
    fontFamily: 'FUNGIS-Bold',
    color: '#AEB784',
  },

  /* Button */
  btn: {
    backgroundColor: '#AEB784',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: 'rgba(174, 183, 132, 0.22)',
  },
  btnText: {
    fontFamily: 'FUNGIS-Bold',
    fontSize: 16,
    color: '#222629',
    letterSpacing: 0.6,
  },
  btnTextDisabled: {
    color: 'rgba(255,255,255,0.30)',
  },
});
