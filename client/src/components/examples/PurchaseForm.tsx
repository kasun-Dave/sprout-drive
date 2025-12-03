import { PurchaseForm } from "../PurchaseForm";

export default function PurchaseFormExample() {
  // todo: remove mock functionality
  const suppliers = [
    { id: "1", name: "Bean Farms Inc" },
    { id: "2", name: "Green Valley Suppliers" },
    { id: "3", name: "Fresh Produce Co" },
  ];

  const products = ["Mung Beans", "Broccoli", "Other Vegetables"];

  const handleSubmit = (data: any) => {
    console.log("Purchase recorded:", data);
  };

  return (
    <PurchaseForm
      suppliers={suppliers}
      products={products}
      onSubmit={handleSubmit}
    />
  );
}
