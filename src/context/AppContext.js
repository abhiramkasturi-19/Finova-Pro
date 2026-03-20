// src/context/AppContext.js
// Finova v3.0 — Pro system · Wallets · App Lock · CSV/Passcode Export · Search

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_COLORS } from '../data/categories';

const AppContext = createContext();

const DESIGNER_PALETTE = [
  '#4ECDC4','#FF6B6B','#1A8FE3','#FFD166','#EF476F',
  '#06D6A0','#118AB2','#073B4C','#8338EC','#3A86FF',
  '#FB5607','#FF006E','#FFBE0B','#2A9D8F','#E76F51',
  '#F4A261','#E9C46A','#264653','#606C38','#283618',
  '#BC6C25','#DDA15E','#F94144','#F3722C','#F8961E',
];

const getUniqueColor = (existingCustom) => {
  const customColors = existingCustom.map(c => c.color.toUpperCase());
  const allTaken     = [...BASE_COLORS.map(c => c.toUpperCase()), ...customColors];
  const available    = DESIGNER_PALETTE.find(p => !allTaken.includes(p.toUpperCase()));
  return available || `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
};

export const DEFAULT_WALLET = { id: 'default', name: 'Personal', icon: '💳', archived: false };

const initialState = {
  transactions: [],
  settings: {
    name:             '',
    age:              '',
    currency:         '₹',
    darkMode:         false,
    profileImage:     '',
    isPro:            false,
    appLockEnabled:   false,
    appLockPin:       '',
  },
  customCategories: { expense: [], income: [] },
  wallets:          [DEFAULT_WALLET],
  activeWalletId:   'default',
};

function reducer(state, action) {
  switch (action.type) {

    case 'LOAD_DATA': {
      const loaded   = action.payload.customCategories || { expense: [], income: [] };
      const migrate  = (list) => {
        if (!list || !Array.isArray(list)) return [];
        return list.map(item =>
          typeof item === 'string'
            ? { name: item, color: DESIGNER_PALETTE[Math.floor(Math.random() * DESIGNER_PALETTE.length)] }
            : item
        );
      };
      return {
        ...state,
        ...action.payload,
        settings: {
          ...initialState.settings,
          ...state.settings,
          ...(action.payload.settings || {}),
          isPro: state.settings.isPro,
          appLockEnabled: state.settings.appLockEnabled,
          appLockPin: state.settings.appLockPin,
        },
        customCategories: {
          expense: migrate(loaded.expense),
          income:  migrate(loaded.income),
        },
        wallets:        action.payload.wallets        || state.wallets        || [DEFAULT_WALLET],
        activeWalletId: action.payload.activeWalletId || state.activeWalletId || 'default',
      };
    }

    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };

    case 'EDIT_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      };

    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case 'UPDATE_PRO':
      return { ...state, settings: { ...state.settings, isPro: action.payload } };

    case 'ADD_CUSTOM_CATEGORY': {
      const { type, name } = action.payload;
      const trimmed = name.trim();
      const current = state.customCategories[type] || [];
      if (current.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) return state;
      const newColor = getUniqueColor([...state.customCategories.expense, ...state.customCategories.income]);
      return {
        ...state,
        customCategories: {
          ...state.customCategories,
          [type]: [...current, { name: trimmed, color: newColor }],
        },
      };
    }

    case 'DELETE_CUSTOM_CATEGORY': {
      const { type, name } = action.payload;
      return {
        ...state,
        customCategories: {
          ...state.customCategories,
          [type]: (state.customCategories[type] || []).filter(c => c.name !== name),
        },
      };
    }

    case 'ADD_WALLET':
      return { ...state, wallets: [...state.wallets, action.payload] };

    case 'RENAME_WALLET': {
      const { id, name } = action.payload;
      return { ...state, wallets: state.wallets.map(w => w.id === id ? { ...w, name } : w) };
    }

    case 'DELETE_WALLET': {
      const { id } = action.payload;
      return {
        ...state,
        wallets:       state.wallets.filter(w => w.id !== id),
        transactions:  state.transactions.map(t =>
          (t.walletId || 'default') === id ? { ...t, walletId: 'default' } : t
        ),
        activeWalletId: state.activeWalletId === id ? 'default' : state.activeWalletId,
      };
    }

    case 'ARCHIVE_WALLET': {
      const { id } = action.payload;
      return {
        ...state,
        wallets:        state.wallets.map(w => w.id === id ? { ...w, archived: true } : w),
        activeWalletId: state.activeWalletId === id ? 'default' : state.activeWalletId,
      };
    }

    case 'UNARCHIVE_WALLET': {
      const { id } = action.payload;
      return { ...state, wallets: state.wallets.map(w => w.id === id ? { ...w, archived: false } : w) };
    }

    case 'SET_ACTIVE_WALLET':
      return { ...state, activeWalletId: action.payload };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── Load persisted data on mount ────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('@flo_data');
        if (stored) {
          dispatch({ type: 'LOAD_DATA', payload: JSON.parse(stored) });
        } else {
          dispatch({ type: 'LOAD_DATA', payload: { transactions: [], settings: initialState.settings } });
        }
      } catch {
        dispatch({ type: 'LOAD_DATA', payload: { transactions: [], settings: initialState.settings } });
      }
    })();
  }, []);

  // ── Persist on every state change ───────────────────────────────────────────
  useEffect(() => {
    AsyncStorage.setItem('@flo_data', JSON.stringify(state)).catch(() => {});
  }, [state]);

  // ── Transaction actions ──────────────────────────────────────────────────────
  const addTransaction    = (txn) => dispatch({
    type:    'ADD_TRANSACTION',
    payload: { ...txn, id: Date.now().toString(), walletId: state.activeWalletId },
  });
  const editTransaction   = (txn) => dispatch({ type: 'EDIT_TRANSACTION',    payload: txn });
  const deleteTransaction = (id)  => dispatch({ type: 'DELETE_TRANSACTION',  payload: id });

  // ── Settings actions ─────────────────────────────────────────────────────────
  const updateSettings  = (s)   => dispatch({ type: 'UPDATE_SETTINGS', payload: s });
  const toggleDarkMode  = ()    => dispatch({ type: 'UPDATE_SETTINGS', payload: { darkMode: !state.settings.darkMode } });
  const updatePro       = (val) => dispatch({ type: 'UPDATE_PRO',      payload: val });

  // ── Custom category actions — returns 'ok' | 'limit_reached' ────────────────
  const addCustomCategory = (type, name) => {
    const current = state.customCategories[type] || [];
    if (!state.settings.isPro && current.length >= 3) return 'limit_reached';
    dispatch({ type: 'ADD_CUSTOM_CATEGORY', payload: { type, name } });
    return 'ok';
  };
  const deleteCustomCategory = (type, name) =>
    dispatch({ type: 'DELETE_CUSTOM_CATEGORY', payload: { type, name } });

  // ── Wallet actions — addWallet returns 'ok' | 'requires_pro' ────────────────
  const addWallet = (name, icon) => {
    if (!state.settings.isPro) return 'requires_pro';
    dispatch({
      type:    'ADD_WALLET',
      payload: { id: Date.now().toString(), name: name.trim(), icon: icon || '💼', archived: false },
    });
    return 'ok';
  };
  const renameWallet    = (id, name) => dispatch({ type: 'RENAME_WALLET',    payload: { id, name } });
  const deleteWallet    = (id) => { if (id !== 'default') dispatch({ type: 'DELETE_WALLET',   payload: { id } }); };
  const archiveWallet   = (id) => { if (id !== 'default') dispatch({ type: 'ARCHIVE_WALLET',  payload: { id } }); };
  const unarchiveWallet = (id) =>  dispatch({ type: 'UNARCHIVE_WALLET', payload: { id } });
  const switchWallet    = (id) =>  dispatch({ type: 'SET_ACTIVE_WALLET', payload: id });

  // ── Import (Login / Upload flows) ────────────────────────────────────────────
  const importData = (data) => dispatch({ type: 'LOAD_DATA', payload: data });

  // ── Computed: transactions filtered by active wallet ─────────────────────────
  // Use `activeTransactions` in all screens that respect wallet context.
  // Use raw `transactions` only when you explicitly need all wallets (e.g. calendar totals).
  const activeTransactions = state.transactions.filter(t =>
    (t.walletId || 'default') === state.activeWalletId
  );

  return (
    <AppContext.Provider value={{
      ...state,
      activeTransactions,
      isPro: state.settings.isPro,
      // Transaction
      addTransaction,
      editTransaction,
      deleteTransaction,
      // Settings
      updateSettings,
      toggleDarkMode,
      updatePro,
      // Categories
      addCustomCategory,
      deleteCustomCategory,
      // Wallets
      addWallet,
      renameWallet,
      deleteWallet,
      archiveWallet,
      unarchiveWallet,
      switchWallet,
      // Import
      importData,
      dispatch,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
