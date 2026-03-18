import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Modal, Dimensions,
} from 'react-native';
import Svg, { G, Circle, Text as SvgText } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { colors, spacing, radius } from '../theme/theme';
import { getCat } from '../data/categories';
import DonutChart from '../components/DonutChart';

const { width: SCREEN_W } = Dimensions.get('window');

const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const FILTERS = ['Week','Month','Quarter','Annual'];

// ── Calendar ─────────────────────────────────────────────────────────────────
function CalendarView({ mode, transactions, currency, onSelectDate }) {
  const [viewYear,  setViewYear]  = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [selected,  setSelected]  = useState(null);
  const fmt = n => `${currency}${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

  // Build spend map
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

  const handleSelect = (key, label) => {
    setSelected(selected === key ? null : key);
    onSelectDate(key, mode);
  };

  // Intensity colour for a value
  const intensity = (val) => {
    if (!val || val === 0) return '#F0F0F0';
    if (val < 200)  return '#D4F5A0';
    if (val < 500)  return '#AADD00';
    if (val < 1000) return '#88BB00';
    return '#557700';
  };

  if (mode === 'daily') {
    // Monthly grid
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
      <View style={cal.wrap}>
        {/* Nav */}
        <View style={cal.nav}>
          <TouchableOpacity onPress={() => {
            if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
            else setViewMonth(m => m - 1);
          }}><Text style={cal.navArrow}>‹</Text></TouchableOpacity>
          <Text style={cal.navTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
          <TouchableOpacity onPress={() => {
            if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
            else setViewMonth(m => m + 1);
          }}><Text style={cal.navArrow}>›</Text></TouchableOpacity>
        </View>
        {/* Day labels */}
        <View style={cal.row}>
          {DAYS.map(d => <Text key={d} style={cal.dayLabel}>{d[0]}</Text>)}
        </View>
        {/* Cells */}
        <View style={cal.grid}>
          {cells.map((d, i) => {
            if (!d) return <View key={`e${i}`} style={cal.cell} />;
            const key = `${viewYear}-${viewMonth}-${d}`;
            const data = spendMap[key];
            const isSelected = selected === key;
            return (
              <TouchableOpacity key={key} style={[cal.cell, { backgroundColor: isSelected ? colors.activePill : intensity(data?.expense) }]}
                onPress={() => handleSelect(key, `${d} ${MONTHS[viewMonth]}`)}>
                <Text style={[cal.cellText, { color: isSelected ? '#fff' : colors.textPrimary }]}>{d}</Text>
                {data?.expense > 0 && <View style={[cal.dot, { backgroundColor: isSelected ? '#fff' : colors.expense }]} />}
              </TouchableOpacity>
            );
          })}
        </View>
        {/* Selected day summary */}
        {selected && (() => {
          const data = spendMap[selected];
          return data ? (
            <View style={cal.summary}>
              <Text style={cal.summaryText}>Spent: <Text style={{ color: colors.expense, fontWeight: '700' }}>{fmt(data.expense)}</Text>   Earned: <Text style={{ color: colors.income, fontWeight: '700' }}>{fmt(data.income)}</Text></Text>
            </View>
          ) : <View style={cal.summary}><Text style={cal.summaryText}>No transactions</Text></View>;
        })()}
      </View>
    );
  }

  if (mode === 'monthly') {
    return (
      <View style={cal.wrap}>
        <View style={cal.nav}>
          <TouchableOpacity onPress={() => setViewYear(y => y - 1)}><Text style={cal.navArrow}>‹</Text></TouchableOpacity>
          <Text style={cal.navTitle}>{viewYear}</Text>
          <TouchableOpacity onPress={() => setViewYear(y => y + 1)}><Text style={cal.navArrow}>›</Text></TouchableOpacity>
        </View>
        <View style={cal.monthGrid}>
          {MONTHS.map((m, i) => {
            const key = `${viewYear}-${i}`;
            const data = spendMap[key];
            const isSelected = selected === key;
            return (
              <TouchableOpacity key={key}
                style={[cal.monthCell, { backgroundColor: isSelected ? colors.activePill : intensity(data?.expense) }]}
                onPress={() => handleSelect(key, m)}>
                <Text style={[cal.monthLabel, { color: isSelected ? '#fff' : colors.textPrimary }]}>{m}</Text>
                {data?.expense > 0 && <Text style={[cal.monthAmt, { color: isSelected ? '#ddd' : colors.expense }]}>{fmt(data.expense)}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
        {selected && (() => {
          const data = spendMap[selected];
          return data ? (
            <View style={cal.summary}>
              <Text style={cal.summaryText}>Spent: <Text style={{ color: colors.expense, fontWeight: '700' }}>{fmt(data.expense)}</Text>   Earned: <Text style={{ color: colors.income, fontWeight: '700' }}>{fmt(data.income)}</Text></Text>
            </View>
          ) : <View style={cal.summary}><Text style={cal.summaryText}>No transactions</Text></View>;
        })()}
      </View>
    );
  }

  // Yearly mode — show last 6 years
  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 5 + i);
  return (
    <View style={cal.wrap}>
      <Text style={cal.navTitle}>Yearly Overview</Text>
      <View style={cal.monthGrid}>
        {years.map(yr => {
          const data = spendMap[yr];
          const isSelected = selected === yr;
          return (
            <TouchableOpacity key={yr}
              style={[cal.monthCell, { backgroundColor: isSelected ? colors.activePill : intensity(data?.expense), width: '30%' }]}
              onPress={() => handleSelect(yr, String(yr))}>
              <Text style={[cal.monthLabel, { color: isSelected ? '#fff' : colors.textPrimary }]}>{yr}</Text>
              {data?.expense > 0 && <Text style={[cal.monthAmt, { color: isSelected ? '#ddd' : colors.expense }]}>{fmt(data.expense)}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
      {selected && (() => {
        const data = spendMap[selected];
        return data ? (
          <View style={cal.summary}>
            <Text style={cal.summaryText}>Spent: <Text style={{ color: colors.expense, fontWeight: '700' }}>{fmt(data.expense)}</Text>   Earned: <Text style={{ color: colors.income, fontWeight: '700' }}>{fmt(data.income)}</Text></Text>
          </View>
        ) : <View style={cal.summary}><Text style={cal.summaryText}>No transactions</Text></View>;
      })()}
    </View>
  );
}

const cal = StyleSheet.create({
  wrap:       { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 12, marginBottom: spacing.lg },
  nav:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  navArrow:   { fontSize: 22, color: colors.textPrimary, paddingHorizontal: 8 },
  navTitle:   { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  row:        { flexDirection: 'row', marginBottom: 4 },
  dayLabel:   { flex: 1, textAlign: 'center', fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  grid:       { flexDirection: 'row', flexWrap: 'wrap' },
  cell:       { width: `${100/7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 6, marginVertical: 1 },
  cellText:   { fontSize: 11, fontWeight: '600' },
  dot:        { width: 4, height: 4, borderRadius: 2, marginTop: 1 },
  summary:    { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  summaryText:{ fontSize: 13, color: colors.textPrimary, textAlign: 'center' },
  monthGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  monthCell:  { width: '22%', borderRadius: 10, padding: 8, alignItems: 'center', marginBottom: 2 },
  monthLabel: { fontSize: 12, fontWeight: '700' },
  monthAmt:   { fontSize: 9, marginTop: 2 },
});

// ── Transaction Detail Modal (glassmorphism style) ────────────────────────────
function TxnDetailModal({ txn, currency, onClose }) {
  if (!txn) return null;
  const cat = getCat(txn.category);
  const fmt = n => `${currency}${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

  return (
    <Modal transparent animationType="fade" visible={!!txn} onRequestClose={onClose}>
      <View style={modal.overlay}>
        <View style={modal.card}>
          <View style={modal.iconRow}>
            <View style={[modal.icon, { backgroundColor: cat.color + '33' }]}>
              <Text style={{ fontSize: 32 }}>{cat.emoji}</Text>
            </View>
          </View>
          <Text style={modal.catName}>{cat.label}</Text>
          <Text style={[modal.amount, { color: txn.type === 'income' ? colors.income : colors.expense }]}>
            {txn.type === 'income' ? '+' : '-'}{fmt(txn.amount)}
          </Text>
          <View style={modal.divider} />
          <View style={modal.row}>
            <Text style={modal.rowLabel}>Type</Text>
            <View style={[modal.typePill, { backgroundColor: txn.type === 'income' ? colors.income + '22' : colors.expense + '22' }]}>
              <Text style={[modal.typePillText, { color: txn.type === 'income' ? colors.income : colors.expense }]}>
                {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
              </Text>
            </View>
          </View>
          <View style={modal.row}>
            <Text style={modal.rowLabel}>Date</Text>
            <Text style={modal.rowVal}>{new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          </View>
          <View style={modal.row}>
            <Text style={modal.rowLabel}>Time</Text>
            <Text style={modal.rowVal}>{new Date(txn.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          {txn.note ? (
            <View style={modal.noteBox}>
              <Text style={modal.noteLabel}>Note</Text>
              <Text style={modal.noteText}>{txn.note}</Text>
            </View>
          ) : null}
          <TouchableOpacity style={modal.closeBtn} onPress={onClose}>
            <Text style={modal.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const modal = StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card:        {
    width: '100%', borderRadius: 28, padding: 24,
    backgroundColor: 'rgba(255,255,255,0.92)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25, shadowRadius: 24, elevation: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)',
  },
  iconRow:     { alignItems: 'center', marginBottom: 10 },
  icon:        { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  catName:     { fontSize: 16, fontWeight: '700', color: colors.textMuted, textAlign: 'center', marginBottom: 4 },
  amount:      { fontSize: 38, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  divider:     { height: 1, backgroundColor: colors.border, marginBottom: 14 },
  row:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  rowLabel:    { fontSize: 13, color: colors.textMuted },
  rowVal:      { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  typePill:    { borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 4 },
  typePillText:{ fontSize: 12, fontWeight: '700' },
  noteBox:     { backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, marginTop: 4, marginBottom: 8 },
  noteLabel:   { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  noteText:    { fontSize: 13, color: colors.textPrimary },
  closeBtn:    { backgroundColor: colors.activePill, borderRadius: radius.pill, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  closeBtnText:{ color: '#fff', fontWeight: '700', fontSize: 14 },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ActivityScreen() {
  const { transactions, settings } = useApp();
  const cur = settings.currency;
  const [activeFilter, setActiveFilter] = useState('Month');
  const [calMode,      setCalMode]      = useState('daily');
  const [selectedTxn,  setSelectedTxn]  = useState(null);
  const [calDateKey,   setCalDateKey]   = useState(null);

  const fmt = n => `${cur}${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;

  // Filter transactions by top filter
  const now = new Date();
  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      if (activeFilter === 'Week') {
        const diff = (now - d) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      }
      if (activeFilter === 'Month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (activeFilter === 'Quarter') {
        const diff = (now - d) / (1000 * 60 * 60 * 24);
        return diff <= 90;
      }
      if (activeFilter === 'Annual') return d.getFullYear() === now.getFullYear();
      return true;
    });
  }, [transactions, activeFilter]);

  const expenses = filtered.filter(t => t.type === 'expense');
  const totalExp = expenses.reduce((s, t) => s + t.amount, 0);

  const donutData = useMemo(() => {
    const map = {};
    expenses.forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map).map(([id, v]) => {
      const cat = getCat(id); return { label: cat.label, value: v, color: cat.color };
    }).sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Calendar mode syncs with top filter
  const calModeFromFilter = () => {
    if (activeFilter === 'Week' || activeFilter === 'Month') return 'daily';
    if (activeFilter === 'Quarter') return 'monthly';
    return 'monthly';
  };

  const handleCalSelect = (key, mode) => setCalDateKey(key);

  // Transactions to show — if calendar date selected, filter by it; else show recent
  const displayTxns = useMemo(() => {
    if (!calDateKey) return filtered.slice(0, 10);
    return transactions.filter(t => {
      const d  = new Date(t.date);
      const yr = d.getFullYear();
      const mo = d.getMonth();
      const dy = d.getDate();
      const parts = String(calDateKey).split('-');
      if (calMode === 'daily'   || parts.length === 3) return `${yr}-${mo}-${dy}` === calDateKey;
      if (calMode === 'monthly' || parts.length === 2) return `${yr}-${mo}` === calDateKey;
      return String(yr) === String(calDateKey);
    });
  }, [calDateKey, transactions, filtered]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Text style={styles.title}>Activities</Text>

        {/* Top filter — Week / Month / Quarter / Annual */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f}
              style={[styles.pill, activeFilter === f && styles.pillActive]}
              onPress={() => { setActiveFilter(f); setCalDateKey(null); }}>
              <Text style={[styles.pillText, activeFilter === f && styles.pillTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Total expense */}
        <View style={styles.totalBlock}>
          <Text style={styles.totalLabel}>Total Expense</Text>
          <Text style={styles.totalAmount}>{fmt(totalExp)}</Text>
        </View>

        {/* Redesigned Donut */}
        <View style={styles.card}>
          <DonutChart
            data={donutData}
            size={SCREEN_W - 80}
            strokeWidth={50}
            centerLabel={`Spent this ${MONTHS[new Date().getMonth()]}`}
            centerAmount={fmt(totalExp)}
            currency={cur}
          />
          <View style={styles.legend}>
            {donutData.map((d, i) => {
              const pct = totalExp > 0 ? Math.round((d.value / totalExp) * 100) : 0;
              return (
                <View key={i} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                  <Text style={styles.legendLabel}>
                    {d.label}{' '}
                    <Text style={{ color: d.color, fontWeight: '800', fontSize: 12 }}>{pct}%</Text>
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Calendar mode selector */}
        <View style={styles.calModeRow}>
          {[
            { key: 'daily',   label: 'Daily' },
            { key: 'monthly', label: 'Monthly' },
            { key: 'yearly',  label: 'Yearly' },
          ].map(m => (
            <TouchableOpacity key={m.key}
              style={[styles.calModeBtn, calMode === m.key && styles.calModeBtnActive]}
              onPress={() => { setCalMode(m.key); setCalDateKey(null); }}>
              <Text style={[styles.calModeBtnText, calMode === m.key && styles.calModeBtnTextActive]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Calendar */}
        <CalendarView mode={calMode} transactions={transactions} currency={cur} onSelectDate={handleCalSelect} />

        {/* Transactions list */}
        <Text style={styles.sectionTitle}>
          {calDateKey ? 'Transactions on selected date' : 'Recent Transactions'}
        </Text>
        {displayTxns.length === 0
          ? <Text style={styles.empty}>No transactions for this period.</Text>
          : displayTxns.map(t => (
              <TouchableOpacity key={t.id} onPress={() => setSelectedTxn(t)}>
                <View style={styles.txnRow}>
                  <View style={[styles.txnIcon, { backgroundColor: getCat(t.category).color + '22' }]}>
                    <Text style={{ fontSize: 20 }}>{getCat(t.category).emoji}</Text>
                  </View>
                  <View style={styles.txnInfo}>
                    <Text style={styles.txnCat}>{getCat(t.category).label}</Text>
                    <Text style={styles.txnDate}>{new Date(t.date).toLocaleDateString('en-IN')}</Text>
                  </View>
                  <Text style={[styles.txnAmt, { color: t.type === 'income' ? colors.income : colors.expense }]}>
                    {t.type === 'income' ? '+' : '-'}{cur}{Math.abs(t.amount).toLocaleString('en-IN')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
        }
      </ScrollView>

      {/* Transaction Detail Modal */}
      <TxnDetailModal txn={selectedTxn} currency={cur} onClose={() => setSelectedTxn(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 60 },

  title: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.lg },

  pill:         { borderRadius: radius.pill, paddingHorizontal: 18, paddingVertical: 9, backgroundColor: colors.surface, marginRight: 8 },
  pillActive:   { backgroundColor: colors.activePill },
  pillText:     { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  pillTextActive:{ color: '#fff', fontWeight: '700' },

  totalBlock: { marginBottom: spacing.lg },
  totalLabel: { fontSize: 13, color: colors.textMuted },
  totalAmount:{ fontSize: 40, fontWeight: '800', color: colors.textPrimary, marginTop: 4 },

  card:       { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', marginBottom: spacing.lg },
  legend:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: spacing.sm, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot:  { width: 8, height: 8, borderRadius: 4 },
  legendLabel:{ fontSize: 11, color: colors.textMuted },

  calModeRow:     { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.pill, padding: 4, marginBottom: spacing.md },
  calModeBtn:     { flex: 1, paddingVertical: 8, borderRadius: radius.pill, alignItems: 'center' },
  calModeBtnActive:{ backgroundColor: colors.activePill },
  calModeBtnText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  calModeBtnTextActive: { color: '#fff' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  empty:        { color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 20 },

  txnRow:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  txnIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txnInfo: { flex: 1 },
  txnCat:  { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  txnDate: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  txnAmt:  { fontSize: 14, fontWeight: '700' },
});
