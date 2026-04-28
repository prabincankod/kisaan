import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { getFarmer } from "../../api/farmer.api";
import { getProducts } from "../../api/product.api";
import { colors, typography, spacing } from "../../theme/designSystem";
import { BACKEND_URL } from "../../api/client";

export default function BuyerFarmerDetail() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { farmerId } = route.params;

  const { data: farmerData, isLoading: farmerLoading } = useQuery({
    queryKey: ["farmer", farmerId],
    queryFn: async () => {
      const res: any = await getFarmer(farmerId);
      return res.data;
    },
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["farmer-products", farmerId],
    queryFn: async () => {
      const res: any = await getProducts({ farmerId });
      return res.data;
    },
  });

  const farmer: any = farmerData;
  const products: any[] = productsData?.products || [];

  if (farmerLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!farmer) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>Farmer not found</Text>
      </View>
    );
  }

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        navigation.navigate("BuyerProductDetail", { productId: item.id })
      }
    >
      <Image
        source={{
          uri: item.images?.[0]?.url
            ? `${BACKEND_URL}${item.images[0].url}`
            : "https://placehold.co/200x200/F5B800/000000?text=Product",
        }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>₹{item.price}</Text>
          <Text style={styles.productUnit}>/{item.unit}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.farmerAvatar}>
          <Ionicons name="person" size={40} color={colors.primary} />
        </View>
        <View style={styles.farmerInfo}>
          <Text style={styles.farmerName}>{farmer.name}</Text>
          {farmer.address && (
            <Text style={styles.farmerAddress}>{farmer.address}</Text>
          )}
          {farmer.phone && (
            <TouchableOpacity style={styles.callButton}>
              <Ionicons name="call" size={16} color={colors.primary} />
              <Text style={styles.phoneText}>{farmer.phone}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Products by {farmer.name}</Text>
        {productsLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : products.length === 0 ? (
          <Text style={styles.emptyText}>No products yet</Text>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            scrollEnabled={false}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  errorText: { ...typography.body, color: colors.error },
  header: {
    flexDirection: "row",
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
  },
  farmerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  farmerInfo: { flex: 1, marginLeft: spacing.md },
  farmerName: { ...typography.title2, color: colors.onSurface },
  farmerAddress: {
    ...typography.caption1,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  phoneText: { ...typography.caption1, color: colors.primary },
  section: { padding: spacing.md },
  sectionTitle: {
    ...typography.headline,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  productRow: { gap: spacing.md },
  productCard: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: spacing.md,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  productImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.surface,
  },
  productInfo: { padding: spacing.sm },
  productTitle: { ...typography.body, color: colors.onSurface },
  productFooter: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: spacing.xs,
  },
  productPrice: { ...typography.title3, color: colors.primary },
  productUnit: {
    ...typography.caption1,
    color: colors.onSurfaceSecondary,
    marginLeft: spacing.xs,
  },
  emptyText: {
    ...typography.body,
    color: colors.onSurfaceSecondary,
    textAlign: "center",
    padding: spacing.xl,
  },
});
