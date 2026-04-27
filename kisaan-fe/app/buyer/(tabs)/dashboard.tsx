import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getProducts, getCategories } from "../../../src/api";
import { colors, spacing, borderRadius, typography } from "../../../src/theme/designSystem";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function BuyerDashboard() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res: any = await getCategories();
      return res.data;
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", search, selectedCategory],
    queryFn: async () => {
      const res: any = await getProducts({
        search: search || undefined,
        categoryId: selectedCategory || undefined,
        limit: 30,
        isActive: true,
      });
      return res.data.products;
    },
  });

  const renderProduct = ({ item }: { item: any }) => {
    const isAvailable = item.quantityAvailable > 0;
    
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push(`/buyer/products/${item.id}`)}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: item.images?.[0]?.url || "https://placehold.co/200x200/e6eeff/2d6a4f?text=Fresh" }}
            style={styles.productImage}
            contentFit="cover"
          />
          {!isAvailable && (
            <View style={styles.soldOutBadge}>
              <Text style={styles.soldOutText}>Sold Out</Text>
            </View>
          )}
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.farmerName}>{item.farmer?.name || "Local Farmer"}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{item.price}</Text>
            <Text style={styles.unit}>/{item.unit}</Text>
          </View>
          
          {isAvailable && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push(`/buyer/products/${item.id}`)}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.subtitle}>What would you like fresh today?</Text>
      </View>

      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search fresh produce..."
          placeholderTextColor={colors.outline}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesList}
        contentContainerStyle={styles.categoriesContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.categoryChip, selectedCategory === item.id && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(selectedCategory === item.id ? null : item.id)}
          >
            <Text style={[styles.categoryText, selectedCategory === item.id && styles.categoryTextActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingTop: spacing.md },
  greeting: { ...typography.h1, color: colors.onSurface },
  subtitle: { ...typography.bodyMd, color: colors.onSurfaceVariant, marginTop: spacing.xs },
  searchWrapper: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  searchInput: { backgroundColor: colors.surfaceContainerLowest, borderRadius: borderRadius.lg, padding: spacing.md, ...typography.body, color: colors.onSurface, borderWidth: 1, borderColor: colors.outlineVariant },
  categoriesList: { marginBottom: spacing.md },
  categoriesContent: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  categoryChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, marginRight: spacing.sm },
  categoryChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryText: { ...typography.labelMd, color: colors.onSurfaceVariant },
  categoryTextActive: { color: colors.onPrimary },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  row: { justifyContent: "space-between" },
  productCard: { width: "48%", backgroundColor: colors.surfaceContainerLowest, borderRadius: borderRadius.lg, marginBottom: spacing.md, overflow: "hidden", borderWidth: 1, borderColor: colors.outlineVariant },
  imageWrapper: { position: "relative" },
  productImage: { width: "100%", aspectRatio: 1, backgroundColor: colors.surfaceContainer },
  soldOutBadge: { position: "absolute", top: spacing.sm, left: spacing.sm, backgroundColor: colors.errorContainer, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  soldOutText: { ...typography.labelMd, color: colors.error },
  productInfo: { padding: spacing.sm },
  productTitle: { ...typography.bodyMd, fontWeight: "600", color: colors.onSurface, marginBottom: spacing.xs },
  farmerName: { ...typography.labelMd, color: colors.onSurfaceVariant, marginBottom: spacing.sm },
  priceRow: { flexDirection: "row", alignItems: "baseline" },
  price: { ...typography.button, color: colors.primary },
  unit: { ...typography.labelMd, color: colors.onSurfaceVariant },
  addButton: { marginTop: spacing.sm, backgroundColor: colors.primaryContainer, paddingVertical: spacing.xs, borderRadius: borderRadius.sm, alignItems: "center" },
  addButtonText: { ...typography.labelMd, color: colors.onPrimaryContainer },
});