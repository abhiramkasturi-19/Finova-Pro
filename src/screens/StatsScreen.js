import React, { useMemo, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Dimensions, Animated,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Text as SvgText } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { lightColors, darkColors, spacing, radius, fonts } from '../theme/theme';
import { getCat } from '../data/categories';

const { width: SCREEN_W } = Dimensions.get('window');
const FILTERS = ['Week', 'Month', '3 Month', '6 Month', 'Year'];
const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ─── Animated pill — spring scale on press ────────────────────────────────────
function AnimPill({ onPress, isActive, style, activeStyle, textStyle, activeTextStyle, children }) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn  = () => Animated.spring(scale, { toValue: 0.88, useNativeDriver: true, speed: 60, bounciness: 0 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 30, bounciness: 8 }).start();

  return (
    <TouchableOpacity onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} activeOpacity={1}>
      <Animated.View style={[style, isActive && activeStyle, { transform: [{ scale }] }]}>
        <Text style={[textStyle, isActive && activeTextStyle]}>{children}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── Dual Area / Line Chart ────────────────────────────────────────────────────
function DualLineChart({ incomePoints, expensePoints, width, height = 200, colors }) {
  const pad = { top: 10, right: 25, bottom: 36, left: 30 };
  const W = width - pad.left - pad.right;
  const H = height - pad.top - pad.bottom;

  const allVals = [...incomePoints.map(p => p.v), ...expensePoints.map(p => p.v), 0];
  const maxV    = Math.max(...allVals, 1);
  const n       = Math.max(incomePoints.length, 1);

  const toX = i => pad.left + (i / Math.max(n - 1, 1)) * W;
  const toY = v => pad.top + H - (v / maxV) * H;

  const buildPath = pts =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(p.v).toFixed(1)}`).join(' ');

  const buildArea = pts => {
    if (pts.length < 2) return '';
    return `${buildPath(pts)} L ${toX(pts.length - 1).toFixed(1)} ${(pad.top + H).toFixed(1)} L ${pad.left.toFixed(1)} ${(pad.top + H).toFixed(1)} Z`;
  };

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(t => ({
    y:     pad.top + H * (1 - t),
    label: Math.round(maxV * t) >= 1000
      ? `${(Math.round(maxV * t) / 1000).toFixed(1)}k`
      : `${Math.round(maxV * t)}`,
  }));

  const incPath = buildPath(incomePoints);
  const expPath = buildPath(expensePoints);
  const incArea = buildArea(incomePoints);
  const expArea = buildArea(expensePoints);
  const labelStep = Math.max(1, Math.ceil(n / 10));

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"   stopColor={colors.income}  stopOpacity="0.4" />
          <Stop offset="100%" stopColor={colors.income}  stopOpacity="0"   />
        </LinearGradient>
        <LinearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"   stopColor={colors.expense} stopOpacity="0.4" />
          <Stop offset="100%" stopColor={colors.expense} stopOpacity="0"   />
        </LinearGradient>
      </Defs>
      {gridLines.map((g, i) => (
        <React.Fragment key={i}>
          <Line x1={pad.left} y1={g.y} x2={pad.left + W} y2={g.y} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <SvgText x={pad.left - 4} y={g.y + 4} textAnchor="end" fontSize={8} fill="rgba(255,255,255,0.5)" fontFamily={fonts.regular}>{g.label}</SvgText>
        </React.Fragment>
      ))}
      {incArea && <Path d={incArea} fill="url(#incGrad)" />}
      {expArea && <Path d={expArea} fill="url(#expGrad)" />}
      {incPath && <Path d={incPath} stroke={colors.income}  strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {expPath && <Path d={expPath} stroke={colors.expense} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {incomePoints.map((p, i)  => i % labelStep === 0 && <Circle key={`ic${i}`} cx={toX(i)} cy={toY(p.v)} r="3" fill={colors.income}  stroke="#111" strokeWidth="1.5" />)}
      {expensePoints.map((p, i) => i % labelStep === 0 && <Circle key={`ec${i}`} cx={toX(i)} cy={toY(p.v)} r="3" fill={colors.expense} stroke="#111" strokeWidth="1.5" />)}
      {incomePoints.map((p, i)  => i % labelStep === 0 && (
        <SvgText key={i} x={toX(i)} y={pad.top + H + 22} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.6)" fontFamily={fonts.regular}>{p.label}</SvgText>
      ))}
    </Svg>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function StatsScreen() {
  const { transactions, settings, customCategories } = useApp();
  const colors = settings.darkMode ? darkColors : lightColors;
  const [activeFilter, setActiveFilter] = useState('Month');
  const [viewYear,     setViewYear]     = useState(new Date().getFullYear());
  const [tooltipId,    setTooltipId]    = useState(null);
  const cur = settings.currency;
  const fmt = n => `${cur}${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
  const now = new Date();
  const s   = makeStyles(colors);

  const filtered = useMemo(() => transactions.filter(t => {
    const d = new Date(t.date);
    switch (activeFilter) {
      case 'Week':    return (now - d) / 86400000 <= 7;
      case 'Month':   return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      case '3 Month': return (now - d) / 86400000 <= 90;
      case '6 Month': return (now - d) / 86400000 <= 180;
      case 'Year':    return d.getFullYear() === viewYear;
      default:        return true;
    }
  }), [transactions, activeFilter, viewYear]);

  const totalInc = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExp = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance  = totalInc - totalExp;

  const catMap = useMemo(() => {
    const map = {};
    filtered.filter(t => t.type === 'expense').forEach(t => {
      const isCustom = (t.category === 'others' && t.customCategory?.trim());
      const key = isCustom ? 'custom_' + t.customCategory.trim().toLowerCase() : t.category;
      if (!map[key]) {
        const cat = getCat(t.category);
        let label = cat.label, color = cat.color, emoji = cat.emoji;
        if (isCustom) {
          label = t.customCategory.trim();
          const saved = (customCategories.expense || []).find(c => c.name.toLowerCase() === label.toLowerCase());
          if (saved) color = saved.color;
        }
        map[key] = { id: key, label, color, emoji, value: 0 };
      }
      map[key].value += t.amount;
    });
    return map;
  }, [filtered, customCategories]);

  const barData = Object.values(catMap).sort((a, b) => b.value - a.value);

  const buildPoints = (type) => {
    if (activeFilter === 'Week') {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (6 - i));
        const v = transactions
          .filter(t => t.type === type && new Date(t.date).toDateString() === d.toDateString())
          .reduce((s, t) => s + t.amount, 0);
        return { label: ['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()], v };
      });
    }
    if (activeFilter === 'Month') {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const v = transactions
          .filter(t => {
            const d = new Date(t.date);
            return t.type === type && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === day;
          })
          .reduce((s, t) => s + t.amount, 0);
        return { label: day % 5 === 1 ? `${day}` : '', v };
      });
    }
    if (activeFilter === '3 Month') {
      return Array.from({ length: 3 }, (_, i) => {
        const mo    = now.getMonth() - (2 - i);
        const adjMo = ((mo % 12) + 12) % 12;
        const adjYr = now.getFullYear() + Math.floor(mo / 12);
        const v = transactions
          .filter(t => t.type === type && new Date(t.date).getMonth() === adjMo && new Date(t.date).getFullYear() === adjYr)
          .reduce((s, t) => s + t.amount, 0);
        return { label: MONTHS[adjMo], v };
      });
    }
    if (activeFilter === '6 Month') {
      return Array.from({ length: 6 }, (_, i) => {
        const mo    = now.getMonth() - (5 - i);
        const adjMo = ((mo % 12) + 12) % 12;
        const adjYr = now.getFullYear() + Math.floor(mo / 12);
        const v = transactions
          .filter(t => t.type === type && new Date(t.date).getMonth() === adjMo && new Date(t.date).getFullYear() === adjYr)
          .reduce((s, t) => s + t.amount, 0);
        return { label: MONTHS[adjMo], v };
      });
    }
    return Array.from({ length: 12 }, (_, i) => {
      const v = transactions
        .filter(t => t.type === type && new Date(t.date).getMonth() === i && new Date(t.date).getFullYear() === viewYear)
        .reduce((s, t) => s + t.amount, 0);
      return { label: MONTHS[i], v };
    });
  };

  const incomePoints  = buildPoints('income');
  const expensePoints = buildPoints('expense');
  const chartWidth    = SCREEN_W - spacing.md * 2 - 24;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <Text style={s.headerTitle}>Statistic</Text>

          {activeFilter === 'Year' ? (
            <View style={s.yearRow}>
              <TouchableOpacity onPress={() => setViewYear(y => y - 1)} style={s.yearBtn}>
                <Text style={s.yearArrow}>‹</Text>
              </TouchableOpacity>
              <Text style={s.yearLabel}>{viewYear}</Text>
              <TouchableOpacity
                onPress={() => setViewYear(y => Math.min(y + 1, now.getFullYear()))}
                style={s.yearBtn}
              >
                <Text style={s.yearArrow}>›</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={s.headerSub}>Updated: {now.toLocaleDateString('en-IN')}</Text>
          )}

          {/* ── Filter pills — animated ── */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
            {FILTERS.map(f => (
              <AnimPill
                key={f}
                isActive={activeFilter === f}
                onPress={() => setActiveFilter(f)}
                style={s.pill}
                activeStyle={s.pillActive}
                textStyle={s.pillText}
                activeTextStyle={s.pillTextActive}
              >
                {f}
              </AnimPill>
            ))}
          </ScrollView>

          <View style={s.chartCard}>
            <View style={s.chartLegend}>
              <View style={s.chartLegendItem}>
                <View style={[s.legendLine, { backgroundColor: colors.income  }]} />
                <Text style={s.legendLineLabel}>Income</Text>
              </View>
              <View style={s.chartLegendItem}>
                <View style={[s.legendLine, { backgroundColor: colors.expense }]} />
                <Text style={s.legendLineLabel}>Spent</Text>
              </View>
            </View>
            <DualLineChart
              incomePoints={incomePoints}
              expensePoints={expensePoints}
              width={chartWidth}
              height={200}
              colors={colors}
            />
          </View>
        </View>

        <View style={s.body}>
          <View style={s.summaryRow}>
            <View style={s.summaryPill}>
              <Text style={[s.summaryVal, { color: colors.income  }]}>{fmt(totalInc)}</Text>
              <Text style={s.summaryLabel}>Income</Text>
            </View>
            <View style={s.summaryPill}>
              <Text style={[s.summaryVal, { color: colors.expense }]}>{fmt(totalExp)}</Text>
              <Text style={s.summaryLabel}>Expenses</Text>
            </View>
            <View style={s.summaryPill}>
              <Text style={[s.summaryVal, { color: balance >= 0 ? colors.income : colors.expense }]}>{fmt(balance)}</Text>
              <Text style={s.summaryLabel}>Balance</Text>
            </View>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Category Breakdown</Text>
            {barData.length === 0
              ? <Text style={s.empty}>No expense data for this period.</Text>
              : barData.map((b, i) => {
                  const pct    = totalExp > 0 ? (b.value / totalExp) * 100 : 0;
                  const isOpen = tooltipId === b.id;
                  return (
                    <View key={i}>
                      <View style={s.barRow}>
                        <TouchableOpacity
                          style={s.emojiWrap}
                          onPress={() => setTooltipId(isOpen ? null : b.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={s.barEmoji}>{b.emoji}</Text>
                        </TouchableOpacity>
                        <View style={s.barTrack}>
                          <View style={[s.barFill, { width: `${pct}%`, backgroundColor: b.color }]} />
                        </View>
                        <Text style={s.barVal}>{fmt(b.value)}</Text>
                      </View>
                      {isOpen && (
                        <View style={[s.tooltip, { borderLeftColor: b.color }]}>
                          <Text style={[s.tooltipText, { color: b.color }]}>{b.label}</Text>
                          <Text style={s.tooltipPct}>{pct.toFixed(1)}% of total expenses</Text>
                        </View>
                      )}
                    </View>
                  );
                })
            }
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header:      { backgroundColor: colors.accent, padding: spacing.lg, paddingTop: 60, paddingBottom: 36 },
  headerTitle: { fontSize: 26, color: colors.activePill, fontFamily: fonts.heavy },
  headerSub:   { fontSize: 12, color: colors.activePill, opacity: 0.7, marginBottom: spacing.md, fontFamily: fonts.regular },

  yearRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: 12 },
  yearBtn:   { padding: 4 },
  yearArrow: { fontSize: 22, color: colors.activePill, fontFamily: fonts.bold },
  yearLabel: { fontSize: 18, color: colors.activePill, fontFamily: fonts.heavy },

  pill:           { borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 9, backgroundColor: 'rgba(0,0,0,0.12)', marginRight: 8 },
  pillActive:     { backgroundColor: colors.activePill },
  pillText:       { fontSize: 12, color: colors.activePill, fontFamily: fonts.bold },
  pillTextActive: { color: colors.accent },

  chartCard:       { backgroundColor: '#1a1f2e', borderRadius: radius.lg, padding: 15, marginTop: 5 },
  chartLegend:     { flexDirection: 'row', gap: 16, marginBottom: 8, paddingLeft: 70 },
  chartLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendLine:      { width: 20, height: 3, borderRadius: 2 },
  legendLineLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: fonts.bold },

  body: { backgroundColor: colors.bg, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, marginTop: -20, padding: spacing.lg },

  summaryRow:   { flexDirection: 'row', gap: 10, marginBottom: spacing.lg },
  summaryPill:  { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, alignItems: 'center' },
  summaryVal:   { fontSize: 14, fontFamily: fonts.bold },
  summaryLabel: { fontSize: 10, color: colors.textMuted, marginTop: 3, fontFamily: fonts.regular },

  card:     { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg },
  cardTitle:{ fontSize: 14, color: colors.textPrimary, marginBottom: spacing.md, fontFamily: fonts.heavy },

  barRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  emojiWrap: { width: 28, alignItems: 'center' },
  barEmoji:  { fontSize: 18 },
  barTrack:  { flex: 1, height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  barFill:   { height: '100%', borderRadius: 4 },
  barVal:    { fontSize: 11, color: colors.textMuted, width: 55, textAlign: 'right', fontFamily: fonts.regular },

  tooltip:     { marginLeft: 36, marginBottom: 8, marginTop: -4, paddingLeft: 10, borderLeftWidth: 3, borderRadius: 2 },
  tooltipText: { fontSize: 13, fontFamily: fonts.bold },
  tooltipPct:  { fontSize: 11, color: colors.textMuted, marginTop: 1, fontFamily: fonts.regular },

  empty: { color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 16, fontFamily: fonts.regular },
});
