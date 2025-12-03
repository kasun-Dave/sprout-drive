import { SalesChart } from "../SalesChart";

export default function SalesChartExample() {
  // todo: remove mock functionality
  const mockData = [
    { date: "Mon", sales: 380, orders: 12 },
    { date: "Tue", sales: 420, orders: 14 },
    { date: "Wed", sales: 390, orders: 13 },
    { date: "Thu", sales: 450, orders: 15 },
    { date: "Fri", sales: 520, orders: 18 },
    { date: "Sat", sales: 480, orders: 16 },
    { date: "Sun", sales: 350, orders: 11 },
  ];

  return <SalesChart data={mockData} />;
}
