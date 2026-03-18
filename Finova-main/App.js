// App.js — Finova v2.6
// Added LoginScreen to onboarding navigator

import React, { useEffect, useCallback, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
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
import AppGuideScreen       from './src/screens/AppGuideScreen';   // ← NEW v2.6
import { lightColors, darkColors } from './src/theme/theme';
import Icon from './src/components/Icon';

SplashScreen.preventAutoHideAsync();

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ITEMS = [
  { name: 'Home',     icon: 'home'     },
  { name: 'Activity', icon: 'activity' },
  { name: 'Stats',    icon: 'barChart' },
  { name: 'Settings', icon: 'settings' },
];

function CustomTabBar({ state, navigation }) {
  const { settings } = useApp();
  const insets = useSafeAreaInsets();
  const colors = settings.darkMode ? darkColors : lightColors;

  const glowColor = settings.darkMode ? '#AEB784' : '#89986D';

  // Split tabs: 2 left, centre +, 2 right
  const leftTabs  = TAB_ITEMS.slice(0, 2);
  const rightTabs = TAB_ITEMS.slice(2);

  const renderTab = (item, index, offset = 0) => {
    const routeIndex = offset + index;
    const isFocused  = state.index === routeIndex;
    const route      = state.routes[routeIndex];
    if (!route) return null;

    return (
      <TouchableOpacity
        key={route.key}
        style={tb.item}
        onPress={() => navigation.navigate(route.name)}
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
          { color: isFocused ? colors.gold : colors.textMuted,
            fontFamily: isFocused ? 'Fungis-Bold' : 'Fungis-Regular' },
        ]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[tb.wrapper, { bottom: Math.max(insets.bottom, 16) + 8 }]}>
      {/* Glow */}
      <View style={[tb.glow, { shadowColor: glowColor }]} />

      {/* Pill */}
      <View style={[tb.bar, { backgroundColor: settings.darkMode ? '#2E3230' : '#F5EDD6' }]}>

        {/* Left two tabs */}
        {leftTabs.map((item, i) => renderTab(item, i, 0))}

        {/* Centre + button */}
        <TouchableOpacity
          style={tb.addWrap}
          onPress={() => navigation.navigate('AddTransaction')}
          activeOpacity={0.85}
        >
          <View style={[tb.addBtn, { backgroundColor: colors.gold }]}>
            <Text style={[tb.addIcon, { color: settings.darkMode ? '#222629' : '#3D4A2E' }]}>+</Text>
          </View>
        </TouchableOpacity>

        {/* Right two tabs */}
        {rightTabs.map((item, i) => renderTab(item, i, 2))}

      </View>
    </View>
  );
}

const tb = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 20, right: 20,
    alignItems: 'stretch',
    overflow: 'visible',
  },
  glow: {
    position: 'absolute',
    top: 4, left: 12, right: 12, bottom: -4,
    borderRadius: 26,
    elevation: 24,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    backgroundColor: 'transparent',
  },
  bar: {
    flexDirection: 'row',
    borderRadius: 26,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    overflow: 'visible',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
  // Centre + button
  addWrap: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    // Lift it above the pill
    marginBottom: 14,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  addIcon: {
    fontSize: 28,
    lineHeight: 32,
    fontFamily: 'Fungis-Bold',
  },
});

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Hide the native tab bar chrome — our custom bar floats above
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tab.Screen name="Home"     component={HomeScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Stats"    component={StatsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

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
          <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>

            {isOnboarded ? (
              <>
                <Stack.Screen name="Main"           component={MainTabs} />
                <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ presentation: 'modal' }} />
                {/* Onboarding screens kept here so logout reset can reach Welcome */}
                <Stack.Screen name="Welcome"       component={WelcomeScreen}       />
                <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
                <Stack.Screen name="DataInfo"      component={DataInfoScreen}      />
                <Stack.Screen name="Login"         component={LoginScreen}         />
                <Stack.Screen name="AppGuide"      component={AppGuideScreen}      />
              </>
            ) : (
              <>
                <Stack.Screen name="Welcome"       component={WelcomeScreen}       />
                <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
                <Stack.Screen name="DataInfo"      component={DataInfoScreen}      />
                <Stack.Screen name="Login"         component={LoginScreen}         />
                <Stack.Screen name="Main"          component={MainTabs}            />
                <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ presentation: 'modal' }} />
                <Stack.Screen name="AppGuide"      component={AppGuideScreen}      />
              </>
            )}

          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </View>
  );
}
