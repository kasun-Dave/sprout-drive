import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users } from "lucide-react";

interface CustomerData {
  name: string;
  quantity: number;
  revenue: number;
}

interface TopCustomersChartProps {
  data: CustomerData[];
  title?: string;
}

export function TopCustomersChart({
  data,
  title = "Top Customers",
}: TopCustomersChartProps) {
  return (
    <Card data-testid="card-top-customers">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis
                dataKey="name"
                type="category"
                width={100}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === "quantity" ? `${value} kg` : `$${value}`,
                  name === "quantity" ? "Quantity" : "Revenue",
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Bar
                dataKey="quantity"
                fill="hsl(var(--chart-1))"
                radius={[0, 4, 4, 0]}
                name="Quantity (kg)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
