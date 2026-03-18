import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, Dimensions, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { G, Circle, Text as SvgText, Path } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { lightColors, darkColors, spacing, radius, fonts } from '../theme/theme';
import { getCat } from '../data/categories';
import DonutChart from '../components/DonutChart';

const { width: SCREEN_W } = Dimensions.get('window');

const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const FULL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const FILTERS = ['Week','Month','Quarter','Annual'];

// ── Calendar ─────────────────────────────────────────────────────────────────
function CalendarView({ mode, transactions, currency, onSelectDate, colors }) {
  const [viewYear,  setViewYear]  = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [selected,  setSelected]  = useState(null);
  const fmt = n => `${currency}${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
  const s = makeCalStyles(colors);

  const spendMap = useMemo(() => {
    const m = {};
    transactions.forEach(t => {
      const d  = new Date(t.date);
      const yr = d.getFullYear();
      const mo = d.getMonth();
      const dy = d.getDate();
      if (mode === 'daily') {
        const key = `${yr}-${mo}-${dy}`;
        if (!m[key]) m[key] = { expense: 0, income: 0 };
        if (t.type === 'expense') m[key].expense += t.amount;
        else                      m[key].income  += t.amount;
      } else if (mode === 'monthly') {
        const key = `${yr}-${mo}`;
        if (!m[key]) m[key] = { expense: 0, income: 0 };
        if (t.type === 'expense') m[key].expense += t.amount;
        else                      m[key].income  += t.amount;
      } else {
        if (!m[yr]) m[yr] = { expense: 0, income: 0 };
        if (t.type === 'expense') m[yr].expense += t.amount;
        else                      m[yr].income  += t.amount;
      }
    });
    return m;
  }, [transactions, mode]);

  const handleSelect = (key) => {
    setSelected(selected === key ? null : key);
    onSelectDate(key);
  };

  const intensity = (val) => {
    if (!val || val === 0) return colors.surface2;
    if (val < 200)  return colors.chartGreen + '44';
    if (val < 500)  return colors.chartGreen + '88';
    if (val < 1000) return colors.chartGreen + 'BB';
    return colors.chartGreen;
  };

  if (mode === 'daily') {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
      <View style={s.wrap}>
        <View style={s.nav}>
          <TouchableOpacity onPress={() => {
            if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
            else setViewMonth(m => m - 1);
          }}><Text style={s.navArrow}>‹</Text></TouchableOpacity>
          <Text style={s.navTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
          <TouchableOpacity onPress={() => {
            if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
            else setViewMonth(m => m + 1);
          }}><Text style={s.navArrow}>›</Text></TouchableOpacity>
        </View>
        <View style={s.row}>
          {DAYS.map(d => <Text key={d} style={s.dayLabel}>{d[0]}</Text>)}
        </View>
        <View style={s.grid}>
          {cells.map((d, i) => {
            if (!d) return <View key={`e${i}`} style={s.cell} />;
            const key = `${viewYear}-${viewMonth}-${d}`;
            const data = spendMap[key];
            const isSelected = selected === key;
            return (
              <TouchableOpacity key={key} style={[s.cell, { backgroundColor: isSelected ? colors.activePill : intensity(data?.expense) }]}
                onPress={() => handleSelect(key)}>
                <Text style={[s.cellText, { color: isSelected ? '#fff' : colors.textPrimary }]}>{d}</Text>
                {data?.expense > 0 && <View style={[s.dot, { backgroundColor: isSelected ? '#fff' : colors.expense }]} />}
              </TouchableOpacity>
            );
          })}
        </View>
        {selected && spendMap[selected] && (
          <View style={s.summary}>
            <Text style={s.summaryText}>Spent: <Text style={{ color: colors.expense, fontWeight: '700' }}>{fmt(spendMap[selected].expense)}</Text>   Earned: <Text style={{ color: colors.income, fontWeight: '700' }}>{fmt(spendMap[selected].income)}</Text></Text>
          </View>
        )}
      </View>
    );
  }

  if (mode === 'monthly') {
    return (
      <View style={s.wrap}>
        <View style={s.nav}>
          <TouchableOpacity onPress={() => setViewYear(y => y - 1)}><Text style={s.navArrow}>‹</Text></TouchableOpacity>
          <Text style={s.navTitle}>{viewYear}</Text>
          <TouchableOpacity onPress={() => setViewYear(y => y + 1)}><Text style={s.navArrow}>›</Text></TouchableOpacity>
        </View>
        <View style={s.monthGrid}>
          {MONTHS.map((m, i) => {
            const key = `${viewYear}-${i}`;
            const data = spendMap[key];
            const isSelected = selected === key;
            return (
              <TouchableOpacity key={key}
                style={[s.monthCell, { backgroundColor: isSelected ? colors.activePill : intensity(data?.expense) }]}
                onPress={() => handleSelect(key)}>
                <Text style={[s.monthLabel, { color: isSelected ? '#fff' : colors.textPrimary }]}>{m}</Text>
                {data?.expense > 0 && <Text style={[s.monthAmt, { color: isSelected ? '#ddd' : colors.expense }]}>{fmt(data.expense)}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
        {selected && spendMap[selected] && (
          <View style={s.summary}>
            <Text style={s.summaryText}>Spent: <Text style={{ color: colors.expense, fontWeight: '700' }}>{fmt(spendMap[selected].expense)}</Text>   Earned: <Text style={{ color: colors.income, fontWeight: '700' }}>{fmt(spendMap[selected].income)}</Text></Text>
          </View>
        )}
      </View>
    );
  }

  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 5 + i);
  return (
    <View style={s.wrap}>
      <Text style={s.navTitle}>   Yearly Overview</Text>
      <Text> </Text>
      <View style={s.monthGrid}>
        {years.map(yr => {
          const data = spendMap[yr];
          const isSelected = selected === yr;
          return (
            <TouchableOpacity key={yr}
              style={[s.monthCell, { backgroundColor: isSelected ? colors.activePill : intensity(data?.expense), width: '30%' }]}
              onPress={() => handleSelect(yr)}>
              <Text style={[s.monthLabel, { color: isSelected ? '#fff' : colors.textPrimary }]}>{yr}</Text>
              {data?.expense > 0 && <Text style={[s.monthAmt, { color: isSelected ? '#ddd' : colors.expense }]}>{fmt(data.expense)}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
      {selected && spendMap[selected] && (
        <View style={s.summary}>
          <Text style={s.summaryText}>Spent: <Text style={{ color: colors.expense, fontWeight: '700' }}>{fmt(spendMap[selected].expense)}</Text>   Earned: <Text style={{ color: colors.income, fontWeight: '700' }}>{fmt(spendMap[selected].income)}</Text></Text>
        </View>
      )}
    </View>
  );
}

// ── Transaction Detail Modal ──────────────────────────────────────────────────
function TxnDetailModal({ txn, currency, onClose, colors, onEdit, onDelete, customCategories }) {
  const [menuOpen, setMenuOpen] = useState(false);
  if (!txn) return null;
  const cat = getCat(txn.category);
  const fmt = n => `${currency}${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
  const s = makeModalStyles(colors);

  let color = cat.color;
  let label = cat.label;
  if (txn.category === 'others' && txn.customCategory?.trim()) {
    label = txn.customCategory.trim();
    const saved = (customCategories[txn.type] || []).find(c => c.name.toLowerCase() === label.toLowerCase());
    if (saved) color = saved.color;
  }

  return (
    <Modal transparent animationType="fade" visible={!!txn} onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <View style={s.modalHeader}>
            <View style={{ width: 40 }} />
            <Text style={s.modalTitle}>Detail</Text>
            <TouchableOpacity style={s.menuBtn} onPress={() => setMenuOpen(!menuOpen)}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="2" fill={colors.textMuted} />
                <Circle cx="12" cy="5" r="2" fill={colors.textMuted} />
                <Circle cx="12" cy="19" r="2" fill={colors.textMuted} />
              </Svg>
            </TouchableOpacity>
          </View>

          {menuOpen && (
            <View style={s.dropdown}>
              <TouchableOpacity style={s.dropdownItem} onPress={() => { setMenuOpen(false); onEdit(txn); }}>
                <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </Svg>
                <Text style={s.dropdownText}>Edit</Text>
              </TouchableOpacity>
              <View style={s.dropDivider} />
              <TouchableOpacity style={s.dropdownItem} onPress={() => { setMenuOpen(false); onDelete(txn.id); }}>
                <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.expense} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                </Svg>
                <Text style={[s.dropdownText, { color: colors.expense }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={s.iconRow}>
            <View style={[s.icon, { backgroundColor: color + '33' }]}>
              <Text style={{ fontSize: 32 }}>{cat.emoji}</Text>
            </View>
          </View>
          <Text style={s.catName}>{label}</Text>
          {txn.category === 'others' && txn.customCategory?.trim() && <Text style={s.catSub}>Others</Text>}
          
          <Text style={[s.amount, { color: txn.type === 'income' ? colors.income : colors.expense }]}>
            {txn.type === 'income' ? '+' : '-'}{fmt(txn.amount)}
          </Text>
          <View style={s.divider} />
          <View style={s.row}><Text style={s.rowLabel}>Type</Text><Text style={[s.rowVal, { color: txn.type === 'income' ? colors.income : colors.expense }]}>{txn.type.toUpperCase()}</Text></View>
          <View style={s.row}><Text style={s.rowLabel}>Date</Text><Text style={s.rowVal}>{new Date(txn.date).toLocaleDateString('en-IN')}</Text></View>
          <View style={s.row}><Text style={s.rowLabel}>Time</Text><Text style={s.rowVal}>{new Date(txn.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</Text></View>
          {txn.note ? <View style={s.noteBox}><Text style={s.noteText}>{txn.note}</Text></View> : null}
          
          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <Text style={s.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ActivityScreen({ navigation }) {
  const { transactions, settings, deleteTransaction, customCategories } = useApp();
  const colors = settings.darkMode ? darkColors : lightColors;
  const cur = settings.currency;
  const [activeFilter, setActiveFilter] = useState('Month');
  const [calMode,      setCalMode]      = useState('daily');
  const [selectedTxn,  setSelectedTxn]  = useState(null);
  const [calDateKey,   setCalDateKey]   = useState(null);
  const s = makeStyles(colors);

  const fmt = n => `${cur}${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;

  const now = new Date();
  const filtered = useMemo(() => transactions.filter(t => {
    const d = new Date(t.date);
    if (activeFilter === 'Week') return (now - d) / 86400000 <= 7;
    if (activeFilter === 'Month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (activeFilter === 'Quarter') return (now - d) / 86400000 <= 90;
    if (activeFilter === 'Annual') return d.getFullYear() === now.getFullYear();
    return true;
  }), [transactions, activeFilter]);

  const expenses = filtered.filter(t => t.type === 'expense');
  const totalExp = expenses.reduce((s, t) => s + t.amount, 0);

  const donutData = useMemo(() => {
    const map = {};
    expenses.forEach(t => { 
      const isCustom = (t.category === 'others' && t.customCategory?.trim());
      const key = isCustom ? 'custom_' + t.customCategory.trim().toLowerCase() : t.category;
      if (!map[key]) {
        const cat = getCat(t.category);
        let color = cat.color;
        let label = cat.label;
        if (isCustom) {
          label = t.customCategory.trim();
          const saved = (customCategories.expense || []).find(c => c.name.toLowerCase() === label.toLowerCase());
          if (saved) color = saved.color;
        }
        map[key] = { label, value: 0, color };
      }
      map[key].value += t.amount;
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [expenses, customCategories]);

  const displayTxns = useMemo(() => {
    if (!calDateKey) return filtered.slice(0, 15);
    return transactions.filter(t => {
      const d = new Date(t.date);
      const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const km = `${d.getFullYear()}-${d.getMonth()}`;
      const ky = String(d.getFullYear());
      return k === calDateKey || km === calDateKey || ky === calDateKey;
    });
  }, [calDateKey, transactions, filtered]);

  const handleEdit = (txn) => { setSelectedTxn(null); navigation.navigate('AddTransaction', { transaction: txn }); };
  const handleDelete = (id) => {
    Alert.alert('Delete', 'Delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteTransaction(id); setSelectedTxn(null); } }
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Activities</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f} style={[s.pill, activeFilter === f && s.pillActive]} onPress={() => { setActiveFilter(f); setCalDateKey(null); }}>
              <Text style={[s.pillText, activeFilter === f && s.pillTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={s.totalBlock}>
          <Text style={s.totalLabel}>Total Expense</Text>
          <Text style={s.totalAmount}>{fmt(totalExp)}</Text>
        </View>

        <View style={s.card}>
          <DonutChart 
            data={donutData} 
            size={SCREEN_W - 80} 
            strokeWidth={50} 
            centerLabel={
              activeFilter === 'Month' ? FULL_MONTHS[now.getMonth()] :
              activeFilter === 'Annual' ? String(now.getFullYear()) :
              activeFilter === 'Week' ? 'This Week' :
              activeFilter === 'Quarter' ? 'Last 90 Days' : 'Total'
            } 
            centerAmount={fmt(totalExp)} 
            centerAmountColor={colors.expense}
            currency={cur} 
          />
          <View style={s.legend}>
            {donutData.map((d, i) => (
              <View key={i} style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: d.color }]} />
                <Text style={s.legendLabel}>{d.label} <Text style={{ color: d.color, fontWeight: '800' }}>{totalExp > 0 ? Math.round((d.value/totalExp)*100) : 0}%</Text></Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.calModeRow}>
          {['daily','monthly','yearly'].map(m => (
            <TouchableOpacity key={m} style={[s.calModeBtn, calMode === m && s.calModeBtnActive]} onPress={() => { setCalMode(m); setCalDateKey(null); }}>
              <Text style={[s.calModeBtnText, calMode === m && s.calModeBtnTextActive]}>{m.charAt(0).toUpperCase()+m.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <CalendarView mode={calMode} transactions={transactions} currency={cur} onSelectDate={setCalDateKey} colors={colors} />

        <Text style={s.sectionTitle}>{calDateKey ? 'Filtered Transactions' : 'Recent Transactions'}</Text>
        {displayTxns.length === 0 ? <Text style={s.empty}>No records found.</Text> : displayTxns.map(t => {
          const cat = getCat(t.category);
          let color = cat.color;
          let label = cat.label;
          if (t.category === 'others' && t.customCategory?.trim()) {
            label = t.customCategory.trim();
            const saved = (customCategories[t.type] || []).find(c => c.name.toLowerCase() === label.toLowerCase());
            if (saved) color = saved.color;
          }
          return (
            <TouchableOpacity key={t.id} onPress={() => setSelectedTxn(t)}>
              <View style={s.txnRow}>
                <View style={[s.txnIcon, { backgroundColor: color + '22' }]}><Text style={{ fontSize: 20 }}>{cat.emoji}</Text></View>
                <View style={s.txnInfo}>
                  <Text style={s.txnCat}>{label}</Text>
                  <Text style={s.txnDate}>{new Date(t.date).toLocaleDateString('en-IN')}</Text>
                </View>
                <Text style={[s.txnAmt, { color: t.type === 'income' ? colors.income : colors.expense }]}>{t.type === 'income' ? '+' : '-'}{cur}{Math.abs(t.amount).toLocaleString('en-IN')}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TxnDetailModal txn={selectedTxn} currency={cur} onClose={() => setSelectedTxn(null)} colors={colors} onEdit={handleEdit} onDelete={handleDelete} customCategories={customCategories} />
    </SafeAreaView>
  );
}

const makeCalStyles = (colors) => StyleSheet.create({
  wrap:       { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 15, marginBottom: spacing.lg },
  nav:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  navArrow:   { fontSize: 22, color: colors.textPrimary, paddingHorizontal: 8, fontFamily: fonts.bold },
  navTitle:   { fontSize: 14, color: colors.textPrimary, fontFamily: fonts.bold },
  row:        { flexDirection: 'row', marginBottom: 4 },
  dayLabel:   { flex: 1, textAlign: 'center', fontSize: 10, color: colors.textMuted, fontFamily: fonts.bold },
  grid:       { flexDirection: 'row', flexWrap: 'wrap' },
  cell:       { width: `${100/7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 6, marginVertical: 1 },
  cellText:   { fontSize: 11, fontFamily: fonts.bold },
  dot:        { width: 4, height: 4, borderRadius: 2, marginTop: 1 },
  summary:    { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  summaryText:{ fontSize: 12, color: colors.textPrimary, textAlign: 'center', fontFamily: fonts.regular },
  monthGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  monthCell:  { width: '22%', borderRadius: 10, padding: 8, alignItems: 'center', marginBottom: 2 },
  monthLabel: { fontSize: 12, fontFamily: fonts.bold },
  monthAmt:   { fontSize: 9, marginTop: 2, fontFamily: fonts.regular },
});

const makeModalStyles = (colors) => StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card:        { width: '100%', borderRadius: 28, padding: 24, backgroundColor: colors.surface, elevation: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle:  { fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', fontFamily: fonts.bold },
  menuBtn:     { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  dropdown:    {
    position: 'absolute', top: 55, right: 24, zIndex: 100, backgroundColor: colors.surface2, 
    borderRadius: 12, padding: 4, elevation: 8, minWidth: 110, borderWidth: 1, borderColor: colors.border 
  },
  dropdownItem:{ flexDirection: 'row', alignItems: 'center', padding: 10, gap: 10 },
  dropdownText:{ fontSize: 14, color: colors.textPrimary, fontFamily: fonts.bold },
  dropDivider: { height: 1, backgroundColor: colors.border, marginHorizontal: 8 },
  iconRow:     { alignItems: 'center', marginBottom: 10 },
  icon:        { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  catName:     { fontSize: 20, color: colors.textPrimary, textAlign: 'center', fontFamily: fonts.heavy },
  catSub:      { fontSize: 12, color: colors.textMuted, textAlign: 'center', fontFamily: fonts.regular },
  amount:      { fontSize: 36, textAlign: 'center', marginVertical: 12, fontFamily: fonts.heavy },
  divider:     { height: 1, backgroundColor: colors.border, marginBottom: 14 },
  row:         { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rowLabel:    { fontSize: 13, color: colors.textMuted, fontFamily: fonts.regular },
  rowVal:      { fontSize: 13, color: colors.textPrimary, fontFamily: fonts.bold },
  noteBox:     { backgroundColor: colors.bg, borderRadius: 12, padding: 12, marginTop: 8 },
  noteText:    { fontSize: 13, color: colors.textPrimary, fontStyle: 'italic', fontFamily: fonts.regular },
  closeBtn:    { backgroundColor: colors.activePill, borderRadius: 25, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  closeBtnText:{ color: '#fff', fontFamily: fonts.bold },
});

const makeStyles = (colors) => StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingTop: 20, paddingBottom: 100 },
  title:   { fontSize: 28, color: colors.textPrimary, marginBottom: spacing.lg, fontFamily: fonts.heavy },
  pill:    { borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.surface, marginRight: 8 },
  pillActive:    { backgroundColor: colors.accentLight},
  pillText:      { fontSize: 13, color: colors.textMuted, fontFamily: fonts.bold },
  pillTextActive:{ color: '#fff' },
  totalBlock:    { marginBottom: spacing.lg },
  totalLabel:    { fontSize: 13, color: colors.textMuted, textTransform: 'uppercase', fontFamily: fonts.bold },
  totalAmount:   { fontSize: 42, color: colors.textPrimary, fontFamily: fonts.heavy },
  card:          { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', marginBottom: spacing.lg },
  legend:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12, justifyContent: 'center' },
  legendItem:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:     { width: 8, height: 8, borderRadius: 4 },
  legendLabel:   { fontSize: 12, color: colors.textPrimary, fontFamily: fonts.bold },
  calModeRow:    { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.pill, padding: 4, marginBottom: spacing.md },
  calModeBtn:    { flex: 1, paddingVertical: 8, borderRadius: radius.pill, alignItems: 'center' },
  calModeBtnActive: { backgroundColor: colors.accentLight },
  calModeBtnText:   { fontSize: 12, color: colors.textMuted, fontFamily: fonts.bold },
  calModeBtnTextActive: { color: '#fff' },
  sectionTitle:  { fontSize: 17, color: colors.textPrimary, marginBottom: spacing.sm, fontFamily: fonts.heavy },
  empty:         { color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 30, fontFamily: fonts.regular },
  txnRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  txnIcon:       { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txnInfo:       { flex: 1 },
  txnCat:        { fontSize: 15, color: colors.textPrimary, fontFamily: fonts.bold },
  txnDate:       { fontSize: 11, color: colors.textMuted, marginTop: 2, fontFamily: fonts.regular },
  txnAmt:        { fontSize: 15, fontFamily: fonts.heavy },
});
