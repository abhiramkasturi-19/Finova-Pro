// ─────────────────────────────────────────────────────────────────────────────
// AppContext.js  —  ADDITIONS for Finova v2.5
// ─────────────────────────────────────────────────────────────────────────────
// Instructions: Merge these additions into your existing AppContext.js.
// Sections are clearly marked. Do NOT replace the whole file — only add/edit
// the marked blocks.
// ─────────────────────────────────────────────────────────────────────────────

// ── STEP 1: Add this currency symbol map near the top of the file ─────────────

export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

export const CURRENCY_NAMES = {
  INR: 'Indian Rupee',
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
};


// ── STEP 2: Add userProfile state inside your AppProvider component ───────────
// (place this alongside your existing useState hooks)

/*
  const [userProfile, setUserProfileState] = useState({
    username:  '',
    age:       '',
    theme:     'dark',
    currency:  'INR',
  });
*/


// ── STEP 3: Add this to your existing useEffect that loads data from AsyncStorage
// (inside the block that already reads isDark / transactions / categories)

/*
  // Load userProfile
  const savedProfile = await AsyncStorage.getItem('userProfile');
  if (savedProfile) {
    const parsed = JSON.parse(savedProfile);
    setUserProfileState(parsed);
    // Restore theme choice
    if (parsed.theme === 'light') setIsDark(false);
    if (parsed.theme === 'dark')  setIsDark(true);
  }
*/


// ── STEP 4: Add this setter function inside your AppProvider ──────────────────

/*
  // Called from CreateAccountScreen during onboarding.
  // Saves in-memory; DataInfoScreen persists to AsyncStorage.
  const setUserProfile = (profile) => {
    setUserProfileState(profile);
    // Theme is applied live so the app reflects the choice immediately
    setIsDark(profile.theme === 'dark');
  };
*/


// ── STEP 5: Add these to your context value object ───────────────────────────

/*
  // Inside your <AppContext.Provider value={{ ... }}> object, add:
  userProfile,
  setUserProfile,
  // Convenience derived values used throughout the app:
  currency:       userProfile.currency || 'INR',
  currencySymbol: CURRENCY_SYMBOLS[userProfile.currency] || '₹',
  username:       userProfile.username || '',
*/


// ── STEP 6 (optional): Update SettingsScreen to show username & currency ─────
// You can display context.username and context.currencySymbol in the header
// or profile section of SettingsScreen.js.


// ── FULL CONTEXT VALUE SHAPE (for reference) ─────────────────────────────────
/*
  <AppContext.Provider value={{
    // existing
    isDark,
    setIsDark,
    transactions,
    addTransaction,
    deleteTransaction,
    categories,
    addCategory,
    deleteCategory,

    // NEW in v2.5
    userProfile,
    setUserProfile,
    currency,           // e.g. 'INR'
    currencySymbol,     // e.g. '₹'
    username,           // e.g. 'Abhiram'
  }}>
*/
