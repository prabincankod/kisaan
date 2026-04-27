import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../src/store/auth.store";
import { colors, spacing, borderRadius, typography } from "../../src/theme/designSystem";

export default function FarmerProfile() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: async () => {
        await logout();
        router.replace("/login");
      }},
    ]);
  };

  const MenuItem = ({ label, onPress }: { label: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuText}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || "F"}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role}</Text>
        </View>
      </View>

      <View style={styles.menu}>
        <MenuItem label="My Products" onPress={() => router.push("/farmer/products")} />
        <MenuItem label="My Orders" onPress={() => router.push("/farmer/orders")} />
        <MenuItem label="Edit Profile" onPress={() => {}} />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  profileCard: { backgroundColor: colors.surfaceContainerLowest, borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: "center", marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.outlineVariant },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primaryContainer, justifyContent: "center", alignItems: "center", marginBottom: spacing.md },
  avatarText: { fontSize: 28, fontWeight: "700", color: colors.onPrimaryContainer },
  name: { ...typography.h2, color: colors.onSurface },
  email: { ...typography.bodyMd, color: colors.onSurfaceVariant, marginTop: spacing.xs },
  roleBadge: { backgroundColor: colors.primaryFixed, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, marginTop: spacing.md },
  roleText: { ...typography.labelMd, color: colors.onPrimaryFixed, textTransform: "capitalize" },
  menu: { backgroundColor: colors.surfaceContainerLowest, borderRadius: borderRadius.lg, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.outlineVariant, marginBottom: spacing.lg },
  menuItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  menuText: { ...typography.body, color: colors.onSurface },
  menuArrow: { fontSize: 20, color: colors.onSurfaceVariant },
  logoutBtn: { backgroundColor: colors.errorContainer, padding: spacing.md, borderRadius: borderRadius.md, alignItems: "center" },
  logoutText: { ...typography.button, color: colors.error },
});