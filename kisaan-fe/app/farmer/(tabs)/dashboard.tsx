import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../../src/store/auth.store";
import { getStats, getFarmerProducts, getOrders } from "../../../src/api";
import { colors, spacing, borderRadius, typography } from "../../../src/theme/designSystem";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: colors.secondaryContainer, color: colors.secondary },
  confirmed: { bg: colors.primaryContainer, color: colors.primary },
  shipped: { bg: colors.tertiaryContainer, color: colors.tertiary },
  delivered: { bg: colors.surfaceContainerHighest, color: colors.onSurface },
};

export default function FarmerDashboard() {
  const user = useAuthStore((state) => state.user);

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res: any = await getStats();
      return res.data;
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["farmer-orders"],
    queryFn: async () => {
      const res: any = await getOrders({ limit: 5 });
      return res.data.orders || [];
    },
  });

  const { data: products } = useQuery({
    queryKey: ["farmer-products"],
    queryFn: async () => {
      const res: any = await getFarmerProducts();
      return res.data.products || [];
    },
  });

  const pendingCount = orders?.filter((o: any) => o.status === "pending").length || 0;
  const totalEarnings = stats?.orders * 1250 || 0;
  const productCount = products?.length || 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl colors={[colors.primary]} tintColor={colors.primary} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {getGreeting()}, {user?.name?.split(" ")[0]}
        </Text>
        <Text style={styles.subtitle}>Here's what's happening today</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Earnings</Text>
          <Text style={styles.statValue}>₹{totalEarnings.toLocaleString()}</Text>
          <Text style={styles.statTrend}>+12% this week</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Active Orders</Text>
          <Text style={styles.statValueSmall}>{pendingCount}</Text>
          <Text style={styles.statLabel}>pending</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Products</Text>
          <Text style={styles.statValueSmall}>{productCount}</Text>
          <Text style={styles.statLabel}>listed</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addProductBtn}
        onPress={() => router.push("/farmer/add-product")}
      >
        <View>
          <Text style={styles.addProductTitle}>Add New Product</Text>
          <Text style={styles.addProductSubtitle}>List your fresh harvest</Text>
        </View>
        <Text style={styles.addProductIcon}>+</Text>
      </TouchableOpacity>

      <View style={styles.quickLinks}>
        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => router.push("/farmer/orders")}
        >
          <Text style={styles.quickLinkIcon}>📋</Text>
          <Text style={styles.quickLinkLabel}>Orders</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => router.push("/farmer/products")}
        >
          <Text style={styles.quickLinkIcon}>📦</Text>
          <Text style={styles.quickLinkLabel}>Products</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => router.push("/farmer/orders")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {(!orders || orders.length === 0) ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
        ) : (
          orders.slice(0, 5).map((order: any) => {
            const status = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
            const total = order.items?.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0) || 0;
            const firstItem = order.items?.[0];

            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => router.push(`/farmer/orders/${order.id}`)}
              >
                <View style={styles.orderInfo}>
                  <Text style={styles.orderTitle}>
                    {firstItem?.product?.title || `Order #${order.id}`}
                  </Text>
                  <Text style={styles.orderMeta}>
                    {order.items?.length || 0} items
                  </Text>
                </View>
                <View style={styles.orderRight}>
                  <Text style={styles.orderAmount}>₹{total}</Text>
                  <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.h1,
    color: colors.onSurface,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  statLabel: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  statValueSmall: {
    ...typography.h2,
    color: colors.onSurface,
    marginTop: spacing.xs,
  },
  statTrend: {
    ...typography.labelMd,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  addProductBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  addProductTitle: {
    ...typography.button,
    color: colors.onPrimary,
  },
  addProductSubtitle: {
    ...typography.labelMd,
    color: colors.primaryFixed,
  },
  addProductIcon: {
    fontSize: 28,
    color: colors.onPrimary,
  },
  quickLinks: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  quickLink: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  quickLinkIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  quickLinkLabel: {
    ...typography.button,
    color: colors.onSurface,
  },
  recentSection: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.onSurface,
  },
  seeAll: {
    ...typography.labelMd,
    color: colors.primary,
  },
  empty: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  orderCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    ...typography.bodyMd,
    fontWeight: "600",
    color: colors.onSurface,
  },
  orderMeta: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  orderRight: {
    alignItems: "flex-end",
  },
  orderAmount: {
    ...typography.bodyMd,
    fontWeight: "700",
    color: colors.onSurface,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: spacing.xs,
  },
});