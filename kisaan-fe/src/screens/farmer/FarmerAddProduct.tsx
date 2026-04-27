import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { getProduct, createProduct, updateProduct } from '../../api/product.api';
import { getCategories } from '../../api/category.api';
import { colors, typography, spacing } from '../../theme/designSystem';

type Category = { id: number; name: string };

export default function FarmerAddProduct() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { productId } = route.params || {};
  const editMode = !!productId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('kg');
  const [quantity, setQuantity] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: async () => { const res: any = await getCategories(); return res.data; } });
  const { data: productData, isLoading: isLoadingProduct } = useQuery({ queryKey: ['product', productId], queryFn: async () => { const res: any = await getProduct(productId); return res.data; }, enabled: !!productId });

  useEffect(() => { if (productData) { setTitle(productData.title || ''); setDescription(productData.description || ''); setPrice(productData.price?.toString() || ''); setUnit(productData.unit || 'kg'); setQuantity(productData.quantityAvailable?.toString() || ''); setImageUrl(productData.images?.[0]?.url || ''); } }, [productData]);

  const { mutate: saveProduct, isLoading } = useMutation({ mutationFn: (data: any) => editMode ? updateProduct(productId, data) : createProduct(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['farmer-products'] }); Alert.alert('Success', `Product ${editMode ? 'updated' : 'created'} successfully!`); navigation.goBack(); }, onError: () => Alert.alert('Error', `Failed to ${editMode ? 'update' : 'create'} product`) });

  const handleSave = () => { if (!title || !price || !quantity) { Alert.alert('Error', 'Please fill all required fields'); return; }
    saveProduct({ title, description, price: parseFloat(price), unit, quantityAvailable: parseInt(quantity), images: imageUrl ? [{ url: imageUrl }] : [] }); };

  const categories: Category[] = categoriesData || [];

  if (isLoadingProduct) return <View style={styles.loading}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageSection}>{imageUrl ? <Image source={{ uri: imageUrl }} style={styles.productImage} /> : <TouchableOpacity style={styles.imagePlaceholder} onPress={() => Alert.alert('Image', 'Image upload coming soon')}><Ionicons name="camera" size={32} color={colors.onSurfaceTertiary} /><Text style={styles.imagePlaceholderText}>Add Image</Text></TouchableOpacity>}</View>
      <View style={styles.form}>
        <View style={styles.inputGroup}><Text style={styles.label}>Title *</Text><TextInput style={styles.input} placeholder="Product name" placeholderTextColor={colors.onSurfaceTertiary} value={title} onChangeText={setTitle} /></View>
        <View style={styles.inputGroup}><Text style={styles.label}>Description</Text><TextInput style={[styles.input, styles.textArea]} placeholder="Describe your product" placeholderTextColor={colors.onSurfaceTertiary} value={description} onChangeText={setDescription} multiline numberOfLines={4} /></View>
        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, styles.halfWidth]}><Text style={styles.label}>Price *</Text><TextInput style={styles.input} placeholder="0" placeholderTextColor={colors.onSurfaceTertiary} value={price} onChangeText={setPrice} keyboardType="decimal-pad" /></View>
          <View style={[styles.inputGroup, styles.halfWidth]}><Text style={styles.label}>Unit</Text><View style={styles.unitSelector}>{['kg', 'piece', 'dozen', 'liter'].map((u) => <TouchableOpacity key={u} style={[styles.unitButton, unit === u && styles.unitButtonActive]} onPress={() => setUnit(u)}><Text style={[styles.unitText, unit === u && styles.unitTextActive]}>{u}</Text></TouchableOpacity>)}</View></View>
        </View>
        <View style={styles.inputGroup}><Text style={styles.label}>Quantity *</Text><TextInput style={styles.input} placeholder="0" placeholderTextColor={colors.onSurfaceTertiary} value={quantity} onChangeText={setQuantity} keyboardType="number-pad" /></View>
      </View>
      <TouchableOpacity style={[styles.saveButton, isLoading && styles.buttonDisabled]} onPress={handleSave} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.saveButtonText}>{editMode ? 'Update Product' : 'Add Product'}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  imageSection: { alignItems: 'center', padding: spacing.md },
  productImage: { width: 200, height: 200, borderRadius: spacing.md, backgroundColor: colors.surface },
  imagePlaceholder: { width: 200, height: 200, borderRadius: spacing.md, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: colors.separator },
  imagePlaceholderText: { ...typography.subhead, color: colors.onSurfaceTertiary, marginTop: spacing.sm },
  form: { padding: spacing.md },
  inputGroup: { marginBottom: spacing.md },
  label: { ...typography.subhead, color: colors.onSurface, marginBottom: spacing.xs },
  input: { ...typography.body, backgroundColor: colors.surface, borderRadius: spacing.sm, padding: spacing.md, color: colors.onSurface },
  textArea: { height: 100, textAlignVertical: 'top' },
  inputRow: { flexDirection: 'row', gap: spacing.md },
  halfWidth: { flex: 1 },
  unitSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  unitButton: { backgroundColor: colors.surface, borderRadius: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  unitButtonActive: { backgroundColor: colors.primary },
  unitText: { ...typography.subhead, color: colors.onSurface },
  unitTextActive: { color: colors.onPrimary, fontWeight: '600' },
  saveButton: { backgroundColor: colors.primary, borderRadius: spacing.sm, padding: spacing.md, alignItems: 'center', margin: spacing.md },
  buttonDisabled: { opacity: 0.5 },
  saveButtonText: { ...typography.button, color: colors.onPrimary },
});