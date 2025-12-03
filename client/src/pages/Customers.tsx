import { useState } from "react";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Phone, MapPin, Truck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Customer {
  id: string;
  name: string;
  shopName: string;
  phone: string;
  address: string;
  route: string;
  usualQty: number;
  totalOrders: number;
}

export default function Customers() {
  // todo: remove mock functionality
  const [customers, setCustomers] = useState<Customer[]>([
    { id: "1", name: "Green Market", shopName: "Main Branch", phone: "+1 234 567 8901", address: "123 Main St, Downtown", route: "Route A", usualQty: 50, totalOrders: 156 },
    { id: "2", name: "Fresh Foods Co", shopName: "Central Store", phone: "+1 234 567 8902", address: "456 Oak Ave, Midtown", route: "Route A", usualQty: 30, totalOrders: 120 },
    { id: "3", name: "Health Hub", shopName: "City Center", phone: "+1 234 567 8903", address: "789 Pine Rd, Uptown", route: "Route B", usualQty: 25, totalOrders: 98 },
    { id: "4", name: "Super Mart", shopName: "West Side", phone: "+1 234 567 8904", address: "321 Elm Dr, West", route: "Route B", usualQty: 40, totalOrders: 145 },
    { id: "5", name: "Organic Store", shopName: "East Mall", phone: "+1 234 567 8905", address: "654 Birch Ln, East", route: "Route C", usualQty: 20, totalOrders: 67 },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    shopName: "",
    phone: "",
    address: "",
    route: "",
    usualQty: 0,
  });

  const routes = ["Route A", "Route B", "Route C"];

  const columns = [
    {
      key: "name",
      header: "Customer",
      render: (item: Customer) => (
        <div>
          <div className="font-medium">{item.name}</div>
          {item.shopName && (
            <div className="text-sm text-muted-foreground">{item.shopName}</div>
          )}
        </div>
      ),
    },
    {
      key: "phone",
      header: "Contact",
      render: (item: Customer) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          {item.phone}
        </div>
      ),
    },
    {
      key: "address",
      header: "Address",
      render: (item: Customer) => (
        <div className="flex items-center gap-2 max-w-xs">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate">{item.address}</span>
        </div>
      ),
    },
    {
      key: "route",
      header: "Route",
      render: (item: Customer) => (
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline">{item.route}</Badge>
        </div>
      ),
    },
    {
      key: "usualQty",
      header: "Usual Qty",
      render: (item: Customer) => (
        <Badge variant="secondary">{item.usualQty} kg</Badge>
      ),
    },
    {
      key: "totalOrders",
      header: "Total Orders",
      render: (item: Customer) => item.totalOrders,
    },
  ];

  const handleAddCustomer = () => {
    const id = String(customers.length + 1);
    setCustomers([
      ...customers,
      { ...newCustomer, id, totalOrders: 0 },
    ]);
    setIsAddDialogOpen(false);
    setNewCustomer({ name: "", shopName: "", phone: "", address: "", route: "", usualQty: 0 });
  };

  const totalCustomers = customers.length;
  const totalUsualQty = customers.reduce((sum, c) => sum + c.usualQty, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-muted-foreground">Manage your customer database</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-md">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-md">
                <Truck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivery Routes</p>
                <p className="text-2xl font-bold">{routes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Daily Avg Demand</p>
                <p className="text-2xl font-bold">{totalUsualQty} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Customer List"
        icon={Users}
        data={customers}
        columns={columns}
        searchKey="name"
        addButtonLabel="Add Customer"
        onAdd={() => setIsAddDialogOpen(true)}
        onEdit={(item) => console.log("Edit customer:", item)}
        onDelete={(item) => console.log("Delete customer:", item)}
      />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="Customer name"
                  data-testid="input-customer-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Shop Name</Label>
                <Input
                  value={newCustomer.shopName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, shopName: e.target.value })}
                  placeholder="Shop/branch name"
                  data-testid="input-shop-name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                placeholder="+1 234 567 8900"
                data-testid="input-customer-phone"
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                placeholder="Full address"
                data-testid="input-customer-address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Delivery Route</Label>
                <Select
                  value={newCustomer.route}
                  onValueChange={(value) => setNewCustomer({ ...newCustomer, route: value })}
                >
                  <SelectTrigger data-testid="select-route">
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    {routes.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Usual Quantity (kg)</Label>
                <Input
                  type="number"
                  value={newCustomer.usualQty}
                  onChange={(e) => setNewCustomer({ ...newCustomer, usualQty: Number(e.target.value) })}
                  data-testid="input-usual-qty"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomer} data-testid="button-save-customer">
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
