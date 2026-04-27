import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { getProduct } from "@/src/api";
import { useCartStore } from "@/src/store";
import { colors, spacing, borderRadius, typography } from "@/src/theme/designSystem";

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = parseInt(id);
  
  const [quantity, setQuantity] = useState(1);
  const { addItem, items } = useCartStore();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const res: any = await getProduct(productId);
      return res.data;
    },
  });

  const currentItem = items.find((i) => i.product.id === productId);
  const alreadyInCart = currentItem?.quantity || 0;
  const maxQty = product?.quantityAvailable || 0;

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
  };

  const totalPrice = (product?.price || 0) * quantity;

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loading}>
        <Text>Product not found</Text>
      </View>
    );
  }

  const isAvailable = product.quantityAvailable > 0;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: product.images?.[0]?.url || "https://placehold.co/400x400/e6eeff/2d6a4f?text=Fresh" }}
          style={styles.image}
          contentFit="cover"
        />

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{product.title}</Text>
            {product.farmer && (
              <Text style={styles.farmer}>by {product.farmer.name}</Text>
            )}
          </View>

          <View style={styles.priceSection}>
            <View>
              <Text style={styles.price}>₹{product.price}</Text>
              <Text style={styles.unit}>per {product.unit}</Text>
            </View>
            <View style={styles.stockBadge}>
              <Text style={styles.stockText}>
                {isAvailable ? `${product.quantityAvailable} ${product.unit} available` : "Out of Stock"}
              </Text>
            </View>
          </View>

          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {isAvailable && (
        <View style={styles.footer}>
          <View style={styles.quantitySelector}>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text style={styles.qtyButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={[styles.qtyButton, quantity >= maxQty && styles.qtyButtonDisabled]}
              onPress={() => setQuantity(Math.min(maxQty, quantity + 1))}
              disabled={quantity >= maxQty}
            >
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {alreadyInCart > 0 && (
            <Text style={styles.alreadyInCart}>{alreadyInCart} in cart</Text>
          )}

          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <Text style={styles.addToCartText}>
              Add to Cart • ₹{totalPrice}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {!isAvailable && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.notifyButton}>
            <Text style={styles.notifyText}>Notify When Available</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: "100%", aspectRatio: 1, backgroundColor: colors.surfaceContainer },
  content: { padding: spacing.lg, paddingBottom: 120 },
  header: { marginBottom: spacing.lg },
  title: { ...typography.h1, color: colors.onSurface },
  farmer: { ...typography.bodyMd, color: colors.onSurfaceVariant, marginTop: spacing.xs },
  priceSection: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xl },
  price: { ...typography.h1, color: colors.primary },
  unit: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  stockBadge: { backgroundColor: colors.primaryContainer, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  stockText: { ...typography.labelMd, color: colors.onPrimaryContainer },
  section: { marginBottom: spacing.xl },
  sectionTitle: { ...typography.h2, color: colors.onSurface, marginBottom: spacing.sm },
  description: { ...typography.body, color: colors.onSurfaceVariant, lineHeight: 24 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: colors.surfaceContainerLowest, padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.outlineVariant, flexDirection: "row", alignItems: "center", gap: spacing.md },
  quantitySelector: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceContainer, borderRadius: borderRadius.md, padding: spacing.xs },
  qtyButton: { width: 36, height: 36, borderRadius: borderRadius.sm, backgroundColor: colors.surfaceContainerLowest, justifyContent: "center", alignItems: "center" },
  qtyButtonDisabled: { opacity: 0.5 },
  qtyButtonText: { fontSize: 20, color: colors.onSurface },
  quantityText: { ...typography.button, color: colors.onSurface, marginHorizontal: spacing.md },
  alreadyInCart: { ...typography.labelMd, color: colors.primary },
  addToCartButton: { flex: 1, backgroundColor: colors.primary, borderRadius: borderRadius.md, padding: spacing.md, alignItems: "center" },
  addToCartText: { ...typography.button, color: colors.onPrimary },
  notifyButton: { flex: 1, backgroundColor: colors.surfaceContainer, borderRadius: borderRadius.md, padding: spacing.md, alignItems: "center", borderWidth: 1, borderColor: colors.outlineVariant },
  notifyText: { ...typography.button, color: colors.onSurface },
});