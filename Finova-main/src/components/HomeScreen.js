import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { lightColors, darkColors, spacing, radius } from '../theme/theme';
import DonutChart from '../components/DonutChart';
import TransactionItem from '../components/TransactionItem';
import { getCat } from '../data/categories';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function HomeScreen({ navigation }) {
  const { transactions, settings } = useApp();
  const colors = settings.darkMode ? darkColors : lightColors;
  const cur    = settings.currency;
  const now    = new Date();
  const fmt    = n => `${cur}${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
  const s      = makeStyles(colors);

  // ── Current month only ─────────────────────────────────────────────────────
  const monthTxns    = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalIncome  = monthTxns.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const totalExpense = monthTxns.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const balance      = totalIncome - totalExpense;

  const spendablePct = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;
  const pctLabel     = `${spendablePct >= 0 ? '+' : ''}${spendablePct}%`;
  const badgeBg      = spendablePct >= 0 ? colors.accentDark : colors.wineRed;

  // ── Donut data — current month, custom categories ──────────────────────────
  const catMap = {};
  monthTxns.filter(t => t.type === 'expense').forEach(t => {
    const key = (t.category === 'others' && t.customCategory && t.customCategory.trim())
      ? 'custom_' + t.customCategory.trim().toLowerCase() : t.category;
    if (!catMap[key]) {
      const cat = getCat(t.category);
      catMap[key] = {
        label: (t.category === 'others' && t.customCategory && t.customCategory.trim())
          ? t.customCategory.trim() : cat.label,
        color: cat.color,
        value: 0,
      };
    }
    catMap[key].value += t.amount;
  });
  const donutData  = Object.values(catMap).sort((a, b) => b.value - a.value);
  const donutTotal = donutData.reduce((a, d) => a + d.value, 0);

  const recent   = transactions.slice(0, 5);
  const hour     = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>{greeting} 👋</Text>
            <Text style={s.username}>{settings.name || 'User'}</Text>
          </View>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{(settings.name || 'U')[0].toUpperCase()}</Text>
          </View>
        </View>

        {/* Wallet Card */}
        <View style={s.walletCard}>
          <View style={s.walletTop}>
            <Text style={s.walletLabel}>Wallet Balance</Text>
            <View style={[s.badge, { backgroundColor: badgeBg }]}>
              <Text style={s.badgeText}>{pctLabel}</Text>
            </View>
          </View>
          <Text style={s.balanceAmount}>{balance < 0 ? '-' : ''}{fmt(balance)}</Text>
          <Text style={s.walletDate}>{MONTHS[now.getMonth()]} {now.getFullYear()} · this month</Text>
          <View style={s.subRow}>
            <View style={s.subItem}>
              <Text style={s.subLabel}>Expense</Text>
              <Text style={[s.subAmount, { color: colors.expense }]}>{fmt(totalExpense)}</Text>
            </View>
            <View style={s.subDivider} />
            <View style={s.subItem}>
              <Text style={s.subLabel}>Income</Text>
              <Text style={[s.subAmount, { color: colors.income }]}>{fmt(totalIncome)}</Text>
            </View>
          </View>
        </View>

        {/* Donut Chart */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Expense Breakdown</Text>
          <Text style={s.sectionSub}>{MONTHS[now.getMonth()]} {now.getFullYear()}</Text>
          <View style={s.chartWrap}>
            <DonutChart
              data={donutData}
              size={220}
              strokeWidth={46}
              centerLabel={MONTHS[now.getMonth()]}
              centerAmount={fmt(totalExpense)}
              currency={cur}
            />
          </View>

          {donutData.length === 0
            ? <Text style={s.empty}>No expenses this month.</Text>
            : (
              <View style={s.legend}>
                {donutData.map((d, i) => {
                  const pct = donutTotal > 0 ? Math.round((d.value / donutTotal) * 100) : 0;
                  return (
                    <View key={i} style={s.legendItem}>
                      <View style={[s.legendDot, { backgroundColor: d.color }]} />
                      <Text style={s.legendLabel}>
                        {d.label}{' '}
                        <Text style={[s.legendPct, { color: d.color }]}>{pct}%</Text>
                      </Text>
                    </View>
                  );
                })}
              </View>
            )
          }
        </View>

        {/* Recent Transactions */}
        <View style={s.txnSection}>
          <Text style={s.sectionTitle}>Recent Transactions</Text>
          <View style={{ marginTop: spacing.sm }}>
            {recent.length === 0
              ? <Text style={s.empty}>No transactions yet. Tap + to add one.</Text>
              : recent.map(t => (
                  <TransactionItem key={t.id} transaction={t} currency={cur} colors={colors} />
                ))
            }
          </View>
        </View>

      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={() => navigation.navigate('AddTransaction')} activeOpacity={0.85}>
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bg },
  scroll:  { flex: 1 },
  content: { padding: spacing.md, paddingTop: 60, paddingBottom: 110 },

  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  greeting:   { fontSize: 13, color: colors.textMuted },
  username:   { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  avatar:     { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 17, fontWeight: '700', color: colors.activePill },

  walletCard:    { backgroundColor: colors.accent, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg },
  walletTop:     { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  walletLabel:   { fontSize: 13, color: colors.activePill, fontWeight: '600' },
  badge:         { borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3, marginLeft: 8 },
  badgeText:     { color: '#fff', fontSize: 10, fontWeight: '800' },
  balanceAmount: { fontSize: 42, fontWeight: '800', color: colors.activePill, marginBottom: 4 },
  walletDate:    { fontSize: 11, color: colors.accentDark, opacity: 0.7, marginBottom: spacing.md },

  subRow:     { flexDirection: 'row', backgroundColor: colors.surface2, borderRadius: radius.lg, padding: spacing.md },
  subItem:    { flex: 1, alignItems: 'center' },
  subLabel:   { fontSize: 12, color: colors.textMuted },
  subAmount:  { fontSize: 16, fontWeight: '700', marginTop: 4 },
  subDivider: { width: 1, backgroundColor: colors.border },

  card:       { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg },
  sectionSub: { fontSize: 11, color: colors.textMuted, marginTop: 2, marginBottom: 4 },
  chartWrap:  { alignItems: 'center', paddingVertical: spacing.md },

  legend:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: '45%' },
  legendDot:  { width: 9, height: 9, borderRadius: 5 },
  legendLabel:{ fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  legendPct:  { fontSize: 12, fontWeight: '800' },

  txnSection:   { marginBottom: spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  empty:        { color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 24 },

  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: colors.accentDark,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8,
  },
  fabText: { color: colors.accent, fontSize: 30, lineHeight: 34 },
});
