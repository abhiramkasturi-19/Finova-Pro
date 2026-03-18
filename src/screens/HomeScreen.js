import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { lightColors, darkColors, spacing, radius, fonts } from '../theme/theme';
import DonutChart from '../components/DonutChart';
import TransactionItem from '../components/TransactionItem';
import { getCat } from '../data/categories';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function HomeScreen({ navigation }) {
  const { transactions, settings, customCategories } = useApp();
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

  // ── Donut data ─────────────────────────────────────────────────────────────
  const catMap = {};
  monthTxns.filter(t => t.type === 'expense').forEach(t => {
    const isCustom = t.category === 'others' && t.customCategory && t.customCategory.trim();
    const key = isCustom ? 'custom_' + t.customCategory.trim().toLowerCase() : t.category;
    if (!catMap[key]) {
      const cat = getCat(t.category);
      let color = cat.color;
      let label = cat.label;
      if (isCustom) {
        label = t.customCategory.trim();
        const saved = (customCategories.expense || []).find(c => c.name.toLowerCase() === label.toLowerCase());
        if (saved) color = saved.color;
      }
      catMap[key] = { label, color, value: 0 };
    }
    catMap[key].value += t.amount;
  });
  const donutData  = Object.values(catMap).sort((a, b) => b.value - a.value);
  const donutTotal = donutData.reduce((a, d) => a + d.value, 0);

  const recent   = transactions.slice(0, 5);
  const hour     = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Avatar: profile image if set, otherwise first letter
  const profileImage = settings.profileImage || '';
  const initials     = (settings.name || 'U')[0].toUpperCase();

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>{greeting} 👋</Text>
            <Text style={s.username}>{settings.name || 'User'}</Text>
          </View>
          {/* Profile avatar — photo if available, initial otherwise */}
          <View style={s.avatarWrap}>
            {profileImage
              ? <Image source={{ uri: profileImage }} style={s.avatarImg} />
              : <View style={s.avatarFallback}>
                  <Text style={s.avatarText}>{initials}</Text>
                </View>
            }
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
          <Text style={s.walletDate}>{MONTHS[now.getMonth()]}-{now.getFullYear().toString().slice(-2)} : Present Month</Text>
          <View style={s.subRow}>
            <View style={s.subItem}>
              <Text style={[s.subLabel, { color: colors.expense }]}>Expense</Text>
              <Text style={[s.subAmount, { color: colors.expense }]}>{fmt(totalExpense)}</Text>
            </View>
            <View style={s.subDivider} />
            <View style={s.subItem}>
              <Text style={[s.subLabel, { color: colors.income }]}>Income</Text>
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
              size={230}
              strokeWidth={46}
              centerAmount={fmt(totalExpense)}
              centerAmountColor={colors.expense}
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
                        {d.label}<Text style={[s.legendPct, { color: d.color }]}> {pct}%</Text>
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
      {/* FAB removed — + lives in the floating tab bar */}
    </SafeAreaView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bg },
  scroll:  { flex: 1 },
  content: { padding: spacing.md, paddingTop: 20, paddingBottom: 120 },

  // Header
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  greeting:     { fontSize: 15, color: colors.textMuted, fontFamily: fonts.regular },
  username:     { fontSize: 25, color: colors.textPrimary, fontFamily: fonts.heavy },

  // Avatar — circular, 44px
  avatarWrap:     { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  avatarImg:      { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText:     { fontSize: 17, color: colors.activePill, fontFamily: fonts.bold },

  // Wallet card
  walletCard:    { backgroundColor: colors.accent, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg },
  walletTop:     { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  walletLabel:   { fontSize: 13, color: colors.activePill, fontFamily: fonts.bold },
  badge:         { borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3, marginLeft: 8 },
  badgeText:     { color: '#fff', fontSize: 10, fontFamily: fonts.heavy },
  balanceAmount: { fontSize: 42, color: colors.activePill, marginBottom: 4, fontFamily: fonts.heavy },
  walletDate:    { fontSize: 11, color: colors.activePill, marginBottom: spacing.md, fontFamily: fonts.regular },

  subRow:     { flexDirection: 'row', backgroundColor: colors.bg, borderRadius: radius.lg, padding: spacing.md },
  subItem:    { flex: 1, alignItems: 'center' },
  subLabel:   { fontSize: 12, fontFamily: fonts.regular },
  subAmount:  { fontSize: 16, marginTop: 4, fontFamily: fonts.bold },
  subDivider: { width: 1, backgroundColor: colors.border },

  // Cards
  card:       { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg },
  sectionSub: { fontSize: 14, color: colors.textPrimary, marginTop: 2, marginBottom: 4, fontFamily: fonts.regular },
  chartWrap:  { alignItems: 'center', paddingVertical: spacing.md },

  legend:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: '45%' },
  legendDot:  { width: 9, height: 9, borderRadius: 5 },
  legendLabel:{ fontSize: 12, color: colors.textPrimary, fontFamily: fonts.bold },
  legendPct:  { fontSize: 12, fontFamily: fonts.heavy },

  txnSection:   { marginBottom: spacing.lg },
  sectionTitle: { fontSize: 20, color: colors.textPrimary, fontFamily: fonts.heavy },
  empty:        { color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 24, fontFamily: fonts.regular },
});
