import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { lightColors, darkColors, spacing, radius, fonts } from '../theme/theme';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../data/categories';

const pad = (n) => String(n).padStart(2, '0');

export default function AddTransactionScreen({ navigation, route }) {
  const {
    addTransaction, editTransaction,
    addCustomCategory, deleteCustomCategory,
    customCategories, settings,
  } = useApp();
  const colors = settings.darkMode ? darkColors : lightColors;

  const editMode = route?.params?.transaction;
  const initDate = editMode ? new Date(editMode.date) : new Date();

  const formatNumber = (val) => {
    if (!val) return '';
    // Strip everything except numbers and one decimal point
    const clean = val.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    // Limit to one decimal point
    if (parts.length > 2) parts.length = 2;
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const [type,           setType]           = useState(editMode?.type     || 'expense');
  const [amount,         setAmount]         = useState(editMode ? formatNumber(editMode.amount.toString()) : '');
  const [category,       setCategory]       = useState(editMode?.category || (type === 'expense' ? 'food' : 'salary'));
  const [customCategory, setCustomCategory] = useState(editMode?.customCategory || '');
  const [note,           setNote]           = useState(editMode?.note     || '');
  const [day,            setDay]            = useState(pad(initDate.getDate()));
  const [month,          setMonth]          = useState(pad(initDate.getMonth() + 1));
  const [year,           setYear]           = useState(String(initDate.getFullYear()));
  const [hour,           setHour]           = useState(pad(initDate.getHours()));
  const [minute,         setMinute]         = useState(pad(initDate.getMinutes()));
  const [newCatInput,    setNewCatInput]    = useState('');
  const [showNewCatBox,  setShowNewCatBox]  = useState(false);
  const [showDateTime,   setShowDateTime]   = useState(false);

  // Base categories + saved custom ones (objects { name, color })
  const baseCategories   = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const savedCustomCats  = (customCategories?.[type] || []);

  const s = makeStyles(colors);

  // ── Save custom category to persistent list ────────────────────────────────
  const handleAddNewCat = () => {
    const name = newCatInput.trim();
    if (!name) return;
    addCustomCategory(type, name);
    setCategory('custom_' + name.toLowerCase());
    setCustomCategory(name);
    setNewCatInput('');
    setShowNewCatBox(false);
  };

  // ── Long press on saved custom chip → confirm delete ──────────────────────
  const handleDeleteCustomCat = (name) => {
    Alert.alert(
      'Remove Category',
      `Remove "${name}" from your saved categories?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            deleteCustomCategory(type, name);
            if (category === 'custom_' + name.toLowerCase()) {
              setCategory(baseCategories[0].id);
              setCustomCategory('');
            }
          },
        },
      ]
    );
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const n = parseFloat(amount.replace(/,/g, ''));
    if (!n || n <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }

    const d  = parseInt(day, 10),    mo  = parseInt(month, 10) - 1;
    const yr = parseInt(year, 10),   hr  = parseInt(hour, 10);
    const min = parseInt(minute, 10);

    if (
      isNaN(d) || isNaN(mo) || isNaN(yr) || isNaN(hr) || isNaN(min) ||
      d < 1 || d > 31 || mo < 0 || mo > 11 ||
      yr < 2000 || yr > 2100 ||
      hr < 0 || hr > 23 || min < 0 || min > 59
    ) {
      Alert.alert('Invalid Date', 'Please check the date and time fields.');
      return;
    }

    const builtDate = new Date(yr, mo, d, hr, min, 0).toISOString();

    // For base 'others' without custom name
    if (category === 'others' && customCategory.trim() === '') {
      Alert.alert('Category Name Required', 'Please enter a name for Others category.');
      return;
    }

    // Determine the real category id and custom name
    const isCustom    = category.startsWith('custom_');
    const finalCatId  = isCustom ? 'others' : category;
    const finalCustom = isCustom ? customCategory : (category === 'others' ? customCategory.trim() : '');

    const txnData = { type, amount: n, category: finalCatId, customCategory: finalCustom, date: builtDate, note };

    if (editMode) {
      editTransaction({ ...editMode, ...txnData });
    } else {
      addTransaction(txnData);
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>{editMode ? 'Edit Transaction' : 'Add Transaction'}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.closeBtn}>
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
            />
          </View>
        </View>

        {/* Category */}
        <Text style={s.fieldLabel}>CATEGORY</Text>
        <View style={s.catGrid}>

          {/* Base categories */}
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

          {/* Saved custom categories — long press to delete */}
          {savedCustomCats.map(cat => {
            const chipKey = 'custom_' + cat.name.toLowerCase();
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

          {/* + Add new category button */}
          <TouchableOpacity
            style={[s.catChip, s.catChipAdd]}
            onPress={() => { setShowNewCatBox(v => !v); }}
          >
            <Text style={s.catAddIcon}>＋</Text>
            <Text style={[s.catLabel, { color: colors.accent }]}>New</Text>
          </TouchableOpacity>
        </View>

        {/* New category input box */}
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

        {/* Others custom name field */}
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
        <TextInput style={s.noteInput} value={note} onChangeText={setNote} placeholder="Add a note..." placeholderTextColor={colors.textMuted} multiline/>

        {/* Collapsible Date & Time */}
        <TouchableOpacity 
          style={s.sectionHeader} 
          onPress={() => setShowDateTime(!showDateTime)}
          activeOpacity={0.7}
        >
          <Text style={s.fieldLabel}>DATE & TIME</Text>
          <Text style={s.chevron}>{showDateTime ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showDateTime && (
          <View style={s.collapsibleContent}>
            {/* Date */}
            <Text style={s.subFieldLabel}>DATE</Text>
            <View style={s.dateRow}>
              <View style={s.dateGroup}>
                <Text style={s.dateFieldLabel}>DD</Text>
                <TextInput style={s.dateInput} value={day} onChangeText={v => setDay(v.replace(/[^0-9]/g,'').slice(0,2))} keyboardType="number-pad" maxLength={2} placeholder="DD" placeholderTextColor={colors.textMuted}/>
              </View>
              <Text style={s.dateSep}>/</Text>
              <View style={s.dateGroup}>
                <Text style={s.dateFieldLabel}>MM</Text>
                <TextInput style={s.dateInput} value={month} onChangeText={v => setMonth(v.replace(/[^0-9]/g,'').slice(0,2))} keyboardType="number-pad" maxLength={2} placeholder="MM" placeholderTextColor={colors.textMuted}/>
              </View>
              <Text style={s.dateSep}>/</Text>
              <View style={s.dateGroup}>
                <Text style={s.dateFieldLabel}>YYYY</Text>
                <TextInput style={[s.dateInput,{width:70}]} value={year} onChangeText={v => setYear(v.replace(/[^0-9]/g,'').slice(0,4))} keyboardType="number-pad" maxLength={4} placeholder="YYYY" placeholderTextColor={colors.textMuted}/>
              </View>
            </View>

            {/* Time */}
            <Text style={s.subFieldLabel}>TIME</Text>
            <View style={s.dateRow}>
              <View style={s.dateGroup}>
                <Text style={s.dateFieldLabel}>HH</Text>
                <TextInput style={s.dateInput} value={hour} onChangeText={v => setHour(v.replace(/[^0-9]/g,'').slice(0,2))} keyboardType="number-pad" maxLength={2} placeholder="HH" placeholderTextColor={colors.textMuted}/>
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
    </SafeAreaView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingTop: spacing.xl + 25, paddingBottom: 60 },

  header:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title:    { fontSize: 22, color: colors.textPrimary, fontFamily: fonts.heavy },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  closeText:{ fontSize: 16, color: colors.textPrimary, fontFamily: fonts.bold },

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

  catGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.sm },
  catChip:        { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  catChipCustom:  { borderStyle: 'dashed', borderColor: colors.accent },
  catChipActive:  { backgroundColor: colors.accent, borderColor: colors.accentDark, borderStyle: 'solid' },
  catChipAdd:     { borderStyle: 'dashed', borderColor: colors.accentDark },
  catEmoji:       { fontSize: 14 },
  catAddIcon:     { fontSize: 14, color: colors.accent, fontFamily: fonts.bold },
  catLabel:       { fontSize: 12, color: colors.textMuted, fontFamily: fonts.bold },
  catLabelActive: { color: colors.activePill },

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

  noteInput:  { backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, fontSize: 14, color: colors.textPrimary, marginBottom: spacing.lg, minHeight: 60, fontFamily: fonts.regular },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: spacing.sm },
  chevron:       { fontSize: 10, color: colors.textMuted },
  subFieldLabel: { fontSize: 9, color: colors.textMuted, letterSpacing: 1, marginBottom: 8, marginTop: 4, fontFamily: fonts.bold },
  collapsibleContent: { marginBottom: spacing.lg },

  submitBtn:        { backgroundColor: colors.wineRed, borderRadius: radius.pill, paddingVertical: 16, alignItems: 'center' },
  submitBtnIncome:  { backgroundColor: colors.income },
  submitText:       { fontSize: 15, color: '#fff', fontFamily: fonts.bold },
});
