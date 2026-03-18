import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCat } from '../data/categories';
import { lightColors, radius, fonts } from '../theme/theme';
import { useApp } from '../context/AppContext';

const fmt = (n, sym = '₹') =>
  `${sym}${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const fmtDate = (d) => {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { month: '2-digit', day: '2-digit', year: 'numeric' });
};

// Returns the display label for a transaction —
// if category is 'others' and customCategory exists, use that name instead
export const getDisplayLabel = (transaction) => {
  if (transaction.category === 'others' && transaction.customCategory?.trim()) {
    return transaction.customCategory.trim();
  }
  return getCat(transaction.category).label;
};

export default function TransactionItem({
  transaction,
  currency = '₹',
  colors = lightColors,
}) {
  const { customCategories } = useApp();
  const cat      = getCat(transaction.category);
  const isIncome = transaction.type === 'income';
  const label    = getDisplayLabel(transaction);

  let iconColor = cat.color;
  if (transaction.category === 'others' && transaction.customCategory?.trim()) {
    const saved = (customCategories[transaction.type] || []).find(c => c.name.toLowerCase() === transaction.customCategory.trim().toLowerCase());
    if (saved) iconColor = saved.color;
  }

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      {/* Icon box */}
      <View style={[styles.iconBox, { backgroundColor: iconColor + '22' }]}>
        <Text style={styles.emoji}>{cat.emoji}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.textPrimary }]}>{label}</Text>
        {/* If custom label differs from base category, show base in muted */}
        {transaction.category === 'others' && transaction.customCategory?.trim() && (
          <Text style={[styles.subLabel, { color: colors.textMuted }]}>Others</Text>
        )}
        <Text style={[styles.note, { color: colors.textMuted }]} numberOfLines={1}>
          {transaction.note || 'No note'}
        </Text>
        <Text style={[styles.date, { color: colors.textMuted }]}>
          {fmtDate(transaction.date)}
        </Text>
      </View>

      {/* Amount */}
      <View style={styles.amountWrap}>
        <Text style={[styles.amount, { color: isIncome ? colors.income : colors.expense }]}>
          {isIncome ? '+' : '-'}{fmt(transaction.amount, currency)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1 },
  iconBox:   { width: 46, height: 46, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  emoji:     { fontSize: 20 },
  info:      { flex: 1 },
  name:      { fontSize: 14, fontFamily: fonts.bold },
  subLabel:  { fontSize: 10, marginTop: 1, fontFamily: fonts.regular },
  note:      { fontSize: 11, marginTop: 1, fontFamily: fonts.regular },
  date:      { fontSize: 11, marginTop: 1, fontFamily: fonts.regular },
  amountWrap:{ alignItems: 'flex-end' },
  amount:    { fontSize: 14, fontFamily: fonts.bold },
});
