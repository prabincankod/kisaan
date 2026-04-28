import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { getOrder } from "../../api/order.api";
import { colors, typography, spacing } from "../../theme/designSystem";
import { BACKEND_URL } from "@/src/api";
import { useState } from "react";

const STATUS_STEPS = [
  { status: "pending", label: "Order Placed", icon: "checkmark" },
  { status: "confirmed", label: "Confirmed", icon: "checkmark" },
  { status: "shipped", label: "Shipped", icon: "car" },
  { status: "delivered", label: "Delivered", icon: "checkmark" },
];

const TERMINAL_STATUSES = ["rejected", "cancelled"];

export default function BuyerOrderDetail() {
  const route = useRoute<any>();
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

  if (isLoading)
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  if (!order)
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );

  const currentIndex = getStatusIndex(order.status);
  const isTerminal = TERMINAL_STATUSES.includes(order.status);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {isTerminal ? (
        <View style={styles.statusBadgeContainer}>
          <View style={[styles.statusBadge, order.status === "rejected" ? styles.statusRejected : styles.statusCancelled]}>
            <Text style={styles.statusBadgeText}>{order.status.toUpperCase()}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.statusTimeline}>
        {STATUS_STEPS.map((step, index) => (
          <View key={step.status} style={styles.timelineStep}>
            <View
              style={[
                styles.timelineIcon,
                index <= currentIndex && styles.timelineIconActive,
                index < currentIndex && styles.timelineIconComplete,
              ]}
            >
              <Ionicons
                name={step.icon as any}
                size={16}
                color={
                  index <= currentIndex
                    ? colors.onPrimary
                    : colors.onSurfaceTertiary
                }
              />
            </View>
            <Text
              style={[
                styles.timelineLabel,
                index <= currentIndex && styles.timelineLabelActive,
              ]}
            >
              {step.label}
            </Text>
            {index < STATUS_STEPS.length - 1 && (
              <View
                style={[
                  styles.timelineLine,
                  index < currentIndex && styles.timelineLineComplete,
                ]}
              />
            )}
          </View>
        ))}
      </View>
      )} 
       <View style={styles.receiptContainer}>
         <View style={styles.receiptHeader}>
           <Text style={styles.receiptTitle}>Order Receipt</Text>
           <Text style={styles.orderDate}>
             {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
           </Text>
         </View>
         
         <View style={styles.receiptSection}>
           <Text style={styles.sectionTitle}>Order Items</Text>
           {order.items.map((item: any, index: number) => (
             <View key={index} style={styles.receiptItem}>
                <View style={styles.receiptItemLeft}>
                  <Text style={styles.itemTitle}>{item.product.title}</Text>
                  <Text style={styles.itemQuantity}>x{item.quantity} • ₹{item.product.price}/unit</Text>
                </View>
               <Text style={styles.itemPrice}>
                 ₹{item.product.price * item.quantity}
               </Text>
             </View>
           ))}
         </View>

         <View style={styles.receiptDivider} />

         <View style={styles.receiptRow}>
           <Text style={styles.receiptLabel}>Subtotal</Text>
           <Text style={styles.receiptValue}>₹{order.totalAmount}</Text>
         </View>
         
         {order.negotiatedTotal && (
           <View style={styles.receiptRow}>
             <Text style={styles.receiptLabel}>Negotiated Total</Text>
             <Text style={[styles.receiptValue, styles.negotiatedValue]}>₹{order.negotiatedTotal}</Text>
           </View>
         )}

         <View style={styles.receiptDivider} />

         <View style={styles.receiptRow}>
           <Text style={styles.receiptTotalLabel}>Total</Text>
           <Text style={styles.receiptTotalValue}>
             ₹{order.negotiatedTotal || order.totalAmount}
           </Text>
         </View>
       </View>

       <View style={styles.section}>
           <Text style={styles.sectionTitle}>Delivery Address</Text>
           <Text style={styles.addressText}>
             {order.shippingAddress || "Not provided"}
           </Text>
         </View>

       {order.farmer && (
         <View style={styles.section}>
           <Text style={styles.sectionTitle}>Farmer</Text>
           <View style={styles.farmerRow}>
             <Text style={styles.farmerName}>{order.farmer.name}</Text>
             {order.farmer.phone && (
               <TouchableOpacity style={styles.callButton}>
                 <Ionicons name="call" size={20} color={colors.primary} />
               </TouchableOpacity>
             )}
           </View>
         </View>
       )}
     </ScrollView>
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
  errorText: { ...typography.body, color: colors.error },
  statusTimeline: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
  },
  timelineStep: { alignItems: "center", flex: 1 },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  timelineIconActive: { backgroundColor: colors.primary },
  timelineIconComplete: { backgroundColor: colors.success },
  timelineLabel: {
    ...typography.caption2,
    color: colors.onSurfaceTertiary,
    textAlign: "center",
  },
  timelineLabelActive: { color: colors.primary, fontWeight: "600" },
  timelineLine: {
    position: "absolute",
    top: 16,
    left: "50%",
    right: "-50%",
    height: 2,
    backgroundColor: colors.surface,
  },
  timelineLineComplete: { backgroundColor: colors.success },
  section: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: spacing.sm,
    backgroundColor: colors.surface,
  },
  itemInfo: { flex: 1, marginLeft: spacing.md },
  itemTitle: { ...typography.body, color: colors.onSurface },
  itemQuantity: { ...typography.caption1, color: colors.onSurfaceSecondary },
  itemPrice: { ...typography.headline, color: colors.primary },
  addressText: { ...typography.body, color: colors.onSurfaceSecondary },
  receiptContainer: {
    backgroundColor: colors.surface,
    margin: spacing.md,
    borderRadius: spacing.md,
    padding: spacing.md,
  },
  receiptHeader: {
    alignItems: "center",
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
    paddingBottom: spacing.md,
  },
  receiptTitle: { ...typography.title2, color: colors.onSurface },
  orderDate: { ...typography.caption1, color: colors.onSurfaceSecondary },
  receiptSection: { marginVertical: spacing.md },
  receiptItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  receiptItemLeft: { flex: 1 },
  receiptDivider: {
    height: 1,
    backgroundColor: colors.separator,
    marginVertical: spacing.md,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  receiptLabel: { ...typography.body, color: colors.onSurfaceSecondary },
  receiptValue: { ...typography.body, color: colors.onSurface },
  negotiatedValue: { color: colors.primary, fontWeight: "600" },
  receiptTotalLabel: { ...typography.title3, color: colors.onSurface },
  receiptTotalValue: { ...typography.title3, color: colors.primary },
  farmerRow: { flexDirection: "row", alignItems: "center" },
  farmerName: { ...typography.body, color: colors.onSurface, flex: 1 },
  callButton: { padding: spacing.sm },
  divider: {
    height: 1,
    backgroundColor: colors.separator,
    marginHorizontal: spacing.md,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  totalLabel: { ...typography.title2, color: colors.onSurface },
  totalValue: { ...typography.title2, color: colors.primary },
  statusBadgeContainer: {
    alignItems: "center",
    padding: spacing.xl,
  },
  statusBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: spacing.sm,
  },
  statusBadgeText: {
    ...typography.headline,
    color: colors.onPrimary,
    fontWeight: "700",
  },
  statusRejected: {
    backgroundColor: colors.error,
  },
  statusCancelled: {
    backgroundColor: colors.error,
  },
});
