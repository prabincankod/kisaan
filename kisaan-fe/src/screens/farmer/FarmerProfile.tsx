import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../store/auth.store";
import { useAuth } from "../../hooks/useAuth";
import { colors, typography, spacing, borderRadius } from "../../theme/designSystem";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";

export default function FarmerProfile() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const appVersion = Constants.expoConfig?.version || "1.0.0";

  const handleLogout = () =>
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="leaf" size={32} color={colors.primary} />
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate("EditProfile")}
      >
        <View style={styles.menuLeft}>
          <Ionicons name="create" size={22} color={colors.onSurface} />
          <Text style={styles.menuText}>Edit Profile</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceSecondary} />
      </TouchableOpacity>

      <View style={styles.menuItem}>
        <View style={styles.menuLeft}>
          <Ionicons name="information-circle" size={22} color={colors.onSurface} />
          <Text style={styles.menuText}>About Kisaan</Text>
        </View>
        <Text style={styles.versionText}>v{appVersion}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={22} color={colors.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  header: { alignItems: "center", marginBottom: spacing.xl },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  name: { ...typography.title2, color: colors.onSurface },
  email: { ...typography.body, color: colors.onSurfaceSecondary, marginTop: spacing.xs },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.separatorOpaque,
  },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  menuText: { ...typography.body, color: colors.onSurface },
  versionText: { ...typography.caption1, color: colors.onSurfaceSecondary },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.separatorOpaque,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  logoutText: { ...typography.body, color: colors.error, fontWeight: "500" },
});
