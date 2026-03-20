// src/screens/ActivityScreen.js
// Finova v3.0 — Transaction search (Pro) · Wallet-aware filtering

import React, { useMemo, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, Dimensions, Animated, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { lightColors, darkColors, spacing, radius, fonts } from '../theme/theme';
import { getCat } from '../data/categories';
import DonutChart from '../components/DonutChart';

// ─── Delete Transaction Confirm Modal ─────────────────────────────────────────
function DeleteTxnModal({ visible, onCancel, onConfirm }) {
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onCancel}>
      <View style={cm.sheetBackdrop}>
        <View style={cm.sheet}>
          <View style={cm.handle} />
          <View style={[cm.iconRing, cm.iconRingDanger]}>
            <Text style={cm.iconEmoji}>🗑️</Text>
          </View>
          <Text style={cm.title}>Delete Transaction</Text>
          <Text style={cm.body}>
            This will permanently remove this transaction.{' '}
            <Text style={cm.bodyHighlight}>This cannot be undone.</Text>
          </Text>
          <TouchableOpacity style={cm.destructiveBtn} onPress={onConfirm} activeOpacity={0.84}>
            <Text style={cm.destructiveBtnText}>Yes, Delete It</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cm.ghostBtn} onPress={onCancel} activeOpacity={0.75}>
            <Text style={cm.ghostBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const { width: SCREEN_W } = Dimensions.get('window');

const MONTHS      = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const FULL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS        = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const FILTERS     = ['Week','Month','Quarter','Annual'];

// ─── Spring-press animated pill ───────────────────────────────────────────────
function AnimPill({ onPress, isActive, style, activeStyle, textStyle, activeTextStyle, label }) {
  const scale    = useRef(new Animated.Value(1)).current;
  const pressIn  = () => Animated.spring(scale, { toValue: 0.88, useNativeDriver: true, speed: 60, bounciness: 0 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 30, bounciness: 8 }).start();
  return (
    <TouchableOpacity onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} activeOpacity={1}>
      <Animated.View style={[style, isActive && activeStyle, { transform: [{ scale }] }]}>
        <Text style={[textStyle, isActive && activeTextStyle]}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── Calendar ──────────────────────────────────────────────────────────────────
function CalendarView({ mode, transactions, currency, onSelectDate, colors }) {
  const [viewYear,  setViewYear ] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [selected,  setSelected ] = useState(null);
  const fmt = n => `${currency}${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
  const s = makeCalStyles(colors);

  const spendMap = useMemo(() => {
    const m = {};
    transactions.forEach(t => {
      const d  = new Date(t.date);
      const yr = d.getFullYear(), mo = d.getMonth(), dy = d.getDate();
      if (mode === 'daily') {
        const key = `${yr}-${mo}-${dy}`;
        if (!m[key]) m[key] = { expense: 0, income: 0 };
        t.type === 'expense' ? (m[key].expense += t.amount) : (m[key].income += t.amount);
      } else if (mode === 'monthly') {
        const key = `${yr}-${mo}`;
        if (!m[key]) m[key] = { expense: 0, income: 0 };
        t.type === 'expense' ? (m[key].expense += t.amount) : (m[key].income += t.amount);
      } else {
        const key = String(yr);
        if (!m[key]) m[key] = { expense: 0, income: 0 };
        t.type === 'expense' ? (m[key].expense += t.amount) : (m[key].income += t.amount);
      }
    });
    return m;
  }, [transactions, mode]);

  const handleSelect = (key) => { setSelected(selected === key ? null : key); onSelectDate(key); };

  const intensity = (val) => {
    if (!val || val === 0) return colors.surface2;
    if (val < 200)  return colors.chartGreen + '44';
    if (val < 500)  return colors.chartGreen + '88';
    if (val < 1000) return colors.chartGreen + 'BB';
    return colors.chartGreen;
  };

  if (mode === 'daily') {
    const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return (
      <View style={s.wrap}>
        <View style={s.nav}>
          <TouchableOpacity onPress={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); }}>
            <Text style={s.navArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={s.navTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
          <TouchableOpacity onPress={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); }}>
            <Text style={s.navArrow}>›</Text>
          </TouchableOpacity>
        </View>
        <View style={s.row}>{DAYS.map(d => <Text key={d} style={s.dayLabel}>{d[0]}</Text>)}</View>
        <View style={s.grid}>
          {cells.map((d, i) => {
            if (!d) return <View key={`e${i}`} style={s.cell} />;
            const key = `${viewYear}-${viewMonth}-${d}`, data = spendMap[key], isSelected = selected === key;
            return (
              <TouchableOpacity key={key} style={[s.cell, { backgroundColor: isSelected ? colors.activePill : intensity(data?.expense) }]} onPress={() => handleSelect(key)}>
                <Text style={[s.cellText, { color: isSelected ? '#fff' : colors.textPrimary }]}>{d}</Text>
                {data?.expense > 0 && <View style={[s.dot, { backgroundColor: isSelected ? '#fff' : colors.expense }]} />}
              </TouchableOpacity>
            );
          })}
        </View>
        {selected && spendMap[selected] && (
          <View style={s.summary}>
            <Text style={s.summaryText}>Spent: <Text style={{ color: colors.expense, fontWeight: '700' }}>{fmt(spendMap[selected].expense)}</Text>{'   '}Earned: <Text style={{ color: colors.income, fontWeight: '700' }}>{fmt(spendMap[selected].income)}</Text></Text>
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
            const key = `${viewYear}-${i}`, data = spendMap[key], isSelected = selected === key;
            return (
              <TouchableOpacity key={key} style={[s.monthCell, { backgroundColor: isSelected ? colors.activePill : intensity(data?.expense) }]} onPress={() => handleSelect(key)}>
                <Text style={[s.monthLabel, { color: isSelected ? '#fff' : colors.textPrimary }]}>{m}</Text>
                {data?.expense > 0 && <Text style={[s.monthAmt, { color: isSelected ? '#ddd' : colors.expense }]}>{fmt(data.expense)}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
        {selected && spendMap[selected] && (
          <View style={s.summary}>
            <Text style={s.summaryText}>Spent: <Text style={{ color: colors.expense, fontWeight: '700' }}>{fmt(spendMap[selected].expense)}</Text>{'   '}Earned: <Text style={{ color: colors.income, fontWeight: '700' }}>{fmt(spendMap[selected].income)}</Text></Text>
          </View>
        )}
      </View>
    );
  }

  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 5 + i);
  return (
    <View style={s.wrap}>
      <Text style={[s.navTitle, { marginBottom: 12, paddingLeft: 90 }]}>Yearly Overview</Text>
      <View style={s.monthGrid}>
        {years.map(yr => {
          const key = String(yr), data = spendMap[key], isSelected = selected === key;
          return (
            <TouchableOpacity key={key} style={[s.monthCell, { backgroundColor: isSelected ? colors.activePill : intensity(data?.expense), width: '30%' }]} onPress={() => handleSelect(key)}>
              <Text style={[s.monthLabel, { color: isSelected ? '#fff' : colors.textPrimary }]}>{yr}</Text>
              {data?.expense > 0 && <Text style={[s.monthAmt, { color: isSelected ? '#ddd' : colors.expense }]}>{fmt(data.expense)}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
      {selected && spendMap[selected] && (
        <View style={s.summary}>
          <Text style={s.summaryText}>Spent: <Text style={{ color: colors.expense, fontWeight: '700' }}>{fmt(spendMap[selected].expense)}</Text>{'   '}Earned: <Text style={{ color: colors.income, fontWeight: '700' }}>{fmt(spendMap[selected].income)}</Text></Text>
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
  const s   = makeModalStyles(colors);
  let color = cat.color, label = cat.label;
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
                <Circle cx="12" cy="5"  r="2" fill={colors.textMuted} />
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
          <View style={s.iconRow}><View style={[s.icon, { backgroundColor: color + '33' }]}><Text style={{ fontSize: 32 }}>{cat.emoji}</Text></View></View>
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
          <TouchableOpacity style={s.closeBtn} onPress={onClose}><Text style={s.closeBtnText}>Close</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ActivityScreen({ navigation }) {
  const {
    transactions, activeTransactions,
    settings, deleteTransaction, customCategories, isPro,
  } = useApp();
  const colors = settings.darkMode ? darkColors : lightColors;
  const cur    = settings.currency;
  const s      = makeStyles(colors);

  const [activeFilter,    setActiveFilter   ] = useState('Month');
  const [calMode,         setCalMode        ] = useState('daily');
  const [selectedTxn,     setSelectedTxn    ] = useState(null);
  const [calDateKey,      setCalDateKey     ] = useState(null);
  const [deleteTxnModal,  setDeleteTxnModal ] = useState({ visible: false, txnId: null });
  const [searchOpen,      setSearchOpen     ] = useState(false);
  const [searchQuery,     setSearchQuery    ] = useState('');

  const fmt = n => `${cur}${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
  const now = new Date();

  // Use activeTransactions (wallet-filtered) for all display + stats
  const filtered = useMemo(() => {
    const today = new Date();
    return activeTransactions.filter(t => {
      const d = new Date(t.date);
      const diff = (today - d) / 86400000;
      if (activeFilter === 'Week')    return diff >= 0 && diff <= 7;
      if (activeFilter === 'Month')   return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      if (activeFilter === 'Quarter') return diff >= 0 && diff <= 90;
      if (activeFilter === 'Annual')  return d.getFullYear() === today.getFullYear();
      return true;
    });
  }, [activeTransactions, activeFilter]);

  const expenses = filtered.filter(t => t.type === 'expense');
  const totalExp = expenses.reduce((s, t) => s + t.amount, 0);

  const donutData = useMemo(() => {
    const map = {};
    expenses.forEach(t => {
      const isCustom = (t.category === 'others' && t.customCategory?.trim());
      const key      = isCustom ? 'custom_' + t.customCategory.trim().toLowerCase() : t.category;
      if (!map[key]) {
        const cat = getCat(t.category);
        let color = cat.color, label = cat.label;
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

  // Base list for "Recent Transactions" section
  const displayTxnsBase = useMemo(() => {
    if (!calDateKey) return filtered.slice(0, 15);
    return activeTransactions.filter(t => {
      const d  = new Date(t.date);
      const k  = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const km = `${d.getFullYear()}-${d.getMonth()}`;
      const ky = String(d.getFullYear());
      return k === calDateKey || km === calDateKey || ky === calDateKey;
    });
  }, [calDateKey, activeTransactions, filtered]);

  // Apply search filter on top
  const displayTxns = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return displayTxnsBase;
    return displayTxnsBase.filter(t => {
      const catLabel = (t.customCategory?.trim() || t.category).toLowerCase();
      return (
        (t.note || '').toLowerCase().includes(q) ||
        t.amount.toString().includes(q) ||
        catLabel.includes(q)
      );
    });
  }, [displayTxnsBase, searchQuery]);

  const handleEdit   = (txn) => { setSelectedTxn(null); navigation.navigate('AddTransaction', { transaction: txn }); };
  const handleDelete = (txnId) => { setSelectedTxn(null); setDeleteTxnModal({ visible: true, txnId }); };
  const confirmDeleteTxn = () => {
    deleteTransaction(deleteTxnModal.txnId);
    setDeleteTxnModal({ visible: false, txnId: null });
  };

  const handleSearchPress = () => {
    if (!isPro) { navigation.navigate('ProPaywall'); return; }
    if (searchOpen) { setSearchOpen(false); setSearchQuery(''); }
    else            { setSearchOpen(true); }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Activities</Text>

        {/* Period filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
          {FILTERS.map(f => (
            <AnimPill
              key={f} label={f} isActive={activeFilter === f}
              onPress={() => { setActiveFilter(f); setCalDateKey(null); }}
              style={s.pill} activeStyle={s.pillActive} textStyle={s.pillText} activeTextStyle={s.pillTextActive}
            />
          ))}
        </ScrollView>

        <View style={s.totalBlock}>
          <Text style={s.totalLabel}>Total Expense</Text>
          <Text style={s.totalAmount}>{fmt(totalExp)}</Text>
        </View>

        <View style={s.card}>
          <DonutChart
            data={donutData} size={SCREEN_W - 80} strokeWidth={50}
            centerLabel={
              activeFilter === 'Month'   ? FULL_MONTHS[now.getMonth()] :
              activeFilter === 'Annual'  ? String(now.getFullYear()) :
              activeFilter === 'Week'    ? 'This Week' :
              activeFilter === 'Quarter' ? 'Last 90 Days' : 'Total'
            }
            centerAmount={fmt(totalExp)} centerAmountColor={colors.expense} currency={cur} colors={colors}
          />
          <View style={s.legend}>
            {donutData.map((d, i) => (
              <View key={i} style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: d.color }]} />
                <Text style={s.legendLabel}>
                  {d.label} <Text style={{ color: d.color, fontWeight: '800' }}>
                    {totalExp > 0 ? Math.round((d.value / totalExp) * 100) : 0}%
                  </Text>
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Calendar mode selector */}
        <View style={s.calModeRow}>
          {['daily','monthly','yearly'].map(m => (
            <AnimPill
              key={m} label={m.charAt(0).toUpperCase() + m.slice(1)} isActive={calMode === m}
              onPress={() => { setCalMode(m); setCalDateKey(null); }}
              style={s.calModeBtn} activeStyle={s.calModeBtnActive}
              textStyle={s.calModeBtnText} activeTextStyle={s.calModeBtnTextActive}
            />
          ))}
        </View>

        {/* Calendar uses all active wallet transactions for heat-map accuracy */}
        <CalendarView mode={calMode} transactions={activeTransactions} currency={cur} onSelectDate={setCalDateKey} colors={colors} />

        {/* ── Section header with search icon ── */}
        <View style={s.sectionTitleRow}>
          <Text style={s.sectionTitle}>{calDateKey ? 'Filtered Transactions' : 'Recent Transactions'}</Text>
          <TouchableOpacity style={s.searchIconBtn} onPress={handleSearchPress} activeOpacity={0.7}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke={searchOpen ? colors.accent : colors.textMuted} strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <Path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
              <Path d="M21 21l-4.35-4.35" />
            </Svg>
            {!isPro && <Text style={s.lockBadge}>🔒</Text>}
          </TouchableOpacity>
        </View>

        {/* Search input — visible only when open and Pro */}
        {searchOpen && isPro && (
          <View style={s.searchBox}>
            <Svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ marginRight: 8 }}>
              <Path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
              <Path d="M21 21l-4.35-4.35" />
            </Svg>
            <TextInput
              style={s.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search note, amount or category…"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={s.clearBtn}>
                <Text style={s.clearBtnText}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {/* Transaction list */}
        {displayTxns.length === 0
          ? <Text style={s.empty}>{searchQuery ? 'No results found.' : 'No records found.'}</Text>
          : displayTxns.slice(0, 100).map(t => {
              const cat = getCat(t.category);
              let color = cat.color, label = cat.label;
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
                    <Text style={[s.txnAmt, { color: t.type === 'income' ? colors.income : colors.expense }]}>
                      {t.type === 'income' ? '+' : '-'}{cur}{Math.abs(t.amount).toLocaleString('en-IN')}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
        }
      </ScrollView>

      <TxnDetailModal
        txn={selectedTxn} currency={cur} onClose={() => setSelectedTxn(null)}
        colors={colors} onEdit={handleEdit} onDelete={handleDelete} customCategories={customCategories}
      />
      <DeleteTxnModal
        visible={deleteTxnModal.visible}
        onCancel={() => setDeleteTxnModal({ visible: false, txnId: null })}
        onConfirm={confirmDeleteTxn}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const makeCalStyles = (colors) => StyleSheet.create({
  wrap:       { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 15, marginBottom: spacing.lg },
  nav:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  navArrow:   { fontSize: 22, color: colors.textPrimary, paddingHorizontal: 8, fontFamily: fonts.bold },
  navTitle:   { fontSize: 14, color: colors.textPrimary, fontFamily: fonts.bold },
  row:        { flexDirection: 'row', marginBottom: 4 },
  dayLabel:   { flex: 1, textAlign: 'center', fontSize: 10, color: colors.textMuted, fontFamily: fonts.bold },
  grid:       { flexDirection: 'row', flexWrap: 'wrap' },
  cell:       { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 6, marginVertical: 1 },
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
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card:         { width: '100%', borderRadius: 28, padding: 24, backgroundColor: colors.surface, elevation: 20 },
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle:   { fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', fontFamily: fonts.bold },
  menuBtn:      { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  dropdown:     { position: 'absolute', top: 55, right: 24, zIndex: 100, backgroundColor: colors.surface2, borderRadius: 12, padding: 4, elevation: 8, minWidth: 110, borderWidth: 1, borderColor: colors.border },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 10 },
  dropdownText: { fontSize: 14, color: colors.textPrimary, fontFamily: fonts.bold },
  dropDivider:  { height: 1, backgroundColor: colors.border, marginHorizontal: 8 },
  iconRow:      { alignItems: 'center', marginBottom: 10 },
  icon:         { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  catName:      { fontSize: 20, color: colors.textPrimary, textAlign: 'center', fontFamily: fonts.heavy },
  catSub:       { fontSize: 12, color: colors.textMuted, textAlign: 'center', fontFamily: fonts.regular },
  amount:       { fontSize: 36, textAlign: 'center', marginVertical: 12, fontFamily: fonts.heavy },
  divider:      { height: 1, backgroundColor: colors.border, marginBottom: 14 },
  row:          { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rowLabel:     { fontSize: 13, color: colors.textMuted, fontFamily: fonts.regular },
  rowVal:       { fontSize: 13, color: colors.textPrimary, fontFamily: fonts.bold },
  noteBox:      { backgroundColor: colors.bg, borderRadius: 12, padding: 12, marginTop: 8 },
  noteText:     { fontSize: 13, color: colors.textPrimary, fontStyle: 'italic', fontFamily: fonts.regular },
  closeBtn:     { backgroundColor: colors.activePill, borderRadius: 25, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  closeBtnText: { color: '#fff', fontFamily: fonts.bold },
});

const makeStyles = (colors) => StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bg, paddingBottom: -100, paddingTop: -50 },
  content: { padding: spacing.md, paddingTop: 50, paddingBottom: 150 },
  title:   { fontSize: 28, color: colors.textPrimary, marginBottom: spacing.lg, fontFamily: fonts.heavy },

  pill:           { borderRadius: radius.pill, paddingHorizontal: 18, paddingVertical: 9, backgroundColor: colors.surface, marginRight: 8 },
  pillActive:     { backgroundColor: colors.accentLight },
  pillText:       { fontSize: 13, color: colors.textMuted, fontFamily: fonts.bold },
  pillTextActive: { color: '#fff' },

  totalBlock:  { marginBottom: spacing.lg },
  totalLabel:  { fontSize: 13, color: colors.textMuted, textTransform: 'uppercase', fontFamily: fonts.bold },
  totalAmount: { fontSize: 42, color: colors.textPrimary, fontFamily: fonts.heavy },

  card:       { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', marginBottom: spacing.lg },
  legend:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:  { width: 8, height: 8, borderRadius: 4 },
  legendLabel:{ fontSize: 12, color: colors.textPrimary, fontFamily: fonts.bold },

  calModeRow:          { flexDirection: 'row', gap: 10, marginBottom: spacing.md, backgroundColor: colors.surface, borderRadius: radius.xl, padding: 7, paddingLeft: 10 },
  calModeBtn:          { flex: 1, paddingVertical: 10, paddingHorizontal: 10, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', minHeight: 40, minWidth: 95 },
  calModeBtnActive:    { backgroundColor: colors.accentLight },
  calModeBtnText:      { fontSize: 13, color: colors.textMuted, fontFamily: fonts.bold },
  calModeBtnTextActive:{ color: '#fff' },

  // Section header row with search icon
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  sectionTitle:    { fontSize: 17, color: colors.textPrimary, fontFamily: fonts.heavy },
  searchIconBtn:   { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  lockBadge:       { position: 'absolute', top: -2, right: -2, fontSize: 10 },

  // Search input bar
  searchBox:   { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 10, marginBottom: spacing.sm, borderWidth: 1.5, borderColor: colors.accent },
  searchInput: { flex: 1, fontSize: 13, color: colors.textPrimary, fontFamily: fonts.regular },
  clearBtn:    { padding: 4 },
  clearBtnText:{ fontSize: 12, color: colors.textMuted, fontFamily: fonts.bold },

  empty:   { color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 30, fontFamily: fonts.regular },
  txnRow:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  txnIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txnInfo: { flex: 1 },
  txnCat:  { fontSize: 15, color: colors.textPrimary, fontFamily: fonts.bold },
  txnDate: { fontSize: 11, color: colors.textMuted, marginTop: 2, fontFamily: fonts.regular },
  txnAmt:  { fontSize: 15, fontFamily: fonts.heavy },
});

const cm = StyleSheet.create({
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet:         { backgroundColor: '#2C3020', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingBottom: 28, borderWidth: 1, borderColor: 'rgba(174,183,132,0.18)', borderBottomWidth: 0, alignItems: 'center' },
  handle:        { width: 38, height: 4, borderRadius: 2, backgroundColor: 'rgba(174,183,132,0.35)', marginTop: 12, marginBottom: 24 },
  iconRing:      { width: 68, height: 68, borderRadius: 34, backgroundColor: 'rgba(174,183,132,0.12)', borderWidth: 1.5, borderColor: 'rgba(174,183,132,0.30)', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  iconRingDanger:{ backgroundColor: 'rgba(158,90,90,0.15)', borderColor: 'rgba(158,90,90,0.35)' },
  iconEmoji:     { fontSize: 30 },
  title:         { fontFamily: 'Fungis-Heavy',   fontSize: 20, color: '#FFFFFF', textAlign: 'center', marginBottom: 10 },
  body:          { fontFamily: 'Fungis-Regular', fontSize: 13, color: 'rgba(255,255,255,0.52)', textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  bodyHighlight: { fontFamily: 'Fungis-Bold', color: '#AEB784' },
  destructiveBtn:    { width: '100%', backgroundColor: 'rgba(158,90,90,0.18)', borderWidth: 1, borderColor: 'rgba(158,90,90,0.45)', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 12 },
  destructiveBtnText:{ fontFamily: 'Fungis-Bold', fontSize: 15, color: '#D4918F', letterSpacing: 0.3 },
  ghostBtn:      { width: '100%', borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  ghostBtnText:  { fontFamily: 'Fungis-Regular', fontSize: 14, color: 'rgba(255,255,255,0.40)' },
});
