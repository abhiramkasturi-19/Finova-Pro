// ─────────────────────────────────────────────────────────────────────────────
// App.js  —  ADDITIONS for Finova v2.5
// ─────────────────────────────────────────────────────────────────────────────
// Instructions: Merge these additions into your existing App.js.
// The goal is to: (a) check AsyncStorage on startup, and (b) show onboarding
// screens on first launch, skipping them on all later launches.
// ─────────────────────────────────────────────────────────────────────────────


// ── STEP 1: Add these imports (alongside your existing ones) ──────────────────

import { useState, useEffect } from 'react';   // already imported — just verify
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// NEW screen imports
import WelcomeScreen       from './screens/WelcomeScreen';
import CreateAccountScreen from './screens/CreateAccountScreen';
import DataInfoScreen      from './screens/DataInfoScreen';


// ── STEP 2: Create a root Stack navigator ────────────────────────────────────
// Place this OUTSIDE your App component (at module level), alongside any
// existing navigator creators.

const RootStack = createNativeStackNavigator();


// ── STEP 3: Add the onboarding check inside your App component ───────────────
// Add this state + effect INSIDE your App() function, before the return.

/*
  const [isOnboarded,      setIsOnboarded     ] = useState(null); // null = loading
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const flag = await AsyncStorage.getItem('hasOnboarded');
        setIsOnboarded(flag === 'true');
      } catch (e) {
        setIsOnboarded(false); // default to showing onboarding on error
      } finally {
        setOnboardingChecked(true);
      }
    };
    checkOnboarding();
  }, []);
*/


// ── STEP 4: Guard the render until the check completes ───────────────────────
// Add this right before your existing return, inside App():

/*
  // Wait for onboarding check (and font loading) before rendering
  if (!onboardingChecked || !fontsLoaded) {
    return null; // Splash screen keeps showing via expo-splash-screen
  }
*/


// ── STEP 5: Replace your existing NavigationContainer's children ─────────────
// Wrap your current tab navigator with a RootStack so onboarding screens
// and the main app share one navigation tree.
//
// BEFORE (simplified):
//   <NavigationContainer>
//     <Tab.Navigator>...</Tab.Navigator>
//   </NavigationContainer>
//
// AFTER:

/*
  <NavigationContainer>
    <RootStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>

      {isOnboarded ? (
        // ── Returning user: go straight to main app ──
        <RootStack.Screen name="MainApp" component={MainTabNavigator} />
      ) : (
        // ── First launch: onboarding flow ──
        <>
          <RootStack.Screen name="Welcome"       component={WelcomeScreen}       />
          <RootStack.Screen name="CreateAccount" component={CreateAccountScreen} />
          <RootStack.Screen name="DataInfo"      component={DataInfoScreen}      />
          {/*
            DataInfoScreen calls navigation.reset({ routes: [{ name: 'MainApp' }] })
            when the user taps "Enter Finova", so we still need MainApp here.
          */}
          <RootStack.Screen name="MainApp"       component={MainTabNavigator}    />
        </>
      )}

    </RootStack.Navigator>
  </NavigationContainer>
*/


// ── STEP 6: Extract your tab navigator into a named component ─────────────────
// If your current Tab.Navigator is inline inside the return, move it to its own
// component so it can be referenced as `MainTabNavigator` above.

/*
  function MainTabNavigator() {
    return (
      <Tab.Navigator
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Home"     component={HomeScreen}     />
        <Tab.Screen name="Stats"    component={StatsScreen}    />
        <Tab.Screen name="Add"      component={AddTransactionScreen} />
        <Tab.Screen name="Activity" component={ActivityScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    );
  }
*/


// ── COMPLETE App() SKELETON for reference ────────────────────────────────────
/*
  export default function App() {
    const [fontsLoaded]       = useFonts({ ... });           // existing
    const [isOnboarded,      setIsOnboarded     ] = useState(null);
    const [onboardingChecked, setOnboardingChecked] = useState(false);

    useEffect(() => {
      const check = async () => {
        try {
          const flag = await AsyncStorage.getItem('hasOnboarded');
          setIsOnboarded(flag === 'true');
        } catch { setIsOnboarded(false); }
        finally { setOnboardingChecked(true); }
      };
      check();
    }, []);

    useEffect(() => {
      if (fontsLoaded && onboardingChecked) SplashScreen.hideAsync();
    }, [fontsLoaded, onboardingChecked]);

    if (!fontsLoaded || !onboardingChecked) return null;

    return (
      <AppProvider>
        <NavigationContainer>
          <RootStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
            {isOnboarded ? (
              <RootStack.Screen name="MainApp" component={MainTabNavigator} />
            ) : (
              <>
                <RootStack.Screen name="Welcome"       component={WelcomeScreen}       />
                <RootStack.Screen name="CreateAccount" component={CreateAccountScreen} />
                <RootStack.Screen name="DataInfo"      component={DataInfoScreen}      />
                <RootStack.Screen name="MainApp"       component={MainTabNavigator}    />
              </>
            )}
          </RootStack.Navigator>
        </NavigationContainer>
      </AppProvider>
    );
  }
*/
