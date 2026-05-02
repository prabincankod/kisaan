import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Linking,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { getOrder, updateOrderStatus } from "../../api/order.api";
import { colors, typography, spacing, borderRadius } from "../../theme/designSystem";
import { BACKEND_URL } from "../../api/client";
import { SafeAreaView } from "react-native-safe-area-context";

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "rejected" | "cancelled";

export default function FarmerOrderDetail() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { orderId } = route.params;
  const [refreshing, setRefreshing] = useState(false);

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res: any = await getOrder(orderId);
      return res.data;
    },
  });

  const { mutate: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["farmer-orders"] });
      Alert.alert("Success", "Order status updated");
    },
    onError: () => Alert.alert("Error", "Failed to update status"),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCall = () => {
    if (order?.user?.phone) {
      Linking.openURL(`tel:${order.user.phone}`);
    }
  };

  const getNextStatus = (): { label: string; icon: string; status: OrderStatus } | null => {
    if (!order) return null;
    const map: Record<string, { label: string; icon: string; status: OrderStatus }> = {
      pending: { label: "Confirm Order", icon: "checkmark-circle", status: "confirmed" },
      confirmed: { label: "Mark Shipped", icon: "boat", status: "shipped" },
      shipped: { label: "Mark Delivered", icon: "flag", status: "delivered" },
    };
    return map[order.status] || null;
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

  const getStatusIcon = (status: string) =>
    ({
      pending: "time",
      confirmed: "checkmark-circle",
      shipped: "boat",
      delivered: "flag",
      rejected: "close-circle",
      cancelled: "ban",
    })[status] || "information-circle";

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

  const nextAction = getNextStatus();
  const total = Number(order.totalAmount);
  const negotiatedTotal = order.negotiatedTotal ? Number(order.negotiatedTotal) : null;
  const finalTotal = negotiatedTotal || total;
  const itemCount = order.items?.length || 0;

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
              year: "numeric",
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
        {/* Status Banner */}
        <View style={styles.statusBanner}>
          <View
            style={[
              styles.statusIconWrap,
              { backgroundColor: getStatusColor(order.status) + "20" },
            ]}
          >
            <Ionicons
              name={getStatusIcon(order.status) as any}
              size={24}
              color={getStatusColor(order.status)}
            />
          </View>
          <View style={styles.statusTextWrap}>
            <Text style={styles.statusLabel}>Order Status</Text>
            <Text
              style={[
                styles.statusValue,
                { color: getStatusColor(order.status) },
              ]}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Customer Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={18} color={colors.onSurfaceSecondary} />
            <Text style={styles.cardTitle}>Customer</Text>
          </View>
          <View style={styles.customerRow}>
            <View style={styles.customerAvatar}>
              <Text style={styles.avatarText}>
                {(order.user?.name || "C").charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{order.user?.name || "Customer"}</Text>
              {order.user?.phone && (
                <Text style={styles.customerPhone}>{order.user.phone}</Text>
              )}
            </View>
            {order.user?.phone && (
              <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
                <Ionicons name="call" size={20} color={colors.onPrimary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Items Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="basket" size={18} color={colors.onSurfaceSecondary} />
            <Text style={styles.cardTitle}>
              {itemCount} Item{itemCount !== 1 ? "s" : ""}
            </Text>
          </View>
          {order.items.map((item: any, index: number) => {
            const linePrice = Number(item.price || item.product?.price) * item.quantity;
            const hasNegotiation = item.negotiatedPrice !== null && item.negotiatedPrice !== undefined;
            const negLinePrice = hasNegotiation ? Number(item.negotiatedPrice) * item.quantity : null;

            return (
              <View
                key={index}
                style={[styles.itemRow, index < order.items.length - 1 && styles.itemBorder]}
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
                    {item.quantity} × ₹{Number(item.price || item.product?.price)}
                  </Text>
                  {hasNegotiation && (
                    <View style={styles.negotiatedTag}>
                      <Ionicons name="pricetag" size={10} color={colors.primary} />
                      <Text style={styles.negotiatedTagText}>
                        ₹{Number(item.negotiatedPrice)} × {item.quantity}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.itemPriceWrap}>
                  {negLinePrice && (
                    <Text style={styles.itemOriginalPrice}>₹{linePrice}</Text>
                  )}
                  <Text style={styles.itemPrice}>
                    ₹{negLinePrice ?? linePrice}
                  </Text>
                </View>
              </View>
            );
          })}
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

        {/* Payment Summary */}
        <View style={[styles.card, styles.summaryCard]}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{total.toFixed(2)}</Text>
          </View>
          {negotiatedTotal && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Negotiated Total</Text>
              <Text style={[styles.summaryValue, styles.negotiatedValue]}>
                ₹{negotiatedTotal.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{finalTotal.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Footer Action */}
      {nextAction && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => updateStatus(nextAction.status)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color={colors.onPrimary} />
            ) : (
              <>
                <Ionicons name={nextAction.icon as any} size={20} color={colors.onPrimary} />
                <Text style={styles.actionButtonText}>{nextAction.label}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
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
  scrollContent: { paddingBottom: 100 },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.separatorOpaque,
    gap: spacing.md,
  },
  statusIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  statusTextWrap: { flex: 1 },
  statusLabel: { ...typography.caption1, color: colors.onSurfaceSecondary },
  statusValue: { ...typography.title3, fontWeight: "700" },
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
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    ...typography.headline,
    color: colors.primary,
    fontWeight: "700",
  },
  customerInfo: { flex: 1, marginLeft: spacing.md },
  customerName: { ...typography.body, color: colors.onSurface },
  customerPhone: { ...typography.caption1, color: colors.onSurfaceSecondary },
  callBtn: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
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
  negotiatedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  negotiatedTagText: {
    ...typography.caption2,
    color: colors.primary,
    fontWeight: "600",
  },
  itemPriceWrap: { alignItems: "flex-end" },
  itemPrice: { ...typography.headline, color: colors.primary },
  itemOriginalPrice: {
    ...typography.caption2,
    color: colors.onSurfaceTertiary,
    textDecorationLine: "line-through",
  },
  addressText: {
    ...typography.body,
    color: colors.onSurfaceSecondary,
    lineHeight: 22,
  },
  summaryCard: {},
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  summaryLabel: { ...typography.body, color: colors.onSurfaceSecondary },
  summaryValue: { ...typography.body, color: colors.onSurface },
  negotiatedValue: { color: colors.primary, fontWeight: "600" },
  totalRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.separatorOpaque,
  },
  totalLabel: { ...typography.title3, color: colors.onSurface },
  totalValue: { ...typography.title3, color: colors.primary },
  bottomSpacer: { height: spacing.xxl },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: colors.separatorOpaque,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
  },
  actionButtonText: { ...typography.button, color: colors.onPrimary },
});
