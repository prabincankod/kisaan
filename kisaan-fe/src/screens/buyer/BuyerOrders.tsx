import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { getOrders } from "../../api/order.api";
import { colors, typography, spacing } from "../../theme/designSystem";

type Order = {
  id: number;
  status: string;
  total: number;
  items: { product: { title: string } }[];
  createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: colors.warning,
  confirmed: colors.info,
  preparing: colors.info,
  outForDelivery: colors.info,
  delivered: colors.success,
  cancelled: colors.error,
};

export default function BuyerOrders() {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: ordersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["buyer-orders"],
    queryFn: async () => {
      const res: any = await getOrders({ limit: 20 });
      return res.data;
    },
  });
  const orders: Order[] = ordersData?.orders || [];
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() =>
        navigation.navigate("BuyerOrderDetail", { orderId: item.id })
      }
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                STATUS_COLORS[item.status] || colors.onSurfaceSecondary,
            },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.orderItems}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.items?.[0]?.product?.title || "Item"}
        </Text>
        <Text style={styles.moreItems}>
          {item.items && item.items.length > 1
            ? `+${item.items.length - 1} more`
            : ""}
        </Text>
      </View>
      <View style={styles.orderFooter}>
        <Text style={styles.orderDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Text style={styles.orderTotal}>₹{item.total}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.onSurfaceSecondary}
      />
    </TouchableOpacity>
  );

  const ListEmpty = () =>
    isLoading ? (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    ) : (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt" size={48} color={colors.onSurfaceTertiary} />
        <Text style={styles.emptyText}>No orders yet</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrder}
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
  orderCard: {
    backgroundColor: colors.surfaceElevated,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: spacing.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
  },
  orderId: { ...typography.headline, color: colors.onSurface },
  statusBadge: {
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusText: {
    ...typography.caption1,
    color: colors.white,
    fontWeight: "600",
  },
  orderItems: { marginTop: spacing.sm },
  itemTitle: { ...typography.body, color: colors.onSurfaceSecondary },
  moreItems: {
    ...typography.caption1,
    color: colors.onSurfaceTertiary,
    marginLeft: spacing.xs,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  orderDate: { ...typography.caption1, color: colors.onSurfaceTertiary },
  orderTotal: { ...typography.headline, color: colors.primary },
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
  shopButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  shopButtonText: { ...typography.button, color: colors.onPrimary },
});
