import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { OrdersTable } from "@/components/OrdersTable";
import { QuickOrderEntry } from "@/components/QuickOrderEntry";
import { InvoiceView } from "@/components/InvoiceView";
import { MetricCard } from "@/components/MetricCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ShoppingCart, Plus, Package, DollarSign, Clock } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useBusinessConfig } from "@/hooks/useBusinessConfig";
import { calculateOrderTotal, resolvePricePerKg, formatCurrency } from "@shared/businessConfig";
import type { Order as DbOrder, Customer, InsertOrder } from "@shared/schema";

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
  paymentType?: "cash" | "credit" | "other";
}

export default function Orders() {
  const { toast } = useToast();
  const { config } = useBusinessConfig();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<TableOrder | null>(null);

  const { data: ordersData = [], isLoading: ordersLoading } = useQuery<OrderWithCustomer[]>({
    queryKey: ["/api/orders", selectedDate],
    queryFn: async () => {
      const res = await fetch(`/api/orders?date=${selectedDate}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: InsertOrder) => {
      const res = await apiRequest("POST", "/api/orders", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Success", description: "Order created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertOrder> }) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Success", description: "Order updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

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

  const handlePrintInvoice = (id: string) => {
    const order = orders.find((o) => o.id === id);
    if (order) {
      setSelectedOrderForInvoice(order);
      setInvoiceDialogOpen(true);
    }
  };

  const handleCreateOrders = (newOrders: Array<{ customerName: string; product: string; quantity: number }>) => {
    newOrders.forEach((o) => {
      const customer = customers.find((c) => c.name === o.customerName);
      if (!customer) {
        toast({ title: "Error", description: `Customer ${o.customerName} not found`, variant: "destructive" });
        return;
      }
      
      const pricePerKg = resolvePricePerKg(customer.pricePerKg, config);
      const totalAmount = calculateOrderTotal(o.quantity, pricePerKg, config.taxRate);

      const orderData: InsertOrder = {
        customerId: customer.id,
        orderDate: selectedDate,
        deliveryDate: selectedDate,
        quantityKg: String(o.quantity),
        pricePerKg: String(pricePerKg),
        totalAmount: String(totalAmount.toFixed(2)),
        status: "pending",
        paymentStatus: "pending",
      };
      createOrderMutation.mutate(orderData);
    });
  };

  const customersList = customers.map((c) => ({
    id: String(c.id),
    name: c.name,
    shopName: c.businessName || undefined,
    usualQty: Number(c.defaultQuantityKg) || 0,
  }));

  const products = ["Mung Sprouts", "Broccoli", "Other Vegetables"];

  const totalOrdered = orders.reduce((sum, o) => sum + o.orderedQty, 0);
  const totalDelivered = orders.reduce((sum, o) => sum + o.deliveredQty, 0);
  const totalCash = orders.reduce((sum, o) => sum + (o.cashCollected || 0), 0);
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  if (ordersLoading || customersLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Orders Management</h1>
          <p className="text-muted-foreground">Create and manage daily orders</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

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
          value={formatCurrency(totalCash, config)}
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
            customers={customersList}
            products={products}
            onSubmit={handleCreateOrders}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedOrderForInvoice && (() => {
            const dbOrder = ordersData.find((o) => String(o.id) === selectedOrderForInvoice.id);
            const pricePerKg = dbOrder ? Number(dbOrder.pricePerKg) : config.defaultPricePerKg;
            const qty = selectedOrderForInvoice.deliveredQty || selectedOrderForInvoice.orderedQty;
            const lineTotal = calculateOrderTotal(qty, pricePerKg, config.taxRate);
            return (
              <InvoiceView
                invoiceNumber={`INV-${selectedOrderForInvoice.id}`}
                date={new Date()}
                customerName={selectedOrderForInvoice.customerName}
                companyName={config.companyName}
                companyPhone={config.companyPhone}
                companyAddress={config.companyAddress}
                items={[
                  {
                    product: selectedOrderForInvoice.product,
                    quantity: qty,
                    pricePerUnit: pricePerKg,
                    total: lineTotal,
                  },
                ]}
                onPrint={() => window.print()}
                onDownload={() => toast({ title: "Invoice", description: "Invoice ready to download" })}
              />
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
