import { useState, useMemo } from "react";
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
import { getQuotations, respondToQuotation, Quotation } from "../../api/quotation.api";
import { colors, typography, spacing } from "../../theme/designSystem";

export default function FarmerQuotations() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: quotationsData, isLoading, refetch } = useQuery({
    queryKey: ["farmer-quotations"],
    queryFn: async () => {
      const res: any = await getQuotations({ status: "pending" });
      return res.data;
    },
  });

  const { mutate: respond, isPending: isResponding } = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "accepted" | "rejected" }) =>
      respondToQuotation(id, status),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["farmer-quotations"] });
      queryClient.invalidateQueries({ queryKey: ["farmer-orders"] });
      const message = status === "accepted"
        ? "Quotation accepted! Order created."
        : "Quotation rejected.";
      Alert.alert("Success", message);
    },
    onError: () => Alert.alert("Error", "Failed to respond to quotation"),
  });

  const quotations: Quotation[] = quotationsData?.quotations || [];

  const pendingCount = useMemo(() => {
    return quotationsData?.pagination?.total || 0;
  }, [quotationsData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleRespond = (id: number, status: "accepted" | "rejected") => {
    const action = status === "accepted" ? "accept" : "reject";
    Alert.alert(
      `${status === "accepted" ? "Accept" : "Reject"} Quotation`,
      `Are you sure you want to ${action} this quotation? ${status === "accepted" ? "This will create an order." : ""}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: status === "accepted" ? "Accept" : "Reject",
          style: status === "rejected" ? "destructive" : "default",
          onPress: () => respond({ id, status }),
        },
      ]
    );
  };

  const renderQuotation = ({ item }: { item: Quotation }) => {
    const total = item.items.reduce((sum, i) => sum + Number(i.offeredPrice || i.price || 0) * i.quantity, 0);

    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.customerName}>{item.user?.name || "Customer"}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.warning }]}>
            <Text style={styles.badgeText}>Pending</Text>
          </View>
        </View>

        <View style={styles.items}>
          {item.items.map((i, idx) => {
            const price = Number(i.offeredPrice || i.price || 0);
            const lineTotal = price * i.quantity;
            return (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {i.product?.title || "Item"} × {i.quantity} {i.product?.unit}
                </Text>
                <Text style={styles.itemPrice}>₹{lineTotal}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.total}>Offered: ₹{total}</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleRespond(item.id, "rejected")}
              disabled={isResponding}
            >
              <Ionicons name="close" size={16} color={colors.error} />
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleRespond(item.id, "accepted")}
              disabled={isResponding}
            >
              <Ionicons name="checkmark" size={16} color={colors.onPrimary} />
              <Text style={styles.acceptText}>Accept</Text>
            </TouchableOpacity>
          </View>
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
        <Text style={styles.emptyText}>No pending quotations</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      {pendingCount > 0 && (
        <View style={styles.countBanner}>
          <Ionicons name="pricetag" size={20} color={colors.onPrimary} />
          <Text style={styles.countText}>
            {pendingCount} {pendingCount === 1 ? "quotation" : "quotations"} awaiting response
          </Text>
        </View>
      )}
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
  countBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: spacing.md,
  },
  countText: {
    ...typography.subhead,
    color: colors.onPrimary,
    fontWeight: "600",
  },
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
  customerName: { ...typography.headline, color: colors.onSurface },
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
  actions: { flexDirection: "row", gap: spacing.sm },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
  },
  acceptButton: { backgroundColor: colors.primary },
  acceptText: { ...typography.subhead, color: colors.onPrimary, fontWeight: "600" },
  rejectButton: { backgroundColor: colors.surface },
  rejectText: { ...typography.subhead, color: colors.error, fontWeight: "600" },
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
});
