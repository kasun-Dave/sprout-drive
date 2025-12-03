import { ProductBreakdownChart } from "../ProductBreakdownChart";

export default function ProductBreakdownChartExample() {
  // todo: remove mock functionality
  const mockData = [
    { name: "Mung Sprouts", value: 2850, color: "hsl(142, 76%, 36%)" },
    { name: "Broccoli", value: 420, color: "hsl(195, 82%, 38%)" },
    { name: "Other Vegetables", value: 180, color: "hsl(31, 88%, 48%)" },
  ];

  return <ProductBreakdownChart data={mockData} />;
}
