import { DataTable } from "../DataTable";
import { Users, Badge } from "lucide-react";
import { Badge as BadgeUI } from "@/components/ui/badge";

interface Customer {
  id: string;
  name: string;
  shopName: string;
  phone: string;
  address: string;
  usualQty: number;
}

export default function DataTableExample() {
  // todo: remove mock functionality
  const customers: Customer[] = [
    {
      id: "1",
      name: "John's Market",
      shopName: "Main Branch",
      phone: "+1 234 567 8900",
      address: "123 Main St, City",
      usualQty: 25,
    },
    {
      id: "2",
      name: "Fresh Foods Co",
      shopName: "Downtown",
      phone: "+1 234 567 8901",
      address: "456 Oak Ave, City",
      usualQty: 40,
    },
    {
      id: "3",
      name: "Health Hub",
      shopName: "City Center",
      phone: "+1 234 567 8902",
      address: "789 Pine Rd, City",
      usualQty: 15,
    },
  ];

  const columns = [
    { key: "name", header: "Customer Name" },
    { key: "shopName", header: "Shop" },
    { key: "phone", header: "Phone" },
    { key: "address", header: "Address" },
    {
      key: "usualQty",
      header: "Usual Qty",
      render: (item: Customer) => (
        <BadgeUI variant="secondary">{item.usualQty} kg</BadgeUI>
      ),
    },
  ];

  return (
    <DataTable
      title="Customers"
      icon={Users}
      data={customers}
      columns={columns}
      searchKey="name"
      addButtonLabel="Add Customer"
      onAdd={() => console.log("Add customer")}
      onEdit={(item) => console.log("Edit customer:", item)}
      onDelete={(item) => console.log("Delete customer:", item)}
    />
  );
}
