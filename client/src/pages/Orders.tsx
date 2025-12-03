import { useState } from "react";
import { OrdersTable, Order } from "@/components/OrdersTable";
import { QuickOrderEntry } from "@/components/QuickOrderEntry";
import { InvoiceView } from "@/components/InvoiceView";
import { MetricCard } from "@/components/MetricCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ShoppingCart, Plus, FileText, Package, DollarSign, Clock } from "lucide-react";
import { format } from "date-fns";

export default function Orders() {
  // todo: remove mock functionality
  const [orders, setOrders] = useState<Order[]>([
    { id: "1", customerName: "Green Market", shopName: "Main Branch", product: "Mung Sprouts", orderedQty: 50, baggedQty: 50, deliveredQty: 48, status: "delivered", cashCollected: 240, paymentType: "cash" },
    { id: "2", customerName: "Fresh Foods Co", product: "Mung Sprouts", orderedQty: 30, baggedQty: 30, deliveredQty: 0, status: "bagged" },
    { id: "3", customerName: "Health Hub", shopName: "City Center", product: "Mung Sprouts", orderedQty: 25, baggedQty: 0, deliveredQty: 0, status: "pending" },
    { id: "4", customerName: "Super Mart", product: "Broccoli", orderedQty: 15, baggedQty: 15, deliveredQty: 15, status: "delivered", cashCollected: 75, paymentType: "credit" },
    { id: "5", customerName: "Organic Store", product: "Mung Sprouts", orderedQty: 20, baggedQty: 0, deliveredQty: 0, status: "pending" },
  ]);

  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  const customers = [
    { id: "1", name: "Green Market", shopName: "Main Branch", usualQty: 50 },
    { id: "2", name: "Fresh Foods Co", usualQty: 30 },
    { id: "3", name: "Health Hub", shopName: "City Center", usualQty: 25 },
    { id: "4", name: "Super Mart", usualQty: 40 },
    { id: "5", name: "Organic Store", usualQty: 20 },
  ];

  const products = ["Mung Sprouts", "Broccoli", "Other Vegetables"];

  const handleUpdateOrder = (id: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
  };

  const handlePrintInvoice = (id: string) => {
    const order = orders.find((o) => o.id === id);
    if (order) {
      setSelectedOrderForInvoice(order);
      setInvoiceDialogOpen(true);
    }
  };

  const handleCreateOrders = (newOrders: any[]) => {
    const createdOrders = newOrders.map((o, idx) => ({
      id: String(orders.length + idx + 1),
      customerName: o.customerName,
      product: o.product,
      orderedQty: o.quantity,
      baggedQty: 0,
      deliveredQty: 0,
      status: "pending" as const,
    }));
    setOrders([...orders, ...createdOrders]);
  };

  const totalOrdered = orders.reduce((sum, o) => sum + o.orderedQty, 0);
  const totalDelivered = orders.reduce((sum, o) => sum + o.deliveredQty, 0);
  const totalCash = orders.reduce((sum, o) => sum + (o.cashCollected || 0), 0);
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <p className="text-muted-foreground">Create and manage daily orders</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Ordered"
          value={`${totalOrdered} kg`}
          subtitle={`${orders.length} orders`}
          icon={Package}
        />
        <MetricCard
          title="Delivered"
          value={`${totalDelivered} kg`}
          subtitle={`${orders.filter((o) => o.status === "delivered").length} completed`}
          icon={ShoppingCart}
          variant="success"
        />
        <MetricCard
          title="Pending"
          value={pendingCount}
          subtitle="Awaiting processing"
          icon={Clock}
          variant={pendingCount > 0 ? "warning" : "default"}
        />
        <MetricCard
          title="Cash Collected"
          value={`$${totalCash.toFixed(2)}`}
          subtitle="Today's total"
          icon={DollarSign}
          variant="success"
        />
      </div>

      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today" data-testid="tab-today-orders">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Today's Orders
          </TabsTrigger>
          <TabsTrigger value="create" data-testid="tab-create-orders">
            <Plus className="h-4 w-4 mr-2" />
            Create Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <Label htmlFor="orderDate">Order Date</Label>
              <Input
                id="orderDate"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-[200px]"
                data-testid="input-filter-date"
              />
            </div>
          </div>
          <OrdersTable
            orders={orders}
            editable={true}
            onUpdateOrder={handleUpdateOrder}
            onPrintInvoice={handlePrintInvoice}
          />
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <QuickOrderEntry
            customers={customers}
            products={products}
            onSubmit={handleCreateOrders}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedOrderForInvoice && (
            <InvoiceView
              invoiceNumber={`INV-${selectedOrderForInvoice.id}`}
              date={new Date()}
              customerName={selectedOrderForInvoice.customerName}
              items={[
                {
                  product: selectedOrderForInvoice.product,
                  quantity: selectedOrderForInvoice.deliveredQty,
                  pricePerUnit: 5,
                  total: selectedOrderForInvoice.deliveredQty * 5,
                },
              ]}
              onPrint={() => window.print()}
              onDownload={() => console.log("Download invoice")}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
