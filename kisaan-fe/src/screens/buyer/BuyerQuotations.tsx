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
import { SafeAreaView } from "react-native-safe-area-context";
import { getQuotations, respondToQuotation, Quotation } from "../../api/quotation.api";
import { colors, typography, spacing, borderRadius } from "../../theme/designSystem";

const STATUS_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  pending: { color: colors.warning, icon: "time", label: "Pending" },
  accepted: { color: colors.success, icon: "checkmark-circle", label: "Accepted" },
  rejected: { color: colors.error, icon: "close-circle", label: "Cancelled" },
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

  const { mutate: cancelQuotation, isPending: isCancelling } = useMutation({
    mutationFn: (id: number) => respondToQuotation(id, "rejected"),
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
    Alert.alert("Cancel Quotation", "Are you sure?", [
      { text: "No", style: "cancel" },
      { text: "Yes", style: "destructive", onPress: () => cancelQuotation(id) },
    ]);
  };

  const renderQuotation = ({ item }: { item: Quotation }) => {
    const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const total = item.items.reduce(
      (sum, i) => sum + Number(i.offeredPrice || i.price || 0) * i.quantity,
      0
    );
    const itemCount = item.items.length;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.farmerRow}>
            <View style={styles.farmerAvatar}>
              <Ionicons name="person" size={18} color={colors.primary} />
            </View>
            <View style={styles.farmerInfo}>
              <Text style={styles.farmerName} numberOfLines={1}>{item.farmer?.name || "Farmer"}</Text>
              <Text style={styles.date}>
                {new Date(item.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
              </Text>
            </View>
          </View>
          <View style={[styles.badge, { borderColor: statusConfig.color, alignSelf: "flex-start" }]}>
            <Ionicons name={statusConfig.icon as any} size={12} color={statusConfig.color} />
            <Text style={[styles.badgeText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.items}>
          {item.items.map((i, idx) => {
            const price = Number(i.offeredPrice || i.price || 0);
            return (
              <View key={idx} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {i.product?.title || "Item"}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {i.quantity} × ₹{price}
                  </Text>
                </View>
                <Text style={styles.itemPrice}>₹{price * i.quantity}</Text>
              </View>
            );
          })}
        </View>

        <View style={[styles.divider, styles.bottomDivider]} />

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.totalLabel}>{itemCount} item{itemCount !== 1 ? "s" : ""}</Text>
            <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
          </View>
          {item.status === "pending" && (
            <TouchableOpacity
              style={[styles.cancelButton, isCancelling && styles.cancelButtonDisabled]}
              onPress={() => handleCancel(item.id)}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <Text style={styles.cancelText}>Cancel</Text>
              )}
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
        <Ionicons name="document-text" size={56} color={colors.onSurfaceTertiary} />
        <Text style={styles.emptyTitle}>No quotations yet</Text>
        <Text style={styles.emptyText}>Negotiate on products to create quotations</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.shopButtonText}>Browse Products</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.pageHeader}>
        <Text style={styles.headerTitle}>Quotations</Text>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <Ionicons name="refresh" size={20} color={colors.onSurfaceSecondary} />
        </TouchableOpacity>
      </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: { ...typography.title1, color: colors.onSurface },
  refreshBtn: { padding: spacing.xs },
  listContent: { flexGrow: 1, paddingBottom: spacing.xl },
  card: {
    backgroundColor: colors.surfaceElevated,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.separatorOpaque,
  },
  cardHeader: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  farmerRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  farmerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  farmerInfo: { flex: 1 },
  farmerName: { ...typography.headline, color: colors.onSurface },
  date: { ...typography.caption2, color: colors.onSurfaceSecondary },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  badgeText: { ...typography.caption2, fontWeight: "600" },
  divider: { height: 1, backgroundColor: colors.separator, marginHorizontal: spacing.md },
  bottomDivider: { marginTop: 0 },
  items: { padding: spacing.md, gap: spacing.sm },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemInfo: { flex: 1, marginRight: spacing.md },
  itemTitle: { ...typography.body, color: colors.onSurface },
  itemMeta: { ...typography.caption1, color: colors.onSurfaceSecondary, marginTop: 2 },
  itemPrice: { ...typography.headline, color: colors.primary, fontWeight: "600" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
  },
  totalLabel: { ...typography.caption2, color: colors.onSurfaceSecondary },
  totalValue: { ...typography.title3, color: colors.onSurface, fontWeight: "700" },
  cancelButton: {
    backgroundColor: colors.error + "15",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  cancelButtonDisabled: { opacity: 0.5 },
  cancelText: { ...typography.subhead, color: colors.error, fontWeight: "600" },
  acceptedNote: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  acceptedText: { ...typography.subhead, color: colors.success, fontWeight: "600" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: { ...typography.title3, color: colors.onSurfaceSecondary, marginTop: spacing.md },
  emptyText: { ...typography.body, color: colors.onSurfaceTertiary, marginTop: spacing.xs, textAlign: "center" },
  shopButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  shopButtonText: { ...typography.button, color: colors.onPrimary },
});
