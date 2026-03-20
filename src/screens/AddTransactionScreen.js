// src/screens/AddTransactionScreen.js
// Finova v3.0 — handles addCustomCategory 'limit_reached' (Pro gate on custom categories)

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Modal, Platform, Animated, Dimensions, BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { lightColors, darkColors, spacing, radius, fonts } from '../theme/theme';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../data/categories';

const SCREEN_H = Dimensions.get('window').height;

const pad = (n) => String(n).padStart(2, '0');

// ─── Error Modal ──────────────────────────────────────────────────────────────
function ErrorModal({ visible, icon, title, body, onClose, actionLabel, onAction }) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={cm.backdrop}>
        <View style={cm.card}>
          <View style={cm.iconRing}>
            <Text style={cm.iconEmoji}>{icon}</Text>
          </View>
          <Text style={cm.title}>{title}</Text>
          <Text style={cm.body}>{body}</Text>
          {actionLabel && onAction && (
            <TouchableOpacity style={cm.actionBtn} onPress={onAction} activeOpacity={0.84}>
              <Text style={cm.actionBtnText}>{actionLabel}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[cm.okBtn, actionLabel ? cm.okBtnSecondary : null]} onPress={onClose} activeOpacity={0.84}>
            <Text style={[cm.okBtnText, actionLabel ? cm.okBtnTextSecondary : null]}>Got It</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Delete Category Confirm Modal ────────────────────────────────────────────
function DeleteCatModal({ visible, catName, onCancel, onConfirm }) {
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onCancel}>
      <View style={cm.sheetBackdrop}>
        <View style={cm.sheet}>
          <View style={cm.handle} />
          <View style={[cm.iconRing, cm.iconRingDanger]}>
            <Text style={cm.iconEmoji}>🗑️</Text>
          </View>
          <Text style={cm.title}>Remove Category</Text>
          <Text style={cm.body}>
            Remove <Text style={cm.bodyHighlight}>"{catName}"</Text> from your saved categories?{'\n'}Any transactions using it will keep their data.
          </Text>
          <TouchableOpacity style={cm.destructiveBtn} onPress={onConfirm} activeOpacity={0.84}>
            <Text style={cm.destructiveBtnText}>Yes, Remove It</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cm.ghostBtn} onPress={onCancel} activeOpacity={0.75}>
            <Text style={cm.ghostBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AddTransactionScreen({ navigation, route }) {
  const {
    addTransaction, editTransaction,
    addCustomCategory, deleteCustomCategory,
    customCategories, settings, isPro,
  } = useApp();
  const colors = settings.darkMode ? darkColors : lightColors;

  const editMode = route?.params?.transaction;
  const initDate = editMode ? new Date(editMode.date) : new Date();

  const formatNumber = (val) => {
    if (!val) return '';
    const clean = val.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) parts.length = 2;
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const [type,           setType          ] = useState(editMode?.type     || 'expense');
  const [amount,         setAmount        ] = useState(editMode ? formatNumber(editMode.amount.toString()) : '');

  const initCategory = (() => {
    if (!editMode) return type === 'expense' ? 'food' : 'salary';
    if (editMode.category === 'others' && editMode.customCategory?.trim()) {
      return 'custom_' + editMode.customCategory.trim().toLowerCase();
    }
    return editMode.category;
  })();

  const [category,       setCategory      ] = useState(initCategory);
  const [customCategory, setCustomCategory] = useState(editMode?.customCategory || '');
  const [note,           setNote          ] = useState(editMode?.note     || '');
  const [day,            setDay           ] = useState(pad(initDate.getDate()));
  const [month,          setMonth         ] = useState(pad(initDate.getMonth() + 1));
  const [year,           setYear          ] = useState(String(initDate.getFullYear()));
  const [hour,           setHour          ] = useState(pad(initDate.getHours()));
  const [minute,         setMinute        ] = useState(pad(initDate.getMinutes()));
  const [newCatInput,    setNewCatInput   ] = useState('');
  const [showNewCatBox,  setShowNewCatBox ] = useState(false);
  const [showDateTime,   setShowDateTime  ] = useState(false);

  const [errorModal,     setErrorModal    ] = useState({ visible: false, icon: '', title: '', body: '', actionLabel: '', onAction: null });
  const [deleteCatModal, setDeleteCatModal] = useState({ visible: false, catName: '' });

  const showError  = (icon, title, body, actionLabel, onAction) =>
    setErrorModal({ visible: true, icon, title, body, actionLabel: actionLabel || '', onAction: onAction || null });
  const closeError = () => setErrorModal(prev => ({ ...prev, visible: false, onAction: null }));

  const baseCategories  = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const savedCustomCats = (customCategories?.[type] || []);
  const s = makeStyles(colors);

  // ── Slide animation ──────────────────────────────────────────────────────────
  const slideAnim = useRef(new Animated.Value(SCREEN_H)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0, useNativeDriver: true,
      damping: 28, stiffness: 260, mass: 0.9,
    }).start();
  }, []);

  const handleClose = (onDone) => {
    Animated.spring(slideAnim, {
      toValue: SCREEN_H, useNativeDriver: true,
      damping: 24, stiffness: 220, mass: 0.8
    }).start(() => {
      if (onDone) onDone();
      navigation.goBack();
    });
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose(); return true;
    });
    return () => sub.remove();
  }, []);

  // ── Add new custom category — Pro gate on > 3 ────────────────────────────────
  const handleAddNewCat = () => {
    const name = newCatInput.trim();
    if (!name) return;

    const result = addCustomCategory(type, name);

    if (result === 'limit_reached') {
      showError(
        '🏷️',
        'Category Limit Reached',
        'Free accounts can save up to 3 custom categories. Upgrade to Pro for unlimited categories.',
        '👑 Upgrade to Pro',
        () => { closeError(); navigation.navigate('ProPaywall'); }
      );
      return;
    }

    setCategory('custom_' + name.toLowerCase());
    setCustomCategory(name);
    setNewCatInput('');
    setShowNewCatBox(false);
  };

  const handleDeleteCustomCat = (name) => {
    setDeleteCatModal({ visible: true, catName: name });
  };

  const confirmDelete = () => {
    const { catName } = deleteCatModal;
    setDeleteCatModal({ visible: false, catName: '' });
    deleteCustomCategory(type, catName);
    if (category === 'custom_' + catName.toLowerCase()) {
      setCategory(baseCategories[0].id);
      setCustomCategory('');
    }
  };

  const handleSubmit = () => {
    const n = parseFloat(amount.replace(/,/g, ''));
    if (!n || n <= 0) {
      showError('💸', 'Invalid Amount', 'Please enter a valid amount greater than 0 before recording.');
      return;
    }

    const d   = parseInt(day,    10);
    const mo  = parseInt(month,  10) - 1;
    const yr  = parseInt(year,   10);
    const hr  = parseInt(hour,   10);
    const min = parseInt(minute, 10);

    if (
      isNaN(d) || isNaN(mo) || isNaN(yr) || isNaN(hr) || isNaN(min) ||
      d < 1 || d > 31 || mo < 0 || mo > 11 ||
      yr < 2000 || yr > 2100 ||
      hr < 0 || hr > 23 || min < 0 || min > 59
    ) {
      showError('📅', 'Invalid Date', 'Please check the date and time fields — something looks off.');
      return;
    }

    if (category === 'others' && customCategory.trim() === '') {
      showError('🏷️', 'Name Required', 'Please enter a name for your custom "Others" category.');
      return;
    }

    const builtDate   = new Date(yr, mo, d, hr, min, 0).toISOString();
    const isCustom    = category.startsWith('custom_');
    const finalCatId  = isCustom ? 'others' : category;
    const finalCustom = isCustom ? customCategory : (category === 'others' ? customCategory.trim() : '');
    const txnData     = { type, amount: n, category: finalCatId, customCategory: finalCustom, date: builtDate, note };

    handleClose(() => {
      if (editMode) {
        editTransaction({ ...editMode, ...txnData });
      } else {
        addTransaction(txnData);
      }
    });
  };

  return (
    <Animated.View style={[sa.root, { transform: [{ translateY: slideAnim }] }]}>
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>{editMode ? 'Edit Transaction' : 'Add Transaction'}</Text>
            <TouchableOpacity onPress={() => handleClose()} style={s.closeBtn}>
              <Text style={s.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Type Toggle */}
          <View style={s.toggleWrap}>
            <TouchableOpacity
              style={[s.toggleBtn, type === 'expense' && s.toggleActiveExpense]}
              onPress={() => { setType('expense'); setCategory('food'); setCustomCategory(''); setShowNewCatBox(false); }}
            >
              <Text style={[s.toggleText, type === 'expense' && s.toggleTextActive]}>Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.toggleBtn, type === 'income' && s.toggleActiveIncome]}
              onPress={() => { setType('income'); setCategory('salary'); setCustomCategory(''); setShowNewCatBox(false); }}
            >
              <Text style={[s.toggleText, type === 'income' && s.toggleTextActive]}>Income</Text>
            </TouchableOpacity>
          </View>

          {/* Amount */}
          <View style={s.amountCard}>
            <Text style={s.amountLabel}>AMOUNT</Text>
            <View style={s.amountRow}>
              <Text style={s.currencySymbol}>{settings.currency}</Text>
              <TextInput
                style={s.amountInput}
                value={amount}
                onChangeText={(v) => setAmount(formatNumber(v))}
                placeholder="0.00"
                placeholderTextColor={colors.border}
                keyboardType="decimal-pad"
                maxLength={12}
              />
            </View>
          </View>

          {/* Category */}
          <Text style={s.fieldLabel}>CATEGORY</Text>
          <View style={s.catGrid}>
            {baseCategories.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[s.catChip, category === c.id && { backgroundColor: c.color, borderColor: c.color }]}
                onPress={() => { setCategory(c.id); setCustomCategory(''); setShowNewCatBox(false); }}
              >
                <Text style={s.catEmoji}>{c.emoji}</Text>
                <Text style={[s.catLabel, category === c.id && { color: '#fff' }]}>{c.label}</Text>
              </TouchableOpacity>
            ))}

            {savedCustomCats.map(cat => {
              const chipKey  = 'custom_' + cat.name.toLowerCase();
              const isActive = category === chipKey;
              return (
                <TouchableOpacity
                  key={chipKey}
                  style={[s.catChip, s.catChipCustom, isActive && { backgroundColor: cat.color, borderColor: cat.color, borderStyle: 'solid' }]}
                  onPress={() => { setCategory(chipKey); setCustomCategory(cat.name); setShowNewCatBox(false); }}
                  onLongPress={() => handleDeleteCustomCat(cat.name)}
                  delayLongPress={500}
                >
                  <Text style={s.catEmoji}>📦</Text>
                  <Text style={[s.catLabel, isActive && { color: '#fff' }]}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}

            {/* + New chip — shows Pro hint if at limit */}
            <TouchableOpacity
              style={[s.catChip, s.catChipAdd]}
              onPress={() => { setShowNewCatBox(v => !v); }}
            >
              <Text style={s.catAddIcon}>＋</Text>
              <Text style={[s.catLabel, { color: colors.accent }]}>
                {!isPro && savedCustomCats.length >= 3 ? 'Pro' : 'New'}
              </Text>
            </TouchableOpacity>
          </View>

          {showNewCatBox && (
            <View style={s.newCatWrap}>
              <TextInput
                style={s.newCatInput}
                value={newCatInput}
                onChangeText={setNewCatInput}
                placeholder="Category name e.g. Gym, Netflix..."
                placeholderTextColor={colors.textMuted}
                maxLength={30}
                autoFocus
                onSubmitEditing={handleAddNewCat}
              />
              <TouchableOpacity
                style={[s.newCatSaveBtn, { opacity: newCatInput.trim() ? 1 : 0.4 }]}
                onPress={handleAddNewCat}
                disabled={!newCatInput.trim()}
              >
                <Text style={s.newCatSaveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}

          {category === 'others' && (
            <>
              <Text style={s.fieldLabel}>CUSTOM CATEGORY NAME</Text>
              <View style={s.customCatWrap}>
                <Text style={s.customCatIcon}>📦</Text>
                <TextInput
                  style={s.customCatInput}
                  value={customCategory}
                  onChangeText={setCustomCategory}
                  placeholder="e.g. Gym, Netflix, Travel..."
                  placeholderTextColor={colors.textMuted}
                  maxLength={30}
                />
              </View>
            </>
          )}

          {/* Note */}
          <Text style={s.fieldLabel}>NOTE (OPTIONAL)</Text>
          <TextInput
            style={s.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note..."
            placeholderTextColor={colors.textMuted}
            multiline
          />

          {/* Collapsible Date & Time */}
          <TouchableOpacity style={s.sectionHeader} onPress={() => setShowDateTime(!showDateTime)} activeOpacity={0.7}>
            <Text style={s.fieldLabel}>DATE & TIME</Text>
            <Text style={s.chevron}>{showDateTime ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showDateTime && (
            <View style={s.collapsibleContent}>
              <Text style={s.subFieldLabel}>DATE</Text>
              <View style={s.dateRow}>
                <View style={s.dateGroup}>
                  <Text style={s.dateFieldLabel}>DD</Text>
                  <TextInput style={s.dateInput} value={day}    onChangeText={v => setDay(v.replace(/[^0-9]/g,'').slice(0,2))}    keyboardType="number-pad" maxLength={2} placeholder="DD" placeholderTextColor={colors.textMuted}/>
                </View>
                <Text style={s.dateSep}>/</Text>
                <View style={s.dateGroup}>
                  <Text style={s.dateFieldLabel}>MM</Text>
                  <TextInput style={s.dateInput} value={month}  onChangeText={v => setMonth(v.replace(/[^0-9]/g,'').slice(0,2))}  keyboardType="number-pad" maxLength={2} placeholder="MM" placeholderTextColor={colors.textMuted}/>
                </View>
                <Text style={s.dateSep}>/</Text>
                <View style={s.dateGroup}>
                  <Text style={s.dateFieldLabel}>YYYY</Text>
                  <TextInput style={[s.dateInput,{width:70}]} value={year} onChangeText={v => setYear(v.replace(/[^0-9]/g,'').slice(0,4))} keyboardType="number-pad" maxLength={4} placeholder="YYYY" placeholderTextColor={colors.textMuted}/>
                </View>
              </View>

              <Text style={s.subFieldLabel}>TIME</Text>
              <View style={s.dateRow}>
                <View style={s.dateGroup}>
                  <Text style={s.dateFieldLabel}>HH</Text>
                  <TextInput style={s.dateInput} value={hour}   onChangeText={v => setHour(v.replace(/[^0-9]/g,'').slice(0,2))}   keyboardType="number-pad" maxLength={2} placeholder="HH" placeholderTextColor={colors.textMuted}/>
                </View>
                <Text style={s.dateSep}>:</Text>
                <View style={s.dateGroup}>
                  <Text style={s.dateFieldLabel}>MM</Text>
                  <TextInput style={s.dateInput} value={minute} onChangeText={v => setMinute(v.replace(/[^0-9]/g,'').slice(0,2))} keyboardType="number-pad" maxLength={2} placeholder="MM" placeholderTextColor={colors.textMuted}/>
                </View>
              </View>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[s.submitBtn, type === 'income' && s.submitBtnIncome]}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <Text style={s.submitText}>
              {editMode ? 'Save Changes' : type === 'expense' ? '— Record Expense' : '+ Record Income'}
            </Text>
          </TouchableOpacity>

        </ScrollView>

        <ErrorModal
          visible={errorModal.visible}
          icon={errorModal.icon}
          title={errorModal.title}
          body={errorModal.body}
          actionLabel={errorModal.actionLabel}
          onAction={errorModal.onAction}
          onClose={closeError}
        />
        <DeleteCatModal
          visible={deleteCatModal.visible}
          catName={deleteCatModal.catName}
          onCancel={() => setDeleteCatModal({ visible: false, catName: '' })}
          onConfirm={confirmDelete}
        />
      </SafeAreaView>
    </Animated.View>
  );
}

const sa = StyleSheet.create({
  root: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});

const makeStyles = (colors) => StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bg, paddingBottom: -100, paddingTop: -50 },
  content: { padding: spacing.lg, paddingTop: spacing.xl + 20, paddingBottom: 120 },

  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title:     { fontSize: 22, color: colors.textPrimary, fontFamily: fonts.heavy },
  closeBtn:  { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 16, color: colors.textPrimary, fontFamily: fonts.bold },

  toggleWrap:          { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.pill, padding: 4, marginBottom: spacing.lg },
  toggleBtn:           { flex: 1, paddingVertical: 10, borderRadius: radius.pill, alignItems: 'center' },
  toggleActiveExpense: { backgroundColor: colors.wineRed },
  toggleActiveIncome:  { backgroundColor: colors.income },
  toggleText:          { fontSize: 14, color: colors.textMuted, fontFamily: fonts.bold },
  toggleTextActive:    { color: '#fff' },

  amountCard:     { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg, alignItems: 'center' },
  amountLabel:    { fontSize: 11, color: colors.textMuted, letterSpacing: 1, marginBottom: 8, fontFamily: fonts.bold },
  amountRow:      { flexDirection: 'row', alignItems: 'center', gap: 4, width: '100%', justifyContent: 'center' },
  currencySymbol: { fontSize: 28, color: colors.textMuted, fontFamily: fonts.bold },
  amountInput:    { fontSize: 44, color: colors.textPrimary, paddingHorizontal: 12, textAlign: 'center', fontFamily: fonts.heavy, flexShrink: 1 },

  fieldLabel: { fontSize: 11, color: colors.textMuted, letterSpacing: 1, marginBottom: 8, marginTop: 4, fontFamily: fonts.bold },

  catGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.sm },
  catChip:       { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  catChipCustom: { borderStyle: 'dashed', borderColor: colors.accent },
  catChipAdd:    { borderStyle: 'dashed', borderColor: colors.accentDark },
  catEmoji:      { fontSize: 14 },
  catAddIcon:    { fontSize: 14, color: colors.accent, fontFamily: fonts.bold },
  catLabel:      { fontSize: 12, color: colors.textMuted, fontFamily: fonts.bold },

  newCatWrap:        { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 10, marginBottom: spacing.md, borderWidth: 1.5, borderColor: colors.accent, gap: 10 },
  newCatInput:       { flex: 1, fontSize: 14, color: colors.textPrimary, fontFamily: fonts.bold },
  newCatSaveBtn:     { backgroundColor: colors.accentDark, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 8 },
  newCatSaveBtnText: { color: colors.accent, fontSize: 13, fontFamily: fonts.bold },

  customCatWrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, marginBottom: spacing.lg, borderWidth: 1.5, borderColor: colors.accent },
  customCatIcon:  { fontSize: 18, marginRight: 10 },
  customCatInput: { flex: 1, fontSize: 15, color: colors.textPrimary, fontFamily: fonts.bold },

  dateRow:        { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.md, padding: 14 },
  dateGroup:      { alignItems: 'center' },
  dateFieldLabel: { fontSize: 9, color: colors.textMuted, letterSpacing: 0.5, marginBottom: 4, fontFamily: fonts.bold },
  dateInput:      { width: 44, fontSize: 18, color: colors.textPrimary, textAlign: 'center', borderBottomWidth: 1.5, borderBottomColor: colors.accent, paddingBottom: 2, fontFamily: fonts.heavy },
  dateSep:        { fontSize: 20, color: colors.textMuted, paddingBottom: 4, fontFamily: fonts.regular },

  noteInput: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, fontSize: 14, color: colors.textPrimary, marginBottom: spacing.lg, minHeight: 60, fontFamily: fonts.regular },

  sectionHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: spacing.sm },
  chevron:            { fontSize: 10, color: colors.textMuted },
  subFieldLabel:      { fontSize: 9, color: colors.textMuted, letterSpacing: 1, marginBottom: 8, marginTop: 4, fontFamily: fonts.bold },
  collapsibleContent: { marginBottom: spacing.lg },

  submitBtn:       { backgroundColor: colors.wineRed, borderRadius: radius.pill, paddingVertical: 16, alignItems: 'center' },
  submitBtnIncome: { backgroundColor: colors.income },
  submitText:      { fontSize: 15, color: '#fff', fontFamily: fonts.bold },
});

const cm = StyleSheet.create({
  backdrop:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 28 },
  card:      { width: '100%', backgroundColor: '#2C3020', borderRadius: 24, paddingHorizontal: 24, paddingVertical: 28, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(174,183,132,0.20)' },

  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet:         { backgroundColor: '#2C3020', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 28, borderWidth: 1, borderColor: 'rgba(174,183,132,0.18)', borderBottomWidth: 0, alignItems: 'center' },

  handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: 'rgba(174,183,132,0.35)', marginTop: 12, marginBottom: 24 },

  iconRing:      { width: 68, height: 68, borderRadius: 34, backgroundColor: 'rgba(174,183,132,0.12)', borderWidth: 1.5, borderColor: 'rgba(174,183,132,0.30)', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  iconRingDanger:{ backgroundColor: 'rgba(158,90,90,0.15)', borderColor: 'rgba(158,90,90,0.35)' },
  iconEmoji:     { fontSize: 30 },

  title: { fontFamily: 'Fungis-Heavy',   fontSize: 20, color: '#FFFFFF', textAlign: 'center', marginBottom: 10 },
  body:  { fontFamily: 'Fungis-Regular', fontSize: 13, color: 'rgba(255,255,255,0.52)', textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  bodyHighlight: { fontFamily: 'Fungis-Bold', color: '#AEB784' },

  actionBtn:     { width: '100%', backgroundColor: '#AEB784', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  actionBtnText: { fontFamily: 'Fungis-Bold', fontSize: 15, color: '#222629', letterSpacing: 0.4 },

  okBtn:           { width: '100%', backgroundColor: '#AEB784', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  okBtnSecondary:  { backgroundColor: 'rgba(255,255,255,0.06)' },
  okBtnText:       { fontFamily: 'Fungis-Bold', fontSize: 15, color: '#222629', letterSpacing: 0.4 },
  okBtnTextSecondary: { color: 'rgba(255,255,255,0.40)' },

  destructiveBtn:    { width: '100%', backgroundColor: 'rgba(158,90,90,0.18)', borderWidth: 1, borderColor: 'rgba(158,90,90,0.45)', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 12 },
  destructiveBtnText:{ fontFamily: 'Fungis-Bold', fontSize: 15, color: '#D4918F', letterSpacing: 0.3 },

  ghostBtn:     { width: '100%', borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  ghostBtnText: { fontFamily: 'Fungis-Regular', fontSize: 14, color: 'rgba(255,255,255,0.40)' },
});
