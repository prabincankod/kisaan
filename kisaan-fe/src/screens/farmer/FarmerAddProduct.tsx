import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  getProduct,
  createProduct,
  updateProduct,
} from "../../api/product.api";
import { getCategories, createCategory } from "../../api/category.api";
import { colors, typography, spacing } from "../../theme/designSystem";

type Category = { id: number; name: string };

const UNITS = ["kg", "pcs"] as const;

export default function FarmerAddProduct() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { productId } = route.params || {};
  const editMode = !!productId;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [nutritionalInfo, setNutritionalInfo] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<"kg" | "pcs">("kg");
  const [quantity, setQuantity] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res: any = await getCategories();
      return res.data;
    },
  });

  const { data: productData, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const res: any = await getProduct(productId);
      return res.data;
    },
    enabled: !!productId,
  });

  useEffect(() => {
    if (productData) {
      setTitle(productData.title || "");
      setDescription(productData.description || "");
      setNutritionalInfo(productData.nutritionalInfo || "");
      setPrice(productData.price?.toString() || "");
      setUnit(productData.unit || "kg");
      setQuantity(productData.quantityAvailable?.toString() || "");
      setImages(productData.images?.map((img: any) => img.url) || []);
      setSelectedCategoryIds(
        productData.categories?.map((c: any) => c.category?.id || c.categoryId).filter(Boolean) || []
      );
    }
  }, [productData]);

  const { mutate: saveProduct, isPending: isSaving } = useMutation({
    mutationFn: (data: any) =>
      editMode ? updateProduct(productId, data) : createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer-products"] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      Alert.alert("Success", `Product ${editMode ? "updated" : "added"} successfully!`);
      navigation.goBack();
    },
    onError: () => {
      Alert.alert("Error", `Failed to ${editMode ? "update" : "add"} product`);
    },
  });

  const { mutate: addCategory, isPending: isAddingCategory } = useMutation({
    mutationFn: (name: string) => createCategory(name),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setSelectedCategoryIds((prev) => [...prev, res.data.id]);
      setShowCategoryModal(false);
      setNewCategoryName("");
      Alert.alert("Success", `Category "${res.data.name}" added!`);
    },
    onError: () => {
      Alert.alert("Error", "Failed to create category");
    },
  });

    const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      if (asset.base64) {
        const mimeType = asset.type === 'video' ? 'video/mp4' : 'image/jpeg';
        const base64 = `data:${mimeType};base64,${asset.base64}`;
        setImages((prev) => [...prev, base64]);
      } else if (asset.uri) {
        setImages((prev) => [...prev, asset.uri]);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Missing Field", "Please enter product title");
      return;
    }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Alert.alert("Invalid Price", "Please enter a valid price");
      return;
    }
    if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) < 0) {
      Alert.alert("Invalid Quantity", "Please enter a valid quantity");
      return;
    }

    saveProduct({
      title: title.trim(),
      description: description.trim() || undefined,
      nutritionalInfo: nutritionalInfo.trim() || undefined,
      price: parseFloat(price),
      unit,
      quantityAvailable: parseInt(quantity),
      categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
      images: images.length > 0 ? images : undefined,
    });
  };

  const categories: Category[] = categoriesData || [];

  if (isLoadingProduct)
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
    
        {/* Image Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Images</Text>
          <FlatList
            horizontal
            data={images}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: item }} style={styles.productImage} />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            )}
            ListFooterComponent={() => (
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                <Ionicons name="camera" size={28} color={colors.onSurfaceTertiary} />
                <Text style={styles.addImageText}>Add Photo</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.imagesList}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Fresh Organic Tomatoes"
              placeholderTextColor={colors.onSurfaceTertiary}
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your product, freshness, origin, etc."
              placeholderTextColor={colors.onSurfaceTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nutritional Info</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g., Rich in Vitamin C, low calories"
              placeholderTextColor={colors.onSurfaceTertiary}
              value={nutritionalInfo}
              onChangeText={setNutritionalInfo}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Pricing & Inventory */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing & Inventory</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Price *</Text>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  placeholderTextColor={colors.onSurfaceTertiary}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Quantity *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={colors.onSurfaceTertiary}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Unit</Text>
            <View style={styles.unitSelector}>
              {UNITS.map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[styles.unitButton, unit === u && styles.unitButtonActive]}
                  onPress={() => setUnit(u)}
                >
                  <Text style={[styles.unitText, unit === u && styles.unitTextActive]}>
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity
              style={styles.addCategoryBtn}
              onPress={() => setShowCategoryModal(true)}
            >
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text style={styles.addCategoryText}>New</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategoryIds.includes(cat.id) && styles.categoryChipActive,
                ]}
                onPress={() => toggleCategory(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategoryIds.includes(cat.id) && styles.categoryTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.saveButtonText}>
              {editMode ? "Update Product" : "Add Product"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Add Category Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.label}>Category Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Vegetables"
                placeholderTextColor={colors.onSurfaceTertiary}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={() => {
                  if (newCategoryName.trim()) {
                    addCategory(newCategoryName.trim());
                  }
                }}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalCancelBtn]}
                onPress={() => setShowCategoryModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSaveBtn,
                  (!newCategoryName.trim() || isAddingCategory) && styles.buttonDisabled,
                ]}
                onPress={() => {
                  if (newCategoryName.trim()) {
                    addCategory(newCategoryName.trim());
                  }
                }}
                disabled={!newCategoryName.trim() || isAddingCategory}
              >
                {isAddingCategory ? (
                  <ActivityIndicator color={colors.onPrimary} size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Add Category</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
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
  scrollContent: { paddingBottom: spacing.xxl },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { ...typography.title3, color: colors.onSurface },
  section: {
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  inputGroup: { marginBottom: spacing.md },
  label: {
    ...typography.subhead,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    padding: spacing.md,
    color: colors.onSurface,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: spacing.md },
  flex1: { flex: 1 },
  priceInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    paddingLeft: spacing.md,
  },
  currencySymbol: {
    ...typography.title3,
    color: colors.primary,
    marginRight: spacing.xs,
  },
  priceInput: {
    ...typography.body,
    flex: 1,
    padding: spacing.md,
    paddingLeft: 0,
    color: colors.onSurface,
  },
  unitSelector: { flexDirection: "row", gap: spacing.sm },
  unitButton: {
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  unitButtonActive: { backgroundColor: colors.primary },
  unitText: { ...typography.subhead, color: colors.onSurface },
  unitTextActive: { color: colors.onPrimary, fontWeight: "600" },
  imagesList: { gap: spacing.sm, paddingVertical: spacing.sm },
  imageWrapper: { position: "relative" },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: spacing.sm,
    backgroundColor: colors.surface,
  },
  addImageBtn: {
    width: 120,
    height: 120,
    borderRadius: spacing.sm,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.separator,
  },
  addImageText: {
    ...typography.caption1,
    color: colors.onSurfaceTertiary,
    marginTop: spacing.xs,
  },
  removeImageBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: colors.background,
    borderRadius: 10,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  categoryChip: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  categoryChipActive: { backgroundColor: colors.primary },
  categoryText: { ...typography.subhead, color: colors.onSurface },
  categoryTextActive: { color: colors.onPrimary, fontWeight: "600" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  addCategoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addCategoryText: { ...typography.subhead, color: colors.primary },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.sm,
    padding: spacing.md,
    alignItems: "center",
    margin: spacing.md,
  },
  buttonDisabled: { opacity: 0.5 },
  saveButtonText: { ...typography.button, color: colors.onPrimary },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: spacing.lg,
    borderTopRightRadius: spacing.lg,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  modalTitle: { ...typography.title3, color: colors.onSurface },
  modalBody: { marginBottom: spacing.md },
  modalFooter: {
    flexDirection: "row",
    gap: spacing.md,
  },
  modalCancelBtn: {
    flex: 1,
    padding: spacing.md,
    alignItems: "center",
    borderRadius: spacing.sm,
    backgroundColor: colors.surface,
  },
  modalCancelText: { ...typography.body, color: colors.onSurface },
  modalSaveBtn: {
    flex: 1,
    padding: spacing.md,
    alignItems: "center",
    borderRadius: spacing.sm,
    backgroundColor: colors.primary,
  },
  modalSaveText: { ...typography.body, color: colors.onPrimary, fontWeight: "600" },
});
