import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Phone, MapPin, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Customer, InsertCustomer } from "@shared/schema";
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

export default function Customers() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState<Partial<InsertCustomer>>({
    name: "",
    businessName: "",
    phone: "",
    address: "",
    deliveryRoute: "",
    defaultQuantityKg: "",
    pricePerKg: "",
    isActive: true,
  });

  const routes = ["Route A", "Route B", "Route C"];

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: InsertCustomer) => {
      const res = await apiRequest("POST", "/api/customers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ title: "Success", description: "Customer created successfully" });
      setIsAddDialogOpen(false);
      setNewCustomer({ name: "", businessName: "", phone: "", address: "", deliveryRoute: "", defaultQuantityKg: "", pricePerKg: "", isActive: true });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCustomer> }) => {
      const res = await apiRequest("PATCH", `/api/customers/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ title: "Success", description: "Customer updated successfully" });
      setIsEditDialogOpen(false);
      setEditingCustomer(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ title: "Success", description: "Customer deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleAddCustomer = () => {
    if (!newCustomer.name) {
      toast({ title: "Error", description: "Customer name is required", variant: "destructive" });
      return;
    }
    createCustomerMutation.mutate(newCustomer as InsertCustomer);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const handleUpdateCustomer = () => {
    if (!editingCustomer) return;
    updateCustomerMutation.mutate({
      id: editingCustomer.id,
      data: {
        name: editingCustomer.name,
        businessName: editingCustomer.businessName,
        phone: editingCustomer.phone,
        address: editingCustomer.address,
        deliveryRoute: editingCustomer.deliveryRoute,
        defaultQuantityKg: editingCustomer.defaultQuantityKg,
        pricePerKg: editingCustomer.pricePerKg,
        isActive: editingCustomer.isActive,
      },
    });
  };

  const columns = [
    {
      key: "name",
      header: "Customer",
      render: (item: Customer) => (
        <div>
          <div className="font-medium">{item.name}</div>
          {item.businessName && (
            <div className="text-sm text-muted-foreground">{item.businessName}</div>
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
          {item.phone || "—"}
        </div>
      ),
    },
    {
      key: "address",
      header: "Address",
      render: (item: Customer) => (
        <div className="flex items-center gap-2 max-w-xs">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate">{item.address || "—"}</span>
        </div>
      ),
    },
    {
      key: "deliveryRoute",
      header: "Route",
      render: (item: Customer) => (
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline">{item.deliveryRoute || "Unassigned"}</Badge>
        </div>
      ),
    },
    {
      key: "defaultQuantityKg",
      header: "Usual Qty",
      render: (item: Customer) => (
        <Badge variant="secondary">{item.defaultQuantityKg || 0} kg</Badge>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (item: Customer) => (
        <Badge variant={item.isActive ? "secondary" : "outline"}>
          {item.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.isActive).length;
  const totalUsualQty = customers.reduce((sum, c) => sum + Number(c.defaultQuantityKg || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <p className="text-sm text-muted-foreground">Active Customers</p>
                <p className="text-2xl font-bold">{activeCustomers}</p>
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
        onEdit={handleEditCustomer}
        onDelete={(item) => deleteCustomerMutation.mutate(item.id)}
      />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer Name *</Label>
                <Input
                  value={newCustomer.name || ""}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="Customer name"
                  data-testid="input-customer-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input
                  value={newCustomer.businessName || ""}
                  onChange={(e) => setNewCustomer({ ...newCustomer, businessName: e.target.value })}
                  placeholder="Shop/branch name"
                  data-testid="input-business-name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={newCustomer.phone || ""}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                placeholder="+1 234 567 8900"
                data-testid="input-customer-phone"
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={newCustomer.address || ""}
                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                placeholder="Full address"
                data-testid="input-customer-address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Delivery Route</Label>
                <Select
                  value={newCustomer.deliveryRoute || ""}
                  onValueChange={(value) => setNewCustomer({ ...newCustomer, deliveryRoute: value })}
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
                  value={newCustomer.defaultQuantityKg || ""}
                  onChange={(e) => setNewCustomer({ ...newCustomer, defaultQuantityKg: e.target.value })}
                  data-testid="input-usual-qty"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Price per kg</Label>
              <Input
                type="number"
                step="0.01"
                value={newCustomer.pricePerKg || ""}
                onChange={(e) => setNewCustomer({ ...newCustomer, pricePerKg: e.target.value })}
                placeholder="5.00"
                data-testid="input-price-per-kg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddCustomer} 
              disabled={createCustomerMutation.isPending}
              data-testid="button-save-customer"
            >
              {createCustomerMutation.isPending ? "Adding..." : "Add Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer Name *</Label>
                  <Input
                    value={editingCustomer.name || ""}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                    placeholder="Customer name"
                    data-testid="input-edit-customer-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input
                    value={editingCustomer.businessName || ""}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, businessName: e.target.value })}
                    placeholder="Shop/branch name"
                    data-testid="input-edit-business-name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={editingCustomer.phone || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                  data-testid="input-edit-customer-phone"
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={editingCustomer.address || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                  placeholder="Full address"
                  data-testid="input-edit-customer-address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Delivery Route</Label>
                  <Select
                    value={editingCustomer.deliveryRoute || ""}
                    onValueChange={(value) => setEditingCustomer({ ...editingCustomer, deliveryRoute: value })}
                  >
                    <SelectTrigger data-testid="select-edit-route">
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
                    value={editingCustomer.defaultQuantityKg || ""}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, defaultQuantityKg: e.target.value })}
                    data-testid="input-edit-usual-qty"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateCustomer} 
              disabled={updateCustomerMutation.isPending}
              data-testid="button-update-customer"
            >
              {updateCustomerMutation.isPending ? "Updating..." : "Update Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
