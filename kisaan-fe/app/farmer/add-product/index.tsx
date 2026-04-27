import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert, ActivityIndicator } from "react-native";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { createProduct, getCategories, getProduct, updateProduct } from "../../../src/api";
import { colors, spacing, borderRadius, typography } from "../../../src/theme/designSystem";

const UNITS = ["kg", "pcs", "liter", "dozen", "bunch"];

export default function AddProduct() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEditing = !!id;
  const productId = id ? parseInt(id) : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [images, setImages] = useState<any[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [categoryIds, setCategoryIds] = useState<number[]>([]);

  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res: any = await getCategories();
      return res.data;
    },
  });

  const { data: product } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const res: any = await getProduct(productId!);
      return res.data;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (product) {
      setTitle(product.title || "");
      setDescription(product.description || "");
      setPrice(product.price?.toString() || "");
      setQuantity(product.quantityAvailable?.toString() || "");
      setUnit(product.unit || "kg");
      setCategoryIds(product.categories?.map((c: any) => c.categoryId) || []);
      setExistingImages(product.images || []);
    }
  }, [product]);

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer-products"] });
      Alert.alert("Success", "Product created!");
      router.back();
    },
    onError: (error: any) => Alert.alert("Error", error.message),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateProduct(productId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer-products"] });
      Alert.alert("Success", "Product updated!");
      router.back();
    },
    onError: (error: any) => Alert.alert("Error", error.message),
  });

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
    });
    if (!result.canceled) {
      const newImages = result.assets.map((asset) => ({
        uri: asset.uri,
        name: `img_${Date.now()}.jpg`,
        type: "image/jpeg",
      }));
      setImages([...images, ...newImages].slice(0, 5));
    }
  };

  const handleSubmit = async () => {
    if (!title || !price || !quantity) {
      Alert.alert("Required", "Please fill in title, price, and quantity");
      return;
    }

    const payload = {
      title,
      description,
      unit,
      price: Number(price),
      quantityAvailable: Number(quantity),
      categoryIds,
      images: images.map((i) => i.uri),
      removeImageIds: existingImages.map((i) => i.id),
    };

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const toggleCategory = (catId: number) => {
    setCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Product Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="Fresh Organic Tomatoes"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your product..."
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <View style={styles.row}>
          <View style={[styles.halfInput, { marginRight: spacing.sm }]}>
            <Text style={styles.label}>Price *</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Quantity *</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <Text style={styles.label}>Unit</Text>
        <View style={styles.unitRow}>
          {UNITS.map((u) => (
            <TouchableOpacity
              key={u}
              style={[styles.unitBtn, unit === u && styles.unitBtnActive]}
              onPress={() => setUnit(u)}
            >
              <Text style={[styles.unitText, unit === u && styles.unitTextActive]}>{u}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Categories</Text>
        <View style={styles.categoryRow}>
          {categories?.map((cat: any) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryBtn, categoryIds.includes(cat.id) && styles.categoryBtnActive]}
              onPress={() => toggleCategory(cat.id)}
            >
              <Text style={[styles.categoryText, categoryIds.includes(cat.id) && styles.categoryTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Images ({images.length + existingImages.length}/5)</Text>
        <View style={styles.imagesRow}>
          {existingImages.map((img: any) => (
            <View key={img.id} style={styles.imageThumb}>
              <Text style={styles.imagePlaceholder}>IMG</Text>
            </View>
          ))}
          {images.map((img, idx) => (
            <View key={idx} style={styles.imageThumb}>
              <Text style={styles.imagePlaceholder}>NEW</Text>
            </View>
          ))}
          {images.length + existingImages.length < 5 && (
            <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
              <Text style={styles.addImageIcon}>+</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.submitText}>
              {isEditing ? "Save Changes" : "Create Product"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  label: { ...typography.labelMd, color: colors.onSurface, marginBottom: spacing.sm, marginTop: spacing.md },
  input: { backgroundColor: colors.surfaceContainerLowest, borderRadius: borderRadius.md, padding: spacing.md, ...typography.body, color: colors.onSurface, borderWidth: 1, borderColor: colors.outlineVariant },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  row: { flexDirection: "row" },
  halfInput: { flex: 1 },
  unitRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  unitBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md, backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant },
  unitBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  unitText: { ...typography.labelMd, color: colors.onSurfaceVariant },
  unitTextActive: { color: colors.onPrimary },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  categoryBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant },
  categoryBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryText: { ...typography.labelMd, color: colors.onSurfaceVariant },
  categoryTextActive: { color: colors.onPrimary },
  imagesRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  imageThumb: { width: 72, height: 72, borderRadius: borderRadius.md, backgroundColor: colors.surfaceContainer, justifyContent: "center", alignItems: "center" },
  imagePlaceholder: { ...typography.labelMd, color: colors.onSurfaceVariant },
  addImageBtn: { width: 72, height: 72, borderRadius: borderRadius.md, borderWidth: 2, borderColor: colors.outlineVariant, borderStyle: "dashed", justifyContent: "center", alignItems: "center" },
  addImageIcon: { fontSize: 24, color: colors.onSurfaceVariant },
  submitBtn: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: borderRadius.md, alignItems: "center", marginTop: spacing.xl, marginBottom: 100 },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: { ...typography.button, color: colors.onPrimary },
});