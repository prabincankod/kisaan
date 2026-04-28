import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { getFarmerProducts, deleteProduct } from "../../api/product.api";
import { colors, typography, spacing } from "../../theme/designSystem";
import { BACKEND_URL } from "../../api/client";


type Product = {
  id: number;
  title: string;
  price: number;
  unit: string;
  images: { url: string }[];
  quantityAvailable: number;
  isActive: boolean;
};

export default function FarmerProducts() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: productsData,
    isPending: isLoading,
    refetch,
  } = useQuery({
    queryKey: ["farmer-products"],
    queryFn: async () => {
      const res: any = await getFarmerProducts();
      return res.data;
    },
  });
  const { mutate: removeProduct } = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer-products"] });
      Alert.alert("Success", "Product deleted");
    },
    onError: () => Alert.alert("Error", "Failed to delete product"),
  });
  const products: Product[] = productsData?.products || [];
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  const handleDelete = (id: number) =>
    Alert.alert("Delete Product", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => removeProduct(id),
      },
    ]);

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <Image
        source={{
          uri: item.images?.[0]?.url 
            ? `${BACKEND_URL}${item.images?.[0]?.url}`
            : "https://placehold.co/100x100/F5B800/000000?text=Product",
        }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.productPrice}>
          ₹{item.price}/{item.unit}
        </Text>
        <View style={styles.productFooter}>
          <Text style={styles.quantity}>
            {item.quantityAvailable} available
          </Text>
          {!item.isActive && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveText}>Inactive</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate("FarmerAddProduct", { productId: item.id })
          }
        >
          <Ionicons name="create" size={20} color={colors.info} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="leaf" size={48} color={colors.onSurfaceTertiary} />
      <Text style={styles.emptyText}>No products yet</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("FarmerAddProduct", {})}
      >
        <Text style={styles.addButtonText}>Add Product</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { flexGrow: 1 },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: spacing.md,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: spacing.sm,
    backgroundColor: colors.surface,
  },
  productInfo: { flex: 1, marginLeft: spacing.md },
  productTitle: { ...typography.headline, color: colors.onSurface },
  productPrice: {
    ...typography.title3,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  productFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  quantity: { ...typography.caption1, color: colors.onSurfaceSecondary },
  inactiveBadge: {
    backgroundColor: colors.error,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  inactiveText: {
    ...typography.caption2,
    color: colors.white,
    fontWeight: "600",
  },
  productActions: { flexDirection: "row", gap: spacing.sm },
  actionButton: { padding: spacing.sm },
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
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  addButtonText: { ...typography.button, color: colors.onPrimary },
});
