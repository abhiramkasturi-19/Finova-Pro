// src/screens/AppGuideScreen.js
// Finova v2.6 — In-app usage guide

import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ImageBackground,
  TouchableOpacity, ScrollView, Dimensions, StatusBar,
  Animated, BackHandler,
} from 'react-native';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

const FREE_FEATURES = [
  {
    title: 'Home',
    desc: "Your monthly balance, income, and expenses at a glance. Tap + to add a transaction.",
  },
  {
    title: 'Adding a Transaction',
    desc: 'Enter the amount, type, and category. Expand Date & Time for a custom date. Tap Record to save.',
  },
  {
    title: 'Activity',
    desc: 'Calendar heat map of your spending — darker days mean more activity. Tap a day to see its transactions.',
  },
  {
    title: 'Stats',
    desc: 'Dual line charts showing income vs expenses over time. Switch between weekly, monthly, and yearly views using the period selector.',
  },
  {
    title: 'Categories',
    desc: 'Built-in categories cover common expenses. Add custom ones in the transaction form — each gets a unique color. Free users can add up to 3 custom categories.',
  },
  {
    title: 'Backing Up & Restoring',
    desc: 'Download a JSON backup of everything. On the Welcome screen tap Log In, then upload your backup JSON to fully restore your account.',
  },
  {
    title: 'Privacy',
    desc: 'All data stays on your device. Nothing is sent to any server. Your transactions and backup files never leave your phone unless you choose to share them.',
  },
];

const PRO_FEATURES = [
  {
    title: 'Wallets',
    desc: 'Manage multiple spending contexts (e.g., Personal, Business). Transactions are tagged to the active wallet. Switch wallets via the avatar or wallet pill on the home screen.',
  },
  {
    title: 'App Lock',
    desc: 'Secure your financial data with a 4-digit PIN. Enable this in Settings → Preferences. The lock triggers whenever you return to the app.',
  },
  {
    title: 'Export & Encrypt',
    desc: 'Export transactions to CSV for Excel, or use Passcode Export to password-protect your backup files (creates an encrypted .enc file).',
  },
  {
    title: 'Activity Search',
    desc: 'Use the search icon in the Activity screen to find specific entries by note or amount.',
  },
  {
    title: 'Unlimited Categories',
    desc: 'Add as many custom categories as you need for both income and expenses.',
  },
];

export default function AppGuideScreen({ navigation }) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      damping: 26,
      stiffness: 240,
      mass: 0.9,
    }).start();
  }, []);

  // Graceful slide-down exit
  const handleClose = () => {
    navigation.goBack();
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose();
      return true;
    });
    return () => sub.remove();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground
        source={require('../../assets/background.png')}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.fullOverlay} />
        <Animated.View style={{ flex: 1, transform: [{ translateY: slideAnim }] }}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            <TouchableOpacity style={styles.backBtn} onPress={handleClose}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

          <Text style={styles.title}>App Guide</Text>
          <View style={styles.titleAccent} />

          <Text style={styles.intro}>
            A complete reference for Finova Free and Pro features.
          </Text>

          <Text style={styles.sectionHeading}>Free Features</Text>
          {FREE_FEATURES.map((section, i) => (
            <View key={`free-${i}`} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.indexPill}>
                  <Text style={styles.indexText}>{String(i + 1).padStart(2, '0')}</Text>
                </View>
                <Text style={styles.cardTitle}>{section.title}</Text>
              </View>
              <Text style={styles.cardDesc}>{section.desc}</Text>
            </View>
          ))}

          <Text style={[styles.sectionHeading, { marginTop: 24, color: '#AEB784' }]}>Pro Features</Text>
          {PRO_FEATURES.map((section, i) => (
            <View key={`pro-${i}`} style={[styles.card, { borderColor: 'rgba(174,183,132,0.3)' }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.indexPill, { backgroundColor: '#AEB784', borderColor: '#AEB784' }]}>
                  <Text style={[styles.indexText, { color: '#2C3020' }]}>{String(i + 1).padStart(2, '0')}</Text>
                </View>
                <Text style={styles.cardTitle}>{section.title}</Text>
              </View>
              <Text style={styles.cardDesc}>{section.desc}</Text>
            </View>
          ))}

          <Text style={styles.footnote}>Finova v3.0.0 · Your data, your privacy.</Text>
          <View style={{ height: 40 }} />
        </ScrollView>
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#222629' },
  bg:   { flex: 1, width, height: SCREEN_HEIGHT },
  fullOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.88)' },
  scroll: { paddingHorizontal: 28, paddingTop: 56, paddingBottom: 20 },

  backBtn:  { marginBottom: 28 },
  backText: { fontFamily: 'Fungis-Regular', fontSize: 15, color: 'rgba(255,255,255,0.55)' },

  title: { fontFamily: 'Fungis-Heavy', fontSize: 40, color: '#FFFFFF', lineHeight: 50, marginBottom: 14 },
  titleAccent: { width: 44, height: 3, backgroundColor: '#AEB784', borderRadius: 2, marginBottom: 24 },

  intro: {
    fontFamily: 'Fungis-Regular',
    fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 24, marginBottom: 20,
  },

  sectionHeading: {
    fontFamily: 'Fungis-Heavy', fontSize: 22, color: '#FFFFFF',
    marginBottom: 16, marginTop: 12,
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(174,183,132,0.14)',
    borderRadius: 14, padding: 16, marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  indexPill: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: 'rgba(174,183,132,0.15)',
    borderWidth: 1, borderColor: 'rgba(174,183,132,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  indexText: { fontFamily: 'Fungis-Bold', fontSize: 11, color: '#AEB784' },
  cardTitle: { fontFamily: 'Fungis-Bold', fontSize: 15, color: '#FFFFFF', flex: 1 },
  cardDesc:  { fontFamily: 'Fungis-Regular', fontSize: 13, color: 'rgba(255,255,255,0.50)', lineHeight: 21 },

  footnote: {
    fontFamily: 'Fungis-Regular', fontSize: 12,
    color: 'rgba(255,255,255,0.22)', textAlign: 'center', marginTop: 12,
  },
});
