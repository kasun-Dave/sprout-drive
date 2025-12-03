import { useQuery, useMutation } from "@tanstack/react-query";
import { MetricCard } from "@/components/MetricCard";
import { PlantingCalendar } from "@/components/PlantingCalendar";
import { StockSummary } from "@/components/StockSummary";
import { VanAlertCard } from "@/components/VanAlertCard";
import { OrdersTable } from "@/components/OrdersTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sprout, Package, Truck, Users, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { addDays, format, differenceInDays, parseISO } from "date-fns";
import type { 
  Order as DbOrder, 
  Customer, 
  PlantingBatch, 
  Van, 
  StockItem, 
  Setting,
  InsertOrder 
} from "@shared/schema";

interface DashboardStats {
  readySproutsKg: number;
  todaysOrdersKg: number;
  todaysOrdersCount: number;
  deliveriesInProgress: number;
  activeCustomers: number;
  ordersGrowth: number;
  customersGrowth: number;
}

type OrderWithCustomer = DbOrder & { customer?: Customer };

interface TableOrder {
  id: string;
  customerName: string;
  shopName?: string;
  product: string;
  orderedQty: number;
  baggedQty: number;
  deliveredQty: number;
  status: "pending" | "bagged" | "delivered" | "cancelled";
  cashCollected?: number;
  paymentType?: "cash" | "credit";
}

interface VanAlert {
  vehicleNumber: string;
  alertType: "insurance" | "license" | "service";
  expiryDate: Date;
}

export default function Dashboard() {
  const { toast } = useToast();
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: ordersData = [], isLoading: ordersLoading } = useQuery<OrderWithCustomer[]>({
    queryKey: ["/api/orders", todayStr],
    queryFn: async () => {
      const res = await fetch(`/api/orders?date=${todayStr}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  const { data: plantingBatches = [] } = useQuery<PlantingBatch[]>({
    queryKey: ["/api/planting-batches"],
  });

  const { data: vans = [] } = useQuery<Van[]>({
    queryKey: ["/api/vans"],
  });

  const { data: stockItems = [] } = useQuery<StockItem[]>({
    queryKey: ["/api/stock"],
  });

  const { data: settings = [] } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertOrder> }) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Success", description: "Order updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const expiryWarningDays = Number(settings.find(s => s.key === "expiryWarningDays")?.value) || 30;
  const serviceIntervalMonths = Number(settings.find(s => s.key === "serviceIntervalMonths")?.value) || 6;

  const orders: TableOrder[] = ordersData.map((order) => ({
    id: String(order.id),
    customerName: order.customer?.name || "Unknown",
    shopName: order.customer?.businessName || undefined,
    product: "Mung Sprouts",
    orderedQty: Number(order.quantityKg),
    baggedQty: order.bagsDelivered || 0,
    deliveredQty: order.bagsDelivered || 0,
    status: order.status as "pending" | "bagged" | "delivered" | "cancelled",
    cashCollected: order.cashCollected ? Number(order.cashCollected) : undefined,
    paymentType: order.paymentStatus === "paid" ? "cash" : undefined,
  }));

  const handleUpdateOrder = (id: string, updates: Partial<TableOrder>) => {
    const orderId = parseInt(id);
    const dbUpdates: Partial<InsertOrder> = {};
    
    if (updates.status) {
      dbUpdates.status = updates.status;
    }
    if (updates.baggedQty !== undefined) {
      dbUpdates.bagsDelivered = updates.baggedQty;
    }
    if (updates.deliveredQty !== undefined) {
      dbUpdates.bagsDelivered = updates.deliveredQty;
    }
    if (updates.cashCollected !== undefined) {
      dbUpdates.cashCollected = String(updates.cashCollected);
      dbUpdates.paymentStatus = "paid";
    }
    
    updateOrderMutation.mutate({ id: orderId, data: dbUpdates });
  };

  const plantingDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const batchesForDay = plantingBatches.filter(
      (b) => b.expectedHarvestDate === dateStr && (b.status === "growing" || b.status === "ready")
    );
    const kgAvailable = batchesForDay.reduce((sum, b) => sum + Number(b.expectedYieldKg), 0);
    const bedsReady = batchesForDay.length;
    return { date, bedsReady, kgAvailable, orderedKg: 0 };
  });

  const stockSummaryItems = stockItems.map((item) => ({
    name: item.name,
    currentStock: Number(item.currentQuantity),
    unit: item.unit,
    maxCapacity: Number(item.minimumLevel || 0) * 10 || 500,
    type: item.itemType as "raw" | "ready" | "other",
  }));

  const vanAlerts: VanAlert[] = vans.flatMap((van) => {
    const alerts: VanAlert[] = [];
    
    if (van.insuranceExpiry) {
      const expiryDate = parseISO(van.insuranceExpiry);
      const daysUntil = differenceInDays(expiryDate, today);
      if (daysUntil <= expiryWarningDays && daysUntil >= 0) {
        alerts.push({ vehicleNumber: van.registrationNumber, alertType: "insurance", expiryDate });
      }
    }
    
    if (van.licenseExpiry) {
      const expiryDate = parseISO(van.licenseExpiry);
      const daysUntil = differenceInDays(expiryDate, today);
      if (daysUntil <= expiryWarningDays && daysUntil >= 0) {
        alerts.push({ vehicleNumber: van.registrationNumber, alertType: "license", expiryDate });
      }
    }
    
    if (van.lastServiceDate) {
      const lastService = parseISO(van.lastServiceDate);
      const nextServiceDue = addDays(lastService, serviceIntervalMonths * 30);
      const daysUntil = differenceInDays(nextServiceDue, today);
      if (daysUntil <= expiryWarningDays && daysUntil >= 0) {
        alerts.push({ vehicleNumber: van.registrationNumber, alertType: "service", expiryDate: nextServiceDue });
      }
    }
    
    return alerts;
  });

  if (statsLoading || ordersLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Ready Sprouts"
          value={`${stats?.readySproutsKg || 0} kg`}
          subtitle="Available today"
          icon={Sprout}
          variant="success"
        />
        <MetricCard
          title="Today's Orders"
          value={`${stats?.todaysOrdersKg || 0} kg`}
          subtitle={`${stats?.todaysOrdersCount || 0} customers`}
          icon={Package}
          trend={stats?.ordersGrowth ? { value: stats.ordersGrowth, isPositive: stats.ordersGrowth > 0 } : undefined}
        />
        <MetricCard
          title="Deliveries"
          value={stats?.deliveriesInProgress || 0}
          subtitle="In progress"
          icon={Truck}
        />
        <MetricCard
          title="Active Customers"
          value={stats?.activeCustomers || 0}
          icon={Users}
          trend={stats?.customersGrowth ? { value: stats.customersGrowth, isPositive: stats.customersGrowth > 0 } : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PlantingCalendar days={plantingDays} />
        </div>
        <div>
          <StockSummary items={stockSummaryItems} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OrdersTable
            orders={orders}
            editable={true}
            onUpdateOrder={handleUpdateOrder}
            onPrintInvoice={(id) => console.log("Print invoice:", id)}
          />
        </div>
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vanAlerts.length > 0 ? (
                vanAlerts.slice(0, 3).map((alert, idx) => (
                  <VanAlertCard
                    key={idx}
                    vehicleNumber={alert.vehicleNumber}
                    alertType={alert.alertType}
                    expiryDate={alert.expiryDate}
                    onAction={() => console.log(`Action for ${alert.vehicleNumber}`)}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No alerts at this time
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
