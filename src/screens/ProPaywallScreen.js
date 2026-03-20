// src/screens/ProPaywallScreen.js
// Finova v3.0 — Premium Side-by-Side Paywall

import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Dimensions, BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';

const SCREEN_H = Dimensions.get('window').height;

const FREE_FEATURES = [
  'General tracking',
  'Monthly charts',
  '3 categories',
  'JSON Backup',
];

const PRO_FEATURES = [
  'Unlimited categories',
  'Multiple Wallets',
  'App Lock (PIN)',
  'Search activity',
  'CSV & .enc export',
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
    if (onDone) onDone();
    navigation.goBack();
  };

  const handlePurchase = () => {
    setLoading(true);
    // ── TEST MODE — replace with RevenueCat in production ──────────────────
    setTimeout(() => {
      updatePro(true);
      setLoading(false);
      handleClose();
    }, 900);
  };

  const handleRestore = () => {
    handleClose();
  };

  return (
    <Animated.View style={[pw.root, { transform: [{ translateY: slideAnim }] }]}>
      <SafeAreaView style={pw.safe}>
        <ScrollView contentContainerStyle={pw.scroll} showsVerticalScrollIndicator={false}>
          
          <TouchableOpacity style={pw.closeBtn} onPress={() => handleClose()} activeOpacity={0.7}>
            <Text style={pw.closeText}>✕</Text>
          </TouchableOpacity>

          <View style={pw.heroWrap}>
            <Text style={pw.brandLabel}>Welcome to</Text>
            <Text style={pw.brandText}>finova</Text>
            <Text style={pw.tagline}>Compare plans to expand your financial toolkit.</Text>
          </View>

          <View style={pw.cardsContainer}>
             {/* Free Card */}
             <View style={[pw.card, pw.freeCard]}>
                <Text style={pw.cardTitle}>Free</Text>
                <Text style={pw.price}>₹0</Text>
                <Text style={pw.priceLabel}>forever</Text>
                
                <View style={pw.divider} />
                
                <View style={pw.featureList}>
                  {FREE_FEATURES.map((feat, i) => (
                    <View key={i} style={pw.featureItem}>
                      <Text style={[pw.featureCheck, { color: 'rgba(255,255,255,0.3)' }]}>◇</Text>
                      <Text style={pw.featureTextFree}>{feat}</Text>
                    </View>
                  ))}
                </View>

                <View style={pw.currentBtn}>
                  <Text style={pw.currentBtnText}>Current</Text>
                </View>
             </View>

             {/* Pro Card */}
             <View style={[pw.card, pw.proCard]}>
                <View style={pw.proHeaderRow}>
                  <Text style={[pw.cardTitle, { color: '#AEB784' }]}>Pro</Text>
                  <View style={pw.badge}><Text style={pw.badgeText}>LIMITED TIME</Text></View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 12 }}>
                  <Text style={{ fontFamily: 'Fungis-Heavy', fontSize: 24, color: 'rgba(255,255,255,0.3)', textDecorationLine: 'line-through', marginBottom: 2 }}>₹199</Text>
                  <Text style={[pw.price, { marginTop: 0 }]}>₹49</Text>
                </View>
                <Text style={[pw.priceLabel, { color: 'rgba(174,183,132,0.6)' }]}>one-time payment. Returns to ₹199 soon.</Text>
                
                <View style={[pw.divider, { backgroundColor: 'rgba(174,183,132,0.15)' }]} />
                
                <View style={pw.featureList}>
                  {PRO_FEATURES.map((feat, i) => (
                    <View key={i} style={pw.featureItem}>
                      <Text style={[pw.featureCheck, { color: '#AEB784' }]}>✓</Text>
                      <Text style={pw.featureTextPro}>{feat}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={pw.buyBtn} onPress={handlePurchase} activeOpacity={0.85} disabled={loading}>
                  <Text style={pw.buyBtnText}>{loading ? '...' : 'Unlock Pro'}</Text>
                </TouchableOpacity>
             </View>
          </View>

          <TouchableOpacity onPress={handleRestore} activeOpacity={0.6} style={pw.restoreWrap}>
            <Text style={pw.restoreText}>Restore Purchase</Text>
          </TouchableOpacity>
          <Text style={pw.legalText}>No subscriptions. Own your data forever.</Text>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}

const pw = StyleSheet.create({
  root: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#090A09' },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20 },

  closeBtn:  { alignSelf: 'flex-end', width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  closeText: { fontFamily: 'Fungis-Bold', fontSize: 16, color: 'rgba(255,255,255,0.55)' },

  heroWrap:   { alignItems: 'center', marginBottom: 32, marginTop: 10 },
  brandLabel: { fontFamily: 'Fungis-Bold', fontSize: 13, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: -4 },
  brandText:  { fontFamily: 'Fungis-Heavy', fontSize: 64, color: '#AEB784', letterSpacing: -2, lineHeight: 72 },
  tagline:    { fontFamily: 'Fungis-Regular', fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 8 },

  cardsContainer: { flexDirection: 'column', gap: 16 },
  card: { borderRadius: 24, padding: 22, borderWidth: 1 },
  
  freeCard: { backgroundColor: '#131513', borderColor: 'rgba(255,255,255,0.08)' },
  proCard:  { backgroundColor: '#1C201A', borderColor: '#AEB784', elevation: 12, shadowColor: '#AEB784', shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width:0, height:8 } },

  proHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { backgroundColor: 'rgba(174,183,132,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(174,183,132,0.3)' },
  badgeText: { fontFamily: 'Fungis-Bold', fontSize: 9, color: '#AEB784', letterSpacing: 1 },

  cardTitle: { fontFamily: 'Fungis-Heavy', fontSize: 26, color: '#FFFFFF' },
  price: { fontFamily: 'Fungis-Heavy', fontSize: 36, color: '#FFFFFF', marginTop: 12, lineHeight: 40 },
  priceLabel: { fontFamily: 'Fungis-Regular', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2, marginBottom: 18 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 20, width: '100%' },
  
  featureList: { gap: 14 },
  featureItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  featureCheck: { fontFamily: 'Fungis-Heavy', fontSize: 15, marginTop: 1 },
  featureTextFree: { fontFamily: 'Fungis-Regular', fontSize: 14, color: 'rgba(255,255,255,0.55)', flex: 1, lineHeight: 20 },
  featureTextPro:  { fontFamily: 'Fungis-Bold', fontSize: 14, color: 'rgba(255,255,255,0.9)', flex: 1, lineHeight: 20 },

  currentBtn: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  currentBtnText: { fontFamily: 'Fungis-Bold', fontSize: 13, color: 'rgba(255,255,255,0.3)' },
  
  buyBtn: { backgroundColor: '#AEB784', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 24, elevation: 6, shadowColor: '#AEB784', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width:0, height:4 } },
  buyBtnText: { fontFamily: 'Fungis-Bold', fontSize: 15, color: '#090A09', letterSpacing: 0.5 },

  restoreWrap: { alignItems: 'center', marginTop: 32, paddingVertical: 10 },
  restoreText: { fontFamily: 'Fungis-Regular', fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecorationLine: 'underline' },
  legalText: { fontFamily: 'Fungis-Regular', fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 8 },
});
