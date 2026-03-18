// src/screens/LoginScreen.js
// Finova v2.6 — Log In via JSON backup file

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ImageBackground,
  TouchableOpacity, Dimensions, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const { importData } = useApp();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) { setLoading(false); return; }

      const fileUri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(fileUri);
      const data    = JSON.parse(content);

      // Validate — must have transactions array and settings
      if (!Array.isArray(data.transactions) || !data.settings) {
        throw new Error('Invalid file');
      }

      // Restore everything
      importData(data);
      await AsyncStorage.setItem('hasOnboarded', 'true');

      // Enter app — reset stack so user can't go back to onboarding
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });

    } catch (err) {
      setLoading(false);
      const msg = err.message === 'Invalid file'
        ? 'This file doesn\'t look like a valid Finova backup.\nMake sure you\'re using a file downloaded from Finova → Settings → Data Management.'
        : 'Could not read the file. Please try again.';
      Alert.alert('Login Failed', msg);
      console.error('[LoginScreen]', err);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground
        source={require('../../assets/splash-icon.png')}
        style={styles.bg}
        resizeMode="cover"
      >
        {/* Standard overlay */}
        <View style={styles.fullOverlay} />

        <View style={styles.content}>
          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.iconWrap}>
            <Text style={styles.iconEmoji}>🔐</Text>
          </View>

          <Text style={styles.title}>Log In</Text>
          <View style={styles.titleAccent} />

          <Text style={styles.body}>
            Restore your Finova account from a previously downloaded backup file.
            All your transactions, categories, and settings will be fully recovered.
          </Text>

          {/* Requirement callout */}
          <View style={styles.callout}>
            <Text style={styles.calloutIcon}>📂</Text>
            <Text style={styles.calloutText}>
              Can only log in if you have a{' '}
              <Text style={styles.calloutBold}>backup data JSON file</Text>
              {' '}downloaded from Settings → Data Management.
            </Text>
          </View>

          {/* How to get one */}
          <Text style={styles.hint}>
            Don't have a backup? Go back and{' '}
            <Text style={styles.hintLink}>create a new account</Text>.
          </Text>

          {/* Upload button */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnLoading]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.84}
          >
            {loading
              ? <ActivityIndicator color="#222629" />
              : <Text style={styles.btnText}>Upload Backup File</Text>
            }
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg:   { flex: 1, width, height },
  fullOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.89)' },
  content: {
    flex: 1, paddingHorizontal: 32,
    paddingTop: 56, paddingBottom: 44, justifyContent: 'center',
  },

  backBtn:  { position: 'absolute', top: 56, left: 32 },
  backText: { fontFamily: 'Fungis-Regular', fontSize: 15, color: 'rgba(255,255,255,0.55)' },

  iconWrap:  { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(174,183,132,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  iconEmoji: { fontSize: 32 },

  title: { fontFamily: 'Fungis-Heavy', fontSize: 42, color: '#FFFFFF', marginBottom: 12 },
  titleAccent: { width: 44, height: 3, backgroundColor: '#AEB784', borderRadius: 2, marginBottom: 24 },

  body: {
    fontFamily: 'Fungis-Regular',
    fontSize: 15, color: 'rgba(255,255,255,0.62)', lineHeight: 25, marginBottom: 28,
  },

  callout: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: 'rgba(174,183,132,0.10)',
    borderWidth: 1, borderColor: 'rgba(174,183,132,0.28)',
    borderRadius: 14, padding: 16, marginBottom: 20,
  },
  calloutIcon: { fontSize: 20, marginTop: 1 },
  calloutText: {
    flex: 1, fontFamily: 'Fungis-Regular',
    fontSize: 13, color: 'rgba(255,255,255,0.60)', lineHeight: 21,
  },
  calloutBold: { fontFamily: 'Fungis-Bold', color: '#AEB784' },

  hint: {
    fontFamily: 'Fungis-Regular',
    fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginBottom: 32,
  },
  hintLink: { fontFamily: 'Fungis-Bold', color: 'rgba(174,183,132,0.65)' },

  btn: {
    backgroundColor: '#AEB784', paddingVertical: 16,
    borderRadius: 14, alignItems: 'center',
  },
  btnLoading: { opacity: 0.7 },
  btnText: { fontFamily: 'Fungis-Bold', fontSize: 16, color: '#222629', letterSpacing: 0.6 },
});
