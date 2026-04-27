import { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFarmerOrders, updateOrderStatus } from "../../../src/api";
import { colors, spacing, borderRadius, typography } from "../../../src/theme/designSystem";

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: colors.secondaryContainer, color: colors.secondary, label: "Pending" },
  confirmed: { bg: colors.primaryContainer, color: colors.primary, label: "Confirmed" },
  shipped: { bg: colors.tertiaryContainer, color: colors.tertiary, label: "Shipped" },
  delivered: { bg: colors.surfaceContainerHighest, color: colors.onSurface, label: "Delivered" },
  rejected: { bg: colors.errorContainer, color: colors.error, label: "Rejected" },
};

export default function FarmerOrders() {
  const queryClient = useQueryClient();
  
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["farmer-orders"],
    queryFn: async () => {
      const res: any = await getFarmerOrders();
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      updateOrderStatus(id, status as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer-orders"] });
      Alert.alert("Success", "Order updated!");
    },
  });

  const handleStatusUpdate = (orderId: number, currentStatus: string) => {
    const flow = ["pending", "confirmed", "shipped", "delivered"];
    const idx = flow.indexOf(currentStatus);
    if (idx < flow.length - 1) {
      const nextStatus = flow[idx + 1];
      Alert.alert("Update Status", `Mark as ${nextStatus}?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => updateMutation.mutate({ id: orderId, status: nextStatus }) },
      ]);
    }
  };

  const renderOrder = ({ item }: { item: any }) => {
    const status = STATUS_COLORS[item.status] || STATUS_COLORS.pending;
    const canUpdate = item.status !== "delivered" && item.status !== "rejected";
    const total = item.items?.reduce((s: number, i: any) => s + (i.price * i.quantity), 0) || 0;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => router.push(`/farmer/orders/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderId}>#{item.id}</Text>
            <Text style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.itemsList}>
          <Text style={styles.itemCount}>{item.items?.length || 0} items</Text>
          {item.items?.slice(0, 2).map((i: any, idx: number) => (
            <Text key={idx} style={styles.itemName}>
              • {i.product?.title} x{i.quantity}
            </Text>
          ))}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{total}</Text>
        </View>

        {canUpdate && (
          <TouchableOpacity
            style={styles.updateBtn}
            onPress={() => handleStatusUpdate(item.id, item.status)}
          >
            <Text style={styles.updateBtnText}>Update Status</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {isLoading ? (
        <View style={styles.loading}><Text>Loading...</Text></View>
      ) : (
        <FlatList
          data={data?.orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptySubtitle}>Orders will appear here</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: spacing.lg, paddingBottom: 100 },
  orderCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  orderId: { ...typography.body, fontWeight: "700", color: colors.onSurface },
  orderDate: { ...typography.labelMd, color: colors.onSurfaceVariant, marginTop: 2 },
  statusBadge: { paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  statusText: { ...typography.labelMd, fontWeight: "600" },
  itemsList: { borderTopWidth: 1, borderTopColor: colors.outlineVariant, paddingTop: spacing.md },
  itemCount: { ...typography.labelMd, color: colors.onSurfaceVariant, marginBottom: spacing.xs },
  itemName: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    paddingTop: spacing.md,
    marginTop: spacing.md,
  },
  totalLabel: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  totalValue: { ...typography.h2, color: colors.primary },
  updateBtn: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: borderRadius.md, marginTop: spacing.md, alignItems: "center" },
  updateBtnText: { ...typography.button, color: colors.onPrimary },
  empty: { alignItems: "center", padding: spacing.xxl },
  emptyTitle: { ...typography.h2, color: colors.onSurface },
  emptySubtitle: { ...typography.bodyMd, color: colors.onSurfaceVariant, marginTop: spacing.xs },
});