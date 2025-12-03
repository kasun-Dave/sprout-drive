import { MetricCard } from "../MetricCard";
import { Sprout, Package, Truck, Users } from "lucide-react";

export default function MetricCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Ready Sprouts"
        value="450 kg"
        subtitle="Available today"
        icon={Sprout}
        variant="success"
      />
      <MetricCard
        title="Today's Orders"
        value="380 kg"
        subtitle="12 customers"
        icon={Package}
        trend={{ value: 12, isPositive: true }}
      />
      <MetricCard
        title="Deliveries"
        value="8"
        subtitle="In progress"
        icon={Truck}
      />
      <MetricCard
        title="Active Customers"
        value="45"
        icon={Users}
        trend={{ value: 5, isPositive: true }}
      />
    </div>
  );
}
