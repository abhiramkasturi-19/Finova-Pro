# Finova — Complete Project Knowledge Base
## Full Development Log, Architecture Reference & Agent Context Document

> **Who should read this:** Any AI agent, developer, or collaborator picking up this project. This document contains the complete history of every decision, every error, every fix, every design change, and the exact current state of every file. Read this fully before making any changes.

---

## TABLE OF CONTENTS

1. Project Overview
2. Tech Stack & Dependencies
3. File Structure
4. Design References & Visual Direction
5. Color Palettes — Current (Designer Modern)
6. Font System — FUNGIS
7. Icon System — Untitled UI
8. Data Models
9. Categories Reference
10. AppContext — State Management
11. Screen Specifications (detailed)
12. Theme Pattern — Critical Rules
13. App.js Architecture
14. Navigation Structure
15. Component Specifications
16. Spacing & Status Bar Rules
17. SafeAreaView Warning
18. All Errors & Fixes (complete log)
19. Full Change Log
20. Seed Data Status
21. How to Run & Troubleshooting
22. QA Init Check Script
23. Future Work
24. Critical Rules for Any Agent

---

## 1. PROJECT OVERVIEW

**App Name:** Finova
**Original name:** FloApp (renamed early in development)
**Type:** Personal Finance Management Mobile App
**Runtime:** Expo Go — scanned via QR code on physical Android device
**Framework:** React Native via Expo SDK ~55
**Platform tested:** Android (physical device, Expo Go app)
**Developer OS:** Windows 11
**Terminal used:** PowerShell
**Project location:** `A:\ProgramLife\APP\Finova\`

### Core Purpose
- Add income and expense transactions with category, amount, date, note
- View current month financial overview on dashboard (balance, income, expenses)
- Analyze spending patterns via interactive donut charts
- Browse activity with a calendar heat map and transaction detail modal
- View trend analysis via dual line charts
- Custom categories — user can create their own saved categories with unique colors
- Toggle between light and dark themes
- First-launch onboarding flow to collect user profile (name, age, theme, currency, profile picture)
- Log In via JSON backup file to restore a full account on a new device
- Log Out with optional data download before clearing

### Current App Version
**2.6.0 — Account System, Login & Profile Picture**

---

## 2. TECH STACK & DEPENDENCIES

```json
{
  "dependencies": {
    "expo": "~55.0.6",
    "expo-status-bar": "~55.0.4",
    "expo-font": "~13.0.3",
    "expo-splash-screen": "~0.29.22",
    "expo-image-picker": "*",
    "expo-document-picker": "*",
    "expo-file-system": "*",
    "expo-sharing": "*",
    "react": "19.2.0",
    "react-native": "0.83.2",
    "@react-navigation/native": "^7.1.33",
    "@react-navigation/bottom-tabs": "^7.15.5",
    "@react-navigation/native-stack": "^7.14.5",
    "react-native-screens": "~4.23.0",
    "react-native-safe-area-context": "~5.6.2",
    "@react-native-async-storage/async-storage": "2.2.0",
    "react-native-svg": "15.15.3"
  }
}
```

**Install command for v2.6 additions:**
```bash
npx expo install expo-image-picker
```
`expo-document-picker`, `expo-file-system`, and `expo-sharing` were already present from v2.5.

---

## 5. COLOR PALETTES — CURRENT (Designer Modern)

### Light Theme — "Parchment & Sage"
```js
export const lightColors = {
  bg:          '#F6F0D7',
  surface:     '#FDFAF0',
  surface2:    '#EDE8CE',
  accent:      '#9CAB84',
  accentLight: '#7A8B68',
  accentDark:  '#89986D',
  gold:        '#89986D',
  goldLight:   '#C5D89D',
  navy:        '#3D4A2E',
  crimson:     '#8B3A3A',
  activePill:  '#3D4A2E',
  textPrimary: '#2C3320',
  textMuted:   '#7A8B68',
  expense:     '#8B3A3A',
  income:      '#4A6741',
  border:      '#DDD9C2',
  wineRed:     '#8B3A3A',
  chartGreen:  '#9CAB84', chartRed: '#B10F2E', chartBlue: '#6B80A0',
  chartGold:   '#B8A96A', chartTeal: '#5A8A7A', chartPurple: '#8A7A9A',
  chartOrange: '#B87A50', chartSlate: '#7A8B68',
};
```

### Dark Theme — "Designer Modern"
```js
export const darkColors = {
  bg:          '#222629',
  surface:     '#474B47',
  surface2:    '#6B6E70',
  accent:      '#AEB784',
  accentLight: '#AEB784',
  accentDark:  '#61892F',
  gold:        '#AEB784',
  goldLight:   '#AEB784',
  navy:        '#222629',
  crimson:     '#9E5A5A',
  activePill:  '#222629',
  textPrimary: '#FFFFFF',
  textMuted:   '#6B6E70',
  expense:     '#B07070',
  income:      '#AEB784',
  border:      'rgba(107, 110, 112, 0.3)',
  wineRed:     '#B07070',
  chartGreen:  '#7A9E7E', chartRed: '#B10F2E', chartBlue: '#5A7AAA',
  chartGold:   '#C4A882', chartTeal: '#5A8A8A', chartPurple: '#8A7AAA',
  chartOrange: '#C4906A', chartSlate: '#8A9AAA',
};
```

### Onboarding / Login Palette (fixed, always dark)
All onboarding and login screens hardcode dark colors regardless of user theme preference:
- SVG gradient overlay on Welcome: `stopOpacity 0 → 0.88 → 1`
- Full overlay on CreateAccount: `rgba(0,0,0,0.86)`
- Full overlay on DataInfo / Login: `rgba(0,0,0,0.88)` – `rgba(0,0,0,0.96)`
- Accent / CTA: `#AEB784` (sage)
- Text primary: `#FFFFFF`
- Text muted: `rgba(255,255,255,0.32–0.68)`

---

## 6. FONT SYSTEM — FUNGIS

**Source:** `assets/FUNGIS/fonts/OpenType-TT/`

- **FUNGIS Heavy** (`'Fungis-Heavy'`): Balance amounts, page titles, primary headers, onboarding headlines.
- **FUNGIS Bold** (`'Fungis-Bold'`): Interactive labels, buttons, chips, section titles.
- **FUNGIS Regular** (`'Fungis-Regular'`): Body text, hints, notes, dates, onboarding body copy.

**⚠️ Critical — Font Key Names:**
```js
'Fungis-Regular': require('./assets/FUNGIS/fonts/OpenType-TT/FUNGIS Regular.ttf'),
'Fungis-Bold':    require('./assets/FUNGIS/fonts/OpenType-TT/FUNGIS Bold.ttf'),
'Fungis-Heavy':   require('./assets/FUNGIS/fonts/OpenType-TT/FUNGIS Heavy.ttf'),
```
Always `Fungis-` (capital F, lowercase ungis, hyphen). Never `FUNGIS-` — silent fallback to system font.

---

## 9. CATEGORIES REFERENCE

### Unique Color System
Custom categories are assigned unique colors from a 25-color **DESIGNER_PALETTE** in `AppContext.js`. No two custom categories share the same color, and they don't clash with base categories.

### Expense Categories (Base)
| Category | Emoji | Color |
|---|---|---|
| Food | 🍜 | `#ECA72C` (Saffron) |
| Petrol | ⛽ | `#B10F2E` (Donut Red) |
| Shopping | 🛍️ | `#9984D4` (Lavender) |
| Books | 📚 | `#EDE580` (Pale Yellow) |
| Transport | 🚇 | `#A3BFA8` (Sage) |
| Health | 💊 | `#A3BFA8` (Sage) |
| Bills | ⚡ | `#3993DD` (Blue) |
| Others | 📦 | `#221E22` (Charcoal) |

---

## 10. SCREEN SPECIFICATIONS

### 10.1 WelcomeScreen *(updated — v2.6)*
**File:** `src/screens/WelcomeScreen.js`

- Full-screen `splash-icon.png` as `ImageBackground`
- Smooth SVG `LinearGradient` (via `react-native-svg`) from transparent at top to solid black at bottom — no more stacked View shadow layers
- Content block pinned to bottom contains:
  - **"Finova"** headline — `Fungis-Heavy` 58px white
  - **Tagline** — `Fungis-Bold` 19px sage
  - **Decorative lines row** — thin sage line / rotated diamond / thin sage line
  - **Sub-headline** — `Fungis-Regular` 15px muted white
  - **"Get Started" button** (sage fill) → navigates to `CreateAccount`
  - **"Log In" button** (outlined, sage border) → navigates to `Login`
  - **Login hint text** — `"Can only log in if you have a backup data JSON file."`
- No back button — this is the root screen

### 10.2 LoginScreen *(NEW — v2.6)*
**File:** `src/screens/LoginScreen.js`

- Same `splash-icon.png` background under a near-opaque overlay (`rgba(0,0,0,0.92–0.96)`)
- Back button top-left → `navigation.goBack()`
- Lock icon (🔐) in a frosted circular badge
- **Title:** "Log In" + sage accent underline
- Body paragraph explaining backup restore
- **Callout card** (frosted, sage border) — contains the requirement: _"Can only log in if you have a backup data JSON file downloaded from Settings → Data Management."_
- Hint linking back to Create Account
- **"Upload Backup File" button** — uses `expo-document-picker` to pick a `.json` file, reads with `expo-file-system`, validates that `data.transactions` is an array and `data.settings` exists, calls `importData(data)`, sets `hasOnboarded: 'true'`, resets nav to `Main`
- Shows `ActivityIndicator` while processing
- Error alerts for invalid or unreadable files

### 10.3 CreateAccountScreen *(updated — v2.6)*
**File:** `src/screens/CreateAccountScreen.js`

- Same layout as v2.5, with one addition at the top of the form: **Profile Picture**
- Circular avatar (80px) with a camera badge overlay
  - If no photo: shows initials from the username field, updating live as user types
  - If photo picked: shows the cropped image
  - Tapping opens `expo-image-picker` gallery picker, `aspect [1,1]`, `quality 0.45`, `base64: true`
  - Image stored as `data:image/jpeg;base64,...` string
- On Continue: calls `updateSettings({ name, age, darkMode, currency, profileImage })`
- Profile picture is optional — user can skip and add later in Settings

### 10.4 DataInfoScreen *(unchanged — v2.5)*
**File:** `src/screens/DataInfoScreen.js`
- Data management explainer (Export / Import / Delete cards)
- "Enter Finova →" saves `hasOnboarded: 'true'` and resets nav to `Main`

### 10.5 SettingsScreen *(updated — v2.6)*
**File:** `src/screens/SettingsScreen.js`

**Profile Card — combined view + edit (replaces separate PROFILE section):**
- **View mode** (default):
  - Shows circular avatar — real photo if `settings.profileImage` is set, otherwise initial letter on sage background
  - Shows display name and meta line (age + currency)
  - Below the info: a pen SVG icon + "Edit Profile" label — tapping opens edit mode
- **Edit mode** (inline, same card):
  - "Edit Profile" title
  - Tappable avatar with camera badge → `expo-image-picker` to change photo
  - "Tap photo to change" hint
  - Name `TextInput`
  - Age `TextInput`
  - **Save** button (sage) — commits changes via `updateSettings`, closes edit mode
  - **Cancel** button (outlined) — discards changes, closes edit mode
- The old standalone PROFILE section with always-visible TextInputs has been removed

**Preferences section** — Dark Mode toggle + Currency chips (unchanged)

**Data Management section** — collapsible, unchanged (Download / Upload / Clear All)

**App section** — Version number only. **"Coming Soon" row removed.**

**Log Out button** — full-width outlined button in wine red at the bottom of the screen:
- Tapping shows a 3-option Alert:
  1. **Download & Log Out** — exports full JSON backup via `expo-sharing`, then clears AsyncStorage and resets nav to `Welcome`
  2. **Log Out Without Saving** — clears AsyncStorage and resets nav to `Welcome` immediately
  3. **Cancel** — dismisses
- `navigation` prop is required — passed automatically by the Tab navigator

### 10.6 AddTransactionScreen *(unchanged — v2.2)*
- Collapsible Date & Time, category chips, thousand-separator amount input

---

## 11. APPCONTEXT — STATE MANAGEMENT

**File:** `src/context/AppContext.js`
**Hook:** `useApp()`

### State Shape *(updated — v2.6)*
```js
{
  transactions: [],
  settings: {
    name:         '',    // username
    age:          '',    // user age
    currency:     '₹',  // symbol string — not code
    darkMode:     false,
    profileImage: '',    // base64 data URI — e.g. "data:image/jpeg;base64,..."
                         // empty string when no photo set
                         // included in JSON export/import automatically
  },
  customCategories: {
    expense: [],         // { name, color }
    income:  [],
  },
}
```

### Key Actions
| Action | Method | Notes |
|---|---|---|
| Add transaction | `addTransaction(txn)` | Auto-generates id |
| Edit transaction | `editTransaction(txn)` | Matches by id |
| Delete transaction | `deleteTransaction(id)` | |
| Update settings | `updateSettings(partial)` | Merges — used by onboarding and Settings |
| Toggle dark mode | `toggleDarkMode()` | Shorthand flip |
| Add custom category | `addCustomCategory(type, name)` | Auto-assigns unique color |
| Delete custom category | `deleteCustomCategory(type, name)` | |
| Import data | `importData(data)` | Full LOAD_DATA replace — used by Login and Upload |

### LOAD_DATA Reducer (v2.6 change)
The `LOAD_DATA` case now safely deep-merges `settings` so that `profileImage` (and any future settings fields) are preserved even when importing an older backup that doesn't include them:
```js
settings: {
  ...initialState.settings,  // defaults
  ...state.settings,         // current device state
  ...(action.payload.settings || {}),  // imported values override
}
```

### Persistence
- App data → AsyncStorage key `@flo_data` (includes `settings.profileImage`)
- Onboarding flag → AsyncStorage key `hasOnboarded` (string `'true'`)
- On logout → `AsyncStorage.clear()` wipes both keys

### JSON Backup File Format
The exported `.json` file contains the complete state:
```json
{
  "transactions": [...],
  "settings": {
    "name": "Abhiram",
    "age": "22",
    "currency": "₹",
    "darkMode": true,
    "profileImage": "data:image/jpeg;base64,..."
  },
  "customCategories": {
    "expense": [...],
    "income":  [...]
  }
}
```
This file is used for both **Login** (full restore on a new device) and **Upload Data** in Settings (restore on the same device).

---

## 12. APP.JS ARCHITECTURE *(updated — v2.6)*

### Onboarding Gate
Reads `hasOnboarded` from AsyncStorage on launch. SplashScreen held until both fonts and check complete.

### Navigation Structure
```
Stack.Navigator (root, headerShown: false, animation: 'fade')
│
├── [isOnboarded === true — returning user]
│   ├── Main             → MainTabs
│   ├── AddTransaction   → AddTransactionScreen (modal)
│   ├── Welcome          → WelcomeScreen   ← kept here so logout reset works
│   ├── CreateAccount    → CreateAccountScreen
│   ├── DataInfo         → DataInfoScreen
│   └── Login            → LoginScreen
│
└── [isOnboarded === false — first launch]
    ├── Welcome          → WelcomeScreen
    ├── CreateAccount    → CreateAccountScreen
    ├── DataInfo         → DataInfoScreen
    ├── Login            → LoginScreen
    ├── Main             → MainTabs
    └── AddTransaction   → AddTransactionScreen (modal)
```

> **Why onboarding screens are in both branches:** `SettingsScreen.handleLogout` calls `navigation.reset({ routes: [{ name: 'Welcome' }] })`. For this to work when the user is already in the app (returning-user branch), `Welcome` must be registered in that branch too.

### MainTabs (Tab.Navigator)
```
Tab.Navigator (CustomTabBar)
├── Home     → HomeScreen
├── Activity → ActivityScreen
├── Stats    → StatsScreen
└── Settings → SettingsScreen
```

---

## 13. NAVIGATION STRUCTURE

### Screen Registry *(updated — v2.6)*
| Screen Name | File | Stack |
|---|---|---|
| `Welcome` | `src/screens/WelcomeScreen.js` | Root Stack (both branches) |
| `CreateAccount` | `src/screens/CreateAccountScreen.js` | Root Stack (both branches) |
| `DataInfo` | `src/screens/DataInfoScreen.js` | Root Stack (both branches) |
| `Login` | `src/screens/LoginScreen.js` | Root Stack (both branches) |
| `Main` | MainTabs component | Root Stack |
| `AddTransaction` | `src/screens/AddTransactionScreen.js` | Root Stack (modal) |
| `Home` | `src/screens/HomeScreen.js` | Tab |
| `Activity` | `src/screens/ActivityScreen.js` | Tab |
| `Stats` | `src/screens/StatsScreen.js` | Tab |
| `Settings` | `src/screens/SettingsScreen.js` | Tab |

### Full Navigation Flows
```
First launch:
  Welcome → CreateAccount → DataInfo → [reset] → Main

Login (existing account):
  Welcome → Login → [upload JSON] → [reset] → Main

Log Out (from Settings):
  Settings → [Alert] → [AsyncStorage.clear()] → [reset] → Welcome

Back navigation:
  CreateAccount ← goBack() ← DataInfo
  Login ← goBack() ← (back to Welcome)
```

---

## 19. FULL CHANGE LOG

| # | Change | Files |
|---|---|---|
| 49 | Integrated FUNGIS custom font family (Regular, Bold, Heavy) | App.js, theme.js, All Screens |
| 50 | Overhauled Dark Theme colors to "Designer Modern" (Greys + Sage Green pops) | theme.js |
| 51 | Fixed visibility of header elements in Dark Mode | StatsScreen.js, theme.js |
| 52 | Fixed Wallet Card visibility and high-contrast labels in Dark Mode | HomeScreen.js |
| 53 | Implemented semantic color popping for Income (Green) and Expense (Red) | HomeScreen.js, theme.js |
| 54 | Updated Donut Chart color palette with designer-curated selections | categories.js, theme.js |
| 55 | Set primary Donut Red to #B10F2E | categories.js, theme.js |
| 56 | Implemented **Dynamic Unique Category Colors** with 25-color designer palette | AppContext.js, categories.js |
| 57 | Updated all screens/components to use unique custom category colors | HomeScreen, Activity, Stats, TxnItem |
| 58 | Redesigned `CustomTabBar` for a seamless, non-cropping aesthetic (Instagram-style) | App.js, SettingsScreen |
| 59 | Streamlined `AddTransactionScreen` with **Collapsible Date & Time** section | AddTransactionScreen.js |
| 60 | Fixed `ReferenceError` during data import by robustly initializing context state | AppContext.js |
| 61 | Updated App Logo and assets (Adaptive Icons, Splash) | assets/ |
| 62 | Updated Donut Chart in Activity Screen to show "Present Month" instead of "Spent" | ActivityScreen.js |
| 63 | Implemented dynamic Donut Chart center label (Month, Year, Period) | ActivityScreen.js |
| 64 | Added thousand separators to Amount Input (auto-formatting) | AddTransactionScreen.js |
| 65 | Fixed Amount Input layout to prevent clipping of large numbers | AddTransactionScreen.js |
| 66 | Built 3-page onboarding flow: WelcomeScreen, CreateAccountScreen, DataInfoScreen | WelcomeScreen.js, CreateAccountScreen.js, DataInfoScreen.js |
| 67 | Added first-launch gate in App.js via `hasOnboarded` AsyncStorage flag | App.js |
| 68 | Wired onboarding form data (name, age, theme, currency) into AppContext via `updateSettings` | CreateAccountScreen.js, AppContext.js |
| 69 | Onboarding exits via `navigation.reset` — back stack cleared on app entry | DataInfoScreen.js |
| 70 | Documented correct font key format (`Fungis-` not `FUNGIS-`) | — |
| 71 | Replaced stacked View shadow layers with smooth SVG LinearGradient on Welcome | WelcomeScreen.js |
| 72 | Fixed grey box artifact below button on Welcome screen | WelcomeScreen.js |
| 73 | Increased background dim on Create Account screen for better readability | CreateAccountScreen.js |
| 74 | Bumped version to 2.5.0 | SettingsScreen.js |
| 75 | Added **Log In** button to WelcomeScreen with login hint text | WelcomeScreen.js |
| 76 | Built **LoginScreen** — upload JSON backup, validate, restore full state, enter app | LoginScreen.js |
| 77 | Added **profile picture** upload to CreateAccountScreen via `expo-image-picker` | CreateAccountScreen.js |
| 78 | Added `profileImage` field (base64 data URI) to AppContext `settings` | AppContext.js |
| 79 | Updated `LOAD_DATA` reducer to deep-merge settings so `profileImage` survives imports | AppContext.js |
| 80 | Combined profile card and profile edit into single inline-edit card in SettingsScreen | SettingsScreen.js |
| 81 | Added profile picture picker (camera badge tap) in Settings edit mode | SettingsScreen.js |
| 82 | Removed standalone PROFILE section (name/age TextInputs) from Settings | SettingsScreen.js |
| 83 | Removed "Coming Soon" row from APP section in Settings | SettingsScreen.js |
| 84 | Added **Log Out button** (wine red, outlined) to bottom of Settings | SettingsScreen.js |
| 85 | Log Out alert: Download & Log Out / Log Out Without Saving / Cancel | SettingsScreen.js |
| 86 | Log Out clears AsyncStorage and resets nav to Welcome | SettingsScreen.js |
| 87 | Added all onboarding screens to returning-user Stack branch so logout reset works | App.js |
| 88 | Fixed navigator crash caused by JSX comment (`{/* */}`) inside Stack.Navigator | App.js |
| 89 | Bumped version to 2.6.0 | SettingsScreen.js |

---

## 21. HOW TO RUN & TROUBLESHOOTING

### Standard Run
```bash
npx expo start
```

### Re-testing Onboarding / Login
```js
// Add temporarily in App.js before the onboarding check, run once, then remove:
await AsyncStorage.removeItem('hasOnboarded');
```

### 🛑 Troubleshooting Logo/Asset Caching
1. `npx expo start --clear`
2. Android: Long-press Expo Go > App Info > Storage > Clear Cache
3. Open `app.json`, add a space, save, restart

### 🛑 Troubleshooting Fonts Rendering as System Font
Keys must be exactly `'Fungis-Heavy'`, `'Fungis-Bold'`, `'Fungis-Regular'`. Any typo silently falls back — no error thrown.

### 🛑 Troubleshooting Navigator Crash
**Error:** `A navigator can only contain 'Screen', 'Group' or 'React.Fragment' as its direct children`
**Cause:** JSX comment `{/* ... */}` placed directly inside a `Stack.Navigator` or `Tab.Navigator`. React Navigation treats it as an invalid child node.
**Fix:** Remove all inline JSX comments from inside navigator blocks. Move comments to lines above `<Stack.Screen>` elements if needed.

### 🛑 Troubleshooting Profile Image Not Showing After Login
If a user logs in via backup JSON and their profile photo doesn't appear, check that the exported JSON contains `settings.profileImage`. If the backup was made before v2.6, it won't have this field — the `LOAD_DATA` reducer will default to `''` (no photo) which is correct behaviour.

---

## 24. CRITICAL RULES FOR ANY AGENT

1. **Font keys are `Fungis-*` not `FUNGIS-*`** — always lowercase `ungis`, capital `F`, hyphen separator.
2. **Asset path from screens** is `../../assets/` (screens at `src/screens/`, assets at root).
3. **Currency in AppContext** is stored as symbol (`₹`, `$`, `€`, `£`, `¥`), not a code.
4. **`useApp()`** is the hook — not `useContext(AppContext)`. Import from `../context/AppContext`.
5. **Onboarding flag** → AsyncStorage key `'hasOnboarded'` (string `'true'`). App data → `'@flo_data'`. Logout clears both via `AsyncStorage.clear()`.
6. **No back button on WelcomeScreen** — it is the root entry point with nowhere to go back to.
7. **`navigation.reset`** must be used (not `navigate`) when exiting onboarding or logging out — clears back stack.
8. **`updateSettings`** handles all profile fields: `name`, `age`, `darkMode`, `currency`, `profileImage`.
9. **Onboarding and login screens are always dark** — hardcoded colors regardless of `settings.darkMode`.
10. **All onboarding screens must be registered in both Stack branches** (`isOnboarded true` and `false`) because logout from inside the app calls `navigation.reset({ routes: [{ name: 'Welcome' }] })` and that screen must be reachable from the returning-user branch.
11. **Never put JSX comments inside navigator blocks** — `{/* */}` is treated as an invalid child node by React Navigation and will crash the app.
12. **`profileImage` is a base64 data URI string** stored in `settings`. It is included in the JSON backup automatically. When displaying: use `<Image source={{ uri: settings.profileImage }} />`. Always check it is non-empty before rendering.
13. **JSON backup contains everything** — transactions, all settings (including profile image), and custom categories. It is the single source of truth for Login and Upload Data flows.

---

*Last updated: March 18, 2026*
*Project: Finova Personal Finance App*
*Version: 2.6.0 — Account System, Login & Profile Picture*
*Developer: Abhiram Kasturi*
