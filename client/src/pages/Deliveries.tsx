import { useState } from "react";
import { DeliveryChecklist } from "@/components/DeliveryChecklist";
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, DollarSign, CheckCircle, Sprout } from "lucide-react";

export default function Deliveries() {
  // todo: remove mock functionality
  const [deliveryItems, setDeliveryItems] = useState([
    {
      id: "1",
      customerName: "Green Market",
      shopName: "Main Branch",
      address: "123 Main St, Downtown",
      orderedQty: 50,
      baggedQty: 50,
      deliveredQty: 48,
      cashCollected: 240,
      isDelivered: true,
    },
    {
      id: "2",
      customerName: "Fresh Foods Co",
      address: "456 Oak Ave, Midtown",
      orderedQty: 30,
      baggedQty: 30,
      deliveredQty: 0,
      cashCollected: 0,
      isDelivered: false,
    },
    {
      id: "3",
      customerName: "Health Hub",
      shopName: "City Center",
      address: "789 Pine Rd, Uptown",
      orderedQty: 25,
      baggedQty: 25,
      deliveredQty: 0,
      cashCollected: 0,
      isDelivered: false,
    },
    {
      id: "4",
      customerName: "Super Mart",
      address: "321 Elm Dr, West Side",
      orderedQty: 40,
      baggedQty: 0,
      deliveredQty: 0,
      cashCollected: 0,
      isDelivered: false,
    },
    {
      id: "5",
      customerName: "Organic Store",
      address: "654 Birch Ln, East Mall",
      orderedQty: 20,
      baggedQty: 0,
      deliveredQty: 0,
      cashCollected: 0,
      isDelivered: false,
    },
  ]);

  const handleUpdateItem = (id: string, updates: any) => {
    setDeliveryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleSaveAll = () => {
    console.log("Saving all deliveries:", deliveryItems);
  };

  const totalOrdered = deliveryItems.reduce((sum, item) => sum + item.orderedQty, 0);
  const totalBagged = deliveryItems.reduce((sum, item) => sum + item.baggedQty, 0);
  const totalDelivered = deliveryItems.reduce((sum, item) => sum + item.deliveredQty, 0);
  const totalCash = deliveryItems.reduce((sum, item) => sum + item.cashCollected, 0);
  const completedCount = deliveryItems.filter((item) => item.isDelivered).length;

  const readySprouts = 450; // todo: get from API

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Today's Deliveries</h1>
        <p className="text-muted-foreground">Manage bagging, delivery, and cash collection</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Ready Sprouts"
          value={`${readySprouts} kg`}
          subtitle="Available stock"
          icon={Sprout}
          variant="success"
        />
        <MetricCard
          title="Ordered"
          value={`${totalOrdered} kg`}
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
                <span className="font-semibold">{readySprouts - totalDelivered} kg</span>
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
