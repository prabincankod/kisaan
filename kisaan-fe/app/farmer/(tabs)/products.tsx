import { useQuery } from "@tanstack/react-query";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFarmerProducts } from "../../../src/api";
import { colors, spacing, borderRadius, typography } from "../../../src/theme/designSystem";

export default function FarmerProducts() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["farmer-products"],
    queryFn: async () => {
      const res: any = await getFarmerProducts();
      return res.data;
    },
  });

  const renderProduct = ({ item }: { item: any }) => {
    const isAvailable = item.quantityAvailable > 0;
    
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push(`/farmer/add-product?id=${item.id}`)}
      >
        <Image
          source={{ uri: item.images?.[0]?.url || "https://placehold.co/100x100/e6eeff/2d6a4f?text=Product" }}
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>{item.title}</Text>
          <Text style={styles.productPrice}>₹{item.price}/{item.unit}</Text>
          <View style={[styles.stock, !isAvailable && styles.outOfStock]}>
            <Text style={[styles.stockText, !isAvailable && styles.outOfStockText]}>
              {isAvailable ? "In Stock" : "Out of Stock"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <FlatList
        data={data?.products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[colors.primary]} />
        }
        ListHeaderComponent={
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push("/farmer/add-product")}
          >
            <Text style={styles.addBtnText}>+ Add Product</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No products yet</Text>
            <Text style={styles.emptySubtitle}>Add your first product to start selling</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: 100 },
  addBtn: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.lg, alignItems: "center" },
  addBtnText: { ...typography.button, color: colors.onPrimary },
  productCard: { flexDirection: "row", backgroundColor: colors.surfaceContainerLowest, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.outlineVariant },
  productImage: { width: 80, height: 80, borderRadius: borderRadius.md },
  productInfo: { flex: 1, marginLeft: spacing.md, justifyContent: "center" },
  productTitle: { ...typography.body, fontWeight: "600", color: colors.onSurface },
  productPrice: { ...typography.bodyMd, color: colors.primary, fontWeight: "600", marginTop: spacing.xs },
  stock: { backgroundColor: colors.primaryContainer, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm, alignSelf: "flex-start", marginTop: spacing.sm },
  stockText: { ...typography.labelMd, color: colors.onPrimaryContainer },
  outOfStock: { backgroundColor: colors.errorContainer },
  outOfStockText: { color: colors.error },
  empty: { alignItems: "center", padding: spacing.xxl },
  emptyTitle: { ...typography.h2, color: colors.onSurface },
  emptySubtitle: { ...typography.bodyMd, color: colors.onSurfaceVariant, marginTop: spacing.xs },
});