// App.js — Finova v3.0
// Added: ProPaywallScreen · WalletsScreen · AppLock PIN overlay

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  TouchableOpacity, View, StyleSheet, Text, Modal,
  Animated, Dimensions, BackHandler, AppState,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppProvider, useApp } from './src/context/AppContext';
import HomeScreen            from './src/screens/HomeScreen';
import ActivityScreen        from './src/screens/ActivityScreen';
import StatsScreen           from './src/screens/StatsScreen';
import SettingsScreen        from './src/screens/SettingsScreen';
import AddTransactionScreen  from './src/screens/AddTransactionScreen';
import WelcomeScreen         from './src/screens/WelcomeScreen';
import CreateAccountScreen   from './src/screens/CreateAccountScreen';
import DataInfoScreen        from './src/screens/DataInfoScreen';
import LoginScreen           from './src/screens/LoginScreen';
import AppGuideScreen        from './src/screens/AppGuideScreen';
import ProPaywallScreen      from './src/screens/ProPaywallScreen';
import WalletsScreen         from './src/screens/WalletsScreen';
import { lightColors, darkColors } from './src/theme/theme';
import Icon from './src/components/Icon';

SplashScreen.preventAutoHideAsync();

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const Stack = createNativeStackNavigator();

const TAB_ITEMS = [
  { name: 'Home',     icon: 'home'     },
  { name: 'Activity', icon: 'activity' },
  { name: 'Stats',    icon: 'barChart' },
  { name: 'Settings', icon: 'settings' },
];

// ─── App Lock PIN Overlay ─────────────────────────────────────────────────────
// Sits inside AppProvider so it can read settings.
// Watches AppState — shows PIN pad whenever app comes back to foreground with lock enabled.
function AppLockOverlay({ children }) {
  const { settings }      = useApp();
  const [locked, setLocked] = useState(false);
  const [pin,    setPin  ]  = useState('');
  const [shake,  setShake]  = useState(false);
  const shakeAnim           = useRef(new Animated.Value(0)).current;
  const appStateRef         = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      // background / inactive → active: lock if enabled
      if (prev.match(/inactive|background/) && next === 'active') {
        if (settings.appLockEnabled && settings.appLockPin) {
          setLocked(true);
          setPin('');
        }
      }
    });
    return () => sub.remove();
  }, [settings.appLockEnabled, settings.appLockPin]);

  const triggerShake = () => {
    setPin('');
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue:  10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  0,  duration: 40, useNativeDriver: true }),
    ]).start();
  };

  const handleDigit = (digit) => {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) {
      if (next === settings.appLockPin) {
        setLocked(false);
        setPin('');
      } else {
        setTimeout(triggerShake, 100);
      }
    }
  };

  const handleBackspace = () => setPin(p => p.slice(0, -1));

  const DIGITS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  return (
    <View style={{ flex: 1 }}>
      {children}
      <Modal visible={locked} animationType="fade" transparent={false} statusBarTranslucent>
        <View style={lock.root}>
          <Text style={lock.appName}>Finova</Text>
          <Text style={lock.label}>Enter your PIN</Text>

          {/* Dots */}
          <Animated.View style={[lock.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
            {[0,1,2,3].map(i => (
              <View key={i} style={[lock.dot, pin.length > i && lock.dotFilled]} />
            ))}
          </Animated.View>

          {/* Numpad */}
          <View style={lock.pad}>
            {DIGITS.map((d, i) => {
              if (d === '') return <View key={i} style={lock.padEmpty} />;
              const isBack = d === '⌫';
              return (
                <TouchableOpacity
                  key={i}
                  style={lock.padBtn}
                  onPress={() => isBack ? handleBackspace() : handleDigit(d)}
                  activeOpacity={0.65}
                >
                  <Text style={[lock.padText, isBack && lock.padBack]}>{d}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const lock = StyleSheet.create({
  root:      { flex: 1, backgroundColor: '#1A1D1A', alignItems: 'center', justifyContent: 'center' },
  appName:   { fontFamily: 'Fungis-Heavy', fontSize: 28, color: '#AEB784', marginBottom: 10 },
  label:     { fontFamily: 'Fungis-Regular', fontSize: 15, color: 'rgba(255,255,255,0.45)', marginBottom: 36 },
  dotsRow:   { flexDirection: 'row', gap: 20, marginBottom: 52 },
  dot:       { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: 'rgba(174,183,132,0.50)', backgroundColor: 'transparent' },
  dotFilled: { backgroundColor: '#AEB784', borderColor: '#AEB784' },
  pad:       { flexDirection: 'row', flexWrap: 'wrap', width: 260, justifyContent: 'center', gap: 16 },
  padEmpty:  { width: 72, height: 72 },
  padBtn:    { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(174,183,132,0.10)', borderWidth: 1, borderColor: 'rgba(174,183,132,0.18)', alignItems: 'center', justifyContent: 'center' },
  padText:   { fontFamily: 'Fungis-Heavy', fontSize: 26, color: '#FFFFFF' },
  padBack:   { fontSize: 22, color: 'rgba(255,255,255,0.55)' },
});

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
function CustomTabBar({ activeTab, onNavigate, navigation }) {
  const { settings } = useApp();
  const insets    = useSafeAreaInsets();
  const colors    = settings.darkMode ? darkColors : lightColors;
  const glowColor = settings.darkMode ? '#AEB784' : '#89986D';

  const renderTab = (item, index) => {
    const isFocused = activeTab === index;
    return (
      <TouchableOpacity key={item.name} style={tb.item} onPress={() => onNavigate(index)} activeOpacity={0.6}>
        <Icon name={item.icon} size={21} color={isFocused ? colors.gold : colors.textMuted} strokeWidth={isFocused ? 2.2 : 1.5} />
        <Text style={[tb.label, { color: isFocused ? colors.gold : colors.textMuted, fontFamily: isFocused ? 'Fungis-Bold' : 'Fungis-Regular' }]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[tb.wrapper, { bottom: Math.max(insets.bottom, 16) + 8 }]}>
      <View style={[tb.glow, { shadowColor: glowColor }]} />
      <View style={[tb.bar, { backgroundColor: settings.darkMode ? '#2E3230' : '#F5EDD6' }]}>
        {TAB_ITEMS.slice(0, 2).map((item, i) => renderTab(item, i))}
        <TouchableOpacity style={tb.addWrap} onPress={() => navigation.navigate('AddTransaction')} activeOpacity={0.85}>
          <View style={[tb.addBtn, { backgroundColor: colors.gold, shadowColor: glowColor }]}>
            <Text style={[tb.addIcon, { color: settings.darkMode ? '#222629' : '#3D4A2E' }]}>+</Text>
          </View>
        </TouchableOpacity>
        {TAB_ITEMS.slice(2).map((item, i) => renderTab(item, i + 2))}
      </View>
    </View>
  );
}

const tb = StyleSheet.create({
  wrapper: { position: 'absolute', left: 20, right: 20, alignItems: 'stretch', overflow: 'visible', zIndex: 100, elevation: 100 },
  glow:    { position: 'absolute', top: 4, left: 12, right: 12, bottom: -4, borderRadius: 26, elevation: 24, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 18, backgroundColor: 'transparent' },
  bar:     { flexDirection: 'row', borderRadius: 26, paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center', overflow: 'visible' },
  item:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 4 },
  label:   { fontSize: 10, letterSpacing: 0.2 },
  addWrap: { width: 52, alignItems: 'center', justifyContent: 'center', marginHorizontal: 4, marginBottom: 14 },
  addBtn:  { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
  addIcon: { fontSize: 28, lineHeight: 32, fontFamily: 'Fungis-Bold' },
});

// ─── Main Tabs — directional spring slide ─────────────────────────────────────
const TAB_SCREENS = [HomeScreen, ActivityScreen, StatsScreen, SettingsScreen];

function MainTabs({ navigation: stackNav }) {
  const [activeTab, setActiveTab] = useState(0);
  const dirRef    = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const navigateTo = useCallback((newIndex) => {
    if (newIndex === activeTab) return;
    dirRef.current = newIndex > activeTab ? 1 : -1;
    setActiveTab(newIndex);
  }, [activeTab]);

  useEffect(() => {
    const dir = dirRef.current;
    if (dir === null) return;
    slideAnim.setValue(dir * SCREEN_WIDTH);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 24, stiffness: 220, mass: 0.85 }).start(() => { dirRef.current = null; });
  }, [activeTab]);

  return (
    <View style={{ flex: 1 }}>
      {TAB_SCREENS.map((Screen, i) => (
        <View key={i} style={[StyleSheet.absoluteFillObject, { display: activeTab === i ? 'flex' : 'none' }]}>
          <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }] }}>
            <Screen navigation={stackNav} />
          </Animated.View>
        </View>
      ))}
      <CustomTabBar activeTab={activeTab} onNavigate={navigateTo} navigation={stackNav} />
    </View>
  );
}

// ─── Auth Flow ─────────────────────────────────────────────────────────────────
const AUTH_SCREENS = {
  Welcome:       { comp: WelcomeScreen,       idx: 0 },
  Login:         { comp: LoginScreen,         idx: 1 },
  CreateAccount: { comp: CreateAccountScreen, idx: 2 },
  DataInfo:      { comp: DataInfoScreen,      idx: 3 },
};

function AuthFlow({ navigation: stackNav }) {
  const [activeScreen, setActiveScreen] = useState('Welcome');
  const dirRef    = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const navigateTo = useCallback((name) => {
    if (name === activeScreen) return;
    const oldIdx = AUTH_SCREENS[activeScreen].idx;
    const newIdx = AUTH_SCREENS[name].idx;
    dirRef.current = newIdx > oldIdx ? 1 : -1;
    setActiveScreen(name);
  }, [activeScreen]);

  const goBack = useCallback(() => {
    if (activeScreen === 'Login' || activeScreen === 'CreateAccount') navigateTo('Welcome');
    else if (activeScreen === 'DataInfo') navigateTo('CreateAccount');
  }, [activeScreen, navigateTo]);

  useEffect(() => {
    const dir = dirRef.current;
    if (dir === null) return;
    slideAnim.setValue(dir * SCREEN_WIDTH);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 24, stiffness: 220, mass: 0.85 }).start(() => { dirRef.current = null; });
  }, [activeScreen]);

  useEffect(() => {
    const onBack = () => {
      if (activeScreen !== 'Welcome') { goBack(); return true; }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [activeScreen, goBack]);

  const authNav = {
    ...stackNav,
    navigate: (name) => AUTH_SCREENS[name] ? navigateTo(name) : stackNav.navigate(name),
    goBack:   () => goBack(),
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {Object.keys(AUTH_SCREENS).map((key) => {
        const { comp: Screen } = AUTH_SCREENS[key];
        return (
          <View key={key} style={[StyleSheet.absoluteFillObject, { display: activeScreen === key ? 'flex' : 'none' }]}>
            <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }] }}>
              <Screen navigation={authNav} />
            </Animated.View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Transition presets ───────────────────────────────────────────────────────
const DARK           = { contentStyle: { backgroundColor: '#111' } };
const slideRight     = { animation: 'slide_from_right', animationDuration: 250, gestureEnabled: true, gestureDirection: 'horizontal', ...DARK };
const panDownManual  = { presentation: 'transparentModal', animation: 'none', ...DARK };
const fadeIn         = { animation: 'fade', animationDuration: 280, ...DARK };
const noAnim         = { animation: 'none', ...DARK };

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Fungis-Regular': require('./assets/FUNGIS/fonts/OpenType-TT/FUNGIS Regular.ttf'),
    'Fungis-Bold':    require('./assets/FUNGIS/fonts/OpenType-TT/FUNGIS Bold.ttf'),
    'Fungis-Heavy':   require('./assets/FUNGIS/fonts/OpenType-TT/FUNGIS Heavy.ttf'),
  });

  const [isOnboarded,       setIsOnboarded      ] = useState(null);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const flag = await AsyncStorage.getItem('hasOnboarded');
        setIsOnboarded(flag === 'true');
      } catch {
        setIsOnboarded(false);
      } finally {
        setOnboardingChecked(true);
      }
    })();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if ((fontsLoaded || fontError) && onboardingChecked) await SplashScreen.hideAsync();
  }, [fontsLoaded, fontError, onboardingChecked]);

  if ((!fontsLoaded && !fontError) || !onboardingChecked) return null;

  // Shared screen list added to BOTH stack branches so navigation always resolves
  const sharedScreens = (
    <>
      <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={panDownManual} />
      <Stack.Screen name="AppGuide"       component={AppGuideScreen}       options={panDownManual} />
      <Stack.Screen name="ProPaywall"     component={ProPaywallScreen}     options={panDownManual} />
      <Stack.Screen name="Wallets"        component={WalletsScreen}        options={slideRight}    />
    </>
  );

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AppProvider>
        <AppLockOverlay>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false, ...slideRight }}>
              {isOnboarded ? (
                <>
                  <Stack.Screen name="Main"    component={MainTabs} options={fadeIn}  />
                  <Stack.Screen name="Welcome" component={AuthFlow} options={noAnim}  />
                  {sharedScreens}
                </>
              ) : (
                <>
                  <Stack.Screen name="Welcome" component={AuthFlow} options={noAnim}  />
                  <Stack.Screen name="Main"    component={MainTabs} options={fadeIn}  />
                  {sharedScreens}
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </AppLockOverlay>
      </AppProvider>
    </View>
  );
}
