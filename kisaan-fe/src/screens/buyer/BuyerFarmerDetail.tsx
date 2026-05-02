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
  Linking,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFarmer } from "../../api/farmer.api";
import { getProducts } from "../../api/product.api";
import { colors, typography, spacing, borderRadius } from "../../theme/designSystem";
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
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {farmer.name}
        </Text>
        <View style={styles.headerRight} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.farmerCard}>
          <View style={styles.farmerAvatar}>
            <Ionicons name="person" size={40} color={colors.primary} />
          </View>
          <View style={styles.farmerInfo}>
            <Text style={styles.farmerName}>{farmer.name}</Text>
            {farmer.address && (
              <View style={styles.infoRow}>
                <Ionicons name="location" size={14} color={colors.onSurfaceSecondary} />
                <Text style={styles.farmerAddress}>{farmer.address}</Text>
              </View>
            )}
            {farmer.phone && (
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => Linking.openURL(`tel:${farmer.phone}`)}
              >
                <Ionicons name="call" size={16} color={colors.onPrimary} />
                <Text style={styles.callButtonText}>{farmer.phone}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Products</Text>
          {productsLoading ? (
            <View style={styles.centerLoader}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.separatorOpaque,
  },
  backBtn: { padding: spacing.xs },
  headerTitle: { ...typography.headline, color: colors.onSurface, flex: 1, textAlign: "center" },
  headerRight: { width: 40 },
  scrollContent: { paddingBottom: spacing.xl },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  errorText: { ...typography.body, color: colors.error },
  centerLoader: { alignItems: "center", padding: spacing.xl },
  farmerCard: {
    flexDirection: "row",
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.separatorOpaque,
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
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  farmerAddress: {
    ...typography.caption1,
    color: colors.onSurfaceSecondary,
    flex: 1,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
    alignSelf: "flex-start",
  },
  callButtonText: { ...typography.caption1, color: colors.onPrimary, fontWeight: "500" },
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
