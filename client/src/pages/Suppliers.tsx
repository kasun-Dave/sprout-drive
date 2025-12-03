import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { PurchaseForm } from "@/components/PurchaseForm";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Supplier, Purchase, InsertSupplier, InsertPurchase } from "@shared/schema";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type PurchaseWithSupplier = Purchase & { supplier?: Supplier };

export default function Suppliers() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState<Partial<InsertSupplier>>({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    isActive: true,
  });

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const { data: purchases = [], isLoading: purchasesLoading } = useQuery<PurchaseWithSupplier[]>({
    queryKey: ["/api/purchases"],
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (data: InsertSupplier) => {
      const res = await apiRequest("POST", "/api/suppliers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      toast({ title: "Success", description: "Supplier created successfully" });
      setIsAddDialogOpen(false);
      setNewSupplier({ name: "", contactPerson: "", phone: "", email: "", address: "", isActive: true });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateSupplierMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertSupplier> }) => {
      const res = await apiRequest("PATCH", `/api/suppliers/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      toast({ title: "Success", description: "Supplier updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/suppliers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      toast({ title: "Success", description: "Supplier deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createPurchaseMutation = useMutation({
    mutationFn: async (data: InsertPurchase) => {
      const res = await apiRequest("POST", "/api/purchases", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
      toast({ title: "Success", description: "Purchase recorded successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleAddSupplier = () => {
    if (!newSupplier.name) {
      toast({ title: "Error", description: "Supplier name is required", variant: "destructive" });
      return;
    }
    createSupplierMutation.mutate(newSupplier as InsertSupplier);
  };

  const supplierColumns = [
    { key: "name", header: "Supplier Name" },
    { key: "phone", header: "Phone" },
    { key: "address", header: "Address" },
    {
      key: "isActive",
      header: "Status",
      render: (item: Supplier) => (
        <Badge variant={item.isActive ? "secondary" : "outline"}>
          {item.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  const purchaseColumns = [
    { key: "purchaseDate", header: "Date" },
    { 
      key: "supplier", 
      header: "Supplier",
      render: (item: PurchaseWithSupplier) => item.supplier?.name || "Unknown"
    },
    {
      key: "quantityKg",
      header: "Quantity",
      render: (item: PurchaseWithSupplier) => `${item.quantityKg} kg`,
    },
    {
      key: "pricePerKg",
      header: "Price/kg",
      render: (item: PurchaseWithSupplier) => `$${Number(item.pricePerKg).toFixed(2)}`,
    },
    {
      key: "totalCost",
      header: "Total",
      render: (item: PurchaseWithSupplier) => (
        <span className="font-semibold">${Number(item.totalCost).toFixed(2)}</span>
      ),
    },
  ];

  if (suppliersLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Suppliers & Purchasing</h1>
          <p className="text-muted-foreground">Manage suppliers and record purchases</p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Suppliers & Purchasing</h1>
        <p className="text-muted-foreground">Manage suppliers and record purchases</p>
      </div>

      <Tabs defaultValue="suppliers">
        <TabsList>
          <TabsTrigger value="suppliers" data-testid="tab-suppliers">
            <Building2 className="h-4 w-4 mr-2" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="purchases" data-testid="tab-purchases">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Purchases
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="mt-6">
          <DataTable
            title="Suppliers"
            icon={Building2}
            data={suppliers}
            columns={supplierColumns}
            searchKey="name"
            addButtonLabel="Add Supplier"
            onAdd={() => setIsAddDialogOpen(true)}
            onEdit={(item) => console.log("Edit supplier:", item)}
            onDelete={(item) => deleteSupplierMutation.mutate(item.id)}
          />
        </TabsContent>

        <TabsContent value="purchases" className="mt-6 space-y-6">
          <PurchaseForm
            suppliers={suppliers.map((s) => ({ id: String(s.id), name: s.name }))}
            products={["Mung Beans", "Broccoli", "Other Vegetables"]}
            onSubmit={(data) => {
              const purchaseData: InsertPurchase = {
                supplierId: parseInt(data.supplierId),
                purchaseDate: data.date,
                quantityKg: String(data.quantity),
                pricePerKg: String(data.pricePerKg),
                totalCost: String(data.quantity * data.pricePerKg),
                notes: data.notes || null,
              };
              createPurchaseMutation.mutate(purchaseData);
            }}
          />
          {purchasesLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <DataTable
              title="Recent Purchases"
              icon={ShoppingBag}
              data={purchases}
              columns={purchaseColumns}
              searchable={false}
              onEdit={(item) => console.log("Edit purchase:", item)}
            />
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Supplier Name *</Label>
              <Input
                value={newSupplier.name || ""}
                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                placeholder="Supplier name"
                data-testid="input-supplier-name"
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input
                value={newSupplier.contactPerson || ""}
                onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                placeholder="Contact person name"
                data-testid="input-contact-person"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={newSupplier.phone || ""}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                  data-testid="input-supplier-phone"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={newSupplier.email || ""}
                  onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                  placeholder="email@example.com"
                  data-testid="input-supplier-email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={newSupplier.address || ""}
                onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                placeholder="Full address"
                data-testid="input-supplier-address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddSupplier} 
              disabled={createSupplierMutation.isPending}
              data-testid="button-save-supplier"
            >
              {createSupplierMutation.isPending ? "Adding..." : "Add Supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
