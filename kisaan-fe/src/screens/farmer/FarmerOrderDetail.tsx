import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { getOrder, updateOrderStatus } from '../../api/order.api';
import { colors, typography, spacing } from '../../theme/designSystem';

const STATUS_FLOW = [{ status: 'confirmed', label: 'Confirm Order', next: 'preparing' }, { status: 'preparing', label: 'Start Preparing', next: 'outForDelivery' }, { status: 'outForDelivery', label: 'Mark Delivered', next: 'delivered' }];

export default function FarmerOrderDetail() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { orderId } = route.params;

  const { data: order, isLoading } = useQuery({ queryKey: ['order', orderId], queryFn: async () => { const res: any = await getOrder(orderId); return res.data; } });
  const { mutate: updateStatus } = useMutation({ mutationFn: (status: string) => updateOrderStatus(orderId, status), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['order', orderId] }); queryClient.invalidateQueries({ queryKey: ['farmer-orders'] }); Alert.alert('Success', 'Order status updated'); }, onError: () => Alert.alert('Error', 'Failed to update status') });

  const getNextAction = () => { if (!order) return null; return STATUS_FLOW.find((s) => s.status === order.status); };

  if (isLoading) return <View style={styles.loading}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (!order) return <View style={styles.loading}><Text style={styles.errorText}>Order not found</Text></View>;

  const nextAction = getNextAction();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statusSection}><Text style={styles.orderId}>Order #{order.id}</Text><View style={styles.statusBadge}><Text style={styles.statusText}>{order.status}</Text></View></View>
      <View style={styles.section}><Text style={styles.sectionTitle}>Customer</Text><View style={styles.customerRow}><Ionicons name="person" size={24} color={colors.primary} /><View style={styles.customerInfo}><Text style={styles.customerName}>{order.customer?.name || 'Customer'}</Text><Text style={styles.customerPhone}>{order.customer?.phone || 'No phone'}</Text></View>{order.customer?.phone && <TouchableOpacity style={styles.callButton}><Ionicons name="call" size={24} color={colors.primary} /></TouchableOpacity>}</View></View>
      <View style={styles.section}><Text style={styles.sectionTitle}>Items</Text>
        {order.items.map((item: any, index: number) => (
          <View key={index} style={styles.item}><Image source={{ uri: item.product.images?.[0]?.url || 'https://placehold.co/60x60/F5B800/000000?text=Product' }} style={styles.itemImage} contentFit="cover" /><View style={styles.itemInfo}><Text style={styles.itemTitle}>{item.product.title}</Text><Text style={styles.itemQuantity}>x{item.quantity}</Text></View><Text style={styles.itemPrice}>₹{item.product.price * item.quantity}</Text></View>
        ))}
      </View>
      <View style={styles.section}><Text style={styles.sectionTitle}>Delivery Address</Text><Text style={styles.addressText}>{order.address || 'Not provided'}</Text></View>
      <View style={styles.divider} /><View style={styles.totalSection}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>₹{order.total}</Text></View>
      {nextAction && <TouchableOpacity style={styles.actionButton} onPress={() => updateStatus(nextAction.next)}><Text style={styles.actionText}>{nextAction.label}</Text></TouchableOpacity>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorText: { ...typography.body, color: colors.error },
  statusSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  orderId: { ...typography.title1, color: colors.onSurface },
  statusBadge: { backgroundColor: colors.primary, borderRadius: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  statusText: { ...typography.subhead, color: colors.onPrimary, fontWeight: '600', textTransform: 'capitalize' },
  section: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.separator },
  sectionTitle: { ...typography.headline, color: colors.onSurface, marginBottom: spacing.sm },
  customerRow: { flexDirection: 'row', alignItems: 'center' },
  customerInfo: { flex: 1, marginLeft: spacing.md },
  customerName: { ...typography.body, color: colors.onSurface },
  customerPhone: { ...typography.caption1, color: colors.onSurfaceSecondary },
  callButton: { padding: spacing.sm },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  itemImage: { width: 60, height: 60, borderRadius: spacing.sm, backgroundColor: colors.surface },
  itemInfo: { flex: 1, marginLeft: spacing.md },
  itemTitle: { ...typography.body, color: colors.onSurface },
  itemQuantity: { ...typography.caption1, color: colors.onSurfaceSecondary },
  itemPrice: { ...typography.headline, color: colors.primary },
  addressText: { ...typography.body, color: colors.onSurfaceSecondary },
  divider: { height: 1, backgroundColor: colors.separator, marginHorizontal: spacing.md },
  totalSection: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md },
  totalLabel: { ...typography.title2, color: colors.onSurface },
  totalValue: { ...typography.title2, color: colors.primary },
  actionButton: { backgroundColor: colors.primary, borderRadius: spacing.sm, padding: spacing.md, alignItems: 'center', margin: spacing.md },
  actionText: { ...typography.button, color: colors.onPrimary },
});