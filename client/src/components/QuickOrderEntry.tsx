import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, X, Save } from "lucide-react";
import { format } from "date-fns";

interface Customer {
  id: string;
  name: string;
  shopName?: string;
  usualQty?: number;
}

interface OrderItem {
  customerId: string;
  customerName: string;
  product: string;
  quantity: number;
}

interface QuickOrderEntryProps {
  customers: Customer[];
  products: string[];
  onSubmit: (orders: OrderItem[]) => void;
}

export function QuickOrderEntry({
  customers,
  products,
  onSubmit,
}: QuickOrderEntryProps) {
  const [orderDate, setOrderDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(0);

  const handleAddOrder = () => {
    if (!selectedCustomer || !selectedProduct || quantity <= 0) return;

    const customer = customers.find((c) => c.id === selectedCustomer);
    if (!customer) return;

    setOrders([
      ...orders,
      {
        customerId: selectedCustomer,
        customerName: customer.name,
        product: selectedProduct,
        quantity,
      },
    ]);

    setSelectedCustomer("");
    setSelectedProduct("");
    setQuantity(0);
  };

  const handleRemoveOrder = (index: number) => {
    setOrders(orders.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    onSubmit(orders);
    setOrders([]);
  };

  const selectedCustomerData = customers.find((c) => c.id === selectedCustomer);

  return (
    <Card data-testid="card-quick-order">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Quick Order Entry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="orderDate">Order Date</Label>
          <Input
            id="orderDate"
            type="date"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            data-testid="input-order-date"
          />
        </div>

        <div className="p-4 bg-muted/50 rounded-md space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger data-testid="select-customer">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                      {c.shopName && ` (${c.shopName})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCustomerData?.usualQty && (
                <p className="text-xs text-muted-foreground">
                  Usual: {selectedCustomerData.usualQty} kg
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger data-testid="select-product">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity (kg)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  data-testid="input-order-qty"
                />
                <Button
                  size="icon"
                  onClick={handleAddOrder}
                  disabled={!selectedCustomer || !selectedProduct || quantity <= 0}
                  data-testid="button-add-order"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {orders.length > 0 && (
          <div className="space-y-2">
            <Label>Orders to Create ({orders.length})</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {orders.map((order, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-card border rounded-md"
                  data-testid={`order-item-${idx}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{order.customerName}</span>
                    <Badge variant="secondary">{order.product}</Badge>
                    <Badge variant="outline">{order.quantity} kg</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOrder(idx)}
                    data-testid={`button-remove-order-${idx}`}
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      {orders.length > 0 && (
        <CardFooter className="border-t pt-4">
          <Button onClick={handleSubmit} className="w-full sm:w-auto" data-testid="button-save-orders">
            <Save className="h-4 w-4 mr-2" />
            Create {orders.length} Order{orders.length > 1 ? "s" : ""}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
