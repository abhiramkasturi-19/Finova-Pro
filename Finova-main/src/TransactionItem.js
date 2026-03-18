import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCat } from '../data/categories';
import { lightColors, radius } from '../theme/theme';

const fmt = (n, sym = '₹') =>
  `${sym}${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const fmtDate = (d) => {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { month: '2-digit', day: '2-digit', year: 'numeric' });
};

export default function TransactionItem({ transaction, currency = '₹', colors = lightColors }) {
  const cat      = getCat(transaction.category);
  const isIncome = transaction.type === 'income';

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={[styles.icon, { backgroundColor: cat.color + '22' }]}>
        <Text style={styles.emoji}>{cat.emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.textPrimary }]}>{cat.label}</Text>
        <Text style={[styles.note, { color: colors.textMuted }]}>{transaction.note || 'No note'}</Text>
        <Text style={[styles.date, { color: colors.textMuted }]}>{fmtDate(transaction.date)}</Text>
      </View>
      <Text style={[styles.amount, { color: isIncome ? colors.income : colors.expense }]}>
        {isIncome ? '+' : '-'}{fmt(transaction.amount, currency)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  icon:   { width: 46, height: 46, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  emoji:  { fontSize: 20 },
  info:   { flex: 1 },
  name:   { fontSize: 14, fontWeight: '600' },
  note:   { fontSize: 11, marginTop: 1 },
  date:   { fontSize: 11, marginTop: 1 },
  amount: { fontSize: 14, fontWeight: '700' },
});
