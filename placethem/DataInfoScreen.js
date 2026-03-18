// screens/DataInfoScreen.js
// Finova v2.5 — Onboarding Page 3
// Data management explainer → final step before entering the app

import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from '../AppContext';

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
  const { userProfile } = useContext(AppContext);

  const handleEnterApp = async () => {
    try {
      // Mark onboarding complete
      await AsyncStorage.setItem('hasOnboarded', 'true');
      // Persist user profile
      if (userProfile) {
        await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
      }
      // Replace the entire navigation stack with the main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp' }],
      });
    } catch (e) {
      console.error('[DataInfoScreen] Failed to save onboarding data:', e);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ImageBackground
        source={require('../assets/splash-icon.png')}
        style={styles.bg}
        resizeMode="cover"
      >
        {/* Dark overlay */}
        <View style={styles.fullOverlay} />

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>Your Data,{'\n'}Your Control.</Text>
          <View style={styles.titleAccent} />

          {/* Intro */}
          <Text style={styles.intro}>
            Finova stores everything privately on your device — nothing leaves without you knowing.
            Head to{' '}
            <Text style={styles.highlight}>Settings → Data Management</Text>
            {' '}whenever you need to:
          </Text>

          {/* Feature cards */}
          {DATA_FEATURES.map((f, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.cardIcon}>{f.icon}</Text>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{f.title}</Text>
                <Text style={styles.cardDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}

          {/* Footnote */}
          <Text style={styles.footnote}>
            These options are always available in your Settings tab.
          </Text>

          {/* Enter App */}
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
    backgroundColor: 'rgba(0,0,0,0.88)',
  },
  scroll: {
    paddingHorizontal: 28,
    paddingTop: 56,
    paddingBottom: 20,
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
    fontSize: 40,
    color: '#FFFFFF',
    lineHeight: 50,
    marginBottom: 14,
  },
  titleAccent: {
    width: 44,
    height: 3,
    backgroundColor: '#AEB784',
    borderRadius: 2,
    marginBottom: 24,
  },

  /* Intro */
  intro: {
    fontFamily: 'FUNGIS-Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.62)',
    lineHeight: 25,
    marginBottom: 28,
  },
  highlight: {
    fontFamily: 'FUNGIS-Bold',
    color: '#AEB784',
  },

  /* Cards */
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(174, 183, 132, 0.14)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 24,
    marginTop: 1,
  },
  cardBody: { flex: 1 },
  cardTitle: {
    fontFamily: 'FUNGIS-Bold',
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  cardDesc: {
    fontFamily: 'FUNGIS-Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.52)',
    lineHeight: 20,
  },

  /* Footnote */
  footnote: {
    fontFamily: 'FUNGIS-Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.30)',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 32,
  },

  /* Button */
  btn: {
    backgroundColor: '#AEB784',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnText: {
    fontFamily: 'FUNGIS-Bold',
    fontSize: 16,
    color: '#222629',
    letterSpacing: 0.6,
  },
});
