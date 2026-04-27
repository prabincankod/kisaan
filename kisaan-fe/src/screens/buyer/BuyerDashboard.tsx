import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
  SafeAreaView,
} from "react-native";
import { SafeAreaView as SafeArea } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { getProducts } from "../../api/product.api";
import { colors, typography, spacing } from "../../theme/designSystem";

type Product = {
  id: number;
  title: string;
  price: number;
  unit: string;
  images: { url: string }[];
  farmer?: { name: string };
  quantityAvailable: number;
};

const CATEGORIES = [
  { id: "all", name: "All", icon: "apps" },
  { id: "vegetables", name: "Vegetables", icon: "leaf" },
  { id: "fruits", name: "Fruits", icon: "nutrition" },
  { id: "dairy", name: "Dairy", icon: "egg" },
  { id: "grains", name: "Grains", icon: "grid" },
];

export default function BuyerDashboard() {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", selectedCategory],
    queryFn: async () => {
      const res: any = await getProducts({
        category: selectedCategory === "all" ? undefined : selectedCategory,
      });
      return res.data;
    },
  });

  const products: Product[] = productsData?.products || [];

  const renderCategory = ({ item }: { item: (typeof CATEGORIES)[0] }) => (
    <Pressable
      style={[
        styles.categoryChip,
        selectedCategory === item.id && styles.categoryChipActive,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Ionicons
        name={item.icon as any}
        size={16}
        color={
          selectedCategory === item.id ? colors.onPrimary : colors.onSurface
        }
      />
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.categoryTextActive,
        ]}
      >
        {item.name}
      </Text>
    </Pressable>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        navigation.navigate("BuyerProductDetail", { productId: item.id })
      }
    >
      <Image
        source={{
          uri:
            item.images?.[0]?.url ||
            "https://placehold.co/200x200/F5B800/000000?text=Product",
        }}
        style={styles.productImage}
        contentFit="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.productFarmer} numberOfLines={1}>
          {item.farmer?.name || "Local Farmer"}
        </Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>₹{item.price}</Text>
          <Text style={styles.productUnit}>/{item.unit}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning</Text>
          <Text style={styles.title}>Discover Fresh</Text>
        </View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate("BuyerCart")}
        >
          <Ionicons name="cart" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        data={CATEGORIES}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      />
    </View>
  );

  const ListEmpty = () => {
    if (isLoading)
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="leaf" size={48} color={colors.onSurfaceTertiary} />
        <Text style={styles.emptyText}>No products found</Text>
      </View>
    );
  };

  return (
    <SafeArea style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
  },
  greeting: { ...typography.subhead, color: colors.onSurfaceSecondary },
  title: { ...typography.title1, color: colors.onSurface },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  categoriesContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: spacing.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  categoryChipActive: { backgroundColor: colors.primary },
  categoryText: { ...typography.subhead, color: colors.onSurface },
  categoryTextActive: { color: colors.onPrimary, fontWeight: "600" },
  listContent: { paddingBottom: spacing.xxl },
  productRow: { paddingHorizontal: spacing.md, gap: spacing.md },
  productCard: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: spacing.md,
    overflow: "hidden",
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.surface,
  },
  productInfo: { padding: spacing.sm },
  productTitle: { ...typography.headline, color: colors.onSurface },
  productFarmer: {
    ...typography.caption1,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  productFooter: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: spacing.xs,
  },
  productPrice: { ...typography.title3, color: colors.primary },
  productUnit: { ...typography.caption1, color: colors.onSurfaceSecondary },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.onSurfaceSecondary,
    marginTop: spacing.md,
  },
});
