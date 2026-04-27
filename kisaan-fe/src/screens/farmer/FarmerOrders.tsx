import { useState } from "react";
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

type Order = {
  id: number;
  status: string;
  total: number;
  items: { product: { title: string } }[];
  customer: { name: string; phone: string };
  createdAt: string;
};
const STATUS_TABS = [
  { status: "all", label: "All" },
  { status: "pending", label: "New" },
  { status: "confirmed", label: "Confirmed" },
  { status: "preparing", label: "Preparing" },
  { status: "outForDelivery", label: "Delivery" },
  { status: "delivered", label: "Delivered" },
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
      preparing: colors.info,
      outForDelivery: colors.info,
      delivered: colors.success,
      cancelled: colors.error,
    })[status] || colors.onSurfaceSecondary;
  const getNextStatus = (current: string): string | null =>
    ({
      pending: "confirmed",
      confirmed: "preparing",
      preparing: "outForDelivery",
      outForDelivery: "delivered",
    })[current] || null;

  const renderTab = ({ item }: { item: (typeof STATUS_TABS)[0] }) => (
    <TouchableOpacity
      style={[styles.tab, selectedStatus === item.status && styles.tabActive]}
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
    </TouchableOpacity>
  );

  const renderOrder = ({ item }: { item: Order }) => {
    const nextStatus = getNextStatus(item.status);
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
        </View>
        <View style={styles.orderFooter}>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          <Text style={styles.orderAmount}>₹{item.total}</Text>
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
    backgroundColor: colors.surface,
    borderRadius: spacing.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  tabActive: { backgroundColor: colors.primary },
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
  orderInfo: { marginTop: spacing.sm },
  customerName: { ...typography.body, color: colors.onSurface },
  orderItems: {
    ...typography.caption1,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
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
