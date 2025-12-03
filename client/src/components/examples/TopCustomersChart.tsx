import { TopCustomersChart } from "../TopCustomersChart";

export default function TopCustomersChartExample() {
  // todo: remove mock functionality
  const mockData = [
    { name: "Green Market", quantity: 580, revenue: 2900 },
    { name: "Fresh Foods Co", quantity: 420, revenue: 2100 },
    { name: "Health Hub", quantity: 350, revenue: 1750 },
    { name: "Super Mart", quantity: 280, revenue: 1400 },
    { name: "Organic Store", quantity: 220, revenue: 1100 },
  ];

  return <TopCustomersChart data={mockData} />;
}
