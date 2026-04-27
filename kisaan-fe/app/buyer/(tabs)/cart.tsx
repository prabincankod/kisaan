import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useMutation } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { createOrder } from "../../../src/api";
import { useCartStore } from "../../../src/store";
import { colors, spacing, borderRadius, typography } from "../../../src/theme/designSystem";

export default function BuyerCart() {
  const [address, setAddress] = useState("");
  const [ordering, setOrdering] = useState(false);

  const { items, updateQuantity, removeItem, clearCart, getTotal, farmerName } = useCartStore();
  const total = getTotal();
  const itemCount = items.length;

  const orderMutation = useMutation({
    mutationFn: async () => {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: Number(item.product.price),
      }));
      return createOrder({
        farmerId: items[0]?.product?.farmerId,
        items: orderItems,
        totalAmount: total,
        type: "buy",
        shippingAddress: address,
      });
    },
    onSuccess: () => {
      clearCart();
      Alert.alert("Success!", "Your order has been placed.", [
        { text: "View Orders", onPress: () => router.replace("/buyer/(tabs)/orders") }
      ]);
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to place order");
    },
    onSettled: () => setOrdering(false),
  });

  const handlePlaceOrder = () => {
    if (!address.trim()) {
      Alert.alert("Address Required", "Please enter your delivery address");
      return;
    }
    setOrdering(true);
    orderMutation.mutate();
  };

  const renderItem = ({ item }: { item: any }) => {
    const { product, quantity } = item;
    const imageUrl = product.images?.[0]?.url || "https://placehold.co/100x100/e6eeff/2d6a4f";

    return (
      <View style={styles.cartItem}>
        <Image source={{ uri: imageUrl }} style={styles.itemImage} />
        
        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle} numberOfLines={2}>{product.title}</Text>
          <Text style={styles.itemPrice}>₹{product.price}/{product.unit}</Text>
          
          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => updateQuantity(product.id, quantity - 1)}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            
            <Text style={styles.qtyText}>{quantity}</Text>
            
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => updateQuantity(product.id, quantity + 1)}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.itemRight}>
          <Text style={styles.itemTotal}>₹{product.price * quantity}</Text>
          <TouchableOpacity onPress={() => removeItem(product.id)}>
            <Text style={styles.removeBtn}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (itemCount === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add some fresh produce to get started</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.replace("/buyer/(tabs)/dashboard")}
          >
            <Text style={styles.browseBtnText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Cart</Text>
            <Text style={styles.headerSubtitle}>
              {itemCount} item{itemCount > 1 ? "s" : ""} from {farmerName}
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.checkoutSection}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TextInput
              style={styles.addressInput}
              placeholder="Enter your full delivery address..."
              placeholderTextColor={colors.outline}
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
            />

            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>₹{total}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery</Text>
                <Text style={styles.freeDelivery}>Free</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₹{total}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.orderBtn, ordering && styles.orderBtnDisabled]}
              onPress={handlePlaceOrder}
              disabled={ordering}
            >
              {ordering ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.orderBtnText}>Place Order • ₹{total}</Text>
              )}
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.onSurface,
  },
  headerSubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceContainer,
  },
  itemDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  itemTitle: {
    ...typography.bodyMd,
    fontWeight: "600",
    color: colors.onSurface,
  },
  itemPrice: {
    ...typography.labelMd,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyBtnText: {
    fontSize: 16,
    color: colors.onSurface,
  },
  qtyText: {
    ...typography.body,
    marginHorizontal: spacing.sm,
  },
  itemRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  itemTotal: {
    ...typography.body,
    fontWeight: "700",
    color: colors.onSurface,
  },
  removeBtn: {
    ...typography.labelMd,
    color: colors.error,
  },
  checkoutSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  addressInput: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.onSurface,
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    textAlignVertical: "top",
  },
  summary: {
    marginTop: spacing.xl,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  summaryValue: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  freeDelivery: {
    ...typography.bodyMd,
    color: colors.primary,
    fontWeight: "600",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  totalLabel: {
    ...typography.button,
    color: colors.onSurface,
  },
  totalValue: {
    ...typography.h2,
    color: colors.primary,
  },
  orderBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: "center",
    marginTop: spacing.lg,
    marginBottom: 100,
  },
  orderBtnDisabled: {
    opacity: 0.7,
  },
  orderBtnText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.onSurface,
  },
  emptySubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  browseBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  browseBtnText: {
    ...typography.button,
    color: colors.onPrimary,
  },
});