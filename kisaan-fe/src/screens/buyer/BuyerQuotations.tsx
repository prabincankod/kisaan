import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { getQuotations, updateQuotationStatus } from "../../api/quotation.api";
import { colors, typography, spacing } from "../../theme/designSystem";

type Quotation = {
  id: number;
  status: string;
  farmer?: { name: string };
  items: { product: { title: string; unit: string }; quantity: number; offeredPrice: number }[];
  createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: colors.warning,
  accepted: colors.success,
  rejected: colors.error,
};

export default function BuyerQuotations() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: quotationsData, isLoading, refetch } = useQuery({
    queryKey: ["buyer-quotations"],
    queryFn: async () => {
      const res: any = await getQuotations({ limit: 20 });
      return res.data;
    },
  });

  const { mutate: cancelQuotation } = useMutation({
    mutationFn: (id: number) => updateQuotationStatus(id, "rejected"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-quotations"] });
    },
  });

  const quotations: Quotation[] = quotationsData?.quotations || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCancel = (id: number) => {
    Alert.alert("Cancel Quotation", "Are you sure you want to cancel this quotation?", [
      { text: "No", style: "cancel" },
      { text: "Yes", onPress: () => cancelQuotation(id) },
    ]);
  };

  const renderQuotation = ({ item }: { item: Quotation }) => {
    const total = item.items.reduce((sum, i) => sum + i.offeredPrice * i.quantity, 0);
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.farmerName}>{item.farmer?.name || "Farmer"}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] || colors.onSurfaceSecondary }]}>
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.items}>
          {item.items.map((i, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {i.product?.title || "Item"} × {i.quantity} {i.product?.unit}
              </Text>
              <Text style={styles.itemPrice}>₹{i.offeredPrice * i.quantity}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.total}>Total: ₹{total}</Text>
          {item.status === "pending" && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancel(item.id)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
          {item.status === "accepted" && (
            <View style={styles.acceptedNote}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.acceptedText}>Order created</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const ListEmpty = () =>
    isLoading ? (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    ) : (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text" size={48} color={colors.onSurfaceTertiary} />
        <Text style={styles.emptyText}>No quotations yet</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.shopButtonText}>Browse Products</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={styles.container}>
      <FlatList
        data={quotations}
        renderItem={renderQuotation}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { flexGrow: 1, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.surfaceElevated,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: spacing.md,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { flex: 1 },
  farmerName: { ...typography.headline, color: colors.onSurface },
  date: { ...typography.caption1, color: colors.onSurfaceSecondary, marginTop: 2 },
  badge: {
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeText: { ...typography.caption1, color: colors.white, fontWeight: "600" },
  items: { marginTop: spacing.md, gap: spacing.xs },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: { ...typography.body, color: colors.onSurfaceSecondary, flex: 1 },
  itemPrice: { ...typography.subhead, color: colors.primary },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
  },
  total: { ...typography.headline, color: colors.onSurface },
  cancelButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
  },
  cancelText: { ...typography.subhead, color: colors.error },
  acceptedNote: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  acceptedText: { ...typography.subhead, color: colors.success },
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
});
