import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
  Linking,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { getOrder } from "../../api/order.api";
import { colors, typography, spacing, borderRadius } from "../../theme/designSystem";
import { BACKEND_URL } from "../../api/client";
import { SafeAreaView } from "react-native-safe-area-context";

const STATUS_STEPS = [
  { status: "pending", label: "Placed", icon: "receipt" },
  { status: "confirmed", label: "Confirmed", icon: "checkmark-circle" },
  { status: "shipped", label: "Shipped", icon: "boat" },
  { status: "delivered", label: "Delivered", icon: "flag" },
];

const TERMINAL_STATUSES = ["rejected", "cancelled"];

export default function BuyerOrderDetail() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { orderId } = route.params;
  const [refreshing, setRefreshing] = useState(false);

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res: any = await getOrder(orderId);
      return res.data;
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusIndex = (status: string) => {
    if (TERMINAL_STATUSES.includes(status)) return -1;
    return STATUS_STEPS.findIndex((s) => s.status === status);
  };

  const handleCallFarmer = () => {
    if (order?.farmer?.phone) {
      Linking.openURL(`tel:${order.farmer.phone}`);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle" size={64} color={colors.onSurfaceTertiary} />
          <Text style={styles.errorText}>Order not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentIndex = getStatusIndex(order.status);
  const isTerminal = TERMINAL_STATUSES.includes(order.status);
  const total = Number(order.totalAmount);
  const negotiatedTotal = order.negotiatedTotal ? Number(order.negotiatedTotal) : null;
  const finalTotal = negotiatedTotal || total;
  const itemCount = order.items?.length || 0;

  const getStatusColor = (status: string) =>
    ({
      pending: colors.warning,
      confirmed: colors.info,
      shipped: colors.info,
      delivered: colors.success,
      rejected: colors.error,
      cancelled: colors.error,
    })[status] || colors.onSurfaceSecondary;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Order #{order.id}</Text>
          <Text style={styles.headerDate}>
            {new Date(order.createdAt).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
            })}
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Status Section */}
        {isTerminal ? (
          <View style={[styles.statusBanner, { backgroundColor: getStatusColor(order.status) + "15" }]}>
            <Ionicons
              name={order.status === "rejected" ? "close-circle" : "ban"}
              size={32}
              color={getStatusColor(order.status)}
            />
            <Text style={[styles.terminalStatus, { color: getStatusColor(order.status) }]}>
              Order {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Text>
          </View>
        ) : (
          <View style={styles.statusCard}>
            {STATUS_STEPS.map((step, index) => {
              const isActive = index <= currentIndex;
              const isComplete = index < currentIndex;
              return (
                <View key={step.status} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepDot,
                      isActive && { backgroundColor: colors.primary },
                      isComplete && { backgroundColor: colors.success },
                    ]}
                  >
                    <Ionicons
                      name={isActive ? "checkmark" : step.icon as any}
                      size={14}
                      color={isActive || isComplete ? colors.onPrimary : colors.onSurfaceTertiary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      isActive && styles.stepLabelActive,
                    ]}
                  >
                    {step.label}
                  </Text>
                  {index < STATUS_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        isComplete && { backgroundColor: colors.success },
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Items Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="basket" size={18} color={colors.onSurfaceSecondary} />
            <Text style={styles.cardTitle}>
              {itemCount} Item{itemCount !== 1 ? "s" : ""}
            </Text>
          </View>
          {order.items.map((item: any, index: number) => (
            <View
              key={index}
              style={[
                styles.itemRow,
                index < order.items.length - 1 && styles.itemBorder,
              ]}
            >
              <Image
                source={{
                  uri: item.product?.images?.[0]?.url
                    ? `${BACKEND_URL}${item.product.images[0].url}`
                    : "https://placehold.co/48x48/F2F2F7/000000?text=P",
                }}
                style={styles.itemImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.product?.title || "Product"}
                </Text>
                <Text style={styles.itemMeta}>
                  {item.quantity} × ₹{Number(item.price)}
                </Text>
              </View>
              <Text style={styles.itemPrice}>
                ₹{Number(item.price) * item.quantity}
              </Text>
            </View>
          ))}
        </View>

        {/* Summary Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="wallet" size={18} color={colors.onSurfaceSecondary} />
            <Text style={styles.cardTitle}>Payment</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{total.toFixed(2)}</Text>
          </View>
          {negotiatedTotal && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Negotiated Discount</Text>
              <Text style={styles.summaryDiscount}>
                -₹{(total - negotiatedTotal).toFixed(2)}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>₹{finalTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Delivery Address */}
        {order.shippingAddress && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="location" size={18} color={colors.onSurfaceSecondary} />
              <Text style={styles.cardTitle}>Delivery Address</Text>
            </View>
            <Text style={styles.addressText}>{order.shippingAddress}</Text>
          </View>
        )}

        {/* Farmer Info */}
        {order.farmer && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="leaf" size={18} color={colors.onSurfaceSecondary} />
              <Text style={styles.cardTitle}>Farmer</Text>
            </View>
            <View style={styles.farmerRow}>
              <View style={styles.farmerAvatar}>
                <Text style={styles.farmerAvatarText}>
                  {order.farmer.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.farmerInfo}>
                <Text style={styles.farmerName}>{order.farmer.name}</Text>
                {order.farmer.phone && (
                  <Text style={styles.farmerPhone}>{order.farmer.phone}</Text>
                )}
              </View>
              {order.farmer.phone && (
                <TouchableOpacity
                  style={styles.farmerCallBtn}
                  onPress={handleCallFarmer}
                >
                  <Ionicons name="call" size={20} color={colors.onPrimary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
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
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  errorText: {
    ...typography.title3,
    color: colors.onSurfaceSecondary,
    marginTop: spacing.md,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  backButtonText: { ...typography.button, color: colors.onPrimary },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.separatorOpaque,
    backgroundColor: colors.background,
  },
  backBtn: { padding: spacing.xs },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { ...typography.headline, color: colors.onSurface },
  headerDate: { ...typography.caption2, color: colors.onSurfaceSecondary },
  headerRight: { width: 40 },
  scrollContent: { paddingBottom: spacing.xxl },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
  },
  terminalStatus: {
    ...typography.title3,
    fontWeight: "700",
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.separatorOpaque,
    gap: spacing.xs,
  },
  stepItem: { flex: 1, alignItems: "center", position: "relative" },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  stepLabel: {
    ...typography.caption2,
    color: colors.onSurfaceTertiary,
    textAlign: "center",
    lineHeight: 14,
  },
  stepLabelActive: { color: colors.primary, fontWeight: "600" },
  stepLine: {
    position: "absolute",
    top: 16,
    left: "50%",
    width: "100%",
    height: 2,
    backgroundColor: colors.separatorOpaque,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.separatorOpaque,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardTitle: { ...typography.headline, color: colors.onSurface },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.separatorOpaque,
    paddingBottom: spacing.md,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
  },
  itemInfo: { flex: 1, marginLeft: spacing.md },
  itemName: { ...typography.body, color: colors.onSurface },
  itemMeta: { ...typography.caption1, color: colors.onSurfaceSecondary },
  itemPrice: { ...typography.headline, color: colors.primary },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  summaryLabel: { ...typography.body, color: colors.onSurfaceSecondary },
  summaryValue: { ...typography.body, color: colors.onSurface },
  summaryDiscount: {
    ...typography.body,
    color: colors.success,
    fontWeight: "600",
  },
  totalRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.separatorOpaque,
  },
  totalLabel: { ...typography.title3, color: colors.onSurface },
  totalValue: { ...typography.title3, color: colors.primary },
  addressText: {
    ...typography.body,
    color: colors.onSurfaceSecondary,
    lineHeight: 22,
  },
  farmerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  farmerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  farmerAvatarText: {
    ...typography.headline,
    color: colors.primary,
    fontWeight: "700",
  },
  farmerInfo: { flex: 1, marginLeft: spacing.md },
  farmerName: { ...typography.body, color: colors.onSurface },
  farmerPhone: { ...typography.caption1, color: colors.onSurfaceSecondary },
  farmerCallBtn: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSpacer: { height: spacing.xl },
});
