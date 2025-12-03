import { useState } from "react";
import { DataTable } from "@/components/DataTable";
import { PurchaseForm } from "@/components/PurchaseForm";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, ShoppingBag } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  items: string[];
}

interface Purchase {
  id: string;
  date: string;
  supplierName: string;
  product: string;
  quantity: number;
  pricePerKg: number;
  total: number;
}

export default function Suppliers() {
  // todo: remove mock functionality
  const [suppliers] = useState<Supplier[]>([
    { id: "1", name: "Bean Farms Inc", phone: "+1 234 567 8901", address: "100 Farm Road, Valley", items: ["Mung Beans"] },
    { id: "2", name: "Green Valley Suppliers", phone: "+1 234 567 8902", address: "200 Green Lane, Hills", items: ["Mung Beans", "Broccoli"] },
    { id: "3", name: "Fresh Produce Co", phone: "+1 234 567 8903", address: "300 Fresh St, Town", items: ["Broccoli", "Vegetables"] },
  ]);

  const [purchases] = useState<Purchase[]>([
    { id: "1", date: "2024-01-15", supplierName: "Bean Farms Inc", product: "Mung Beans", quantity: 200, pricePerKg: 2.5, total: 500 },
    { id: "2", date: "2024-01-14", supplierName: "Green Valley Suppliers", product: "Broccoli", quantity: 50, pricePerKg: 3.0, total: 150 },
    { id: "3", date: "2024-01-13", supplierName: "Fresh Produce Co", product: "Vegetables", quantity: 30, pricePerKg: 2.0, total: 60 },
  ]);

  const supplierColumns = [
    { key: "name", header: "Supplier Name" },
    { key: "phone", header: "Phone" },
    { key: "address", header: "Address" },
    {
      key: "items",
      header: "Products",
      render: (item: Supplier) => (
        <div className="flex flex-wrap gap-1">
          {item.items.map((i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {i}
            </Badge>
          ))}
        </div>
      ),
    },
  ];

  const purchaseColumns = [
    { key: "date", header: "Date" },
    { key: "supplierName", header: "Supplier" },
    { key: "product", header: "Product" },
    {
      key: "quantity",
      header: "Quantity",
      render: (item: Purchase) => `${item.quantity} kg`,
    },
    {
      key: "pricePerKg",
      header: "Price/kg",
      render: (item: Purchase) => `$${item.pricePerKg.toFixed(2)}`,
    },
    {
      key: "total",
      header: "Total",
      render: (item: Purchase) => (
        <span className="font-semibold">${item.total.toFixed(2)}</span>
      ),
    },
  ];

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
            onAdd={() => console.log("Add supplier")}
            onEdit={(item) => console.log("Edit supplier:", item)}
            onDelete={(item) => console.log("Delete supplier:", item)}
          />
        </TabsContent>

        <TabsContent value="purchases" className="mt-6 space-y-6">
          <PurchaseForm
            suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
            products={["Mung Beans", "Broccoli", "Other Vegetables"]}
            onSubmit={(data) => console.log("Purchase recorded:", data)}
          />
          <DataTable
            title="Recent Purchases"
            icon={ShoppingBag}
            data={purchases}
            columns={purchaseColumns}
            searchable={false}
            onEdit={(item) => console.log("Edit purchase:", item)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
