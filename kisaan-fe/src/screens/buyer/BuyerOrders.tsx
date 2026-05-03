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
import { SafeAreaView } from "react-native-safe-area-context";
import { getOrders } from "../../api/order.api";
import { colors, typography, spacing, borderRadius } from "../../theme/designSystem";

type Order = {
  id: number;
  status: string;
  totalAmount: number;
  items: { product: { title: string }; quantity: number }[];
  createdAt: string;
};

const STATUS_CONFIG: Record<string, { color: string; icon: string }> = {
  pending: { color: colors.warning, icon: "time" },
  confirmed: { color: colors.info, icon: "checkmark-circle" },
  shipped: { color: colors.info, icon: "boat" },
  delivered: { color: colors.success, icon: "flag" },
  rejected: { color: colors.error, icon: "close-circle" },
  cancelled: { color: colors.error, icon: "ban" },
};

export default function BuyerOrders() {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const { data: ordersData, isLoading, refetch } = useQuery({
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

  const renderOrder = ({ item }: { item: Order }) => {
    const statusConfig = STATUS_CONFIG[item.status] || { color: colors.onSurfaceSecondary, icon: "information-circle" };
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate("BuyerOrderDetail", { orderId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.orderTop}>
          <View style={styles.orderIdRow}>
            <Text style={styles.orderId}>#{item.id}</Text>
            <View style={[styles.statusBadge, { borderColor: statusConfig.color }]}>
              <Ionicons name={statusConfig.icon as any} size={12} color={statusConfig.color} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceTertiary} />
        </View>

        <View style={styles.orderItems}>
          <Ionicons name="basket" size={14} color={colors.onSurfaceTertiary} />
          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.items?.[0]?.product?.title || "Item"}
            {item.items && item.items.length > 1 && ` +${item.items.length - 1}`}
          </Text>
        </View>

        <View style={styles.orderFooter}>
          <View style={styles.dateRow}>
            <Ionicons name="calendar" size={14} color={colors.onSurfaceTertiary} />
            <Text style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
            </Text>
          </View>
          <Text style={styles.orderTotal}>₹{Number(item.totalAmount).toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const ListEmpty = () =>
    isLoading ? (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    ) : (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt" size={56} color={colors.onSurfaceTertiary} />
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptyText}>Your placed orders will appear here</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.pageHeader}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <Ionicons name="refresh" size={20} color={colors.onSurfaceSecondary} />
        </TouchableOpacity>
      </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: { ...typography.title1, color: colors.onSurface },
  refreshBtn: { padding: spacing.xs },
  listContent: { flexGrow: 1, paddingBottom: spacing.xl },
  orderCard: {
    backgroundColor: colors.surfaceElevated,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.separatorOpaque,
  },
  orderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  orderIdRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  orderId: { ...typography.headline, color: colors.onSurface, fontWeight: "700" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    flexShrink: 0,
  },
  statusText: { ...typography.caption2, fontWeight: "600" },
  orderItems: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  itemTitle: { ...typography.body, color: colors.onSurfaceSecondary, flex: 1 },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
  },
  dateRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  orderDate: { ...typography.caption1, color: colors.onSurfaceTertiary },
  orderTotal: { ...typography.headline, color: colors.primary, fontWeight: "700" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: { ...typography.title3, color: colors.onSurfaceSecondary, marginTop: spacing.md },
  emptyText: { ...typography.body, color: colors.onSurfaceTertiary, marginTop: spacing.xs, textAlign: "center" },
  shopButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  shopButtonText: { ...typography.button, color: colors.onPrimary },
});
