import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { getOrders, updateOrderStatus, Order } from "../../api/order.api";
import { colors, typography, spacing, borderRadius } from "../../theme/designSystem";

const STATUS_TABS = [
  { status: "all", label: "All" },
  { status: "pending", label: "New" },
  { status: "confirmed", label: "Confirmed" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
];

export default function FarmerOrders() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const {
    data: ordersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["farmer-orders", selectedStatus],
    queryFn: async () => {
      const res: any = await getOrders({
        type: "buy",
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

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((o) => {
      const id = o.id.toString().toLowerCase();
      const customer = (o.user?.name || "").toLowerCase();
      return id.includes(q) || customer.includes(q);
    });
  }, [orders, searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getStatusColor = (status: string) =>
    ({
      pending: colors.warning,
      confirmed: colors.info,
      shipped: colors.info,
      delivered: colors.success,
      rejected: colors.error,
      cancelled: colors.error,
    })[status] || colors.onSurfaceSecondary;

  const getStatusIcon = (status: string) =>
    ({
      pending: "time",
      confirmed: "checkmark-circle",
      shipped: "boat",
      delivered: "flag",
      rejected: "close-circle",
      cancelled: "ban",
    })[status] || "information-circle";

  const getNextStatus = (current: string): string | null =>
    ({
      pending: "confirmed",
      confirmed: "shipped",
      shipped: "delivered",
    })[current] || null;

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    orders.forEach((order: Order) => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const renderTab = ({ item }: { item: (typeof STATUS_TABS)[0] }) => {
    const count = statusCounts[item.status] || 0;
    const isSelected = selectedStatus === item.status;
    return (
      <TouchableOpacity
        style={[styles.tab, isSelected && styles.tabActive]}
        onPress={() => setSelectedStatus(item.status)}
      >
        <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
          {item.label}
        </Text>
        {count > 0 && (
          <View style={[styles.tabBadge, isSelected && styles.tabBadgeActive]}>
            <Text style={[styles.tabBadgeText, isSelected && styles.tabBadgeTextActive]}>
              {count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const nextStatus = getNextStatus(item.status);
    const total = Number(item.negotiatedTotal || item.totalAmount);
    const itemCount = item.items?.length || 0;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        activeOpacity={0.7}
        onPress={() => navigation.navigate("FarmerOrderDetail", { orderId: item.id })}
      >
        <View style={styles.cardTop}>
          <View style={styles.orderIdRow}>
            <Text style={styles.orderId}>#{item.id}</Text>
            <View
              style={[
                styles.statusPill,
                { backgroundColor: getStatusColor(item.status) + "15" },
              ]}
            >
              <Ionicons
                name={getStatusIcon(item.status) as any}
                size={12}
                color={getStatusColor(item.status)}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(item.status) },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
          <Text style={styles.customerName}>
            {item.user?.name || "Customer"}
          </Text>
          <Text style={styles.itemSummary} numberOfLines={1}>
            {itemCount} item{itemCount !== 1 ? "s" : ""} • {item.items?.[0]?.product?.title || "Products"}
            {itemCount > 1 ? ` +${itemCount - 1} more` : ""}
          </Text>
        </View>

        <View style={styles.cardBottom}>
          <View style={styles.cardLeft}>
            <Text style={styles.totalLabel}>₹{total.toFixed(2)}</Text>
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
          <View style={styles.cardRight}>
            <TouchableOpacity
              style={styles.detailBtn}
              onPress={() =>
                navigation.navigate("FarmerOrderDetail", { orderId: item.id })
              }
            >
              <Text style={styles.detailBtnText}>Details</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.onSurfaceSecondary} />
            </TouchableOpacity>
            {nextStatus && (
              <TouchableOpacity
                style={styles.nextStatusBtn}
                onPress={() => updateStatus({ id: item.id, status: nextStatus })}
              >
                <Text style={styles.nextStatusText}>
                  {item.status === "pending" ? "Confirm" : `Mark ${nextStatus}`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ListEmpty = () =>
    isLoading ? (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    ) : searchQuery ? (
      <View style={styles.emptyContainer}>
        <Ionicons name="search" size={48} color={colors.onSurfaceTertiary} />
        <Text style={styles.emptyText}>No orders matching "{searchQuery}"</Text>
      </View>
    ) : (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt" size={48} color={colors.onSurfaceTertiary} />
        <Text style={styles.emptyText}>No orders yet</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Orders</Text>
        <TouchableOpacity
          style={styles.searchToggle}
          onPress={() => {
            setShowSearch(!showSearch);
            if (showSearch) setSearchQuery("");
          }}
        >
          <Ionicons
            name={showSearch ? "close" : "search"}
            size={20}
            color={colors.onSurface}
          />
        </TouchableOpacity>
      </View>

      {showSearch && (
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.onSurfaceTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by order # or customer"
            placeholderTextColor={colors.onSurfaceTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            keyboardType="number-pad"
            autoCapitalize="none"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.onSurfaceTertiary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        horizontal
        data={STATUS_TABS}
        renderItem={renderTab}
        keyExtractor={(item) => item.status}
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 44 }} 
        contentContainerStyle={{
          paddingHorizontal: 16,
          alignItems: "center", 
        }}

      />

      <FlatList
        data={filteredOrders}
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  headerTitle: { ...typography.title2, color: colors.onSurface },
  searchToggle: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.onSurface,
    padding: 0,
  },
  tabsContainer: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  tab: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.separatorOpaque,
    flexDirection: "row",
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: colors.primary + "15",
    borderColor: colors.primary,
  },
  tabText: { ...typography.subhead, color: colors.onSurface },
  tabTextActive: { color: colors.primary, fontWeight: "600" },
  tabBadge: {
    backgroundColor: colors.onSurfaceTertiary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.xs,
    marginLeft: spacing.xs,
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
    height: 18,
  },
  tabBadgeActive: { backgroundColor: colors.primary },
  tabBadgeText: { ...typography.caption2, color: colors.surface, fontWeight: "600" },
  tabBadgeTextActive: { color: colors.onPrimary },
  listContent: { flexGrow: 1, paddingBottom: spacing.xxl },
  orderCard: {
    backgroundColor: colors.surfaceElevated,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.separatorOpaque,
  },
  cardTop: { marginBottom: spacing.sm },
  orderIdRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  orderId: { ...typography.headline, color: colors.onSurface },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  statusText: {
    ...typography.caption2,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  customerName: { ...typography.body, color: colors.onSurface, marginBottom: 2 },
  itemSummary: {
    ...typography.caption1,
    color: colors.onSurfaceSecondary,
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.separatorOpaque,
  },
  cardLeft: {},
  totalLabel: { ...typography.title3, color: colors.primary },
  dateText: { ...typography.caption2, color: colors.onSurfaceTertiary },
  cardRight: {
    flexDirection: "row",
    gap: spacing.xs,
    alignItems: "center",
  },
  detailBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  detailBtnText: { ...typography.caption1, color: colors.onSurfaceSecondary },
  nextStatusBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  nextStatusText: {
    ...typography.caption1,
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
