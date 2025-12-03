import { useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { PlantingCalendar } from "@/components/PlantingCalendar";
import { StockSummary } from "@/components/StockSummary";
import { VanAlertCard } from "@/components/VanAlertCard";
import { OrdersTable, Order } from "@/components/OrdersTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, Package, Truck, Users, AlertTriangle } from "lucide-react";
import { addDays } from "date-fns";

export default function Dashboard() {
  // todo: remove mock functionality
  const today = new Date();

  const mockPlantingDays = [
    { date: today, bedsReady: 15, kgAvailable: 450, orderedKg: 380 },
    { date: addDays(today, 1), bedsReady: 12, kgAvailable: 360, orderedKg: 400 },
    { date: addDays(today, 2), bedsReady: 18, kgAvailable: 540, orderedKg: 420 },
    { date: addDays(today, 3), bedsReady: 14, kgAvailable: 420, orderedKg: 350 },
    { date: addDays(today, 4), bedsReady: 10, kgAvailable: 300, orderedKg: 380 },
    { date: addDays(today, 5), bedsReady: 16, kgAvailable: 480, orderedKg: 400 },
    { date: addDays(today, 6), bedsReady: 13, kgAvailable: 390, orderedKg: 360 },
  ];

  const stockItems = [
    { name: "Mung Beans (Raw)", currentStock: 150, unit: "kg", maxCapacity: 500, type: "raw" as const },
    { name: "Ready Sprouts", currentStock: 450, unit: "kg", maxCapacity: 600, type: "ready" as const },
    { name: "Broccoli", currentStock: 45, unit: "kg", type: "other" as const },
  ];

  const [orders, setOrders] = useState<Order[]>([
    { id: "1", customerName: "Green Market", shopName: "Main Branch", product: "Mung Sprouts", orderedQty: 50, baggedQty: 50, deliveredQty: 48, status: "delivered", cashCollected: 240 },
    { id: "2", customerName: "Fresh Foods Co", product: "Mung Sprouts", orderedQty: 30, baggedQty: 30, deliveredQty: 0, status: "bagged" },
    { id: "3", customerName: "Health Hub", shopName: "City Center", product: "Mung Sprouts", orderedQty: 25, baggedQty: 0, deliveredQty: 0, status: "pending" },
  ]);

  const handleUpdateOrder = (id: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Ready Sprouts"
          value="450 kg"
          subtitle="Available today"
          icon={Sprout}
          variant="success"
        />
        <MetricCard
          title="Today's Orders"
          value="380 kg"
          subtitle="12 customers"
          icon={Package}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Deliveries"
          value="8"
          subtitle="In progress"
          icon={Truck}
        />
        <MetricCard
          title="Active Customers"
          value="45"
          icon={Users}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PlantingCalendar days={mockPlantingDays} />
        </div>
        <div>
          <StockSummary items={stockItems} />
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
              <VanAlertCard
                vehicleNumber="ABC-1234"
                alertType="insurance"
                expiryDate={addDays(today, 5)}
                onAction={() => console.log("Renew insurance")}
              />
              <VanAlertCard
                vehicleNumber="XYZ-5678"
                alertType="service"
                expiryDate={addDays(today, 12)}
                onAction={() => console.log("Schedule service")}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
