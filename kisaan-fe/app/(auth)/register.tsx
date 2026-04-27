import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../src/hooks/useAuth";
import { colors, spacing, borderRadius, typography } from "../../src/theme/designSystem";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "farmer">("buyer");
  const { register, isLoading } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Required", "Please fill in all fields");
      return;
    }
    await register({ name, email, password, role });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Join Kissan</Text>
          <Text style={styles.subtitle}>Create your account</Text>
        </View>

        <View style={styles.roleSelector}>
          <TouchableOpacity
            style={[styles.roleCard, role === "buyer" && styles.roleCardActive]}
            onPress={() => setRole("buyer")}
          >
            <Text style={styles.roleIcon}>🛒</Text>
            <Text style={[styles.roleLabel, role === "buyer" && styles.roleLabelActive]}>Buyer</Text>
            <Text style={styles.roleDesc}>Fresh produce, direct from farmers</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.roleCard, role === "farmer" && styles.roleCardActive]}
            onPress={() => setRole("farmer")}
          >
            <Text style={styles.roleIcon}>🌾</Text>
            <Text style={[styles.roleLabel, role === "farmer" && styles.roleLabelActive]}>Farmer</Text>
            <Text style={styles.roleDesc}>Sell your harvest directly</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor={colors.outline}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="john@example.com"
              placeholderTextColor={colors.outline}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.outline}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, (!name || !email || !password || isLoading) && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading || !name || !email || !password}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.onSurface,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  roleSelector: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  roleCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    alignItems: "center",
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  roleIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  roleLabel: {
    ...typography.button,
    color: colors.onSurface,
  },
  roleLabelActive: {
    color: colors.primary,
  },
  roleDesc: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  form: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.labelMd,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.onSurface,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  linkText: {
    ...typography.bodyMd,
    color: colors.primary,
    fontWeight: "600",
  },
});