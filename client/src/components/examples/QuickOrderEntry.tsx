import { QuickOrderEntry } from "../QuickOrderEntry";

export default function QuickOrderEntryExample() {
  // todo: remove mock functionality
  const customers = [
    { id: "1", name: "Green Market", shopName: "Main Branch", usualQty: 50 },
    { id: "2", name: "Fresh Foods Co", usualQty: 30 },
    { id: "3", name: "Health Hub", shopName: "City Center", usualQty: 25 },
    { id: "4", name: "Super Mart", usualQty: 40 },
  ];

  const products = ["Mung Sprouts", "Broccoli", "Other Vegetables"];

  const handleSubmit = (orders: any) => {
    console.log("Orders created:", orders);
  };

  return (
    <QuickOrderEntry
      customers={customers}
      products={products}
      onSubmit={handleSubmit}
    />
  );
}
