import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getOrder } from "@/src/api";
import { colors, spacing, borderRadius, shadows } from "@/src/theme/designSystem";

const STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  pending: { color: "#b45309", bgColor: "#fef3c7", label: "Pending" },
  confirmed: { color: "#1d4ed8", bgColor: "#dbeafe", label: "Confirmed" },
  shipped: { color: "#7c3aed", bgColor: "#ede9fe", label: "Shipped" },
  delivered: { color: "#15803d", bgColor: "#dcfce7", label: "Delivered" },
  rejected: { color: "#dc2626", bgColor: "#fee2e2", label: "Rejected" },
  cancelled: { color: "#dc2626", bgColor: "#fee2e2", label: "Cancelled" },
};

const TYPE_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  buy: { color: "#22c55e", bgColor: "#dcfce7", label: "Purchase Order" },
  quotation: { color: "#f59e0b", bgColor: "#fef3c7", label: "Price Quote" },
};

export default function BuyerOrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const orderId = Number(id);

  const { data, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await getOrder(orderId);
      return (res as any)?.data;
    },
    enabled: !!orderId,
  });

  const order = data;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.statusLabel}>Type</Text>
              <View style={[styles.typeBadge, { backgroundColor: TYPE_CONFIG[order.type]?.bgColor || "#f3f4f6" }]}>
                <Text style={[styles.typeText, { color: TYPE_CONFIG[order.type]?.color || "#6b7280" }]}>
                  {TYPE_CONFIG[order.type]?.label || order.type}
                </Text>
              </View>
            </View>
            <View>
              <Text style={styles.statusLabel}>Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                <Text style={[styles.statusBadgeText, { color: statusConfig.color }]}>
                  {statusConfig.label}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order ID</Text>
            <Text style={styles.infoValue}>#{order.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>

        {order.shippingAddress && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <Text style={styles.addressText}>{order.shippingAddress}</Text>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items?.map((item: any, index: number) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.product?.title || `Product #${item.productId}`}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>₹{item.price}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Delivery</Text>
            <Text style={[styles.totalValue, styles.freeDelivery]}>Free</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total Paid</Text>
            <Text style={styles.grandTotalValue}>₹{order.totalAmount}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 18, color: colors.textSecondary, marginBottom: 20 },
  backButton: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  backButtonText: { color: colors.textInverse, fontSize: 16, fontWeight: "600" },
  
  statusCard: { 
    backgroundColor: colors.surface, 
    borderRadius: borderRadius.xl, 
    padding: spacing.lg, 
    margin: spacing.lg,
    marginBottom: 0,
    ...shadows.sm,
  },
  statusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.xs },
  statusBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  statusBadgeText: { fontSize: 14, fontWeight: "700" },
  typeBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  typeText: { fontSize: 14, fontWeight: "700" },
  
  infoCard: { 
    backgroundColor: colors.surface, 
    borderRadius: borderRadius.xl, 
    padding: spacing.lg, 
    margin: spacing.lg,
    marginTop: spacing.md,
    ...shadows.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: spacing.md },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  infoLabel: { fontSize: 14, color: colors.textSecondary },
  infoValue: { fontSize: 14, fontWeight: "600", color: colors.text },
  addressText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: "500", color: colors.text },
  itemQty: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: "600", color: colors.primary },
  
  totalCard: { 
    backgroundColor: colors.surface, 
    borderRadius: borderRadius.xl, 
    padding: spacing.lg, 
    margin: spacing.lg,
    marginTop: spacing.md,
    ...shadows.sm,
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  totalLabel: { fontSize: 14, color: colors.textSecondary },
  totalValue: { fontSize: 14, fontWeight: "500", color: colors.text },
  freeDelivery: { color: colors.success },
  grandTotalRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: spacing.sm },
  grandTotalLabel: { fontSize: 16, fontWeight: "700", color: colors.text },
  grandTotalValue: { fontSize: 18, fontWeight: "800", color: colors.primary },
});