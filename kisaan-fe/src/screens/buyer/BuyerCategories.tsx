import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../../api/category.api';
import { colors, typography, spacing } from '../../theme/designSystem';
import { Ionicons } from '@expo/vector-icons';

const CATEGORY_ICONS: Record<string, string> = { vegetables: 'leaf', fruits: 'nutrition', dairy: 'egg', grains: 'grid', default: 'basket' };

type Category = { id: number; name: string; products: number };

export default function BuyerCategories() {
  const { data: categories, isLoading } = useQuery({ queryKey: ['categories'], queryFn: async () => { const res: any = await getCategories(); return res.data; } });
  if (isLoading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>;
  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>Categories</Text><Text style={styles.subtitle}>Browse by category</Text></View>
      <View style={styles.grid}>
        {(categories || []).map((cat: Category) => (
          <TouchableOpacity key={cat.id} style={styles.categoryCard}>
            <View style={styles.categoryIcon}><Ionicons name={(CATEGORY_ICONS[cat.name.toLowerCase()] || CATEGORY_ICONS.default) as any} size={28} color={colors.primary} /></View>
            <Text style={styles.categoryName}>{cat.name}</Text>
            <Text style={styles.productCount}>{cat.products} products</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { marginBottom: spacing.lg },
  title: { ...typography.largeTitle, color: colors.onSurface },
  subtitle: { ...typography.body, color: colors.onSurfaceSecondary, marginTop: spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: { width: '48%', backgroundColor: colors.surfaceElevated, borderRadius: spacing.md, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.md, shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  categoryIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  categoryName: { ...typography.headline, color: colors.onSurface, textAlign: 'center' },
  productCount: { ...typography.caption1, color: colors.onSurfaceSecondary, marginTop: spacing.xs },
});