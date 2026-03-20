// src/screens/ProPaywallScreen.js
// Finova v3.0 — Pro Paywall (TEST MODE — replace with RevenueCat for production)

import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Dimensions, BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';

const SCREEN_H = Dimensions.get('window').height;

const FEATURES = [
  { icon: '🔒', title: 'App Lock',             desc: 'PIN-protect the app every time you open it.' },
  { icon: '👛', title: 'Multiple Wallets',      desc: 'Trip, work, personal — track them separately.' },
  { icon: '🔍', title: 'Transaction Search',    desc: 'Instantly find any transaction by note or amount.' },
  { icon: '📊', title: 'CSV Export',            desc: 'Export all transactions to a spreadsheet.' },
  { icon: '🔐', title: 'Passcode Export',       desc: 'Password-protect your backup file.' },
  { icon: '🏷️', title: 'Unlimited Categories',  desc: 'Create as many custom categories as you need.' },
  { icon: '📥', title: 'Data Backup',           desc: 'Download and restore your full Finova data.' },
];

export default function ProPaywallScreen({ navigation }) {
  const { updatePro } = useApp();
  const slideAnim     = useRef(new Animated.Value(SCREEN_H)).current;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0, useNativeDriver: true,
      damping: 28, stiffness: 260, mass: 0.9,
    }).start();
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose(); return true;
    });
    return () => sub.remove();
  }, []);

  const handleClose = (onDone) => {
    Animated.spring(slideAnim, {
      toValue: SCREEN_H, useNativeDriver: true,
      damping: 26, stiffness: 240, mass: 0.9
    }).start(() => {
      if (onDone) onDone();
      navigation.goBack();
    });
  };

  const handlePurchase = () => {
    setLoading(true);
    // ── TEST MODE — replace with RevenueCat in production ──────────────────
    // import Purchases from 'react-native-purchases';
    // const offerings = await Purchases.getOfferings();
    // const pkg = offerings.current?.availablePackages[0];
    // const { customerInfo } = await Purchases.purchasePackage(pkg);
    // if (customerInfo.entitlements.active['pro']) { updatePro(true); navigation.goBack(); }
    setTimeout(() => {
      updatePro(true);
      setLoading(false);
      handleClose();
    }, 900);
  };

  const handleRestore = () => {
    // ── TEST MODE — replace with RevenueCat in production ──────────────────
    // const customerInfo = await Purchases.restorePurchases();
    // if (customerInfo.entitlements.active['pro']) { updatePro(true); ... }
    handleClose();
  };

  return (
    <Animated.View style={[pw.root, { transform: [{ translateY: slideAnim }] }]}>
      <SafeAreaView style={pw.safe}>
        <ScrollView contentContainerStyle={pw.scroll} showsVerticalScrollIndicator={false}>

          {/* Close */}
          <TouchableOpacity style={pw.closeBtn} onPress={() => handleClose()} activeOpacity={0.7}>
            <Text style={pw.closeText}>✕</Text>
          </TouchableOpacity>

          {/* Crown + headline */}
          <View style={pw.heroWrap}>
            <Text style={pw.crown}>👑</Text>
            <Text style={pw.headline}>Finova Pro</Text>
            <Text style={pw.tagline}>Everything you need to own your finances.</Text>
          </View>

          {/* Price pill */}
          <View style={pw.pricePill}>
            <Text style={pw.price}>₹199</Text>
            <Text style={pw.priceLabel}> · one-time · no subscription</Text>
          </View>

          {/* Feature rows */}
          <View style={pw.featureList}>
            {FEATURES.map((f, i) => (
              <View key={i} style={pw.featureRow}>
                <View style={pw.featureIconBox}>
                  <Text style={pw.featureIcon}>{f.icon}</Text>
                </View>
                <View style={pw.featureText}>
                  <Text style={pw.featureTitle}>{f.title}</Text>
                  <Text style={pw.featureDesc}>{f.desc}</Text>
                </View>
                <Text style={pw.featureCheck}>✓</Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity style={pw.buyBtn} onPress={handlePurchase} activeOpacity={0.84} disabled={loading}>
            <Text style={pw.buyText}>{loading ? 'Unlocking…' : 'Unlock Finova Pro  →'}</Text>
          </TouchableOpacity>

          {/* Restore */}
          <TouchableOpacity onPress={handleRestore} activeOpacity={0.6} style={{ alignItems: 'center', paddingVertical: 14 }}>
            <Text style={pw.restoreText}>Restore Purchase</Text>
          </TouchableOpacity>

          <Text style={pw.legalText}>
            One-time payment · No subscription · Data stays on your device
          </Text>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}

const pw = StyleSheet.create({
  root: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#1A1D1A' },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20 },

  closeBtn:  { alignSelf: 'flex-end', width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  closeText: { fontFamily: 'Fungis-Bold', fontSize: 16, color: 'rgba(255,255,255,0.55)' },

  heroWrap:  { alignItems: 'center', marginBottom: 24 },
  crown:     { fontSize: 48, marginBottom: 12 },
  headline:  { fontFamily: 'Fungis-Heavy', fontSize: 34, color: '#FFFFFF', marginBottom: 8, textAlign: 'center' },
  tagline:   { fontFamily: 'Fungis-Regular', fontSize: 14, color: 'rgba(255,255,255,0.50)', textAlign: 'center', lineHeight: 22 },

  pricePill:  { flexDirection: 'row', alignItems: 'baseline', alignSelf: 'center', backgroundColor: 'rgba(174,183,132,0.12)', borderWidth: 1, borderColor: 'rgba(174,183,132,0.30)', borderRadius: 40, paddingHorizontal: 20, paddingVertical: 8, marginBottom: 28 },
  price:      { fontFamily: 'Fungis-Heavy', fontSize: 26, color: '#AEB784' },
  priceLabel: { fontFamily: 'Fungis-Regular', fontSize: 13, color: 'rgba(255,255,255,0.45)' },

  featureList: { marginBottom: 24 },
  featureRow:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(174,183,132,0.10)', gap: 14 },
  featureIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(174,183,132,0.10)', alignItems: 'center', justifyContent: 'center' },
  featureIcon:    { fontSize: 20 },
  featureText:    { flex: 1 },
  featureTitle:   { fontFamily: 'Fungis-Bold',    fontSize: 14, color: '#FFFFFF', marginBottom: 2 },
  featureDesc:    { fontFamily: 'Fungis-Regular', fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 18 },
  featureCheck:   { fontFamily: 'Fungis-Heavy',   fontSize: 16, color: '#AEB784' },

  buyBtn:    { backgroundColor: '#AEB784', borderRadius: 16, paddingVertical: 17, alignItems: 'center', marginBottom: 4 },
  buyText:   { fontFamily: 'Fungis-Bold', fontSize: 16, color: '#1A1D1A', letterSpacing: 0.4 },

  restoreText: { fontFamily: 'Fungis-Regular', fontSize: 13, color: 'rgba(255,255,255,0.35)' },
  legalText:   { fontFamily: 'Fungis-Regular', fontSize: 11, color: 'rgba(255,255,255,0.22)', textAlign: 'center', marginTop: 8, lineHeight: 18 },
});
