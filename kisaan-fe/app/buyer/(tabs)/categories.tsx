import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCategories, Category } from "@/src/api";

const CATEGORY_ICONS: Record<string, string> = {
  vegetables: "🥬", fruits: "🍎", dairy: "🥛", grains: "🌾",
  spices: "🌶️", herbs: "🌿", pulses: "🫘", default: "🧺",
};

export default function BuyerCategories() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res: any = await getCategories();
      return res.data;
    },
  });

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => router.push(`/buyer/products?categoryId=${item.id}`)}
    >
      <View style={styles.categoryIcon}>
        <Text style={styles.iconText}>
          {CATEGORY_ICONS[item.name.toLowerCase()] || CATEGORY_ICONS.default}
        </Text>
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.productCount}>{item.products} products</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#22c55e" /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.title}>Categories</Text>
            <Text style={styles.subtitle}>Browse by category</Text>
          </View>
        )}
        ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>No categories yet</Text></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16 },
  row: { justifyContent: "space-between", marginBottom: 16 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  categoryCard: {
    backgroundColor: "#fff", borderRadius: 16, padding: 20, width: "48%", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  categoryIcon: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: "#f0fdf4",
    justifyContent: "center", alignItems: "center", marginBottom: 12,
  },
  iconText: { fontSize: 28 },
  categoryName: { fontSize: 16, fontWeight: "600", color: "#111827", textAlign: "center" },
  productCount: { fontSize: 12, color: "#9ca3af", marginTop: 4 },
  emptyContainer: { alignItems: "center", paddingTop: 60 },
  emptyText: { fontSize: 16, color: "#6b7280" },
});
