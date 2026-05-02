import { useState, useCallback, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Modal,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { getProduct, Product } from "../../api/product.api";
import { useCartStore } from "../../store/cart.store";
import { createQuotation } from "../../api/quotation.api";
import { colors, typography, spacing, borderRadius } from "../../theme/designSystem";
import { BACKEND_URL } from "../../api/client";
import { SafeAreaView } from "react-native-safe-area-context";

let Haptics: any = null;
if (Platform.OS !== "web") {
  try {
    Haptics = require("expo-haptics");
  } catch (e) { }
}

const MemoizedThumbnail = memo(function ThumbnailItem({
  img,
  isActive,
  onPress,
}: {
  img: { url: string };
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.thumbnail, isActive && styles.thumbnailActive]}
      onPress={onPress}
    >
      <Image
        source={{
          uri: img.url
            ? `${BACKEND_URL}${img.url}`
            : "https://placehold.co/60x60/F5B800/000000?text=Product",
        }}
        style={styles.thumbnailImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
});

export default function BuyerProductDetail() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { productId } = route.params;
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showNegotiate, setShowNegotiate] = useState(false);
  const [offeredPrice, setOfferedPrice] = useState("");
  const [showCartModal, setShowCartModal] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const res: any = await getProduct(productId);
      return res.data as Product;
    },
  });


  const { mutate: submitQuotation, isPending: isNegotiating } = useMutation({
    mutationFn: (params: {
      farmerId: number;
      productId: number;
      quantity: number;
      price: number;
    }) =>
      createQuotation({
        farmerId: params.farmerId,
        items: [
          {
            productId: params.productId,
            quantity: params.quantity,
            offeredPrice: params.price,
          },
        ],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-quotations"] });
      setShowNegotiate(false);
      setOfferedPrice("");
      Alert.alert("Success", "Negotiation request sent to farmer!");
    },
    onError: () => Alert.alert("Error", "Failed to send negotiation request"),
  });

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    const result = addItem(product, quantity);
    if (result.success) {
      Haptics?.notificationFeedback?.(Haptics.NotificationFeedbackType.Success);
      setShowCartModal(true);
      setTimeout(() => setShowCartModal(false), 1500);
    } else if (result.message?.includes("Replace cart")) {
      Alert.alert(
        "Different Farmer",
        result.message,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Replace Cart",
            style: "destructive",
            onPress: () => {
              const replaceResult = addItem(product, quantity, true);
              if (replaceResult.success) {
                Haptics?.notificationFeedback?.(Haptics.NotificationFeedbackType.Success);
                setShowCartModal(true);
                setTimeout(() => setShowCartModal(false), 1500);
              }
            },
          },
        ]
      );
    } else {
      Alert.alert("Cannot Add", result.message || "Failed to add to cart");
    }
  }, [product, quantity, addItem]);

  const handleNegotiate = useCallback(() => {
    if (!product || !offeredPrice) {
      Alert.alert("Error", "Please enter your offered price");
      return;
    }
    const price = parseFloat(offeredPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert("Error", "Please enter a valid price");
      return;
    }
    if (price >= product.price) {
      Alert.alert("Error", "Offered price must be less than the current price");
      return;
    }
    submitQuotation({
      farmerId: product.farmerId,
      productId: product.id,
      quantity,
      price,
    });
  }, [product, offeredPrice, quantity, submitQuotation]);

  const handleImagePress = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  const isAvailable = (product?.quantityAvailable ?? 0) > 0;
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
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle" size={64} color={colors.onSurfaceTertiary} />
          <Text style={styles.errorText}>Product not found</Text>
          <TouchableOpacity
            style={styles.backHomeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backHomeText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={spacing.sm}
        >
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.title}
        </Text>
        <View style={styles.headerRight} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: product.images?.[selectedImageIndex]?.url
                ? `${BACKEND_URL}${product.images[selectedImageIndex].url}`
                : "https://placehold.co/400x400/F5B800/000000?text=Product",
            }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          {product.images && product.images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageThumbnails}
              contentContainerStyle={styles.thumbnailContainer}
            >
              {product.images.map((img: any, idx: number) => (
                <MemoizedThumbnail
                  key={idx}
                  img={img}
                  isActive={selectedImageIndex === idx}
                  onPress={() => handleImagePress(idx)}
                />
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{product.title}</Text>

          {product.farmer && (
            <TouchableOpacity
              style={styles.farmerRow}
              onPress={() =>
                navigation.navigate("BuyerFarmerDetail", {
                  farmerId: product.farmerId,
                  farmerName: product.farmer?.name,
                })
              }
            >
              <Ionicons name="person-circle" size={20} color={colors.onSurfaceSecondary} />
              <Text style={styles.farmer}>by {product.farmer.name}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceSecondary} />
            </TouchableOpacity>
          )}

          {product.categories && product.categories.length > 0 && (
            <View style={styles.categoriesRow}>
              {product.categories.map((cat: any, idx: number) => (
                <View key={idx} style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {cat.category?.name || "Uncategorized"}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product.price}</Text>
            <Text style={styles.unit}>/{product.unit}</Text>
          </View>

          <View style={styles.stockRow}>
            <Ionicons
              name={isAvailable ? "checkmark-circle" : "close-circle"}
              size={20}
              color={isAvailable ? colors.success : colors.error}
            />
            <Text
              style={[
                styles.stockText,
                !isAvailable && styles.stockTextUnavailable,
              ]}
            >
              {isAvailable
                ? `${product.quantityAvailable} ${product.unit} available`
                : "Out of Stock"}
            </Text>
          </View>

          <View style={styles.divider} />

          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.sectionText}>{product.description}</Text>
            </View>
          )}

          {product.nutritionalInfo && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nutritional Info</Text>
              <Text style={styles.sectionText}>{product.nutritionalInfo}</Text>
            </View>
          )}

          {isAvailable && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quantity</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Ionicons name="remove" size={20} color={colors.onSurface} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity >= product.quantityAvailable &&
                    styles.quantityButtonDisabled,
                  ]}
                  onPress={() =>
                    setQuantity(
                      Math.min(product.quantityAvailable, quantity + 1)
                    )
                  }
                  disabled={quantity >= product.quantityAvailable}
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color={
                      quantity >= product.quantityAvailable
                        ? colors.onSurfaceTertiary
                        : colors.onSurface
                    }
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.totalText}>
                Total: ₹{totalPrice.toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {isAvailable && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.negotiateButton}
              onPress={() => setShowNegotiate(!showNegotiate)}
            >
              <Ionicons
                name={showNegotiate ? "chevron-up" : "pricetag"}
                size={20}
                color={colors.primary}
              />
              <Text style={styles.negotiateButtonText}>
                {showNegotiate ? "Hide Negotiation" : "Negotiate Price"}
              </Text>
            </TouchableOpacity>

            {showNegotiate && (
              <View style={styles.negotiateSection}>
                <View style={styles.negotiateInputRow}>
                  <View style={styles.negotiateInputContainer}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <TextInput
                      style={styles.negotiateInput}
                      placeholder="Your offered price"
                      placeholderTextColor={colors.onSurfaceTertiary}
                      value={offeredPrice}
                      onChangeText={setOfferedPrice}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.sendNegotiateButton,
                      isNegotiating && styles.buttonDisabled,
                    ]}
                    onPress={handleNegotiate}
                    disabled={isNegotiating}
                  >
                    {isNegotiating ? (
                      <ActivityIndicator size="small" color={colors.onPrimary} />
                    ) : (
                      <Ionicons name="send" size={20} color={colors.onPrimary} />
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.negotiateHint}>
                  Offer less than ₹{product.price} to negotiate
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.addToCartButton, isAvailable ? styles.cartButtonEnabled : {}]}
              onPress={handleAddToCart}
              disabled={!isAvailable}
            >
              <Ionicons name="cart" size={20} color={colors.onPrimary} />
              <Text style={styles.addToCartText}>
                Add to Cart • ₹{totalPrice.toFixed(2)}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      <Modal
        visible={showCartModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={48} color={colors.success} />
            <Text style={styles.successText}>Added to cart!</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  backHomeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  backHomeText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.separatorOpaque,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.headline,
    color: colors.onSurface,
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  imageContainer: {
    backgroundColor: colors.surface,
  },
  mainImage: {
    width: "100%",
    height: 320,
  },
  imageThumbnails: {
    position: "absolute",
    bottom: spacing.md,
    left: 0,
    right: 0,
  },
  thumbnailContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.sm,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbnailActive: {
    borderColor: colors.primary,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  content: {
    padding: spacing.md,
  },
  title: {
    ...typography.title2,
    color: colors.onSurface,
  },
  farmerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  farmer: {
    ...typography.subhead,
    color: colors.onSurfaceSecondary,
    flex: 1,
  },
  categoriesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  categoryBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  categoryBadgeText: {
    ...typography.caption1,
    color: colors.onSurfaceSecondary,
    fontWeight: "600",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: spacing.md,
  },
  price: {
    ...typography.title1,
    color: colors.primary,
  },
  unit: {
    ...typography.body,
    color: colors.onSurfaceSecondary,
    marginLeft: spacing.xs,
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  stockText: {
    ...typography.subhead,
    color: colors.success,
    fontWeight: "600",
  },
  stockTextUnavailable: {
    color: colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: colors.separatorOpaque,
    marginVertical: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  sectionText: {
    ...typography.body,
    color: colors.onSurfaceSecondary,
    lineHeight: 24,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    alignSelf: "flex-start",
    marginTop: spacing.xs,
  },
  quantityButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonDisabled: {
    opacity: 0.4,
  },
  quantityText: {
    ...typography.title3,
    color: colors.onSurface,
    minWidth: 44,
    textAlign: "center",
  },
  totalText: {
    ...typography.headline,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  footer: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.separatorOpaque,
  },
  negotiateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  negotiateButtonText: {
    ...typography.subhead,
    color: colors.primary,
    fontWeight: "600",
  },
  negotiateSection: {
    marginBottom: spacing.md,
  },
  negotiateInputRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  negotiateInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.separatorOpaque,
  },
  currencySymbol: {
    ...typography.subhead,
    color: colors.primary,
    fontWeight: "600",
  },
  negotiateInput: {
    flex: 1,
    ...typography.subhead,
    color: colors.onSurface,
    paddingVertical: spacing.sm,
  },
  sendNegotiateButton: {
    backgroundColor: colors.primary,
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  negotiateHint: {
    ...typography.caption1,
    color: colors.onSurfaceTertiary,
    marginTop: spacing.xs,
  },
  addToCartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  cartButtonEnabled: {
    backgroundColor: colors.primary,
  },
  addToCartText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  successCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  successText: {
    ...typography.headline,
    color: colors.success,
    marginTop: spacing.sm,
  },
});
