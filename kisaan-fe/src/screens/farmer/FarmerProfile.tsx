import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { useAuth } from '../../hooks/useAuth';
import { colors, typography, spacing } from '../../theme/designSystem';
import { Ionicons } from '@expo/vector-icons';

type SettingItem = { icon: string; title: string; onPress: () => void };

export default function FarmerProfile() {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const handleLogout = () => Alert.alert('Logout', 'Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Logout', style: 'destructive', onPress: logout }]);
  const SETTINGS: SettingItem[][] = [[{ icon: 'person', title: 'Farm Details', onPress: () => Alert.alert('Farm', 'Coming soon') }, { icon: 'star', title: 'My Ratings', onPress: () => Alert.alert('Ratings', 'Coming soon') }, { icon: 'wallet', title: 'Earnings', onPress: () => Alert.alert('Earnings', 'Coming soon') }], [{ icon: 'notifications', title: 'Notifications', onPress: () => Alert.alert('Notifications', 'Coming soon') }, { icon: 'language', title: 'Language', onPress: () => Alert.alert('Language', 'Coming soon') }], [{ icon: 'help', title: 'Help & Support', onPress: () => Alert.alert('Help', 'Coming soon') }, { icon: 'document', title: 'Terms & Conditions', onPress: () => Alert.alert('Terms', 'Coming soon') }]];

  const LogoutButton = () => (
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <Ionicons name="log-out" size={22} color={colors.error} />
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}><Ionicons name="leaf" size={40} color={colors.primary} /></View>
      <Text style={styles.userName}>{user?.name || 'Farmer'}</Text>
      <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
    </View>
  );

  const renderSection = ({ item, index }: { item: SettingItem[]; index: number }) => {
    const titles = ['', 'Preferences', 'About'];
    return (
      <View style={styles.section}>
        {titles[index] ? <Text style={styles.sectionHeader}>{titles[index]}</Text> : null}
        {item.map((settingItem, idx) => (
          <View key={idx}>
            <TouchableOpacity style={styles.settingItem} onPress={settingItem.onPress}>
              <View style={styles.settingLeft}><Ionicons name={settingItem.icon as any} size={22} color={colors.onSurface} /><Text style={styles.settingTitle}>{settingItem.title}</Text></View>
              <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceSecondary} />
            </TouchableOpacity>
            {idx < item.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </View>
    );
  };

  return <View style={styles.container}><FlatList data={SETTINGS} renderItem={renderSection} keyExtractor={(item, index) => index.toString()} ListHeaderComponent={ListHeader} ListFooterComponent={LogoutButton} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} /></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingBottom: spacing.xxl },
  profileHeader: { alignItems: 'center', paddingVertical: spacing.xl },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' },
  userName: { ...typography.title2, color: colors.onSurface, marginTop: spacing.md },
  userEmail: { ...typography.body, color: colors.onSurfaceSecondary, marginTop: spacing.xs },
  section: { marginBottom: spacing.lg },
  sectionHeader: { ...typography.footnote, color: colors.onSurfaceSecondary, textTransform: 'uppercase', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surfaceElevated, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  settingTitle: { ...typography.body, color: colors.onSurface },
  separator: { height: 1, backgroundColor: colors.separator, marginLeft: spacing.md + 22 + spacing.md },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.surfaceElevated, marginHorizontal: spacing.md, marginBottom: spacing.lg, padding: spacing.md, borderRadius: spacing.md },
  logoutText: { ...typography.body, color: colors.error, fontWeight: '500' },
});