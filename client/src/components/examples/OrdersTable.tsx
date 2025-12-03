import { useState } from "react";
import { OrdersTable, Order } from "../OrdersTable";

export default function OrdersTableExample() {
  // todo: remove mock functionality
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "1",
      customerName: "Green Market",
      shopName: "Main Street Branch",
      product: "Mung Sprouts",
      orderedQty: 50,
      baggedQty: 50,
      deliveredQty: 48,
      status: "delivered",
      cashCollected: 240,
      paymentType: "cash",
    },
    {
      id: "2",
      customerName: "Fresh Foods Co",
      product: "Mung Sprouts",
      orderedQty: 30,
      baggedQty: 30,
      deliveredQty: 0,
      status: "bagged",
    },
    {
      id: "3",
      customerName: "Health Hub",
      shopName: "City Center",
      product: "Mung Sprouts",
      orderedQty: 25,
      baggedQty: 0,
      deliveredQty: 0,
      status: "pending",
    },
    {
      id: "4",
      customerName: "Super Mart",
      product: "Broccoli",
      orderedQty: 15,
      baggedQty: 15,
      deliveredQty: 15,
      status: "delivered",
      cashCollected: 75,
      paymentType: "credit",
    },
  ]);

  const handleUpdate = (id: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
    console.log("Order updated:", id, updates);
  };

  const handlePrintInvoice = (id: string) => {
    console.log("Print invoice for order:", id);
  };

  return (
    <OrdersTable
      orders={orders}
      editable={true}
      onUpdateOrder={handleUpdate}
      onPrintInvoice={handlePrintInvoice}
    />
  );
}
