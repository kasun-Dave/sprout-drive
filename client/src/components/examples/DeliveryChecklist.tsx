import { useState } from "react";
import { DeliveryChecklist } from "../DeliveryChecklist";

export default function DeliveryChecklistExample() {
  // todo: remove mock functionality
  const [items, setItems] = useState([
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
      baggedQty: 0,
      deliveredQty: 0,
      cashCollected: 0,
      isDelivered: false,
    },
  ]);

  const handleUpdate = (id: string, updates: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleSaveAll = () => {
    console.log("Saving all deliveries:", items);
  };

  return (
    <DeliveryChecklist
      items={items}
      onUpdateItem={handleUpdate}
      onSaveAll={handleSaveAll}
    />
  );
}
