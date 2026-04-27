import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/auth.store";
import { getStats, getOrders } from "../../api/order.api";
import { colors, typography, spacing } from "../../theme/designSystem";
import { SafeAreaProvider } from "react-native-safe-area-context";

type Order = {
  id: number;
  status: string;
  total: number;
  items: { product: { title: string } }[];
  createdAt: string;
};

export default function FarmerDashboard() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ["farmer-stats"],
    queryFn: async () => {
      const res: any = await getStats();
      return res.data;
    },
  });
  const { data: ordersData, refetch: refetchOrders } = useQuery({
    queryKey: ["farmer-orders", 5],
    queryFn: async () => {
      const res: any = await getOrders({ limit: 5 });
      return res.data;
    },
  });
  const stats = statsData || { orders: 0, revenue: 0, products: 0 };
  const orders: Order[] = ordersData?.orders || [];
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchOrders()]);
    setRefreshing(false);
  };
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.title}>
            {user?.name?.split(" ")[0] || "Farmer"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("FarmerAddProduct", {})}
        >
          <Ionicons name="add" size={24} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="receipt" size={24} color={colors.primary} />
          <Text style={styles.statValue}>{stats.orders}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cash" size={24} color={colors.primary} />
          <Text style={styles.statValue}>₹{stats.revenue || 0}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="leaf" size={24} color={colors.primary} />
          <Text style={styles.statValue}>{stats.products || 0}</Text>
          <Text style={styles.statLabel}>Products</Text>
        </View>
      </View>
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("FarmerAddProduct", {})}
          >
            <Ionicons name="add-circle" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Add Product</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Orders")}
          >
            <Ionicons name="receipt" size={24} color={colors.primary} />
            <Text style={styles.actionText}>View Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Products")}
          >
            <Ionicons name="list" size={24} color={colors.primary} />
            <Text style={styles.actionText}>My Products</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.ordersSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Orders")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {orders.length === 0 ? (
          <View style={styles.emptyOrders}>
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
        ) : (
          orders.slice(0, 5).map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderItem}
              onPress={() =>
                navigation.navigate("FarmerOrderDetail", { orderId: order.id })
              }
            >
              <View style={styles.orderInfo}>
                <Text style={styles.orderId}>Order #{order.id}</Text>
                <Text style={styles.orderItems} numberOfLines={1}>
                  {order.items?.[0]?.product?.title || "Item"}
                  {order.items && order.items.length > 1
                    ? ` +${order.items.length - 1} more`
                    : ""}
                </Text>
              </View>
              <View style={styles.orderRight}>
                <Text style={styles.orderAmount}>₹{order.total}</Text>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(order.status) },
                  ]}
                />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
  },
  greeting: { ...typography.subhead, color: colors.onSurfaceSecondary },
  title: { ...typography.title1, color: colors.onSurface },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: spacing.md,
    padding: spacing.md,
    alignItems: "center",
  },
  statValue: {
    ...typography.title2,
    color: colors.onSurface,
    marginTop: spacing.sm,
  },
  statLabel: {
    ...typography.caption1,
    color: colors.onSurfaceSecondary,
    marginTop: spacing.xs,
  },
  quickActions: { padding: spacing.md },
  sectionTitle: {
    ...typography.headline,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  actionsRow: { flexDirection: "row", gap: spacing.sm },
  actionButton: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: spacing.md,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  actionText: { ...typography.caption1, color: colors.onSurface },
  ordersSection: { padding: spacing.md },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seeAll: { ...typography.body, color: colors.primary },
  emptyOrders: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: spacing.md,
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: { ...typography.body, color: colors.onSurfaceSecondary },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceElevated,
    borderRadius: spacing.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  orderInfo: { flex: 1 },
  orderId: { ...typography.headline, color: colors.onSurface },
  orderItems: {
    ...typography.caption1,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  orderRight: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  orderAmount: { ...typography.headline, color: colors.primary },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
});
