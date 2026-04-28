import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { getOrders, updateOrderStatus } from "../../api/order.api";
import { colors, typography, spacing } from "../../theme/designSystem";
import { SafeAreaView as SafeArea } from "react-native-safe-area-context";
type Order = {
  id: number;
  status: string;
  totalAmount: number;
  negotiatedTotal?: number | null;
  items: { product: { title: string; images?: { url: string }[] } }[];
  customer?: { name: string; phone: string };
  createdAt: string;
};
const STATUS_TABS = [
  { status: "all", label: "All" },
  { status: "pending", label: "New" },
  { status: "confirmed", label: "Confirmed" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
  { status: "rejected", label: "Rejected" },
  { status: "cancelled", label: "Cancelled" },
];

export default function FarmerOrders() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: ordersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["farmer-orders", selectedStatus],
    queryFn: async () => {
      const res: any = await getOrders({
        status: selectedStatus === "all" ? undefined : selectedStatus,
      });
      return res.data;
    },
  });
  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      updateOrderStatus(id, status),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["farmer-orders"] }),
  });
  const orders: Order[] = ordersData?.orders || [];
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  const getStatusColor = (status: string) =>
    ({
      pending: colors.warning,
      confirmed: colors.info,
      shipped: colors.info,
      delivered: colors.success,
      rejected: colors.error,
      cancelled: colors.error,
    })[status] || colors.onSurfaceSecondary;
  const getNextStatus = (current: string): string | null =>
    ({
      pending: "confirmed",
      confirmed: "shipped",
      shipped: "delivered",
    })[current] || null;

  const renderTab = ({ item }: { item: (typeof STATUS_TABS)[0] }) => {
    const count = statusCounts[item.status] || 0;
    return (
      <TouchableOpacity
        style={[
          styles.tab,
          selectedStatus === item.status && styles.tabActive,
          selectedStatus === item.status && { borderColor: colors.primary },
        ]}
        onPress={() => setSelectedStatus(item.status)}
      >
        <Text
          style={[
            styles.tabText,
            selectedStatus === item.status && styles.tabTextActive,
          ]}
        >
          {item.label}
        </Text>
        {count > 0 && (
          <View style={[
            styles.tabBadge,
            selectedStatus === item.status && styles.tabBadgeActive,
          ]}>
            <Text style={[
              styles.tabBadgeText,
              selectedStatus === item.status && styles.tabBadgeTextActive,
            ]}>{count}</Text>
          </View>
        )}
      </TouchableOpacity>
    );

  };

  const renderOrder = ({ item }: { item: Order }) => {
    const nextStatus = getNextStatus(item.status);
    const displayTotal = item.negotiatedTotal || item.totalAmount || item.total;
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.orderInfo}>
          <Text style={styles.customerName}>
            {item.customer?.name || "Customer"}
          </Text>
          <Text style={styles.orderItems} numberOfLines={1}>
            {item.items?.[0]?.product?.title || "Item"}
            {item.items && item.items.length > 1
              ? ` +${item.items.length - 1} more`
              : ""}
          </Text>
          {item.totalAmount ? (
            <Text style={styles.orderPrice}>₹{item.totalAmount}</Text>
          ) : null}
        </View>
        <View style={styles.orderFooter}>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.orderActions}>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() =>
              navigation.navigate("FarmerOrderDetail", { orderId: item.id })
            }
          >
            <Text style={styles.detailText}>View Details</Text>
          </TouchableOpacity>
          {nextStatus && (
            <TouchableOpacity
              style={styles.updateButton}
              onPress={() => updateStatus({ id: item.id, status: nextStatus })}
            >
              <Text style={styles.updateText}>Mark as {nextStatus}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    ordersData?.orders?.forEach((order: Order) => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });
    return counts;
  }, [ordersData]);

  const ListEmpty = () =>
    isLoading ? (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    ) : (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt" size={48} color={colors.onSurfaceTertiary} />
        <Text style={styles.emptyText}>No orders</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={STATUS_TABS}
        renderItem={renderTab}
        keyExtractor={(item) => item.status}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      />
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
  tabsContainer: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  tab: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.separator,
    flexDirection: "row",
    alignItems: "center",
  },
  tabActive: { 
    backgroundColor: colors.primary + "20",
    borderColor: colors.primary,
  },
  tabBadge: {
    backgroundColor: colors.onSurfaceTertiary,
    borderRadius: spacing.full,
    paddingHorizontal: spacing.xs,
    marginLeft: spacing.xs,
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
    height: 18,
  },
  tabBadgeActive: {
    backgroundColor: colors.primary,
  },
  tabBadgeText: {
    ...typography.caption2,
    color: colors.surface,
    fontWeight: "600",
  },
  tabBadgeTextActive: {
    color: colors.onPrimary,
  },
  tabText: { ...typography.subhead, color: colors.onSurface },
  tabTextActive: { color: colors.onPrimary, fontWeight: "600" },
  listContent: { flexGrow: 1, paddingBottom: spacing.xxl },
  orderCard: {
    backgroundColor: colors.surfaceElevated,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: spacing.md,
    padding: spacing.md,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    textTransform: "capitalize",
  },
  orderInfo: { marginTop: spacing.sm, flex: 1 },
  customerName: { ...typography.body, color: colors.onSurface },
  orderItems: {
    ...typography.caption1,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  orderPrice: { ...typography.title3, color: colors.primary, marginTop: spacing.xs },
  orderPriceContainer: { marginTop: spacing.xs },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  orderDate: { ...typography.caption1, color: colors.onSurfaceTertiary },
  orderAmount: { ...typography.headline, color: colors.primary },
  orderActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  detailButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    alignItems: "center",
  },
  detailText: { ...typography.subhead, color: colors.onSurface },
  updateButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    alignItems: "center",
  },
  updateText: {
    ...typography.subhead,
    color: colors.onPrimary,
    fontWeight: "600",
  },
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
