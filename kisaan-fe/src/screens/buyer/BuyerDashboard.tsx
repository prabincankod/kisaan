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
  RefreshControl,
  Animated,
  Platform,
} from "react-native";
import { SafeAreaView as SafeArea } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { getProducts } from "../../api/product.api";
import { getFarmers } from "../../api/farmer.api";
import { getCategories } from "../../api/category.api";
import { colors, typography, spacing } from "../../theme/designSystem";
import { BACKEND_URL } from "@/src/api";

let Haptics: any = null;
if (Platform.OS !== "web") {
  try {
    Haptics = require("expo-haptics");
  } catch (e) {}
}

type Product = {
  id: number;
  title: string;
  price: number;
  unit: string;
  images: { url: string }[];
  farmer?: { name: string };
  quantityAvailable: number;
};

type Category = {
  id: number;
  name: string;
  products: number;
};

const CATEGORY_ICONS: Record<string, string> = {
  vegetables: "leaf",
  fruits: "nutrition",
  dairy: "egg",
  grains: "grid",
  default: "basket",
};

export default function BuyerDashboard() {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
  const [refreshing, setRefreshing] = useState(false);

  const { data: categoriesData, refetch: refetchCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res: any = await getCategories();
      return res.data;
    },
  });
  const categories: Category[] = categoriesData || [];

  const { data: productsData, isPending: isLoading, refetch: refetchProducts } = useQuery({
    queryKey: ["products", selectedCategory],
    queryFn: async () => {
      const res: any = await getProducts({
        categoryId: selectedCategory === "all" ? undefined : selectedCategory,
      });
      return res.data;
    },
  });

  const products: Product[] = productsData?.products || [];

  const { data: farmersData } = useQuery({
    queryKey: ["top-farmers"],
    queryFn: async () => {
      const res: any = await getFarmers({ limit: 6 });
      return res.data;
    },
  });
  const topFarmers: any[] = farmersData?.farmers || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProducts(), refetchCategories()]);
    setRefreshing(false);
  };

  const handleCategoryPress = (item: Category | { id: string; name: string }) => {
    const isAll = item.id === "all";
    const newSelection = isAll ? "all" : item.id as number;
    setSelectedCategory(newSelection);
    if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderCategory = ({ item }: { item: Category | { id: string; name: string; icon: string } }) => {
    const isAll = item.id === "all";
    const isSelected = isAll ? selectedCategory === "all" : selectedCategory === item.id;
    const iconName = isAll ? "apps" : (CATEGORY_ICONS[(item as Category).name?.toLowerCase()] || CATEGORY_ICONS.default) as any;

    return (
      <Pressable
        style={[
          styles.categoryChip,
          isSelected && styles.categoryChipActive,
        ]}
        onPress={() => handleCategoryPress(item)}
      >
        <Ionicons
          name={iconName}
          size={16}
          color={isSelected ? colors.onPrimary : colors.onSurface}
        />
        <Text
          style={[
            styles.categoryText,
            isSelected && styles.categoryTextActive,
          ]}
        >
          {item.name}
        </Text>
      </Pressable>
    );
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        navigation.navigate("BuyerProductDetail", { productId: item.id })
      }
      activeOpacity={0.85}
    >
      <Image
        source={{
          uri: item.images?.[0]?.url 
            ? `${BACKEND_URL}${item.images?.[0]?.url}`
            : "https://placehold.co/200x200/F5B800/000000?text=Product",
        }}
        style={styles.productImage}
        resizeMode="cover"
      />
      {item.quantityAvailable <= 5 && item.quantityAvailable > 0 && (
        <View style={styles.lowStockBadge}>
          <Text style={styles.lowStockText}>Low Stock</Text>
        </View>
      )}
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

  const renderFarmer = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.farmerCard}
      onPress={() =>
        navigation.navigate("BuyerFarmerDetail", { farmerId: item.id })
      }
    >
      <View style={styles.farmerAvatar}>
        <Ionicons name="person" size={24} color={colors.primary} />
      </View>
      <Text style={styles.farmerName} numberOfLines={1}>
        {item.name}
      </Text>
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
        data={[{ id: "all", name: "All", icon: "apps" }, ...categories]}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      />
      {topFarmers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Farmers</Text>
          <FlatList
            horizontal
            data={topFarmers}
            renderItem={renderFarmer}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.farmersContainer}
          />
        </View>
      )}
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
        <Ionicons name="leaf-outline" size={56} color={colors.onSurfaceTertiary} />
        <Text style={styles.emptyTitle}>No products found</Text>
        <Text style={styles.emptyText}>Try selecting a different category</Text>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
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
  section: { padding: spacing.md },
  sectionTitle: {
    ...typography.headline,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  farmersContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  farmerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: spacing.md,
    flex: 1,
  },
  farmerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  farmerName: {
    ...typography.body,
    color: colors.onSurface,
    marginLeft: spacing.md,
    flex: 1,
  },
});
