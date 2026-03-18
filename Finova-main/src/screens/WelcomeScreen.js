// src/screens/WelcomeScreen.js
// Finova v2.6 — Onboarding Page 1 — Get Started + Log In

import React from 'react';
import {
  View, Text, StyleSheet, ImageBackground,
  TouchableOpacity, Dimensions, StatusBar,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground
        source={require('../../assets/splash-icon.png')}
        style={styles.bg}
        resizeMode="cover"
      >
        {/* Smooth SVG gradient from bottom */}
        <View style={StyleSheet.absoluteFill}>
          <Svg height={height} width={width}>
            <Defs>
              <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%"   stopColor="#000" stopOpacity="0" />
                <Stop offset="42%"  stopColor="#000" stopOpacity="0" />
                <Stop offset="52%"  stopColor="#000" stopOpacity="0.88" />
                <Stop offset="100%" stopColor="#000" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width={width} height={height} fill="url(#grad)" />
          </Svg>
        </View>

        <View style={styles.content}>
          <Text style={styles.headline}>Finova</Text>
          <Text style={styles.tagline}>Your wealth, in full view.</Text>

          <View style={styles.linesRow}>
            <View style={styles.line} />
            <View style={styles.lineDiamond} />
            <View style={styles.line} />
          </View>

          <Text style={styles.subheadline}>
            Track every flow, analyze every trend,{'\n'}and own your financial future.
          </Text>

          {/* Primary CTA */}
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => navigation.navigate('CreateAccount')}
            activeOpacity={0.84}
          >
            <Text style={styles.btnPrimaryText}>Get Started</Text>
          </TouchableOpacity>

          {/* Secondary — Log In */}
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.75}
          >
            <Text style={styles.btnSecondaryText}>Log In</Text>
          </TouchableOpacity>

          <Text style={styles.loginHint}>
            Can only log in if you have a backup data JSON file.
          </Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg:   { flex: 1, width, height },
  content: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 32, paddingBottom: 44,
  },
  headline: {
    fontFamily: 'Fungis-Heavy',
    fontSize: 58, color: '#FFFFFF', letterSpacing: 0.5, marginBottom: 4,
  },
  tagline: {
    fontFamily: 'Fungis-Bold',
    fontSize: 19, color: '#AEB784', marginBottom: 22, letterSpacing: 0.2,
  },
  linesRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 10 },
  line:     { flex: 1, height: 1, backgroundColor: 'rgba(174,183,132,0.38)' },
  lineDiamond: {
    width: 6, height: 6, borderRadius: 1, backgroundColor: '#AEB784',
    transform: [{ rotate: '45deg' }],
  },
  subheadline: {
    fontFamily: 'Fungis-Regular',
    fontSize: 15, color: 'rgba(255,255,255,0.68)', lineHeight: 25, marginBottom: 36,
  },
  btnPrimary: {
    backgroundColor: '#AEB784', paddingVertical: 16,
    borderRadius: 14, alignItems: 'center', marginBottom: 12,
  },
  btnPrimaryText: {
    fontFamily: 'Fungis-Bold', fontSize: 16, color: '#222629', letterSpacing: 0.6,
  },
  btnSecondary: {
    borderWidth: 1.5, borderColor: 'rgba(174,183,132,0.45)',
    paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginBottom: 14,
  },
  btnSecondaryText: {
    fontFamily: 'Fungis-Bold', fontSize: 16, color: '#AEB784', letterSpacing: 0.6,
  },
  loginHint: {
    fontFamily: 'Fungis-Regular',
    fontSize: 12, color: 'rgba(255,255,255,0.32)',
    textAlign: 'center', lineHeight: 18,
  },
});
