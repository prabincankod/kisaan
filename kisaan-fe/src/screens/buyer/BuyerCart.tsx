import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Pressable,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useCartStore } from "../../store/cart.store";
import { createOrderFromCart } from "../../api/order.api";
import { useMutation } from "@tanstack/react-query";
import { colors, typography, spacing } from "../../theme/designSystem";

type CartItem = {
  id: string;
  product: {
    id: number;
    title: string;
    price: number;
    unit: string;
    images: { url: string }[];
    farmer?: { name: string };
  };
  quantity: number;
};

export default function BuyerCart() {
  const navigation = useNavigation<any>();
  const { items, removeItem, updateQuantity, clearCart, getTotal } =
    useCartStore();
  const [address, setAddress] = useState("");
  const [negotiatedTotal, setNegotiatedTotal] = useState("");
  const [negotiateMode, setNegotiateMode] = useState(false);

  const { mutate: checkout, isPending: isCheckingOut } = useMutation({
    mutationFn: (params: any) => createOrderFromCart(params),
    onSuccess: () => {
      Alert.alert("Success", "Order placed successfully!");
      clearCart();
    },
    onError: () => Alert.alert("Error", "Failed to place order"),
  });

  const handleCheckout = () => {
    if (!address.trim()) {
      Alert.alert("Error", "Please add a delivery address");
      return;
    }
    if (items.length === 0) {
      Alert.alert("Error", "Your cart is empty");
      return;
    }
    
    const farmerId = items[0]?.product?.farmerId;
    if (!farmerId) {
      Alert.alert("Error", "Unable to determine farmer for this order");
      return;
    }

    const hasNegotiation = negotiateMode && negotiatedTotal.trim() !== "";
    const finalTotal = hasNegotiation ? parseFloat(negotiatedTotal) : getTotal();

    checkout({
      farmerId,
      items: items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
        price: i.product.price,
      })),
      totalAmount: hasNegotiation ? finalTotal : getTotal(),
      type: hasNegotiation ? "quotation" : "buy",
      shippingAddress: address,
      ...(hasNegotiation && { negotiatedTotal: finalTotal }),
    });
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image
        source={{
          uri:
            item.product.images?.[0]?.url ||
            "https://placehold.co/100x100/F5B800/000000?text=Product",
        }}
        style={styles.itemImage}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.product.title}
        </Text>
        <Text style={styles.itemFarmer}>
          {item.product.farmer?.name || "Local Farmer"}
        </Text>
        <Text style={styles.itemPrice}>
          ₹{item.product.price * item.quantity}
        </Text>
      </View>
      <View style={styles.quantityControls}>
        <Pressable
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
        >
          <Ionicons name="remove" size={16} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <Pressable
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
        >
          <Ionicons name="add" size={16} color={colors.onSurface} />
        </Pressable>
      </View>
      <Pressable
        style={styles.removeButton}
        onPress={() => removeItem(item.product.id)}
      >
        <Ionicons name="trash" size={20} color={colors.error} />
      </Pressable>
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart" size={48} color={colors.onSurfaceTertiary} />
      <Text style={styles.emptyText}>Your cart is empty</Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      {items.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.addressInput}
            onPress={() =>
              Alert.prompt("Address", "Enter delivery address", (text) =>
                setAddress(text || "")
              )
            }
          >
            <Text
              style={address ? styles.addressText : styles.addressPlaceholder}
            >
              {address || "Add delivery address"}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.onSurfaceSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.negotiateToggle}
            onPress={() => {
              setNegotiateMode(!negotiateMode);
              setNegotiatedTotal("");
            }}
          >
            <Ionicons
              name={negotiateMode ? "chevron-up" : "chevron-down"}
              size={16}
              color={colors.primary}
            />
            <Text style={styles.negotiateToggleText}>
              {negotiateMode ? "Hide Negotiation" : "Negotiate Final Price"}
            </Text>
          </TouchableOpacity>

          {negotiateMode && (
            <View style={styles.negotiatedTotalContainer}>
              <Text style={styles.negotiatedTotalLabel}>Your Proposed Total:</Text>
              <View style={styles.negotiatedTotalInput}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.negotiatedTotalField}
                  placeholder={getTotal().toString()}
                  placeholderTextColor={colors.onSurfaceTertiary}
                  value={negotiatedTotal}
                  onChangeText={setNegotiatedTotal}
                  keyboardType="decimal-pad"
                />
              </View>
              <TouchableOpacity
                style={styles.clearNegotiate}
                onPress={() => setNegotiatedTotal("")}
              >
                <Ionicons name="close-circle" size={20} color={colors.onSurfaceSecondary} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.summary}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {negotiateMode && negotiatedTotal ? `₹${negotiatedTotal}` : `₹${getTotal()}`}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.checkoutButton, isCheckingOut && styles.buttonDisabled]}
            onPress={handleCheckout}
            disabled={isCheckingOut}
          >
            <Text style={styles.checkoutText}>
              {isCheckingOut ? "Processing..." : `Checkout • ₹${getTotal()}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { flexGrow: 1 },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: spacing.md,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: spacing.sm,
    backgroundColor: colors.surface,
  },
  itemInfo: { flex: 1, marginLeft: spacing.md },
  itemTitle: { ...typography.headline, color: colors.onSurface },
  itemFarmer: {
    ...typography.caption1,
    color: colors.onSurfaceSecondary,
    marginTop: 2,
  },
  itemPrice: {
    ...typography.title3,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  quantity: { ...typography.headline, marginHorizontal: spacing.sm },
  removeButton: { padding: spacing.sm },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.onSurfaceSecondary,
    marginTop: spacing.md,
  },
  shopButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  shopButtonText: { ...typography.button, color: colors.onPrimary },
  footer: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
  },
  addressInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  addressText: { ...typography.body, color: colors.onSurface, flex: 1 },
  addressPlaceholder: {
    ...typography.body,
    color: colors.onSurfaceTertiary,
    flex: 1,
  },
  negotiateToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    marginBottom: spacing.sm,
  },
  negotiateToggleText: {
    ...typography.subhead,
    color: colors.primary,
  },
  negotiateInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    marginBottom: spacing.md,
  },
  negotiateInfoText: {
    ...typography.caption1,
    color: colors.onSurfaceSecondary,
    flex: 1,
  },
  negotiatedPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  negotiatedPriceLabel: {
    ...typography.caption1,
    color: colors.onSurfaceSecondary,
  },
  negotiatedPriceInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flex: 1,
  },
  currencySymbol: {
    ...typography.subhead,
    color: colors.primary,
  },
  negotiatedPriceField: {
    flex: 1,
    ...typography.subhead,
    color: colors.onSurface,
    padding: spacing.xs,
  },
  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  totalLabel: { ...typography.headline, color: colors.onSurface },
  totalValue: { ...typography.title2, color: colors.primary },
  checkoutButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.sm,
    padding: spacing.md,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  checkoutText: { ...typography.button, color: colors.onPrimary },
  negotiatedTotalLabel: {
    ...typography.subhead,
    color: colors.onSurfaceSecondary,
  },
  negotiatedTotalContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  negotiatedTotalInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flex: 1,
  },
  negotiatedTotalField: {
    flex: 1,
    ...typography.subhead,
    color: colors.onSurface,
    padding: spacing.xs,
  },
  clearNegotiate: { padding: spacing.sm },
});
