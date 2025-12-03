import { InvoiceView } from "../InvoiceView";

export default function InvoiceViewExample() {
  // todo: remove mock functionality
  const invoiceData = {
    invoiceNumber: "INV-2024-001",
    date: new Date(),
    customerName: "Green Market",
    customerAddress: "123 Main St, Downtown, City",
    items: [
      { product: "Mung Sprouts", quantity: 50, pricePerUnit: 5, total: 250 },
      { product: "Broccoli", quantity: 10, pricePerUnit: 3, total: 30 },
    ],
  };

  return (
    <InvoiceView
      {...invoiceData}
      onPrint={() => window.print()}
      onDownload={() => console.log("Download invoice")}
    />
  );
}
