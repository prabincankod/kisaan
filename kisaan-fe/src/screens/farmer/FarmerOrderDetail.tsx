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
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { getOrder, updateOrderStatus } from "../../api/order.api";
import { colors, typography, spacing } from "../../theme/designSystem";
import { BACKEND_URL } from "../../api/client";
import { useState } from "react";

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "rejected" | "cancelled";

const STATUS_FLOW: { status: OrderStatus; label: string; next: OrderStatus }[] = [
  { status: "confirmed", label: "Mark Shipped", next: "shipped" },
  { status: "shipped", label: "Mark Delivered", next: "delivered" },
];

const QUOTATION_FLOW: { status: OrderStatus; label: string; next: OrderStatus }[] = [
  { status: "pending", label: "Accept & Confirm", next: "confirmed" },
];

export default function FarmerOrderDetail() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { orderId } = route.params;

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

  const getNextAction = () => {
    if (!order) return null;
    if (order.type === "quotation" && order.status === "pending") {
      return QUOTATION_FLOW.find((s) => s.status === order.status);
    }
    return STATUS_FLOW.find((s) => s.status === order.status);
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

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
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

  const nextAction = getNextAction();

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
      <View style={styles.receiptContainer}>
        <View style={styles.receiptHeader}>
          <Text style={styles.receiptTitle}>Order Receipt</Text>
          <Text style={styles.orderDate}>
            Order #{order.id} • {new Date(order.createdAt).toLocaleDateString()}
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
              <View style={styles.itemPriceContainer}>
                {item.negotiatedPrice ? (
                  <>
                    <Text style={styles.itemOriginalPrice}>
                      ₹{item.product.price * item.quantity}
                    </Text>
                    <Text style={styles.itemPrice}>
                      ₹{item.negotiatedPrice * item.quantity}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.itemPrice}>
                    ₹{item.product.price * item.quantity}
                  </Text>
                )}
              </View>
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
         <Text style={styles.sectionTitle}>Customer</Text>
         <View style={styles.customerRow}>
           <Ionicons name="person" size={24} color={colors.primary} />
           <View style={styles.customerInfo}>
             <Text style={styles.customerName}>
               {order.user?.name || "Customer"}
             </Text>
             <Text style={styles.customerPhone}>
               {order.user?.phone || "No phone"}
             </Text>
           </View>
           {order.user?.phone && (
             <TouchableOpacity style={styles.callButton}>
               <Ionicons name="call" size={24} color={colors.primary} />
             </TouchableOpacity>
           )}
         </View>
       </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items</Text>
        {order.items.map((item: any, index: number) => (
          <View key={index} style={styles.item}>
              <Image
                source={{
                  uri: item.product.images?.[0]?.url 
                    ? `${BACKEND_URL}${item.product.images?.[0]?.url}`
                    : "https://placehold.co/60x60/F5B800/000000?text=Product",
                }}
                style={styles.itemImage}
              />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.product.title}</Text>
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              {item.negotiatedPrice && (
                <Text style={styles.itemNegotiatedPrice}>
                  Negotiated: ₹{item.negotiatedPrice}
                </Text>
              )}
            </View>
            <View style={styles.itemPriceContainer}>
              {item.negotiatedPrice ? (
                <>
                  <Text style={styles.itemOriginalPrice}>
                    ₹{item.product.price * item.quantity}
                  </Text>
                  <Text style={styles.itemPrice}>
                    ₹{item.negotiatedPrice * item.quantity}
                  </Text>
                </>
              ) : (
                <Text style={styles.itemPrice}>
                  ₹{item.product.price * item.quantity}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <Text style={styles.addressText}>
          {order.address || "Not provided"}
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Total</Text>
        {order.negotiatedTotal ? (
          <View style={styles.totalPriceContainer}>
            <Text style={styles.totalOriginalPrice}>₹{order.totalAmount}</Text>
            <Text style={styles.totalValue}>₹{order.negotiatedTotal}</Text>
          </View>
        ) : (
          <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
        )}
      </View>
      {order.type === "quotation" && order.negotiatedTotal && (
        <View style={styles.negotiationSection}>
          <View style={styles.negotiationHeader}>
            <Ionicons name="chatbubble-ellipses" size={20} color={colors.primary} />
            <Text style={styles.negotiationTitle}>Price Negotiation</Text>
          </View>
          <View style={styles.negotiationRow}>
            <Text style={styles.negotiationLabel}>Buyer's Proposed Total:</Text>
            <Text style={styles.negotiationValue}>₹{order.negotiatedTotal}</Text>
          </View>
          <View style={styles.negotiationRow}>
            <Text style={styles.negotiationLabel}>Your Listed Total:</Text>
            <Text style={styles.negotiationOriginalValue}>₹{order.totalAmount}</Text>
          </View>
          {order.status === "pending" && (
            <View style={styles.negotiationActions}>
              <TouchableOpacity
                style={[styles.acceptButton]}
                onPress={() => updateStatus("confirmed")}
                disabled={isUpdating}
              >
                <Text style={styles.acceptButtonText}>
                  {isUpdating ? "Processing..." : "Accept & Confirm"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rejectButton]}
                onPress={() => updateStatus("rejected")}
                disabled={isUpdating}
              >
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      {nextAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => updateStatus(nextAction.next)}
        >
          <Text style={styles.actionText}>{nextAction.label}</Text>
        </TouchableOpacity>
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
  statusSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
  },
  orderId: { ...typography.title1, color: colors.onSurface },
  statusBadge: {
    backgroundColor: colors.primary,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusText: {
    ...typography.subhead,
    color: colors.onPrimary,
    fontWeight: "600",
    textTransform: "capitalize",
  },
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
  customerRow: { flexDirection: "row", alignItems: "center" },
  customerInfo: { flex: 1, marginLeft: spacing.md },
  customerName: { ...typography.body, color: colors.onSurface },
  customerPhone: { ...typography.caption1, color: colors.onSurfaceSecondary },
  callButton: { padding: spacing.sm },
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
  itemPriceContainer: { alignItems: "flex-end" },
  itemOriginalPrice: { 
    ...typography.caption1, 
    color: colors.onSurfaceTertiary, 
    textDecorationLine: "line-through" 
  },
  itemNegotiatedPrice: { ...typography.caption1, color: colors.primary },
  addressText: { ...typography.body, color: colors.onSurfaceSecondary },
  divider: {
    height: 1,
    backgroundColor: colors.separator,
    marginHorizontal: spacing.md,
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  totalLabel: { ...typography.title2, color: colors.onSurface },
  totalValue: { ...typography.title2, color: colors.primary },
  totalPriceContainer: { alignItems: "flex-end" },
  totalOriginalPrice: { 
    ...typography.title3, 
    color: colors.onSurfaceTertiary, 
    textDecorationLine: "line-through" 
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.sm,
    padding: spacing.md,
    alignItems: "center",
    margin: spacing.md,
  },
  actionText: { ...typography.button, color: colors.onPrimary },
  negotiationSection: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: spacing.md,
    marginBottom: spacing.md,
  },
  negotiationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  negotiationTitle: {
    ...typography.headline,
    color: colors.onSurface,
  },
  negotiationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  negotiationLabel: {
    ...typography.body,
    color: colors.onSurfaceSecondary,
  },
  negotiationValue: {
    ...typography.title3,
    color: colors.primary,
  },
  negotiationOriginalValue: {
    ...typography.title3,
    color: colors.onSurfaceTertiary,
    textDecorationLine: "line-through",
  },
  negotiationActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: colors.success,
    borderRadius: spacing.sm,
    padding: spacing.md,
    alignItems: "center",
  },
  acceptButtonText: {
    ...typography.body,
    color: colors.onPrimary,
    fontWeight: "600",
  },
  rejectButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.error,
  },
  rejectButtonText: {
    ...typography.body,
    color: colors.error,
    fontWeight: "600",
  },
});

