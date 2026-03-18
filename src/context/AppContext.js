// src/context/AppContext.js
// Finova v2.6 — profileImage added to settings; export/import covers everything

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_COLORS } from '../data/categories';

const AppContext = createContext();

const DESIGNER_PALETTE = [
  '#4ECDC4', '#FF6B6B', '#1A8FE3', '#FFD166', '#EF476F',
  '#06D6A0', '#118AB2', '#073B4C', '#8338EC', '#3A86FF',
  '#FB5607', '#FF006E', '#FFBE0B', '#2A9D8F', '#E76F51',
  '#F4A261', '#E9C46A', '#264653', '#606C38', '#283618',
  '#BC6C25', '#DDA15E', '#F94144', '#F3722C', '#F8961E',
];

const getUniqueColor = (existingCustom) => {
  const customColors = existingCustom.map(c => c.color.toUpperCase());
  const allTaken     = [...BASE_COLORS.map(c => c.toUpperCase()), ...customColors];
  const available    = DESIGNER_PALETTE.find(p => !allTaken.includes(p.toUpperCase()));
  if (available) return available;
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
};

const initialState = {
  transactions: [],
  settings: {
    name:         '',
    age:          '',
    currency:     '₹',
    darkMode:     false,
    profileImage: '',   // base64 data URI — stored here, included in JSON export/import
  },
  customCategories: { expense: [], income: [] },
};

function reducer(state, action) {
  switch (action.type) {

    case 'LOAD_DATA': {
      const loaded = action.payload.customCategories || { expense: [], income: [] };

      const migrate = (list) => {
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
        // Preserve profileImage if the imported payload has it; keep existing if not
        settings: {
          ...initialState.settings,
          ...state.settings,
          ...(action.payload.settings || {}),
        },
        customCategories: {
          expense: migrate(loaded.expense),
          income:  migrate(loaded.income),
        },
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
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
      };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

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

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

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

  useEffect(() => {
    AsyncStorage.setItem('@flo_data', JSON.stringify(state)).catch(() => {});
  }, [state]);

  const addTransaction       = (txn)        => dispatch({ type: 'ADD_TRANSACTION',       payload: { ...txn, id: Date.now().toString() } });
  const editTransaction      = (txn)        => dispatch({ type: 'EDIT_TRANSACTION',       payload: txn });
  const deleteTransaction    = (id)         => dispatch({ type: 'DELETE_TRANSACTION',     payload: id });
  const updateSettings       = (s)          => dispatch({ type: 'UPDATE_SETTINGS',        payload: s });
  const toggleDarkMode       = ()           => dispatch({ type: 'UPDATE_SETTINGS',        payload: { darkMode: !state.settings.darkMode } });
  const addCustomCategory    = (type, name) => dispatch({ type: 'ADD_CUSTOM_CATEGORY',    payload: { type, name } });
  const deleteCustomCategory = (type, name) => dispatch({ type: 'DELETE_CUSTOM_CATEGORY', payload: { type, name } });
  // importData replaces the full state — used by Login and Upload flows
  const importData           = (data)       => dispatch({ type: 'LOAD_DATA',              payload: data });

  return (
    <AppContext.Provider value={{
      ...state,
      addTransaction,
      editTransaction,
      deleteTransaction,
      updateSettings,
      toggleDarkMode,
      addCustomCategory,
      deleteCustomCategory,
      importData,
      dispatch,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
