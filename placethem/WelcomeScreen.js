// screens/WelcomeScreen.js
// Finova v2.5 — Onboarding Page 1
// Full-screen splash background, bottom shadow, headline, decorative lines, CTA

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ImageBackground
        source={require('../assets/splash-icon.png')}
        style={styles.bg}
        resizeMode="cover"
      >
        {/* ── Multi-layer bottom shadow (simulates gradient fade) ── */}
        <View style={[styles.shadowSlice, { height: height * 0.25, opacity: 0.15 }]} />
        <View style={[styles.shadowSlice, { height: height * 0.35, opacity: 0.25 }]} />
        <View style={[styles.shadowSlice, { height: height * 0.48, opacity: 0.42 }]} />
        <View style={[styles.shadowSlice, { height: height * 0.58, opacity: 0.60 }]} />
        <View style={[styles.shadowSlice, { height: height * 0.68, opacity: 0.76 }]} />
        <View style={[styles.shadowSlice, { height: height * 0.52, opacity: 0.88 }]} />

        {/* ── Content pinned to bottom ── */}
        <View style={styles.content}>

          {/* Headline */}
          <Text style={styles.headline}>Finova</Text>
          <Text style={styles.tagline}>Your wealth, in full view.</Text>

          {/* Decorative lines — sit between headline & sub-headline */}
          <View style={styles.linesRow}>
            <View style={styles.line} />
            <View style={styles.lineDiamond} />
            <View style={styles.line} />
          </View>

          {/* Sub-headline */}
          <Text style={styles.subheadline}>
            Track every flow, analyze every trend,{'\n'}
            and own your financial future.
          </Text>

          {/* CTA */}
          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate('CreateAccount')}
            activeOpacity={0.84}
          >
            <Text style={styles.btnText}>Get Started</Text>
          </TouchableOpacity>

        </View>
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

  /* Shadow layers — all anchored to bottom */
  shadowSlice: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000',
  },

  /* Content */
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    paddingBottom: 52,
  },

  headline: {
    fontFamily: 'FUNGIS-Heavy',   // match key used in useFonts inside App.js
    fontSize: 58,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tagline: {
    fontFamily: 'FUNGIS-Bold',
    fontSize: 19,
    color: '#AEB784',
    marginBottom: 22,
    letterSpacing: 0.2,
  },

  /* Decorative lines */
  linesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(174, 183, 132, 0.38)',
  },
  lineDiamond: {
    width: 6,
    height: 6,
    borderRadius: 1,
    backgroundColor: '#AEB784',
    transform: [{ rotate: '45deg' }],
  },

  subheadline: {
    fontFamily: 'FUNGIS-Regular',
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.68)',
    lineHeight: 25,
    marginBottom: 44,
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
