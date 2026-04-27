import { useState } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { colors, typography, spacing } from '../../theme/designSystem';

type Role = 'buyer' | 'farmer';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('buyer');
  const { register, isLoading } = useAuth();

  const handleRegister = async () => {
    if (name && email && password) {
      await register({ name, email, password, role });
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Kissan today</Text>
        </View>

        <View style={styles.roleSelector}>
          <TouchableOpacity style={[styles.roleButton, role === 'buyer' && styles.roleButtonActive]} onPress={() => setRole('buyer')}>
            <Text style={[styles.roleText, role === 'buyer' && styles.roleTextActive]}>Buyer</Text>
            <Text style={styles.roleDesc}>Fresh produce</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roleButton, role === 'farmer' && styles.roleButtonActive]} onPress={() => setRole('farmer')}>
            <Text style={[styles.roleText, role === 'farmer' && styles.roleTextActive]}>Farmer</Text>
            <Text style={styles.roleDesc}>Sell your harvest</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} placeholder="Your full name" placeholderTextColor={colors.onSurfaceTertiary} value={name} onChangeText={setName} textContentType="name" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} placeholder="email@example.com" placeholderTextColor={colors.onSurfaceTertiary} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" textContentType="emailAddress" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} placeholder="Create a password" placeholderTextColor={colors.onSurfaceTertiary} value={password} onChangeText={setPassword} secureTextEntry textContentType="newPassword" />
          </View>
          <TouchableOpacity style={[styles.button, (!name || !email || !password || isLoading) && styles.buttonDisabled]} onPress={handleRegister} disabled={isLoading || !name || !email || !password}>
            {isLoading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.buttonText}>Create Account</Text>}
          </TouchableOpacity>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, padding: spacing.lg },
  header: { marginTop: spacing.xl, marginBottom: spacing.lg },
  title: { ...typography.largeTitle, color: colors.onSurface },
  subtitle: { ...typography.body, color: colors.onSurfaceSecondary, marginTop: spacing.xs },
  roleSelector: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  roleButton: { flex: 1, padding: spacing.md, borderRadius: spacing.sm, backgroundColor: colors.surface, alignItems: 'center' },
  roleButtonActive: { backgroundColor: colors.primary },
  roleText: { ...typography.headline, color: colors.onSurface },
  roleTextActive: { color: colors.onPrimary },
  roleDesc: { ...typography.caption1, color: colors.onSurfaceSecondary, marginTop: spacing.xs },
  form: { marginTop: spacing.md },
  inputGroup: { marginBottom: spacing.md },
  label: { ...typography.subhead, color: colors.onSurface, marginBottom: spacing.xs },
  input: { ...typography.body, backgroundColor: colors.surface, borderRadius: spacing.sm, padding: spacing.md, color: colors.onSurface },
  button: { backgroundColor: colors.primary, borderRadius: spacing.sm, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { ...typography.button, color: colors.onPrimary },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { ...typography.body, color: colors.onSurfaceSecondary },
  linkText: { ...typography.body, color: colors.primary, fontWeight: '600' },
});