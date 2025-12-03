import { StockSummary } from "../StockSummary";

export default function StockSummaryExample() {
  // todo: remove mock functionality
  const stockItems = [
    {
      name: "Mung Beans (Raw)",
      currentStock: 150,
      unit: "kg",
      maxCapacity: 500,
      type: "raw" as const,
    },
    {
      name: "Ready Sprouts",
      currentStock: 450,
      unit: "kg",
      maxCapacity: 600,
      type: "ready" as const,
    },
    {
      name: "Broccoli",
      currentStock: 45,
      unit: "kg",
      type: "other" as const,
    },
    {
      name: "Other Vegetables",
      currentStock: 30,
      unit: "kg",
      type: "other" as const,
    },
  ];

  return <StockSummary items={stockItems} />;
}
