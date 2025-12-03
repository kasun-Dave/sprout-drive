import { useQuery, useMutation } from "@tanstack/react-query";
import { DeliveryChecklist } from "@/components/DeliveryChecklist";
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Truck, Package, DollarSign, CheckCircle, Sprout } from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order, Customer, StockItem } from "@shared/schema";

type OrderWithCustomer = Order & { customer?: Customer };

interface DeliveryItem {
  id: string;
  customerName: string;
  shopName?: string;
  address: string;
  orderedQty: number;
  baggedQty: number;
  deliveredQty: number;
  cashCollected: number;
  isDelivered: boolean;
}

export default function Deliveries() {
  const { toast } = useToast();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: orders = [], isLoading: ordersLoading } = useQuery<OrderWithCustomer[]>({
    queryKey: ['/api/orders', { date: today }],
  });

  const { data: stockItems = [], isLoading: stockLoading } = useQuery<StockItem[]>({
    queryKey: ['/api/stock'],
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Order> }) => {
      const res = await apiRequest('PATCH', `/api/orders/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order updated",
        description: "Delivery details have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const transformOrderToDeliveryItem = (order: OrderWithCustomer): DeliveryItem => ({
    id: order.id.toString(),
    customerName: order.customer?.name || 'Unknown Customer',
    shopName: order.customer?.businessName || undefined,
    address: order.customer?.address || 'No address',
    orderedQty: parseFloat(order.quantityKg),
    baggedQty: order.bagsDelivered || 0,
    deliveredQty: order.bagsDelivered || 0,
    cashCollected: parseFloat(order.cashCollected || '0'),
    isDelivered: order.status === 'delivered',
  });

  const deliveryItems = orders.map(transformOrderToDeliveryItem);

  const handleUpdateItem = (id: string, updates: Partial<DeliveryItem>) => {
    const orderId = parseInt(id);
    const orderUpdates: Partial<Order> = {};
    
    if (updates.baggedQty !== undefined) {
      orderUpdates.bagsDelivered = updates.baggedQty;
    }
    if (updates.deliveredQty !== undefined) {
      orderUpdates.bagsDelivered = updates.deliveredQty;
    }
    if (updates.cashCollected !== undefined) {
      orderUpdates.cashCollected = updates.cashCollected.toString();
    }
    if (updates.isDelivered !== undefined) {
      orderUpdates.status = updates.isDelivered ? 'delivered' : 'pending';
    }
    
    updateOrderMutation.mutate({ id: orderId, updates: orderUpdates });
  };

  const handleSaveAll = () => {
    toast({
      title: "Changes saved",
      description: "All delivery updates have been saved.",
    });
  };

  const totalOrdered = deliveryItems.reduce((sum, item) => sum + item.orderedQty, 0);
  const totalBagged = deliveryItems.reduce((sum, item) => sum + item.baggedQty, 0);
  const totalDelivered = deliveryItems.reduce((sum, item) => sum + item.deliveredQty, 0);
  const totalCash = deliveryItems.reduce((sum, item) => sum + item.cashCollected, 0);
  const completedCount = deliveryItems.filter((item) => item.isDelivered).length;

  const readySprouts = stockItems
    .filter(item => item.itemType === 'sprouts' || item.name.toLowerCase().includes('sprout'))
    .reduce((sum, item) => sum + parseFloat(item.currentQuantity), 0);

  const isLoading = ordersLoading || stockLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Today's Deliveries</h1>
          <p className="text-muted-foreground">Manage bagging, delivery, and cash collection</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Today's Deliveries</h1>
        <p className="text-muted-foreground">Manage bagging, delivery, and cash collection</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Ready Sprouts"
          value={`${readySprouts.toFixed(0)} kg`}
          subtitle="Available stock"
          icon={Sprout}
          variant="success"
        />
        <MetricCard
          title="Ordered"
          value={`${totalOrdered.toFixed(0)} kg`}
          subtitle={`${deliveryItems.length} customers`}
          icon={Package}
        />
        <MetricCard
          title="Bagged"
          value={`${totalBagged} kg`}
          icon={Package}
          variant={totalBagged < totalOrdered ? "warning" : "success"}
        />
        <MetricCard
          title="Delivered"
          value={`${totalDelivered} kg`}
          subtitle={`${completedCount}/${deliveryItems.length} done`}
          icon={Truck}
        />
        <MetricCard
          title="Cash Collected"
          value={`$${totalCash.toFixed(2)}`}
          icon={DollarSign}
          variant="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DeliveryChecklist
            items={deliveryItems}
            onUpdateItem={handleUpdateItem}
            onSaveAll={handleSaveAll}
          />
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5 text-primary" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Completion</span>
                <Badge variant={completedCount === deliveryItems.length ? "default" : "secondary"}>
                  {completedCount}/{deliveryItems.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Leftover</span>
                <span className="font-semibold">{totalBagged - totalDelivered} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Remaining Stock</span>
                <span className="font-semibold">{(readySprouts - totalDelivered).toFixed(0)} kg</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">1.</span>
                  Enter bagged quantity before loading van
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">2.</span>
                  Update delivered quantity after each stop
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">3.</span>
                  Record cash collected immediately
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">4.</span>
                  Check the box when delivery is complete
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
