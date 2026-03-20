# GEMINI.md — Finova Project Context

## Project Overview
**Finova** is a Personal Finance Management mobile application built with **React Native** and **Expo**. It is designed to track income and expenses, provide visual analysis via donut and line charts, and manage custom categories. The app supports a dynamic light/dark theme system and manual data backup/restore via JSON files.

### Tech Stack
- **Framework:** Expo (SDK 55) / React Native
- **State Management:** `useReducer` with `AsyncStorage` (key: `@flo_data`)
- **Navigation:** React Navigation (Bottom Tabs + Native Stack)
- **Visuals:** `react-native-svg` for charts and icons
- **Utilities:** `expo-file-system/legacy`, `expo-sharing`, `expo-document-picker`, `react-native-safe-area-context`

---

## Building and Running
1. **Install Dependencies:** `npm install`
2. **Start Expo Go:** `npx expo start`
3. **Clean Cache:** `npx expo start --clear` (recommended after structural changes)
4. **Build (TODO):** EAS Build commands are not yet configured for production.

---

## Architecture & Development Conventions

### 1. State Management (`src/context/AppContext.js`)
- Use the `useApp()` hook to access global state and actions.
- Actions include: `addTransaction`, `editTransaction`, `deleteTransaction`, `updateSettings`, `toggleDarkMode`, `importData`.
- **Note:** `importData` (dispatching `LOAD_DATA`) replaces the entire state.
- **Note:** `updateSettings` is used for profile fields (`name`, `age`, `profileImage`) as well as `currency`.

### 2. Navigation & Layout (CRITICAL)
- **Tab Navigation:** `Tab.Navigator` is **NOT** used. A custom `MainTabs` component (hand-built spring animated) in `App.js` manages tab rendering.
- **Directional Slide:** Tab transitions use directional logic (right-of-current slides from right, etc.) with spring physics.
- **Android Tab Fix:** The tab bar wrapper must have both `zIndex: 100` AND `elevation: 100` to prevent screen content from overlapping it.
- **Inactive Screens:** Use `display: 'none'` (not `pointerEvents: 'none'`) to fully remove inactive tab screens from the render tree.
- **White Flash Fix:** The `NavigationContainer` now uses a custom dark theme to prevent white flashes. All stack screen options include `contentStyle: { backgroundColor: '#111' }`.
- **Modals:** `AddTransaction`, `AppGuide`, and `WalletsScreen` now use `presentation: 'transparentModal'` + a manual slide-up animation from the bottom.

### 3. Theming Rules (CRITICAL)
- **Strict Rule:** NEVER `import { colors }` from the theme file into a component for static `StyleSheet.create` calls.
- **Strict Rule:** ALWAYS use the `makeStyles(colors)` pattern inside the component:
  ```javascript
  const { settings } = useApp();
  const colors = settings.darkMode ? darkColors : lightColors;
  const s = makeStyles(colors);
  // ...
  const makeStyles = (colors) => StyleSheet.create({ ... });
  ```
- All screens must have `paddingTop: 60` or more (e.g., `75` in `ActivityScreen`) to clear the Android status bar.

### 4. Safe Area Handling
- **Mandatory:** Always use `SafeAreaView` from `react-native-safe-area-context`. The standard `react-native` version is deprecated and causes layout issues.

### 5. Date Handling
- **No Native Pickers:** `@react-native-community/datetimepicker` is avoided due to crashes on Android Expo Go.
- Use manual text inputs (DD/MM/YYYY + HH:MM) as implemented in `AddTransactionScreen.js`.
- **Home Screen:** Wallet date format is "FullMonth-Year : Present Month" (e.g., "March-26 : Present Month").

### 6. Backup & Restore
- Implemented in `SettingsScreen.js` and `LoginScreen.js`.
- **Export:** Supports full backup to `.json`, Pro users can export to `.csv` or a password-protected `.enc` file.
- **Import:** Both screens now support restoring from `.json`, `.csv`, and `.enc` files, with a passcode prompt for encrypted backups.
- Uses `expo-file-system/legacy` to avoid modern API deprecation errors in SDK 55.

---

## Directory Overview
- `src/context/`: `AppContext.js` — Single source of truth.
- `src/theme/`: `theme.js` — Color palettes and layout constants.
- `src/data/`: `categories.js` — Hardcoded base categories and metadata.
- `src/components/`: Reusable UI elements (DonutChart, Icon, TransactionItem).
- `src/screens/`:
  - `HomeScreen`: Monthly dashboard with full month date display.
  - `ActivityScreen`: Calendar-based transaction explorer with Edit/Delete capabilities via a "three dots" menu.
  - `StatsScreen`: Dual area line charts and category bars.
  - `AddTransactionScreen`: Form for income/expense with manual date entry.
  - `SettingsScreen`: Profile, Theme, and Collapsible Data Management.

---

## Development Constraints for Agents
- **Icons:** Use `src/components/Icon.js` (Untitled UI line icons via SVG).
- **Wallet Card (Home):** Must only show data for the **current month**.
- **Transaction Labels:** Use `getCat` helper and check for `customCategory` field when `category === 'others'`.
- **Modals:** Ensure transaction detail modals include Edit and Delete actions.
- **Amount Input:** Handle comma formatting (e.g., 5,000) for display, but strip commas before parsing/saving as a number.
- **Animated Components:** Use `AnimPill` (spring-press) for interactive filter/mode selectors in `Activity` and `Stats` screens.
