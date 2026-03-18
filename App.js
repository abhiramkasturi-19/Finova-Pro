// App.js — Finova v2.7
// Key fix: panDownModal removes presentation:'modal' so goBack() slides down on Android
// Tab transitions: spring physics, directional
// All stack screens: unified slide_from_right, dark contentStyle = no white flash

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  TouchableOpacity, View, StyleSheet, Text,
  Animated, Dimensions, BackHandler,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppProvider, useApp } from './src/context/AppContext';
import HomeScreen           from './src/screens/HomeScreen';
import ActivityScreen       from './src/screens/ActivityScreen';
import StatsScreen          from './src/screens/StatsScreen';
import SettingsScreen       from './src/screens/SettingsScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import WelcomeScreen        from './src/screens/WelcomeScreen';
import CreateAccountScreen  from './src/screens/CreateAccountScreen';
import DataInfoScreen       from './src/screens/DataInfoScreen';
import LoginScreen          from './src/screens/LoginScreen';
import AppGuideScreen       from './src/screens/AppGuideScreen';
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

// ─── Custom tab bar ───────────────────────────────────────────────────────────
function CustomTabBar({ activeTab, onNavigate, navigation }) {
  const { settings } = useApp();
  const insets    = useSafeAreaInsets();
  const colors    = settings.darkMode ? darkColors : lightColors;
  const glowColor = settings.darkMode ? '#AEB784' : '#89986D';

  const renderTab = (item, index) => {
    const isFocused = activeTab === index;
    return (
      <TouchableOpacity
        key={item.name}
        style={tb.item}
        onPress={() => onNavigate(index)}
        activeOpacity={0.6}
      >
        <Icon
          name={item.icon}
          size={21}
          color={isFocused ? colors.gold : colors.textMuted}
          strokeWidth={isFocused ? 2.2 : 1.5}
        />
        <Text style={[
          tb.label,
          {
            color:      isFocused ? colors.gold : colors.textMuted,
            fontFamily: isFocused ? 'Fungis-Bold' : 'Fungis-Regular',
          },
        ]}>
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

        <TouchableOpacity
          style={tb.addWrap}
          onPress={() => navigation.navigate('AddTransaction')}
          activeOpacity={0.85}
        >
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
  glow: {
    position: 'absolute', top: 4, left: 12, right: 12, bottom: -4,
    borderRadius: 26, elevation: 24,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 18,
    backgroundColor: 'transparent',
  },
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
    // Start off-screen in the direction we're coming from
    slideAnim.setValue(dir * SCREEN_WIDTH);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      damping: 24,
      stiffness: 220,
      mass: 0.85,
    }).start(() => { dirRef.current = null; });
  }, [activeTab]);

  return (
    <View style={{ flex: 1 }}>
      {TAB_SCREENS.map((Screen, i) => (
        <View
          key={i}
          style={[
            StyleSheet.absoluteFillObject,
            { display: activeTab === i ? 'flex' : 'none' },
          ]}
        >
          <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }] }}>
            <Screen navigation={stackNav} />
          </Animated.View>
        </View>
      ))}

      <CustomTabBar activeTab={activeTab} onNavigate={navigateTo} navigation={stackNav} />
    </View>
  );
}

// ─── Auth Flow — directional spring slide for onboarding ──────────────────────
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
    if (activeScreen === 'Login' || activeScreen === 'CreateAccount') {
      navigateTo('Welcome');
    } else if (activeScreen === 'DataInfo') {
      navigateTo('CreateAccount');
    }
  }, [activeScreen, navigateTo]);

  useEffect(() => {
    const dir = dirRef.current;
    if (dir === null) return;
    slideAnim.setValue(dir * SCREEN_WIDTH);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      damping: 24,
      stiffness: 220,
      mass: 0.85,
    }).start(() => { dirRef.current = null; });
  }, [activeScreen]);

  useEffect(() => {
    const onBackPress = () => {
      if (activeScreen !== 'Welcome') {
        goBack();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [activeScreen, goBack]);

  // Intercept navigation for internal flow
  const authNav = {
    ...stackNav,
    navigate: (name) => {
      if (AUTH_SCREENS[name]) navigateTo(name);
      else stackNav.navigate(name);
    },
    goBack: () => goBack(),
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {Object.keys(AUTH_SCREENS).map((key) => {
        const { comp: Screen } = AUTH_SCREENS[key];
        return (
          <View
            key={key}
            style={[
              StyleSheet.absoluteFillObject,
              { display: activeScreen === key ? 'flex' : 'none' },
            ]}
          >
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
const DARK = { contentStyle: { backgroundColor: '#111' } };

// Standard horizontal slide — used for ALL screens (tabs, onboarding, everything)
// gestureEnabled lets user swipe back from any screen naturally
const slideRight = {
  animation: 'slide_from_right',
  animationDuration: 250,
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  ...DARK,
};

// ── Pan-down dismiss — AddTransaction and AppGuide ───────────────────────────
// AddTransaction now handles its own spring transition via Animated.View
const panDownManual = {
  presentation: 'transparentModal',
  animation: 'none',
  ...DARK,
};

const panDownModal = {
  presentation: 'modal',
  animation: 'slide_from_bottom',
  animationDuration: 350,
  gestureEnabled: true,
  gestureDirection: 'vertical',
  ...DARK,
};

// Gentle fade — for the initial Main screen appear after onboarding/login
const fadeIn = {
  animation: 'fade',
  animationDuration: 280,
  ...DARK,
};

const noAnim = {
  animation: 'none',
  ...DARK,
};

// ─── Root App ─────────────────────────────────────────────────────────────────
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
    if ((fontsLoaded || fontError) && onboardingChecked) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, onboardingChecked]);

  if ((!fontsLoaded && !fontError) || !onboardingChecked) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AppProvider>
        <NavigationContainer>
          {/* Default for every screen unless overridden below */}
          <Stack.Navigator screenOptions={{ headerShown: false, ...slideRight }}>
            {isOnboarded ? (
              <>
                <Stack.Screen name="Main"           component={MainTabs}             options={fadeIn}       />
                <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={panDownManual} />
                <Stack.Screen name="Welcome"        component={AuthFlow}             options={noAnim}       />
                <Stack.Screen name="AppGuide"       component={AppGuideScreen}       options={panDownManual} />
              </>
            ) : (
              <>
                <Stack.Screen name="Welcome"        component={AuthFlow}             options={noAnim}       />
                <Stack.Screen name="Main"           component={MainTabs}             options={fadeIn}       />
                <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={panDownManual} />
                <Stack.Screen name="AppGuide"       component={AppGuideScreen}       options={panDownManual} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </View>
  );
}
