// src/screens/DataInfoScreen.js
// Finova v2.5 — Onboarding Page 3
// Data management explainer → saves hasOnboarded and enters main app

import React from 'react';
import {
  View, Text, StyleSheet, ImageBackground, TouchableOpacity,
  ScrollView, Dimensions, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const DATA_FEATURES = [
  {
    icon: '📤',
    title: 'Export Data',
    desc: 'Download all your transactions and settings as a backup file, saved directly to your device.',
  },
  {
    icon: '📥',
    title: 'Import Data',
    desc: 'Restore a previous backup — all your transactions and preferences come back instantly.',
  },
  {
    icon: '🗑️',
    title: 'Delete Data',
    desc: 'Permanently wipe everything from the app. A clean slate, no traces left behind.',
  },
];

export default function DataInfoScreen({ navigation }) {

  const handleEnterApp = async () => {
    try {
      await AsyncStorage.setItem('hasOnboarded', 'true');
    } catch (e) {
      console.error('[DataInfoScreen] Failed to save onboarding flag:', e);
    }
    // Reset nav stack — user lands on Main and can never go back to onboarding
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground
        source={require('../../assets/background.png')}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.fullOverlay} />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Your Data,{'\n'}Your Control.</Text>
          <View style={styles.titleAccent} />

          <Text style={styles.intro}>
            Finova stores everything privately on your device — nothing leaves without you knowing.
            Head to <Text style={styles.highlight}>Settings → Data Management</Text> whenever you need to:
          </Text>

          {DATA_FEATURES.map((f, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.cardIcon}>{f.icon}</Text>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{f.title}</Text>
                <Text style={styles.cardDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}

          <Text style={styles.footnote}>
            These options are always available in your Settings tab.
          </Text>

          <TouchableOpacity style={styles.btn} onPress={handleEnterApp} activeOpacity={0.84}>
            <Text style={styles.btnText}>Enter Finova  →</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#222629' },
  bg: { flex: 1, width, height },
  fullOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.89)' },
  scroll: { paddingHorizontal: 28, paddingTop: 56, paddingBottom: 20 },
  backBtn: { marginBottom: 28 },
  backText: { fontFamily: 'Fungis-Regular', fontSize: 15, color: 'rgba(255,255,255,0.55)' },
  title: { fontFamily: 'Fungis-Heavy', fontSize: 40, color: '#FFFFFF', lineHeight: 50, marginBottom: 14 },
  titleAccent: { width: 44, height: 3, backgroundColor: '#AEB784', borderRadius: 2, marginBottom: 24 },
  intro: { fontFamily: 'Fungis-Regular', fontSize: 15, color: 'rgba(255,255,255,0.62)', lineHeight: 25, marginBottom: 28 },
  highlight: { fontFamily: 'Fungis-Bold', color: '#AEB784' },
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(174,183,132,0.14)',
    borderRadius: 14, padding: 16, marginBottom: 12,
  },
  cardIcon: { fontSize: 24, marginTop: 1 },
  cardBody: { flex: 1 },
  cardTitle: { fontFamily: 'Fungis-Bold', fontSize: 15, color: '#FFFFFF', marginBottom: 5 },
  cardDesc: { fontFamily: 'Fungis-Regular', fontSize: 13, color: 'rgba(255,255,255,0.52)', lineHeight: 20 },
  footnote: { fontFamily: 'Fungis-Regular', fontSize: 12, color: 'rgba(255,255,255,0.30)', textAlign: 'center', marginTop: 6, marginBottom: 32 },
  btn: { backgroundColor: '#AEB784', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  btnText: { fontFamily: 'Fungis-Bold', fontSize: 16, color: '#222629', letterSpacing: 0.6 },
});
