// src/screens/WalletsScreen.js
// Finova v3.0 — Wallet manager: create, switch, archive, delete wallets

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Modal, Alert, Animated, Dimensions, BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { lightColors, darkColors, spacing, radius, fonts } from '../theme/theme';

const SCREEN_H    = Dimensions.get('window').height;
const WALLET_ICONS = ['💳','💼','✈️','🏖️','🚗','🏠','🎓','💊','🛒','🎉','⚽','🍜','🎸','📱','🌍'];

// ── Rename Modal ──────────────────────────────────────────────────────────────
function RenameModal({ visible, wallet, onCancel, onSave, colors }) {
  const [name, setName] = useState('');
  useEffect(() => { if (visible && wallet) setName(wallet.name); }, [visible, wallet]);
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onCancel}>
      <View style={cm.backdrop}>
        <View style={cm.sheet}>
          <View style={cm.handle} />
          <Text style={cm.title}>Rename Wallet</Text>
          <TextInput
            style={cm.input}
            value={name}
            onChangeText={setName}
            placeholder="Wallet name"
            placeholderTextColor="rgba(255,255,255,0.30)"
            autoFocus
            maxLength={24}
          />
          <TouchableOpacity
            style={[cm.primaryBtn, { opacity: name.trim() ? 1 : 0.4 }]}
            onPress={() => name.trim() && onSave(name.trim())}
            disabled={!name.trim()}
          >
            <Text style={cm.primaryBtnText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cm.ghostBtn} onPress={onCancel}>
            <Text style={cm.ghostBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── New Wallet Modal ──────────────────────────────────────────────────────────
function NewWalletModal({ visible, onCancel, onCreate }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💼');
  useEffect(() => { if (!visible) { setName(''); setIcon('💼'); } }, [visible]);
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onCancel}>
      <View style={cm.backdrop}>
        <View style={cm.sheet}>
          <View style={cm.handle} />
          <Text style={cm.title}>New Wallet</Text>
          <Text style={cm.subtitle}>Give it a name and pick an icon</Text>

          <TextInput
            style={cm.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Kerala Trip, Work, Savings…"
            placeholderTextColor="rgba(255,255,255,0.30)"
            autoFocus
            maxLength={24}
          />

          <Text style={cm.iconPickerLabel}>ICON</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 2, paddingVertical: 4 }}>
              {WALLET_ICONS.map(ic => (
                <TouchableOpacity
                  key={ic}
                  style={[cm.iconChip, ic === icon && cm.iconChipActive]}
                  onPress={() => setIcon(ic)}
                >
                  <Text style={{ fontSize: 22 }}>{ic}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[cm.primaryBtn, { opacity: name.trim() ? 1 : 0.4 }]}
            onPress={() => name.trim() && onCreate(name.trim(), icon)}
            disabled={!name.trim()}
          >
            <Text style={cm.primaryBtnText}>Create Wallet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cm.ghostBtn} onPress={onCancel}>
            <Text style={cm.ghostBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function WalletsScreen({ navigation }) {
  const {
    wallets, activeWalletId, switchWallet, addWallet,
    renameWallet, deleteWallet, archiveWallet, unarchiveWallet,
    transactions, settings, isPro,
  } = useApp();
  const colors = settings.darkMode ? darkColors : lightColors;
  const s = makeStyles(colors);

  const [newModalOpen,    setNewModalOpen   ] = useState(false);
  const [renameTarget,    setRenameTarget   ] = useState(null);
  const [showArchived,    setShowArchived   ] = useState(false);
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      damping: 26,
      stiffness: 240,
      mass: 0.9,
    }).start();

    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose();
      return true;
    });
    return () => sub.remove();
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


  const active   = (wallets || []).filter(w => !w.archived);
  const archived = (wallets || []).filter(w =>  w.archived);

  const txnCount = (walletId) =>
    transactions.filter(t => (t.walletId || 'default') === walletId).length;

  const handleSwitch = (id) => {
    switchWallet(id);
    handleClose();
  };

  const handleCreate = (name, icon) => {
    const result = addWallet(name, icon);
    if (result === 'requires_pro') {
      setNewModalOpen(false);
      navigation.navigate('ProPaywall');
      return;
    }
    setNewModalOpen(false);
  };

  const handleRename = (name) => {
    if (renameTarget) renameWallet(renameTarget.id, name);
    setRenameTarget(null);
  };

  const handleDelete = (wallet) => {
    if (wallet.id === 'default') return;
    const count = txnCount(wallet.id);
    Alert.alert(
      `Delete "${wallet.name}"?`,
      count > 0
        ? `This wallet has ${count} transaction${count > 1 ? 's' : ''}. They will be moved to Personal.`
        : 'This wallet is empty.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteWallet(wallet.id) },
      ]
    );
  };

  const handleArchive = (wallet) => {
    archiveWallet(wallet.id);
  };

  return (
    <SafeAreaView style={s.safe}>
      <Animated.View style={{flex: 1, transform: [{ translateY: slideAnim }]}}>
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={() => handleClose()} activeOpacity={0.7} style={s.backBtn}>
              <Text style={s.backText}>←</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>Wallets</Text>
              <Text style={s.subtitle}>Switch context · Your data follows.</Text>
            </View>
          </View>

          {/* Active wallet context hint */}
          {activeWalletId !== 'default' && (
            <View style={s.activeBanner}>
              <Text style={s.activeBannerText}>
                📊  All screens are showing{' '}
                <Text style={s.activeBannerName}>
                  {wallets?.find(w => w.id === activeWalletId)?.name || 'this wallet'}
                </Text>
                {' '}data
              </Text>
              <TouchableOpacity onPress={() => handleSwitch('default')}>
                <Text style={s.activeBannerBack}>Back to Personal</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Wallet list */}
          <Text style={s.sectionLabel}>YOUR WALLETS</Text>
          <View style={s.card}>
            {active.map((wallet, i) => {
              const isActive = wallet.id === activeWalletId;
              const count    = txnCount(wallet.id);
              const isLast   = i === active.length - 1;
              return (
                <TouchableOpacity
                  key={wallet.id}
                  style={[s.walletRow, isActive && s.walletRowActive, isLast && { borderBottomWidth: 0 }]}
                  onPress={() => handleSwitch(wallet.id)}
                  activeOpacity={0.78}
                >
                  <View style={[s.walletIconBox, isActive && s.walletIconBoxActive]}>
                    <Text style={s.walletIcon}>{wallet.icon}</Text>
                  </View>
                  <View style={s.walletInfo}>
                    <Text style={[s.walletName, isActive && s.walletNameActive]}>{wallet.name}</Text>
                    <Text style={s.walletCount}>{count} transaction{count !== 1 ? 's' : ''}</Text>
                  </View>
                  {isActive
                    ? <View style={s.activePill}><Text style={s.activePillText}>Active</Text></View>
                    : (
                      <View style={s.walletActions}>
                        {wallet.id !== 'default' && (
                          <>
                            <TouchableOpacity style={s.actionBtn} onPress={() => setRenameTarget(wallet)} activeOpacity={0.6}>
                              <Text style={s.actionBtnText}>✏️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={s.actionBtn} onPress={() => handleArchive(wallet)} activeOpacity={0.6}>
                              <Text style={s.actionBtnText}>📦</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={s.actionBtn} onPress={() => handleDelete(wallet)} activeOpacity={0.6}>
                              <Text style={[s.actionBtnText, { color: colors.expense }]}>🗑️</Text>
                            </TouchableOpacity>
                          </>
                        )}
                        <Text style={s.rowChevron}>›</Text>
                      </View>
                    )
                  }
                </TouchableOpacity>
              );
            })}
          </View>

          {/* New wallet button */}
          <TouchableOpacity
            style={s.newBtn}
            onPress={() => isPro ? setNewModalOpen(true) : navigation.navigate('ProPaywall')}
            activeOpacity={0.82}
          >
            <Text style={s.newBtnIcon}>＋</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.newBtnText}>New Wallet</Text>
              {!isPro && <Text style={s.newBtnHint}>🔒 Pro feature</Text>}
            </View>
          </TouchableOpacity>

          {/* Archived wallets */}
          {archived.length > 0 && (
            <>
              <TouchableOpacity style={s.archivedHeader} onPress={() => setShowArchived(v => !v)} activeOpacity={0.7}>
                <Text style={s.sectionLabel}>ARCHIVED  ({archived.length})</Text>
                <Text style={s.chevron}>{showArchived ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showArchived && (
                <View style={s.card}>
                  {archived.map((wallet, i) => {
                    const count  = txnCount(wallet.id);
                    const isLast = i === archived.length - 1;
                    return (
                      <View key={wallet.id} style={[s.walletRow, isLast && { borderBottomWidth: 0 }]}>
                        <View style={s.walletIconBox}>
                          <Text style={[s.walletIcon, { opacity: 0.45 }]}>{wallet.icon}</Text>
                        </View>
                        <View style={s.walletInfo}>
                          <Text style={[s.walletName, { color: colors.textMuted }]}>{wallet.name}</Text>
                          <Text style={s.walletCount}>{count} transaction{count !== 1 ? 's' : ''} · Archived</Text>
                        </View>
                        <View style={s.walletActions}>
                          <TouchableOpacity style={s.actionBtn} onPress={() => unarchiveWallet(wallet.id)} activeOpacity={0.6}>
                            <Text style={s.actionBtnText}>♻️</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={s.actionBtn} onPress={() => handleDelete(wallet)} activeOpacity={0.6}>
                            <Text style={[s.actionBtnText, { color: colors.expense }]}>🗑️</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          )}

<Text style={s.footnote}>
  Long-press any wallet row to rename it.
</Text>
<Text style={s.footnote}>
  Archived wallets keep their transactions but are hidden from the active view.
</Text>

        </ScrollView>
      </Animated.View>

      <NewWalletModal
        visible={newModalOpen}
        onCancel={() => setNewModalOpen(false)}
        onCreate={handleCreate}
      />
      <RenameModal
        visible={!!renameTarget}
        wallet={renameTarget}
        onCancel={() => setRenameTarget(null)}
        onSave={handleRename}
        colors={colors}
      />
    </SafeAreaView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bg, paddingTop: -50, paddingBottom: -100 },
  content: { padding: spacing.md, paddingTop: 50, paddingBottom: 120 },

  header:   { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: spacing.lg },
  backBtn:  { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  backText: { fontFamily: fonts.bold, fontSize: 18, color: colors.textPrimary },
  title:    { fontFamily: fonts.heavy,   fontSize: 26, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: 2 },

  activeBanner:     { backgroundColor: colors.accentDark + '22', borderWidth: 1, borderColor: colors.accentDark + '55', borderRadius: 12, padding: 14, marginBottom: spacing.lg },
  activeBannerText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textPrimary, lineHeight: 20 },
  activeBannerName: { fontFamily: fonts.bold, color: colors.accent },
  activeBannerBack: { fontFamily: fonts.bold, fontSize: 12, color: colors.accent, marginTop: 8 },

  sectionLabel: { fontFamily: fonts.bold, fontSize: 11, color: colors.textMuted, letterSpacing: 1, marginBottom: 10 },
  card:         { backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: spacing.lg, overflow: 'hidden' },

  walletRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 },
  walletRowActive: { backgroundColor: colors.accent + '18' },
  walletIconBox:       { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  walletIconBoxActive: { backgroundColor: colors.accent + '33' },
  walletIcon:   { fontSize: 22 },
  walletInfo:   { flex: 1 },
  walletName:   { fontFamily: fonts.bold, fontSize: 15, color: colors.textPrimary },
  walletNameActive: { color: colors.accentDark },
  walletCount:  { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: 2 },

  activePill:     { backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  activePillText: { fontFamily: fonts.bold, fontSize: 10, color: colors.activePill ?? '#fff' },

  walletActions:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBtn:      { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  actionBtnText:  { fontSize: 16 },
  rowChevron:     { fontFamily: fonts.bold, fontSize: 16, color: colors.textMuted, marginLeft: 4 },

  newBtn:     { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, borderWidth: 1.5, borderColor: colors.accent, borderStyle: 'dashed', marginBottom: spacing.lg },
  newBtnIcon: { fontFamily: fonts.heavy, fontSize: 22, color: colors.accent, width: 30, textAlign: 'center' },
  newBtnText: { fontFamily: fonts.bold, fontSize: 15, color: colors.accent },
  newBtnHint: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: 2 },

  archivedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  chevron:        { fontFamily: fonts.bold, fontSize: 10, color: colors.textMuted },

  footnote: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 18, marginTop: 4 },
});

const cm = StyleSheet.create({
  backdrop:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', justifyContent: 'flex-end' },
  sheet:     { backgroundColor: '#2C3020', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingBottom: 32, borderWidth: 1, borderColor: 'rgba(174,183,132,0.18)', borderBottomWidth: 0 },
  handle:    { width: 38, height: 4, borderRadius: 2, backgroundColor: 'rgba(174,183,132,0.35)', alignSelf: 'center', marginTop: 12, marginBottom: 24 },
  title:     { fontFamily: 'Fungis-Heavy', fontSize: 20, color: '#FFFFFF', marginBottom: 6 },
  subtitle:  { fontFamily: 'Fungis-Regular', fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 20 },
  input:     { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontFamily: 'Fungis-Bold', fontSize: 15, color: '#FFFFFF', marginBottom: 18, borderWidth: 1, borderColor: 'rgba(174,183,132,0.20)' },
  iconPickerLabel: { fontFamily: 'Fungis-Bold', fontSize: 10, color: 'rgba(255,255,255,0.40)', letterSpacing: 1, marginBottom: 10 },
  iconChip:       { width: 46, height: 46, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(174,183,132,0.12)' },
  iconChipActive: { backgroundColor: 'rgba(174,183,132,0.20)', borderColor: 'rgba(174,183,132,0.60)' },
  primaryBtn:     { backgroundColor: '#AEB784', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 12 },
  primaryBtnText: { fontFamily: 'Fungis-Bold', fontSize: 15, color: '#222629' },
  ghostBtn:       { borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  ghostBtnText:   { fontFamily: 'Fungis-Regular', fontSize: 14, color: 'rgba(255,255,255,0.40)' },
});
