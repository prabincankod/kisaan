import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { getProduct } from '../../api/product.api';
import { useCartStore } from '../../store/cart.store';
import { colors, typography, spacing } from '../../theme/designSystem';

export default function BuyerProductDetail() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { productId } = route.params;
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  const { data: product, isLoading } = useQuery({ queryKey: ['product', productId], queryFn: async () => { const res: any = await getProduct(productId); return res.data; } });
  const handleAddToCart = () => { if (product) addItem(product, quantity); };
  const totalPrice = (product?.price || 0) * quantity;
  const isAvailable = product?.quantityAvailable > 0;

  if (isLoading) return <View style={styles.loading}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (!product) return <View style={styles.loading}><Text style={styles.errorText}>Product not found</Text></View>;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: product.images?.[0]?.url || 'https://placehold.co/400x400/F5B800/000000?text=Product' }} style={styles.image} contentFit="cover" />
        <View style={styles.content}>
          <Text style={styles.title}>{product.title}</Text>
          {product.farmer && <Text style={styles.farmer}>by {product.farmer.name}</Text>}
          <View style={styles.priceRow}><Text style={styles.price}>₹{product.price}</Text><Text style={styles.unit}>/{product.unit}</Text></View>
          <View style={styles.stockRow}><Ionicons name={isAvailable ? 'checkmark-circle' : 'close-circle'} size={20} color={isAvailable ? colors.success : colors.error} /><Text style={[styles.stockText, !isAvailable && styles.stockTextUnavailable]}>{isAvailable ? `${product.quantityAvailable} ${product.unit} available` : 'Out of Stock'}</Text></View>
          {product.description && <View style={styles.descriptionContainer}><Text style={styles.sectionTitle}>Description</Text><Text style={styles.description}>{product.description}</Text></View>}
        </View>
      </ScrollView>
      {isAvailable && (
        <View style={styles.footer}>
          <View style={styles.quantitySelector}>
            <TouchableOpacity style={styles.quantityButton} onPress={() => setQuantity(Math.max(1, quantity - 1))}><Ionicons name="remove" size={20} color={colors.onSurface} /></TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity style={[styles.quantityButton, quantity >= product.quantityAvailable && styles.quantityButtonDisabled]} onPress={() => setQuantity(Math.min(product.quantityAvailable, quantity + 1))} disabled={quantity >= product.quantityAvailable}><Ionicons name="add" size={20} color={colors.onSurface} /></TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}><Text style={styles.addButtonText}>Add to Cart • ₹{totalPrice}</Text></TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorText: { ...typography.body, color: colors.error },
  image: { width: '100%', aspectRatio: 1, backgroundColor: colors.surface },
  content: { padding: spacing.md },
  title: { ...typography.title1, color: colors.onSurface },
  farmer: { ...typography.body, color: colors.onSurfaceSecondary, marginTop: spacing.xs },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.md },
  price: { ...typography.title1, color: colors.primary },
  unit: { ...typography.body, color: colors.onSurfaceSecondary, marginLeft: spacing.xs },
  stockRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.xs },
  stockText: { ...typography.body, color: colors.success },
  stockTextUnavailable: { color: colors.error },
  descriptionContainer: { marginTop: spacing.lg },
  sectionTitle: { ...typography.headline, color: colors.onSurface, marginBottom: spacing.sm },
  description: { ...typography.body, color: colors.onSurfaceSecondary, lineHeight: 24 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: colors.surfaceElevated, borderTopWidth: 1, borderTopColor: colors.separator },
  quantitySelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: spacing.sm },
  quantityButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  quantityButtonDisabled: { opacity: 0.5 },
  quantityText: { ...typography.headline, marginHorizontal: spacing.md },
  addButton: { flex: 1, backgroundColor: colors.primary, borderRadius: spacing.sm, padding: spacing.md, alignItems: 'center' },
  addButtonText: { ...typography.button, color: colors.onPrimary },
});