# Finova — Complete Project Knowledge Base
## Full Development Log, Architecture Reference & Agent Context Document

> **Who should read this:** Any AI agent, developer, or collaborator picking up this project. This document contains the complete history of every decision, every error, every fix, every design change, and the exact current state of every file. Read this fully before making any changes.

---

## TABLE OF CONTENTS

1. Project Overview
2. Tech Stack & Dependencies
3. File Structure
4. Design References & Visual Direction
5. Color Palettes
6. Font System — FUNGIS
7. Icon System
8. Data Models
9. Categories Reference
10. Screen Specifications (detailed)
11. AppContext — State Management
12. Theme Pattern — Critical Rules
13. App.js Architecture
14. Navigation Structure
15. Component Specifications
16. Spacing & Status Bar Rules
17. SafeAreaView Warning
18. All Errors & Fixes
19. Full Change Log
20. Pro System — Architecture & Monetization
21. How to Run & Troubleshooting
22. Security & Robustness Notes
23. Critical Rules for Any Agent
24. Future Work

---

## 1. PROJECT OVERVIEW

**App Name:** Finova
**Type:** Personal Finance Management Mobile App
**Runtime:** Expo Go (dev) → EAS Build (production)
**Framework:** React Native via Expo SDK ~55
**Platform tested:** Android
**Developer OS:** Windows 11 | PowerShell
**Project location:** `A:\ProgramLife\APP\Finova\`

### Core Purpose
Track income and expense transactions, view monthly overviews, analyze spending via donut charts, browse activity with calendar heat maps, trend analysis with line charts, custom categories, multiple wallets, app lock, dark/light themes, onboarding, login via JSON backup, logout.

### Current App Version
**3.0.2 — Pro System (Free + One-Time Pro Unlock, TEST MODE) + App Lock + Multiple Wallets + Transaction Search + CSV Export + Passcode Export + Deep QA Parity**

### Delivered Files (v3.0.2)
All 10 files are complete drop-in replacements.

| File | Action | Destination in project |
|---|---|---|
| `App.js` | Replace | `App.js` (root) |
| `AppContext.js` | Replace | `src/context/AppContext.js` |
| `ProPaywallScreen.js` | Replace | `src/screens/ProPaywallScreen.js` |
| `WalletsScreen.js` | **New file** | `src/screens/WalletsScreen.js` |
| `SettingsScreen.js` | Replace | `src/screens/SettingsScreen.js` |
| `ActivityScreen.js` | Replace | `src/screens/ActivityScreen.js` |
| `HomeScreen.js` | Replace | `src/screens/HomeScreen.js` |
| `StatsScreen.js` | Replace | `src/screens/StatsScreen.js` |
| `AddTransactionScreen.js` | Replace | `src/screens/AddTransactionScreen.js` |
| `app.json` | Replace | `app.json` (root) |

### Known Startup Fix
After dropping in v3.0 files, always run:
```bash
npx expo start --clear
```
The `[runtime not ready]: TypeError: Cannot read property 'EventEmitter' of undefined` error is caused by stale Metro bundle cache — **not a code bug**. `--clear` always fixes it.

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

> ⚠️ `@react-navigation/bottom-tabs` installed but NOT used.
> ⚠️ `expo-image-manipulator` permanently removed. Do NOT add back.
> ⚠️ `react-native-purchases` (RevenueCat) NOT yet installed. ProPaywallScreen is wired but purchase flow is TEST MODE. Install RevenueCat when Play Store account is ready.
> ⚠️ `expo-local-authentication` (biometrics) NOT yet installed. App Lock is PIN-only for now.

---

## 5. COLOR PALETTES

### Light Theme — "Parchment & Sage"
```js
bg:'#F6F0D7', surface:'#FDFAF0', surface2:'#EDE8CE', accent:'#9CAB84',
accentLight:'#7A8B68', accentDark:'#89986D', textPrimary:'#2C3320', textMuted:'#7A8B68',
wineRed:'#8B3A3A', expense:'#8B3A3A', income:'#4A6741', border:'#DDD9C2'
```

### Dark Theme — "Designer Modern"
```js
bg:'#222629', surface:'#474B47', surface2:'#6B6E70', accent:'#AEB784',
accentLight:'#AEB784', accentDark:'#61892F', textPrimary:'#FFFFFF', textMuted:'#6B6E70',
wineRed:'#B07070', expense:'#B07070', income:'#AEB784', border:'rgba(107,110,112,0.3)'
```

### Pro Paywall / App Lock Screen (fixed dark — not theme-dependent)
```js
bg: '#1A1D1A'   // slightly deeper than app bg — gives paywall its own identity
```

### Onboarding / Login (always dark)
Overlay: `rgba(0,0,0,0.90)` | Accent: `#AEB784` | Text: `#FFFFFF`

### Modal / Bottom Sheet
Sheet: `#2C3020` | Border: `rgba(174,183,132,0.18)` | Handle: `rgba(174,183,132,0.35)`

---

## 6. FONT SYSTEM — FUNGIS

```js
'Fungis-Regular': require('./assets/FUNGIS/fonts/OpenType-TT/FUNGIS Regular.ttf'),
'Fungis-Bold':    require('./assets/FUNGIS/fonts/OpenType-TT/FUNGIS Bold.ttf'),
'Fungis-Heavy':   require('./assets/FUNGIS/fonts/OpenType-TT/FUNGIS Heavy.ttf'),
```
**Never `FUNGIS-*`** — silent fallback. Always `Fungis-*`.

---

## 9. CATEGORIES REFERENCE

Base expense: Food🍜`#ECA72C` | Petrol⛽`#B10F2E` | Shopping🛍️`#9984D4` | Books📚`#EDE580` | Transport🚇`#A3BFA8` | Health💊`#A3BFA8` | Bills⚡`#3993DD` | Others📦`#221E22`

Custom: 25-colour `DESIGNER_PALETTE` in AppContext. **Free users: max 3 custom categories. Pro: unlimited.**

---

## 10. SCREEN SPECIFICATIONS

### 10.1 WelcomeScreen *(v2.6)*
Root screen. "Get Started" → CreateAccount. "Log In" → Login. No back button.

### 10.2 LoginScreen *(v2.6)*
JSON backup upload → validate → `importData()` → `hasOnboarded:'true'` → reset to Main.
Also handles encrypted `.enc` files — auto-detects `FINOVA_ENC:` prefix and opens DecryptImportModal.

### 10.3 CreateAccountScreen *(v2.8)*
Profile pic (`allowsEditing:true`), username, age, theme chip, currency chip, terms checkbox.
Terms row: one line, link opens TermsModal (6 sections). "I Understand" does NOT auto-tick.
Layout: `SafeAreaView paddingTop:-50 paddingBottom:-100`.

### 10.4 DataInfoScreen *(v2.5)*
"Enter Finova →" → `hasOnboarded:'true'` → reset to Main.

### 10.5 AppGuideScreen *(v2.9)*
`panDownManual`. Own internal `Animated.View` slide. `stiffness:240`. `goBack()` immediately on close.
Footnote: `Finova v3.0.0 · All data stored locally.`

### 10.6 SettingsScreen *(v3.0)*
**File:** `src/screens/SettingsScreen.js`

Profile card view mode shows **👑 PRO badge** if `isPro`. Active wallet name shown below meta line (if not default wallet).

**PREFERENCES section:**
- Dark Mode toggle (unchanged)
- App Lock toggle — Pro-gated. If not Pro → navigates to ProPaywall. If Pro + toggled ON → opens `PinSetupModal` (two-step PIN entry). If toggled OFF → clears `appLockEnabled` + `appLockPin`.

**DATA MANAGEMENT section (collapsible):**
- Download Data — Pro-gated (JSON backup)
- CSV Export — **NEW Pro feature** — exports all transactions to `.csv` via expo-sharing
- Passcode Export — **NEW Pro feature** — XOR-encrypts backup with password → `.enc` file
- Upload Data — always available. Auto-detects `.enc` (encrypted) files, opens `DecryptImportModal`. Handles plain JSON as before.
- Clear All Data — always available. Custom modal confirm.

**APP section:**
- Version: `3.0.0`
- Wallets row → navigates to `WalletsScreen`
- App Guide row → navigates to `AppGuide`
- "👑 Upgrade to Pro — ₹49 →" row — visible only to free users

**executeClear** preserves: `name`, `age`, `currency`, `darkMode`, `profileImage`, `isPro`, `appLockEnabled`, `appLockPin`, `wallets`, `activeWalletId`, `customCategories`.

**Layout/Styling:**
- ScrollView `contentContainerStyle` uses `paddingBottom: 100` to guarantee the bottom list items clear the custom tab bar completely.

**Logout Options:**
The `LogoutModal` renders 3 explicit paths (Log Out + Download, Log Out without Download). Free users interacting with the Download option are aggressively routed through to the ProPaywall.

### 10.7 AddTransactionScreen *(v3.0)*
**File:** `src/screens/AddTransactionScreen.js`

**Custom category gate:** `handleAddNewCat` checks return value of `addCustomCategory`. If `'limit_reached'` → shows `ErrorModal` with "👑 Upgrade to Pro" action button → navigates to ProPaywall.

**"+ New" chip:** shows label `'Pro'` (instead of `'New'`) when free user has hit the 3-category limit.

`panDownManual`. Own `Animated.View` slide. Immediate `goBack()` on close. `maxLength={12}` on amount. `paddingBottom:120`.

Wallet tagging is automatic — `addTransaction()` in AppContext always tags with `state.activeWalletId`. No wallet selector UI needed in this screen.

### 10.8 HomeScreen *(v3.0)*
**File:** `src/screens/HomeScreen.js`

Uses `activeTransactions` (wallet-filtered) for all calculations — month totals, donut chart, recent 5.

**Wallet card changes:**
- Wallet name pill shown on the card top row (taps → WalletsScreen)
- Avatar tap also navigates to WalletsScreen

### 10.9 ActivityScreen *(v3.0)*
**File:** `src/screens/ActivityScreen.js`

Uses `activeTransactions` for period filter, donut chart, total, and transaction list.
Calendar heat-map also uses `activeTransactions` (shows heat for active wallet only).

**Transaction Search (NEW — Pro):**
- Search icon (`🔍`) beside "Recent Transactions" section title
- Free users: search icon has `🔒` badge — tap navigates to ProPaywall
- Pro users: tap toggles search bar open/closed
- Search bar filters `displayTxns` by: note, amount (as string), category label
- `setSearchOpen(false); setSearchQuery('')` on close

### 10.10 StatsScreen *(v3.0)*
**File:** `src/screens/StatsScreen.js`

Uses `activeTransactions` throughout — `filtered`, `catMap`, `buildPoints`. Wallet switch on HomeScreen automatically makes Stats reflect the active wallet.

Filters: `['Week','Month','3 Month','6 Month','Year']`

### 10.11 ProPaywallScreen *(v3.0.2 — visually redesigned)*
**File:** `src/screens/ProPaywallScreen.js`

**Background:** `#090A09` (deep black premium layout).

**Layout:**
```
✕ close button (top right, rounded ghost button)
Huge 'finova' text logo (Heavy 64px, gold)
Tagline (Regular 14px)

Vertical column containing Two Stacked Cards:
[Free Card]
  ₹0 forever
  4 Base Features
  "Current" marker

[Pro Card] (Gold accented)
  ₹49 one-time limited offer + "LIMITED TIME" badge
  5 Pro Features
  "Unlock Pro" CTA

"Restore Purchase" (Link)
Legal footer
```

**Purchase flow — TEST MODE (current):**
```js
// 900ms fake delay → updatePro(true) → navigation.goBack()
setTimeout(() => { updatePro(true); navigation.goBack(); }, 900);
```
**When RevenueCat is ready:** replace `setTimeout` block with RevenueCat `purchasePackage` call.

`panDownManual`. Own `Animated.View` slide. Immediate `goBack()` on close.

### 10.12 WalletsScreen *(NEW — v3.0)*
**File:** `src/screens/WalletsScreen.js`

Full wallet manager. Uses `slideRight` transition (not panDown).

**Features:**
- Lists active (non-archived) wallets with transaction count
- Active wallet highlighted with sage tint + "Active" pill
- Switch wallet → `switchWallet(id)` + `navigation.goBack()` (all screens reflect new wallet)
- Rename wallet (ModalSheet, `RenameModal`)
- Archive wallet (moves to archived section, switches to default if active)
- Delete wallet with confirmation — migrates transactions to Personal
- Create new wallet (Pro-gated) — `NewWalletModal` with name + icon picker (15 emoji icons)
- Default (`id: 'default'`) wallet cannot be deleted or archived
- Archived section collapsible, shows unarchive (♻️) + delete options
- Active context banner shown when not on default wallet — with "Back to Personal" shortcut

**Pro gate on create:** if `!isPro` → `setNewModalOpen(false)` → `navigation.navigate('ProPaywall')`

---

## 11. APPCONTEXT — STATE MANAGEMENT

**File:** `src/context/AppContext.js` | **Hook:** `useApp()`

### State Shape *(v3.0)*
```js
{
  transactions: [],         // all transactions across all wallets
  settings: {
    name:           '',
    age:            '',
    currency:       '₹',
    darkMode:       false,
    profileImage:   '',     // base64 data URI
    isPro:          false,  // false = free, true = pro unlocked
    appLockEnabled: false,  // App Lock toggle state
    appLockPin:     '',     // 4-digit PIN string
  },
  customCategories: { expense: [], income: [] },
  wallets: [
    { id: 'default', name: 'Personal', icon: '💳', archived: false }
  ],
  activeWalletId: 'default',
}
```

### Computed Value
```js
// Exposed in context — use this in all screens for wallet-aware display
activeTransactions = transactions.filter(t =>
  (t.walletId || 'default') === activeWalletId
)
```
> Use `activeTransactions` in HomeScreen, ActivityScreen, StatsScreen.
> Use raw `transactions` only for cross-wallet aggregations (not currently needed).

### Key Actions *(v3.0)*
| Method | Purpose | Notes |
|---|---|---|
| `addTransaction(txn)` | Prepends with `id` + `walletId:activeWalletId` | Auto-tags active wallet |
| `editTransaction(txn)` | `map()` replaces by id | |
| `deleteTransaction(id)` | Filter by id | |
| `updateSettings(partial)` | Merges settings | |
| `updatePro(bool)` | Sets `settings.isPro` | |
| `toggleDarkMode()` | Shorthand | |
| `addCustomCategory(type, name)` | Returns `'limit_reached'` or `'ok'` | Free limit: 3 |
| `deleteCustomCategory(type, name)` | Filter | |
| `addWallet(name, icon)` | Returns `'requires_pro'` or `'ok'` | Pro-gated |
| `renameWallet(id, name)` | Updates wallet name | |
| `deleteWallet(id)` | Removes wallet, migrates txns to 'default' | Cannot delete 'default' |
| `archiveWallet(id)` | Sets archived:true, switches to default if active | Cannot archive 'default' |
| `unarchiveWallet(id)` | Sets archived:false | |
| `switchWallet(id)` | Updates `activeWalletId` | |
| `importData(data)` | Full LOAD_DATA replace | |

### Transaction shape *(v3.0)*
```js
{
  id:             '1711000000000',   // Date.now().toString()
  type:           'expense' | 'income',
  amount:         1234.5,
  category:       'food',            // base category id, or 'others'
  customCategory: '',                // non-empty only when category='others'
  date:           '2026-03-20T...',  // ISO string
  note:           '',
  walletId:       'default',         // NEW in v3.0 — auto-tagged by addTransaction
}
```
> Old transactions without `walletId` default to `'default'` via `(t.walletId || 'default')` throughout.

### isPro & App Lock persistence
- `isPro`, `appLockEnabled`, `appLockPin` are in `settings` → persisted in `@flo_data`
- Survive: `executeClear` ✅, backup restore ✅ (if backup was from v3.0)
- Cleared by: `performLogout` only (resets to defaults)

### Context value
```js
value={{
  ...state,
  activeTransactions,          // computed wallet-filtered list
  isPro: state.settings.isPro, // boolean shortcut
  // all actions...
}}
```

---

## 13. APP.JS ARCHITECTURE

### Transition Presets *(v3.0 — unchanged from v2.9 except Wallets)*
```js
const DARK          = { contentStyle: { backgroundColor: '#111' } };
const panDownManual = { presentation:'transparentModal', animation:'none', ...DARK };
const slideRight    = { animation:'slide_from_right', animationDuration:250, gestureEnabled:true, gestureDirection:'horizontal', ...DARK };
const fadeIn        = { animation:'fade', animationDuration:280, ...DARK };
const noAnim        = { animation:'none', ...DARK };
```

### Screen → Preset mapping *(v3.0)*
| Screen | Preset | Notes |
|---|---|---|
| Welcome (AuthFlow) | noAnim | Root |
| Main (MainTabs) | fadeIn | Custom tabs |
| AddTransaction | panDownManual | Own internal Animated.View slide |
| AppGuide | panDownManual | Own internal Animated.View slide |
| ProPaywall | panDownManual | Own internal Animated.View slide |
| **Wallets** | **slideRight** | **NEW — standard horizontal slide** |

### Stack Structure *(v3.0)*
```
[onboarded]
  Main(fadeIn)
  Welcome(noAnim)
  AddTransaction(panDownManual)
  AppGuide(panDownManual)
  ProPaywall(panDownManual)
  Wallets(slideRight)          ← NEW

[not onboarded]
  Welcome(noAnim)
  Main(fadeIn)
  AddTransaction(panDownManual)
  AppGuide(panDownManual)
  ProPaywall(panDownManual)
  Wallets(slideRight)          ← NEW
```

> `sharedScreens` pattern used to avoid duplicating AddTransaction, AppGuide, ProPaywall, Wallets across both branches. Both branches share the same 4 screens via a JSX fragment defined once.

### App Lock Overlay *(NEW — v3.0)*
`AppLockOverlay` component wraps the entire `NavigationContainer` inside `AppProvider`. It:
- Watches `AppState` — triggers on `background/inactive → active` transitions
- Shows a full-screen `Modal` (transparent:false) with PIN pad when `settings.appLockEnabled && settings.appLockPin`
- 4-dot indicator, 12-key numpad (1–9, empty, 0, ⌫)
- Wrong PIN → shake animation (`Animated.sequence` translateX) + clear
- Correct PIN → `setLocked(false)`
- Background: `#1A1D1A` (same as paywall — dark identity screen)

---

## 14. NAVIGATION STRUCTURE

### Key flows *(v3.0)*
```
Free user hits custom cat limit:
  AddTransactionScreen "+ New" chip → addCustomCategory returns 'limit_reached'
  → ErrorModal with "👑 Upgrade to Pro" action → navigation.navigate('ProPaywall')
  → user buys → updatePro(true) → goBack() → now unlimited

Free user taps search icon in Activity:
  → navigation.navigate('ProPaywall')
  → user buys → goBack() → search now works

Free user taps App Lock toggle in Settings:
  → navigation.navigate('ProPaywall')
  → user buys → goBack() → toggle opens PinSetupModal

Free user taps New Wallet in WalletsScreen:
  → navigation.navigate('ProPaywall')
  → user buys → goBack() → new wallet modal opens

Free user taps Download/CSV/Passcode Export in Settings:
  → navigation.navigate('ProPaywall')

Free user taps "Upgrade to Pro" in Settings App section:
  → navigation.navigate('ProPaywall')

Wallet switch:
  WalletsScreen wallet row tap → switchWallet(id) → navigation.goBack()
  All screens now show filtered data for new active wallet
  HomeScreen avatar tap → WalletsScreen
  HomeScreen wallet name pill → WalletsScreen
```

---

## 15. ENCRYPTION (Passcode Export)

XOR encryption — sufficient for ₹49 app privacy. Not military-grade but acceptable.

```js
// Encrypt: returns 'FINOVA_ENC:<hex>' or null
function encryptJson(jsonStr, password) {
  const key     = Array.from(password).map(c => c.charCodeAt(0));
  const encoded = encodeURIComponent(jsonStr);  // safe ASCII
  const hex     = Array.from(encoded).map((c, i) =>
    (c.charCodeAt(0) ^ key[i % key.length]).toString(16).padStart(2, '0')
  ).join('');
  return 'FINOVA_ENC:' + hex;
}

// Decrypt: returns original JSON string or null on wrong password
function decryptJson(encStr, password) {
  if (!encStr?.startsWith('FINOVA_ENC:')) return null;
  const key  = Array.from(password).map(c => c.charCodeAt(0));
  const hex  = encStr.slice(11);
  const chars = [];
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16);
    chars.push(String.fromCharCode(byte ^ key[(i / 2) % key.length]));
  }
  return decodeURIComponent(chars.join(''));
}
```

**Upload flow auto-detection:** `handleUpload` reads file content. If it starts with `FINOVA_ENC:` → open `DecryptImportModal`. Otherwise parse as JSON.

---

## 18. ALL ERRORS & FIXES

| Error | Cause | Fix |
|---|---|---|
| White/grey flash on modal | Native modal bg on Android | `panDownManual` + internal `Animated.View` |
| Exit animation grey flash | Spring-down before goBack | Immediate `goBack()` — no exit spring |
| Note hidden behind keyboard | KAV broken inside Android modals | `softwareKeyboardLayoutMode:'pan'` in app.json |
| `MediaTypeOptions` crash | SDK 55 deprecated API | Omit `mediaTypes` entirely |
| `darkColors.bg` wrong | `'#222222'` not `'#222629'` | Fixed in theme.js |
| Activity delete used system Alert | `Alert.alert` not custom modal | `DeleteTxnModal` added |
| `executeClear` wiped `hasOnboarded` | `AsyncStorage.clear()` in executeClear | Replaced with `setItem('@flo_data',...)` |
| HomeScreen taps did nothing | No `onPress` on TransactionItem | `TouchableOpacity` wrapping added |
| Stats pills overflow | `'3 Month'`/`'6 Month'` too wide | `'3M'`/`'6M'` |
| Username overflow | No numberOfLines | `numberOfLines={1}` + ellipsis |
| Amount overflow | No maxLength | `maxLength={12}` |
| AppGuide entry too slow | `stiffness:24` typo | Fixed to `stiffness:240` |
| `[runtime not ready] EventEmitter undefined` | Stale Metro cache after new file drops | `npx expo start --clear` |
| `Invalid number formatting character 'z'` | Malformed SVG path in SettingsScreen CameraIcon | Fixed arc parameters from `a4 4 1 0 0-8 4 4 0 0 0 0 8z` to `a4 4 0 1 0 0-8 4 4 0 1 0 0 8z` |
| **CRITICAL** Pro JSON Injection Bypass | `LOAD_DATA` overwritten full settings including privileges | Stripped `isPro` / `appLock` from incoming payload |
| **CRITICAL** App Lock Cold-Boot Bypass | `AppState` listener only checks minimizes | Added immediate mount check to `AppLockOverlay` |
| **HIGH** O(N) Array Iteration Freeze | Mapping thousands of nodes inside `ScrollView` | Sliced array output to 100 on primary feeds |
| **HIGH** Weak XOR Encryption | Exposed static passcodes | Replaced with `FINOVA_ENC2` salted-hash positional shift |
| **MEDIUM** CSV Wallet Isolation | CSV import hard-forced `walletId: 'default'` | Rewrote `parseCsvBackup` to build/map `wallets[]` dynamically |
| **MEDIUM** Future Date Filter Leak | JS date math went negative, dropping below 7 days | Bound check to `diff >= 0 && diff <= 7` |
| **LOW** Instant Modal Snap Dismount | `navigation.goBack()` fired before spring animation | Wrapped `goBack` inside `Animated.spring().start()` callback |

---

## 19. FULL CHANGE LOG

| # | Change | Files |
|---|---|---|
| 49–135 | v2.6.0 through v2.8.0 changes (see previous KB) | — |
| 136 | Added `isPro: false` to AppContext settings | AppContext.js |
| 137 | Added `updatePro(bool)` action | AppContext.js |
| 138 | `addCustomCategory` returns `'limit_reached'` if free and ≥3 cats | AppContext.js |
| 139 | `isPro` shortcut in context value | AppContext.js |
| 140 | `handleAddNewCat` checks return value — ProPaywall on limit | AddTransactionScreen.js |
| 141 | ProPaywall paywall screen built | ProPaywallScreen.js |
| 142 | ProPaywall registered in both Stack branches | App.js |
| 143 | Download Data row gated behind isPro | SettingsScreen.js |
| 144 | "Upgrade to Pro" row added to Settings App section | SettingsScreen.js |
| 145 | Pro badge `👑 PRO` on Settings profile card | SettingsScreen.js |
| 146–148 | v2.9.0 delivered | — |
| 149 | **App Lock** — `AppLockOverlay` in App.js, AppState watcher, PIN pad modal, shake animation | App.js |
| 150 | App Lock PIN setup: `PinSetupModal` (two-step, 4-digit) in Settings | SettingsScreen.js |
| 151 | `appLockEnabled` + `appLockPin` added to AppContext settings state | AppContext.js |
| 152 | App Lock toggle (Pro-gated) in Preferences section | SettingsScreen.js |
| 153 | **Multiple Wallets** — `wallets[]` + `activeWalletId` + wallet CRUD reducers in AppContext | AppContext.js |
| 154 | `activeTransactions` computed value added to AppContext | AppContext.js |
| 155 | `addTransaction` auto-tags `walletId: state.activeWalletId` | AppContext.js |
| 156 | `addWallet` returns `'requires_pro'` or `'ok'` | AppContext.js |
| 157 | `WalletsScreen.js` built — full wallet CRUD UI | WalletsScreen.js (NEW) |
| 158 | WalletsScreen registered in both Stack branches (slideRight) | App.js |
| 159 | Wallets row added to Settings APP section | SettingsScreen.js |
| 160 | HomeScreen uses `activeTransactions`, wallet name pill on card | HomeScreen.js |
| 161 | ActivityScreen uses `activeTransactions` | ActivityScreen.js |
| 162 | StatsScreen uses `activeTransactions` | StatsScreen.js |
| 163 | **Transaction Search** — search icon beside "Recent Transactions", Pro-gated, inline filter bar | ActivityScreen.js |
| 164 | **CSV Export** — `handleCsvExport` in Settings, Pro-gated, shares `.csv` via expo-sharing | SettingsScreen.js |
| 165 | **Passcode Export** — XOR encrypt JSON, `PasscodeExportModal`, shares `.enc` file | SettingsScreen.js |
| 166 | **Decrypt Import** — `DecryptImportModal`, auto-detected in Upload Data flow | SettingsScreen.js |
| 167 | `executeClear` updated to preserve `appLockEnabled`, `appLockPin`, `wallets`, `activeWalletId` | SettingsScreen.js |
| 168 | `performLogout` resets wallets to `[DEFAULT_WALLET]` + `activeWalletId:'default'` | SettingsScreen.js |
| 169 | ProPaywall rebuilt — 7 feature rows, 900ms TEST delay, `#1A1D1A` bg | ProPaywallScreen.js |
| 170 | `sharedScreens` pattern in App.js — avoids duplicating 4 screens across both branches | App.js |
| 171 | AddTransactionScreen ErrorModal gains `actionLabel`/`onAction` props for Pro upgrade CTA | AddTransactionScreen.js |
| 172 | app.json version bumped to `3.0.0` | app.json |
| 173 | AppGuide footnote should be updated to `v3.0.0` | AppGuideScreen.js |
| 174 | Fixed CameraIcon SVG path crashing the app | SettingsScreen.js |
| 175 | **Deep QA Audit Completed** — 7 vulnerabilities identified | Walkthrough.md |
| 176 | **v3.0.1 Patch Cycle Delivered** — All 7 QA Vulnerabilities decisively patched | Multiple files |
| 177 | App Lock bug — explicitly mapped `RESET_APP` in context to wipe lock on logout | AppContext.js, SettingsScreen.js |
| 178 | AppGuide redesign — distinctly separated Free Features and Pro Features arrays | AppGuideScreen.js |
| 179 | Settings Download Restrict — Free users only see "Log Out" destructive option | SettingsScreen.js |
| 180 | ProPaywall stacked layout redesign + huge "finova" top logo + premium styling | ProPaywallScreen.js |
| 181 | Instant close transitions removed `Animated.spring` on exit for Wallets, AppGuide, ProPaywall | Multiple files |
| 182 | DataInfoScreen onboarding features updated to include new Encrypt & Privacy emphasis | DataInfoScreen.js |
| 183 | LogoutModal explicitly shows 3 distinct options, routing Free users to Paywall on 'Download' | SettingsScreen.js |
| 184 | ProPaywall pricing updated to visually reflect ₹49 Limited Time Offer | ProPaywallScreen.js |

---

## 20. PRO SYSTEM — ARCHITECTURE & MONETIZATION

### Free vs Pro feature split *(v3.0)*
| Feature | Free | Pro |
|---|---|---|
| All transactions (add/edit/delete) | ✅ Unlimited | ✅ Unlimited |
| Base categories (8 expense + income) | ✅ All | ✅ All |
| Custom categories | ✅ 3 max | ✅ Unlimited |
| Data Export / JSON Backup | ❌ Locked → paywall | ✅ Unlocked |
| CSV Export | ❌ Locked → paywall | ✅ Unlocked |
| Passcode Export | ❌ Locked → paywall | ✅ Unlocked |
| App Lock (PIN) | ❌ Locked → paywall | ✅ Unlocked |
| Multiple Wallets (create new) | ❌ Locked → paywall | ✅ Unlocked |
| Transaction Search | ❌ Locked → paywall | ✅ Unlocked |
| Dark + Light theme | ✅ Both | ✅ Both |
| Home / Activity / Stats screens | ✅ Full | ✅ Full |
| All future Pro features | ❌ | ✅ Auto-included |

**Price: ₹199 one-time.**

### Current payment state: TEST MODE
`react-native-purchases` (RevenueCat) is NOT yet installed. Paywall purchase calls `updatePro(true)` directly after 900ms fake delay.

### RevenueCat integration (when Play Store account is ready)
1. Install: `npx expo install react-native-purchases`
2. Add to `app.json` plugins: `"react-native-purchases"`
3. Create EAS dev build: `eas build --profile development --platform android`
4. In `App.js` root useEffect: `Purchases.configure({ apiKey: 'YOUR_RC_ANDROID_KEY' })`
5. In `ProPaywallScreen.handlePurchase`: replace `setTimeout` block with:
   ```js
   const offerings = await Purchases.getOfferings();
   const pkg = offerings.current?.availablePackages[0];
   const { customerInfo } = await Purchases.purchasePackage(pkg);
   if (customerInfo.entitlements.active['pro']) {
     updatePro(true);
     navigation.goBack();
   }
   ```
6. In `ProPaywallScreen.handleRestore`: replace with:
   ```js
   const customerInfo = await Purchases.restorePurchases();
   if (customerInfo.entitlements.active['pro']) {
     updatePro(true);
     Alert.alert('Restored!', 'Finova Pro has been restored.');
   }
   ```
7. Play Console: Create in-app product `finova_pro_lifetime` at ₹199, type: non-consumable
8. RevenueCat dashboard: Create entitlement `pro`, product `finova_pro_lifetime`, offering `default`

---

## 21. HOW TO RUN & TROUBLESHOOTING

### Standard Run
```bash
npx expo start --clear
```

### Always use `--clear` after dropping in new files
Metro caches bundles. New files (WalletsScreen, ProPaywallScreen) or changed imports will cause `[runtime not ready] EventEmitter undefined` without `--clear`.

### Nuclear reset (if `--clear` alone doesn't work)
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

### Testing Free Mode
Default state: `isPro: false`. At 3 custom categories, "+ New" chip label changes to "Pro" and error modal offers upgrade. Search icon shows 🔒 badge. App Lock toggle redirects to paywall.

### Testing Pro Mode
On the paywall, tap "Unlock Finova Pro →". isPro becomes `true` in 900ms (TEST MODE). All Pro features unlock instantly. To reset: log out.

### Testing App Lock
1. Go to Settings → Preferences → App Lock (requires Pro)
2. Toggle ON → set a 4-digit PIN
3. Send app to background → bring back to foreground
4. PIN overlay appears

### Testing Wallets
1. Settings → APP → Wallets (or HomeScreen wallet pill)
2. Create new wallet (requires Pro)
3. Switch to it — HomeScreen card shows wallet name
4. Add transactions — they appear only in that wallet's view
5. Switch back to Personal — those transactions disappear from view (not deleted)

### Re-testing Onboarding
```js
await AsyncStorage.removeItem('hasOnboarded');
```

### 🛑 White / Grey Flash on Modal
Both AddTransaction and AppGuide and ProPaywall use `panDownManual` + internal animation. Do NOT switch to `panDownModal`.

### 🛑 Pro Gate Not Showing
Check `isPro` is correctly in the context value. Ensure `addCustomCategory` returns `'limit_reached'` and the caller checks it.

### 🛑 ProPaywall / Wallets Not Found in Navigation
Both screens must be in **both** Stack branches. Use the `sharedScreens` pattern.

### 🛑 isPro Resets After Clear All Data
This should NOT happen. `executeClear` uses `AsyncStorage.setItem('@flo_data',...)` and explicitly preserves `isPro`. If it resets, check `executeClear` is NOT calling `AsyncStorage.clear()`.

### 🛑 Wallet transactions showing cross-wallet
All screens must use `activeTransactions` from context, not raw `transactions`. Check imports.

---

## 22. SECURITY & ROBUSTNESS NOTES

### isPro security
Local AsyncStorage flag. No server-side validation. Acceptable for privacy-first local app at ₹199 price point. RevenueCat integration will add receipt validation when ready.

### Passcode Export security
XOR encryption with URL-encoded payload. Not cryptographically strong, but sufficient for privacy backup use case. A determined user with hex editor could brute-force short passwords. Acceptable for this app.

### App Lock security
PIN stored as plaintext in AsyncStorage (inside `@flo_data`). Not in secure storage. A user with device ADB access could read it. For current use case this is acceptable — App Lock is a convenience lock, not a security guarantee. Future: migrate to `expo-secure-store`.

---

## 23. CRITICAL RULES FOR ANY AGENT

1. **Font keys: `Fungis-*`** — never `FUNGIS-*`.
2. **Asset path:** `../../assets/` from screens.
3. **Currency stored as symbol.** Lives in Edit Profile.
4. **Hook is `useApp()`.**
5. **`hasOnboarded` flag survives executeClear.** Only logout clears it.
6. **No back button on WelcomeScreen.**
7. **`navigation.reset`** for onboarding exit and logout.
8. **`updateSettings`** for profile fields. **`updatePro(bool)`** for Pro status.
9. **Onboarding always dark** — never reads `settings.darkMode`.
10. **All screens in both Stack branches.** Use `sharedScreens` pattern.
11. **No JSX comments inside navigator blocks.**
12. **`profileImage` is base64 data URI.**
13. **JSON backup contains everything** including `isPro`, `wallets`, `activeWalletId`.
14. **AddTransaction + AppGuide + ProPaywall all use `panDownManual`** — internal animation, no native modal flash.
15. **Wallets screen uses `slideRight`** — standard horizontal slide.
16. **No spring-down exit on panDownManual screens** — immediate `goBack()`.
17. **Tab bar: `elevation:100`.** Inactive: `display:'none'`.
18. **Tab.Navigator NOT used** — MainTabs is custom.
19. **`contentStyle:{backgroundColor:'#111'}` on all stack screens.**
20. **Never `Alert.alert()` for destructive actions** — use custom modals.
21. **Modal sheet: `#2C3020`. ProPaywall + AppLock bg: `#1A1D1A`.**
22. **TermsModal "I Understand" does NOT auto-tick.**
23. **`executeClear` uses `AsyncStorage.setItem` NOT `AsyncStorage.clear()`.**
24. **`executeClear` preserves `customCategories`, `isPro`, `appLockEnabled`, `appLockPin`, `wallets`, `activeWalletId`.**
25. **Creator credit always visible.**
26. **Never add KAV to AddTransactionScreen.**
27. **Never use `ImagePicker.MediaTypeOptions`.**
28. **Never re-add custom crop modal.**
29. **`darkColors.bg` is `'#222629'`.**
30. **HomeScreen rows are tappable** — TouchableOpacity wrapping.
31. **Stats filters: `['Week','Month','3 Month','6 Month','Year']`.** Month view graphs map every day of the month explicitly (30/31 days) but restrict label steps (`n <= 31 ? 2 : Math.max(1, Math.ceil(n / 10))`) to display precisely ~15 axes points.
32. **Version is `3.0.0`.**
33. **Negative SafeAreaView padding is intentional** — `paddingTop:-50`, `paddingBottom:-100`.
34. **AppGuide, AddTransaction, and Wallets screen spring stiffness is `240`**. They all explicitly utilize `panDownManual` preset in Navigation, paired with an internal `Animated.View` spring slide-up and instantaneous `goBack()` exit to eliminate transit lag.
35. **`addCustomCategory` returns `'limit_reached'` or `'ok'`** — callers must check return value.
36. **`addWallet` returns `'requires_pro'` or `'ok'`** — callers must check return value.
37. **`isPro: false` is free mode. `isPro: true` is Pro.** No other states.
38. **ProPaywall is TEST MODE** — `handlePurchase` sets isPro directly after 900ms. Do NOT ship to production without RevenueCat.
39. **`react-native-purchases` is NOT yet installed** — do not import or reference it.
40. **All screens (ProPaywall + Wallets) must be in BOTH Stack branches.** Use `sharedScreens` pattern.
41. **`activeTransactions` is the wallet-filtered list.** Use it in all display screens. Raw `transactions` only for cross-wallet use cases.
42. **`walletId` is auto-tagged on `addTransaction`.** Old transactions default to `'default'` via `(t.walletId || 'default')`.
43. **Default wallet `id:'default'` cannot be deleted or archived.**
44. **Delete wallet migrates its transactions to `'default'`.**
45. **Always run `npx expo start --clear` after dropping in new files** — Metro cache causes EventEmitter crash otherwise.
46. **Terms & Conditions in CreateAccountScreen must always include the "Last updated March 2026" text to ensure legal timeline consistency.**
47. **No OS Alerts:** Never utilize native `Alert.alert` for success, error, or confirmation boundaries. Use standard `MessageModal` or `RestoreConfirmModal` custom overlays in `SettingsScreen` and `LoginScreen`.

---

## 24. FUTURE WORK

| Feature | Version | Notes |
|---|---|---|
| RevenueCat integration | v3.1.0 | Replace TEST MODE in ProPaywallScreen. Install `react-native-purchases`. |
| App Lock biometrics | v3.1.0 | `expo-local-authentication`. Fingerprint/face as alternative to PIN. |
| AppGuide footnote update | v3.0.x | Change `v2.9.0` to `v3.0.0` in AppGuideScreen.js |
| Secure PIN storage | v3.1.0 | Migrate `appLockPin` from AsyncStorage to `expo-secure-store` |
| DonutChart interactive segments | v3.1.0 | `onSegmentPress` on SVG arcs → legend highlight |
| Wallet-aware CSV export | v3.0.x | Add wallet name column to CSV (already done in v3.0) |
| Backup checksum | v3.1.0 | Version + hash in JSON backup to detect tampering |
| Cross-wallet Stats view | v3.1.0 | Toggle in StatsScreen to see all wallets combined |

---

*Last updated: March 20, 2026*
*Project: Finova Personal Finance App*
*Version: 3.0.2 — Pro System + App Lock + Multiple Wallets + Transaction Search + CSV Export + Passcode Export + Deep QA Parity + Architecture Transitions Fixes*
*Developer: Abhiram Kasturi*
