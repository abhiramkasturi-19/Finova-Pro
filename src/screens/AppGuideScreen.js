// src/screens/AppGuideScreen.js
// Finova v2.6 — In-app usage guide

import React from 'react';
import {
  View, Text, StyleSheet, ImageBackground,
  TouchableOpacity, ScrollView, Dimensions, StatusBar,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const GUIDE_SECTIONS = [
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
    desc: 'Calendar heat map of your spending — darker days mean more activity. Tap a day to see its transactions. The donut chart below breaks down categories for the month.',
  },
  {
    title: 'Stats',
    desc: 'Dual line charts showing income vs expenses over time. Switch between weekly, monthly, and yearly views using the period selector.',
  },
  {
    title: 'Categories',
    desc: 'Built-in categories cover common expenses. Add custom ones in the transaction form — each gets a unique colour. Remove custom categories from transtion page.',
  },
  {
    title: 'Profile & Settings',
    desc: 'Tap Edit Profile on your profile card to update your name, age, or photo. Change theme and currency in Preferences anytime.',
  },
  {
    title: 'Backing Up',
    desc: 'Settings → Data Management → Download Data exports a full JSON file of all your transactions, categories, and profile. Keep this file — it is your only way to restore your account.',
  },
  {
    title: 'Restoring an Account',
    desc: 'On the Welcome screen tap Log In, then upload your backup JSON file. Everything — transactions, settings, and profile picture — will be fully restored.',
  },
  {
    title: 'Logging Out',
    desc: 'Tap Log Out at the bottom of Settings. You can download a backup first. After logout, all data is cleared from the device.',
  },
  {
    title: 'Privacy',
    desc: 'All data stays on your device. Nothing is sent to any server. Your transactions and backup files never leave your phone unless you choose to share them.',
  },
];

export default function AppGuideScreen({ navigation }) {
  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground
        source={require('../../assets/splash-icon.png')}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.fullOverlay} />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>App Guide</Text>
          <View style={styles.titleAccent} />

          <Text style={styles.intro}>
            A quick reference for every feature in Finova.
          </Text>

          {GUIDE_SECTIONS.map((section, i) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.indexPill}>
                  <Text style={styles.indexText}>{String(i + 1).padStart(2, '0')}</Text>
                </View>
                <Text style={styles.cardTitle}>{section.title}</Text>
              </View>
              <Text style={styles.cardDesc}>{section.desc}</Text>
            </View>
          ))}

          <Text style={styles.footnote}>Finova v2.6.0 · All data stored locally.</Text>
          <View style={{ height: 40 }} />
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#222629' },
  bg:   { flex: 1, width, height },
  fullOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.88)' },
  scroll: { paddingHorizontal: 28, paddingTop: 56, paddingBottom: 20 },

  backBtn:  { marginBottom: 28 },
  backText: { fontFamily: 'Fungis-Regular', fontSize: 15, color: 'rgba(255,255,255,0.55)' },

  title: { fontFamily: 'Fungis-Heavy', fontSize: 40, color: '#FFFFFF', lineHeight: 50, marginBottom: 14 },
  titleAccent: { width: 44, height: 3, backgroundColor: '#AEB784', borderRadius: 2, marginBottom: 24 },

  intro: {
    fontFamily: 'Fungis-Regular',
    fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 24, marginBottom: 28,
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
