import { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Linking,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { getOrder, updateOrderStatus } from "@/src/api";
import { colors, spacing, borderRadius, shadows, typography } from "@/src/theme/designSystem";

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered"] as const;

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
  quotation: { color: "#f59e0b", bgColor: "#fef3c7", label: "Price Quote Request" },
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = parseInt(id);
  const queryClient = useQueryClient();
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res: any = await getOrder(orderId);
      return res.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ status }: { status: string }) => updateOrderStatus(orderId, status as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["farmer-orders"] });
      setShowStatusPicker(false);
      Alert.alert("Success", "Order status updated!");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to update status");
    },
  });

  const handleDownloadPDF = () => {
    Alert.alert("Download Invoice", "This will download the invoice PDF for this order.", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Download", 
        onPress: () => {
          const pdfUrl = `https://your-api.com/orders/${orderId}/invoice`;
          Linking.openURL(pdfUrl).catch(() => {
            Alert.alert("Error", "Unable to download PDF");
          });
        }
      },
    ]);
  };

  const handleStatusUpdate = (newStatus: string) => {
    Alert.alert(
      "Update Status",
      `Change order status to "${STATUS_CONFIG[newStatus].label}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Update", 
          onPress: () => updateStatusMutation.mutate({ status: newStatus }) 
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const currentStatusIndex = ORDER_STATUSES.indexOf(order.status as any);
  const canUpdateStatus = order.status !== "delivered" && order.status !== "cancelled";

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen options={{ title: `Order #${order.id}` }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <View style={styles.typeRow}>
            <Text style={styles.statusLabel}>Order Type</Text>
            <View style={[styles.typeBadge, { backgroundColor: TYPE_CONFIG[order.type]?.bgColor || "#f3f4f6" }]}>
              <Text style={[styles.typeText, { color: TYPE_CONFIG[order.type]?.color || "#6b7280" }]}>
                {TYPE_CONFIG[order.type]?.label || order.type}
              </Text>
            </View>
          </View>
          <View style={styles.statusHeader}>
            <Text style={styles.statusLabel}>Current Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
              <Text style={[styles.statusBadgeText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
          
          {canUpdateStatus && (
            <TouchableOpacity 
              style={styles.updateButton}
              onPress={() => setShowStatusPicker(!showStatusPicker)}
              activeOpacity={0.7}
            >
              <Text style={styles.updateButtonText}>Update Status →</Text>
            </TouchableOpacity>
          )}

          {showStatusPicker && (
            <View style={styles.statusPicker}>
              {ORDER_STATUSES.map((status, index) => {
                if (index <= currentStatusIndex && order.status !== "cancelled") return null;
                return (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      index === currentStatusIndex + 1 && styles.statusOptionActive,
                    ]}
                    onPress={() => handleStatusUpdate(status)}
                  >
                    <View style={[styles.statusDot, { backgroundColor: STATUS_CONFIG[status].bgColor }]} />
                    <Text style={styles.statusOptionText}>{STATUS_CONFIG[status].label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.orderInfo}>
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
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Source</Text>
            <Text style={[styles.infoValue, styles.sourceBadge]}>
              <Text style={[styles.infoValue, styles.sourceBadge]}>{order.source}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressCard}>
            <Text style={styles.addressText}>
              {order.shippingAddress || "No address provided"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items?.map((item: any, index: number) => (
            <View key={index} style={styles.itemCard}>
              <Image
                source={{ uri: item.product?.images?.[0]?.url || "https://placehold.co/100" }}
                style={styles.itemImage}
                contentFit="cover"
              />
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
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>₹{order.totalAmount}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.downloadButton}
          onPress={handleDownloadPDF}
          activeOpacity={0.7}
        >
          <Text style={styles.downloadButtonIcon}>📄</Text>
          <Text style={styles.downloadButtonText}>Download Invoice PDF</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl },
  errorText: { fontSize: 18, color: colors.textSecondary, marginBottom: spacing.lg },
  backButton: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.lg },
  backButtonText: { color: colors.textInverse, fontWeight: "600" },
  content: { padding: spacing.lg },
  
  statusCard: { 
    backgroundColor: colors.surface, 
    borderRadius: borderRadius.xl, 
    padding: spacing.lg, 
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  statusHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusLabel: { fontSize: 14, color: colors.textSecondary },
  statusRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  typeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  typeBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  typeText: { fontSize: 14, fontWeight: "700" },
  statusBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  statusBadgeText: { fontSize: 14, fontWeight: "700" },
  updateButton: { 
    backgroundColor: colors.primary, 
    padding: spacing.md, 
    borderRadius: borderRadius.lg, 
    alignItems: "center",
    marginTop: spacing.md,
  },
  updateButtonText: { color: colors.textInverse, fontWeight: "600" },
  statusPicker: { marginTop: spacing.md, backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.lg, padding: spacing.sm },
  statusOption: { flexDirection: "row", alignItems: "center", padding: spacing.md, borderRadius: borderRadius.md },
  statusOptionActive: { backgroundColor: colors.primary, margin: -spacing.sm },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: spacing.sm },
  statusOptionText: { fontSize: 14, fontWeight: "600", color: colors.text },
  
  orderInfo: { 
    backgroundColor: colors.surface, 
    borderRadius: borderRadius.xl, 
    padding: spacing.lg, 
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  infoLabel: { fontSize: 14, color: colors.textSecondary },
  infoValue: { fontSize: 14, fontWeight: "600", color: colors.text },
  sourceBadge: { backgroundColor: colors.primaryLight, paddingHorizontal: spacing.sm, borderRadius: borderRadius.sm },
  
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: spacing.md },
  addressCard: { 
    backgroundColor: colors.surface, 
    borderRadius: borderRadius.xl, 
    padding: spacing.lg,
    ...shadows.sm,
  },
  addressText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  
  itemCard: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: colors.surface, 
    borderRadius: borderRadius.lg, 
    padding: spacing.md, 
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  itemImage: { width: 60, height: 60, borderRadius: borderRadius.md },
  itemInfo: { flex: 1, marginLeft: spacing.md },
  itemTitle: { fontSize: 14, fontWeight: "600", color: colors.text },
  itemQty: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  itemPrice: { fontSize: 16, fontWeight: "700", color: colors.primary },
  
  totalCard: { 
    backgroundColor: colors.surface, 
    borderRadius: borderRadius.xl, 
    padding: spacing.lg, 
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  totalLabel: { fontSize: 14, color: colors.textSecondary },
  totalValue: { fontSize: 14, fontWeight: "500", color: colors.text },
  freeDelivery: { color: colors.success },
  grandTotalRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: spacing.sm },
  grandTotalLabel: { fontSize: 16, fontWeight: "700", color: colors.text },
  grandTotalValue: { fontSize: 18, fontWeight: "800", color: colors.primary },
  
  downloadButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center",
    backgroundColor: colors.surface, 
    borderRadius: borderRadius.xl, 
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  downloadButtonIcon: { fontSize: 20 },
  downloadButtonText: { fontSize: 16, fontWeight: "600", color: colors.text },
});