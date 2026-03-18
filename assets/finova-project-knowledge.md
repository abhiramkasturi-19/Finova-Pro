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
**2.7.0 — Transitions, Animations & UX Polish**

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

> ⚠️ `@react-navigation/bottom-tabs` is still installed as a dependency but is **no longer used**. `MainTabs` is now a fully custom animated component in `App.js`. The package can be removed in a future cleanup.

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

### 10.1 WelcomeScreen *(unchanged — v2.6)*
**File:** `src/screens/WelcomeScreen.js`

- Full-screen `splash-icon.png` as `ImageBackground`
- Smooth SVG `LinearGradient` from transparent at top to solid black at bottom
- Content block pinned to bottom:
  - **"Finova"** headline — `Fungis-Heavy` 58px white
  - **Tagline** — `Fungis-Bold` 19px sage
  - Decorative lines row (thin sage line / rotated diamond / thin sage line)
  - Sub-headline — `Fungis-Regular` 15px muted white
  - **"Get Started" button** (sage fill) → navigates to `CreateAccount`
  - **"Log In" button** (outlined, sage border) → navigates to `Login`
  - Login hint text
- No back button — this is the root screen

### 10.2 LoginScreen *(unchanged — v2.6)*
**File:** `src/screens/LoginScreen.js`

- `splash-icon.png` background + near-opaque overlay
- Back button top-left → `navigation.goBack()` (slides right-to-left back)
- Lock icon 🔐, title, body, callout card, hint
- **"Upload Backup File" button** — `expo-document-picker` picks `.json`, validates, calls `importData()`, sets `hasOnboarded: 'true'`, resets nav to `Main`
- ActivityIndicator while processing

### 10.3 CreateAccountScreen *(unchanged — v2.6)*
**File:** `src/screens/CreateAccountScreen.js`

- Profile Picture upload at top (circular avatar, camera badge, `expo-image-picker`)
- Username, Age, Theme chip selector, Currency chip selector
- Terms checkbox
- Continue → `updateSettings({ name, age, darkMode, currency, profileImage })` → navigates to `DataInfo`

### 10.4 DataInfoScreen *(unchanged — v2.5)*
**File:** `src/screens/DataInfoScreen.js`
- Data management explainer cards
- "Enter Finova →" saves `hasOnboarded: 'true'`, resets nav to `Main`

### 10.5 AppGuideScreen *(NEW — v2.6)*
**File:** `src/screens/AppGuideScreen.js`

- Accessed from Settings → App Guide
- Opens as a **pan-down modal** (`presentation: 'modal'`, `slide_from_bottom`)
- `splash-icon.png` background + `rgba(0,0,0,0.88)` overlay
- ScrollView of 10 guide sections (numbered cards)
- Back button top-left → `navigation.goBack()` — slides DOWN (modal reverse)
- Footnote: `Finova v2.7.0 · All data stored locally.`

### 10.6 SettingsScreen *(updated — v2.7)*
**File:** `src/screens/SettingsScreen.js`

**Profile Card:**
- **View mode:** avatar, name, meta (age + currency), "Edit Profile" pen icon
- **Edit mode (v2.7 change):** Name input, Age input, **Currency chip selector** (moved here from Preferences), profile photo picker
- Saving commits name, age, profileImage, and currency all at once via `updateSettings()`

**Preferences section (v2.7 change):** Dark Mode toggle **only** — currency has been moved into Edit Profile.

**Data Management:** collapsible, Download / Upload / Clear All (unchanged)

**App section:** Version `2.7.0`, App Guide link (opens pan-down modal)

**Log Out button:** wine red at bottom — 3-option alert (Download & Log Out / Log Out Without Saving / Cancel)

### 10.7 AddTransactionScreen *(updated — v2.7)*
**File:** `src/screens/AddTransactionScreen.js`

- Opens as a **pan-down modal** (slides up from bottom, swipe down or X to close)
- **Drag handle pill** at very top (44×4px, `colors.border`)
- **Header row:** title left, **X close button** right (34×34 circle, calls `navigation.goBack()`)
- Both X button and Record Expense/Income button call `navigation.goBack()` after saving — both slide the screen DOWN because `presentation: 'modal'` is set
- Collapsible Date & Time section (unchanged)
- Category chips with spring press animation
- Thousand-separator amount input

### 10.8 HomeScreen *(unchanged — v2.6)*
### 10.9 ActivityScreen *(updated — v2.7)*
**File:** `src/screens/ActivityScreen.js`

- Period filter pills (Week/Month/Quarter/Annual) — **AnimPill** spring-press animation
- Calendar mode selector (Daily/Monthly/Yearly) — **AnimPill** spring-press animation
- **Calendar mode button fix (v2.7):** `calModeRow` now uses `gap: 8`, `padding: 6`, each button has `paddingVertical: 10`, `paddingHorizontal: 8`, `minHeight: 40`, `fontSize: 13` — properly spaced and tappable

### 10.10 StatsScreen *(updated — v2.7)*
**File:** `src/screens/StatsScreen.js`

- Period filter pills (Week/Month/3 Month/6 Month/Year) — **AnimPill** spring-press animation

---

## 11. APPCONTEXT — STATE MANAGEMENT

**File:** `src/context/AppContext.js`
**Hook:** `useApp()`

### State Shape *(updated — v2.6)*
```js
{
  transactions: [],
  settings: {
    name:         '',
    age:          '',
    currency:     '₹',   // symbol — not code. Updated in Edit Profile (v2.7)
    darkMode:     false,
    profileImage: '',     // base64 data URI
  },
  customCategories: {
    expense: [],          // { name, color }
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
| Update settings | `updateSettings(partial)` | Merges — used by onboarding, Settings edit, and currency change |
| Toggle dark mode | `toggleDarkMode()` | Shorthand flip |
| Add custom category | `addCustomCategory(type, name)` | Auto-assigns unique color |
| Delete custom category | `deleteCustomCategory(type, name)` | |
| Import data | `importData(data)` | Full LOAD_DATA replace — used by Login and Upload |

### Persistence
- App data → AsyncStorage key `@flo_data`
- Onboarding flag → AsyncStorage key `hasOnboarded` (string `'true'`)
- On logout → `AsyncStorage.clear()` wipes both keys

### JSON Backup File Format
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

---

## 13. APP.JS ARCHITECTURE *(updated — v2.7)*

### No Branded Splash
The custom `BrandedSplash` overlay was removed in v2.7. The native Expo splash screen (`splash-icon.png` from `app.json`) is shown while fonts load, then hidden immediately. No 2-second delay, no opacity bleed-through.

### Tab Navigation — Custom Animated (replaces Tab.Navigator)
`@react-navigation/bottom-tabs` Tab.Navigator has been **replaced entirely** with a hand-built animated tab system inside `MainTabs`:

```
MainTabs (custom component)
├── Screens rendered with StyleSheet.absoluteFillObject
│   └── display:'none' when inactive (fully removes from render tree)
│   └── Animated.spring translateX on active screen only
├── CustomTabBar (floating pill bar)
│   └── zIndex:100 + elevation:100 — always on top on Android
```

**Directional slide logic:**
- Tap a tab to the **right** of current → new screen slides in from the **right**
- Tap a tab to the **left** of current → new screen slides in from the **left**
- Spring physics: `damping: 24`, `stiffness: 220`, `mass: 0.85`

**Why `display:'none'` instead of `pointerEvents:'none'`:**
`pointerEvents:'none'` only disables touch — the screen still paints on top of the tab bar, hiding it. `display:'none'` removes the screen from the render tree completely.

**Why `elevation:100` on the tab bar wrapper:**
On Android, elevation controls z-order between Views in the same stacking context. Without it, any View with a non-zero elevation (like screen content) can overlap the tab bar even if rendered later in the tree.

### Stack Navigation Structure
```
Stack.Navigator (root, default: slideRight, headerShown: false)
│
├── [isOnboarded === true]
│   ├── Main             → MainTabs           (fadeIn)
│   ├── AddTransaction   → AddTransactionScreen (panDownModal)
│   ├── Welcome          → WelcomeScreen       (slideRight) ← needed for logout reset
│   ├── CreateAccount    → CreateAccountScreen (slideRight)
│   ├── DataInfo         → DataInfoScreen      (slideRight)
│   ├── Login            → LoginScreen         (slideRight)
│   └── AppGuide         → AppGuideScreen      (panDownModal)
│
└── [isOnboarded === false]
    ├── Welcome          → WelcomeScreen       (fadeIn)
    ├── CreateAccount    → CreateAccountScreen (slideRight)
    ├── DataInfo         → DataInfoScreen      (slideRight)
    ├── Login            → LoginScreen         (slideRight)
    ├── Main             → MainTabs            (fadeIn)
    ├── AddTransaction   → AddTransactionScreen (panDownModal)
    └── AppGuide         → AppGuideScreen      (panDownModal)
```

### Transition Presets

```js
// All screens share this dark background during animation — kills white flash
const DARK = { contentStyle: { backgroundColor: '#111' } };

// Standard — all stack pushes (onboarding, guide, etc.)
const slideRight = {
  animation: 'slide_from_right',
  animationDuration: 300,
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  ...DARK,
};

// Modal — AddTransaction and AppGuide
// ⚠️ presentation:'modal' is REQUIRED on Android native stack.
// Without it, slide_from_bottom is silently ignored and the screen appears instantly.
// With it, goBack() correctly reverses to slide_to_bottom.
const panDownModal = {
  presentation: 'modal',
  animation: 'slide_from_bottom',
  animationDuration: 350,
  gestureEnabled: true,
  gestureDirection: 'vertical',
  ...DARK,
};

// Fade — used for the Main screen on first entry after onboarding/login
const fadeIn = {
  animation: 'fade',
  animationDuration: 280,
  ...DARK,
};

const noAnim = {
  animation: 'none',
  ...DARK,
};
```

---

## 14. NAVIGATION STRUCTURE *(updated — v2.7)*

### Screen Registry
| Screen Name | File | Transition | Notes |
|---|---|---|---|
| `Welcome` | `src/screens/WelcomeScreen.js` | noAnim | Instant appearance on root or logout |
| `CreateAccount` | `src/screens/CreateAccountScreen.js` | slideRight | |
| `DataInfo` | `src/screens/DataInfoScreen.js` | slideRight | |
| `Login` | `src/screens/LoginScreen.js` | slideRight | |
| `Main` | MainTabs (App.js) | fadeIn | Custom animated tabs |
| `AddTransaction` | `src/screens/AddTransactionScreen.js` | panDownModal | Slides up, X/Record/swipe-down to close |
| `AppGuide` | `src/screens/AppGuideScreen.js` | panDownModal | Slides up, Back/swipe-down to close |
| `Home` | `src/screens/HomeScreen.js` | spring slide | Inside MainTabs |
| `Activity` | `src/screens/ActivityScreen.js` | spring slide | Inside MainTabs |
| `Stats` | `src/screens/StatsScreen.js` | spring slide | Inside MainTabs |
| `Settings` | `src/screens/SettingsScreen.js` | spring slide | Inside MainTabs |

### Full Navigation Flows
```
First launch:
  Welcome (fade) → CreateAccount (slide) → DataInfo (slide) → [reset] → Main (fade)

Login (existing account):
  Welcome → Login (slide) → [upload JSON] → [reset] → Main (fade)

Log Out (from Settings):
  Settings → [Alert] → [AsyncStorage.clear()] → [reset] → Welcome

AddTransaction open/close:
  Any tab → AddTransaction (slides UP) → X or Record → slides DOWN back

AppGuide open/close:
  Settings → AppGuide (slides UP) → Back → slides DOWN back

Back navigation (stack):
  CreateAccount ← goBack() (slides right)
  Login ← goBack() (slides right)
```

---

## 15. COMPONENT SPECIFICATIONS

### AnimPill *(NEW — v2.7)*
Used in `ActivityScreen.js` and `StatsScreen.js` for filter/mode selectors.

```js
function AnimPill({ onPress, isActive, style, activeStyle, textStyle, activeTextStyle, label }) {
  // Spring press: scale 1 → 0.88 on pressIn, 0.88 → 1 with bounce on pressOut
  // damping/stiffness tuned so pressIn is instant, pressOut has a small spring back
}
```
Props: `onPress`, `isActive`, `style`, `activeStyle`, `textStyle`, `activeTextStyle`, `label`

### CustomTabBar *(updated — v2.7)*
- Receives `activeTab` (index), `onNavigate` (callback), `navigation` (stack nav for AddTransaction)
- No longer uses React Navigation's tab state — fully decoupled
- `tb.wrapper`: `position:'absolute'`, `zIndex:100`, **`elevation:100`** (Android z-order fix)
- Center + button navigates to `AddTransaction` via `navigation.navigate('AddTransaction')`

### DonutChart
Unchanged. Located at `src/components/DonutChart.js`.

---

## 18. ALL ERRORS & FIXES (complete log)

| Error | Cause | Fix |
|---|---|---|
| Navigator crash: "A navigator can only contain Screen/Group/Fragment" | JSX comment `{/* */}` inside Stack.Navigator | Remove all JSX comments from inside navigator blocks |
| Tab bar invisible on Android | Screens using `absoluteFillObject` with `pointerEvents:'none'` still painted over the tab bar | Changed to `display:'none'` for inactive screens; added `elevation:100` + `zIndex:100` to tab bar wrapper |
| `slide_from_bottom` ignored (screen appears instantly) | `presentation:'modal'` was removed from `panDownModal` config | Added `presentation:'modal'` back — it is required on Android native stack for the animation to fire |
| White flash on back navigation | Navigator background was transparent during transition frames | Added `contentStyle: { backgroundColor: '#111' }` to all screen options |
| Tab bar hidden by extra wrapper View | `<View style={{ zIndex:99 }}>` wrapped tab bar, breaking its absolute `bottom` positioning | Removed the wrapper; elevation on `tb.wrapper` itself is sufficient |
| goBack() from X button didn't animate | panDownModal had no `presentation:'modal'` | Restored `presentation:'modal'` — goBack() now correctly reverses to slide_to_bottom |

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
| 84 | Added **Log Out button** (wine red) to bottom of Settings | SettingsScreen.js |
| 85 | Log Out alert: Download & Log Out / Log Out Without Saving / Cancel | SettingsScreen.js |
| 86 | Log Out clears AsyncStorage and resets nav to Welcome | SettingsScreen.js |
| 87 | Added all onboarding screens to returning-user Stack branch so logout reset works | App.js |
| 88 | Fixed navigator crash caused by JSX comment inside Stack.Navigator | App.js |
| 89 | Bumped version to 2.6.0 | SettingsScreen.js |
| 90 | Removed branded splash overlay — native Expo splash only, no 2s delay or opacity bleed | App.js |
| 91 | Replaced Tab.Navigator with custom `MainTabs` — directional spring slide between tabs | App.js |
| 92 | Tab slide direction: right-of-current → slides from right; left-of-current → slides from left | App.js |
| 93 | Added `contentStyle: { backgroundColor: '#111' }` to all stack screens — fixes white flash on back | App.js |
| 94 | AddTransaction: removed ✕ close button, replaced with drag handle pill only (then reverted in 97) | AddTransactionScreen.js |
| 95 | AddTransaction/AppGuide: `presentation:'modal'` + `slide_from_bottom` + `gestureDirection:'vertical'` | App.js |
| 96 | Fixed tab bar invisible on Android — `display:'none'` for inactive screens, `elevation:100` on wrapper | App.js |
| 97 | Restored ✕ close button on AddTransactionScreen header (drag handle pill kept at top as well) | AddTransactionScreen.js |
| 98 | Confirmed `presentation:'modal'` is required for `slide_from_bottom` to animate on Android native stack | App.js |
| 99 | Added **AnimPill** spring-press component to ActivityScreen and StatsScreen for filter/mode selectors | ActivityScreen.js, StatsScreen.js |
| 100 | Fixed Activity calendar mode buttons (Daily/Monthly/Yearly) — proper spacing, padding, tap targets | ActivityScreen.js |
| 101 | Moved **Currency** from Preferences into Edit Profile card in Settings | SettingsScreen.js |
| 102 | Preferences section now contains Dark Mode only | SettingsScreen.js |
| 103 | Bumped version to 2.7.0 | SettingsScreen.js |

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

### 🛑 Tab Bar Not Visible
The tab bar wrapper must have both `zIndex: 100` AND `elevation: 100`. On Android, elevation controls z-order between Views — without it, screen content (even with display:'flex') can render above the tab bar in the compositing pass.

Inactive screens must use `display: 'none'`, not `pointerEvents: 'none'`. `pointerEvents:'none'` only disables touch — the screen still paints and covers the tab bar.

### 🛑 AddTransaction / AppGuide Opens Without Animation (Appears Instantly)
`presentation: 'modal'` must be present in the screen options. On Android's native stack, `slide_from_bottom` without `presentation: 'modal'` is silently ignored. The screen will appear and disappear with no animation.

### 🛑 goBack() Does Not Animate (Snaps Closed)
Same as above — `presentation: 'modal'` must be set. With it, `goBack()` correctly reverses to slide_to_bottom. Without it, `goBack()` snaps the screen off instantly.

### 🛑 White Flash During Navigation
All screen options must include `contentStyle: { backgroundColor: '#111' }`. This sets the navigator background to near-black so the brief animation frame before screen content paints is dark, not white.

### 🛑 Troubleshooting Logo/Asset Caching
1. `npx expo start --clear`
2. Android: Long-press Expo Go > App Info > Storage > Clear Cache
3. Open `app.json`, add a space, save, restart

### 🛑 Troubleshooting Fonts Rendering as System Font
Keys must be exactly `'Fungis-Heavy'`, `'Fungis-Bold'`, `'Fungis-Regular'`. Any typo silently falls back — no error thrown.

### 🛑 Troubleshooting Navigator Crash
**Error:** `A navigator can only contain 'Screen', 'Group' or 'React.Fragment' as its direct children`
**Cause:** JSX comment `{/* ... */}` placed directly inside a `Stack.Navigator`.
**Fix:** Remove all inline JSX comments from inside navigator blocks.

### 🛑 Profile Image Not Showing After Login
Backup made before v2.6 won't have `settings.profileImage`. The `LOAD_DATA` reducer defaults to `''` — correct behaviour. Nothing to fix.

---

## 24. CRITICAL RULES FOR ANY AGENT

1. **Font keys are `Fungis-*` not `FUNGIS-*`** — capital F, lowercase ungis, hyphen separator.
2. **Asset path from screens** is `../../assets/` (screens at `src/screens/`, assets at root).
3. **Currency in AppContext** is stored as symbol (`₹`, `$`, `€`, `£`, `¥`), not a code. Updated via `updateSettings({ currency })` inside Edit Profile, not Preferences.
4. **`useApp()`** is the hook — not `useContext(AppContext)`. Import from `../context/AppContext`.
5. **Onboarding flag** → AsyncStorage key `'hasOnboarded'` (string `'true'`). App data → `'@flo_data'`. Logout clears both via `AsyncStorage.clear()`.
6. **No back button on WelcomeScreen** — it is the root entry point.
7. **`navigation.reset`** must be used (not `navigate`) when exiting onboarding or logging out.
8. **`updateSettings`** handles all profile fields: `name`, `age`, `darkMode`, `currency`, `profileImage`.
9. **Onboarding and login screens are always dark** — hardcoded colors regardless of `settings.darkMode`.
10. **All onboarding screens must be registered in both Stack branches** because logout calls `navigation.reset({ routes: [{ name: 'Welcome' }] })` from inside the app.
11. **Never put JSX comments inside navigator blocks** — crashes the app.
12. **`profileImage` is a base64 data URI string** — check non-empty before rendering: `{profileImage ? <Image source={{ uri: profileImage }} /> : <Fallback />}`.
13. **JSON backup contains everything** — transactions, settings (incl. profileImage), customCategories.
14. **`presentation:'modal'` is required for `slide_from_bottom` on Android** — without it the screen appears/disappears instantly with no animation. Always include it for AddTransaction and AppGuide.
15. **Tab bar must have `elevation:100` on Android** — this is the Android z-order mechanism. `zIndex` alone is not enough on Android.
16. **Inactive tab screens use `display:'none'`** — not `pointerEvents:'none'`. Only `display:'none'` fully removes the screen from the render tree.
17. **Tab.Navigator is NOT used** — MainTabs is a fully custom component in App.js. Do not add `createBottomTabNavigator` back.
18. **`contentStyle: { backgroundColor: '#111' }` on all stack screens** — prevents white flash during slide transitions on dark-background screens.

---

*Last updated: March 18, 2026*
*Project: Finova Personal Finance App*
*Version: 2.7.0 — Transitions, Animations & UX Polish*
*Developer: Abhiram Kasturi*
