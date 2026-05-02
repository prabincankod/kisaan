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
import { getQuotations, updateQuotationStatus } from "../../api/quotation.api";
import { colors, typography, spacing } from "../../theme/designSystem";

type Quotation = {
  id: number;
  status: string;
  user?: { name: string; phone?: string };
  items: {
    product: { title: string; unit: string };
    quantity: number;
    offeredPrice: number;
  }[];
  createdAt: string;
};

const STATUS_TABS = [
  { status: "all", label: "All" },
  { status: "pending", label: "Pending" },
  { status: "accepted", label: "Accepted" },
  { status: "rejected", label: "Rejected" },
];

export default function FarmerQuotations() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const { data: quotationsData, isLoading, refetch } = useQuery({
    queryKey: ["farmer-quotations", selectedStatus],
    queryFn: async () => {
      const res: any = await getQuotations({
        status: selectedStatus === "all" ? undefined : selectedStatus,
      });
      return res.data;
    },
  });

  const { mutate: respondToQuotation } = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "accepted" | "rejected" }) =>
      updateQuotationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer-quotations"] });
    },
  });

  const quotations: Quotation[] = quotationsData?.quotations || [];

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: quotations.length };
    quotationsData?.quotations?.forEach((q: Quotation) => {
      counts[q.status] = (counts[q.status] || 0) + 1;
    });
    return counts;
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
      `Are you sure you want to ${action} this quotation?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: status === "accepted" ? "Accept" : "Reject",
          style: status === "rejected" ? "destructive" : "default",
          onPress: () => respondToQuotation({ id, status }),
        },
      ]
    );
  };

  const renderTab = ({ item }: { item: (typeof STATUS_TABS)[0] }) => {
    const count = statusCounts[item.status] || 0;
    const isSelected = selectedStatus === item.status;
    return (
      <TouchableOpacity
        style={[
          styles.tab,
          isSelected && styles.tabActive,
          isSelected && { borderColor: colors.primary },
        ]}
        onPress={() => setSelectedStatus(item.status)}
      >
        <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
          {item.label}
        </Text>
        {count > 0 && (
          <View style={[styles.tabBadge, isSelected && styles.tabBadgeActive]}>
            <Text style={[styles.tabBadgeText, isSelected && styles.tabBadgeTextActive]}>
              {count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderQuotation = ({ item }: { item: Quotation }) => {
    const total = item.items.reduce((sum, i) => sum + i.offeredPrice * i.quantity, 0);
    const isPending = item.status === "pending";

    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.customerName}>{item.user?.name || "Customer"}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  item.status === "accepted"
                    ? colors.success
                    : item.status === "rejected"
                    ? colors.error
                    : colors.warning,
              },
            ]}
          >
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
          <Text style={styles.total}>Offered: ₹{total}</Text>
          {isPending && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleRespond(item.id, "rejected")}
              >
                <Ionicons name="close" size={16} color={colors.error} />
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleRespond(item.id, "accepted")}
              >
                <Ionicons name="checkmark" size={16} color={colors.onPrimary} />
                <Text style={styles.acceptText}>Accept</Text>
              </TouchableOpacity>
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
        <Text style={styles.emptyText}>No quotations</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={STATUS_TABS}
        renderItem={renderTab}
        keyExtractor={(item) => item.status}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      />
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
  tabsContainer: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  tab: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.separator,
    flexDirection: "row",
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: colors.primary + "20",
    borderColor: colors.primary,
  },
  tabText: { ...typography.subhead, color: colors.onSurface },
  tabTextActive: { color: colors.primary, fontWeight: "600" },
  tabBadge: {
    backgroundColor: colors.onSurfaceTertiary,
    borderRadius: spacing.full,
    paddingHorizontal: spacing.xs,
    marginLeft: spacing.xs,
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
    height: 18,
  },
  tabBadgeActive: { backgroundColor: colors.primary },
  tabBadgeText: { ...typography.caption2, color: colors.surface, fontWeight: "600" },
  tabBadgeTextActive: { color: colors.onPrimary },
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
