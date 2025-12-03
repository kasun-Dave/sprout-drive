import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Package, Leaf, Sprout } from "lucide-react";

interface StockItem {
  name: string;
  currentStock: number;
  unit: string;
  maxCapacity?: number;
  type: "raw" | "ready" | "other";
}

interface StockSummaryProps {
  items: StockItem[];
}

export function StockSummary({ items }: StockSummaryProps) {
  const getIcon = (type: StockItem["type"]) => {
    switch (type) {
      case "raw":
        return <Package className="h-5 w-5 text-amber-600" />;
      case "ready":
        return <Sprout className="h-5 w-5 text-green-600" />;
      default:
        return <Leaf className="h-5 w-5 text-blue-600" />;
    }
  };

  const getProgressColor = (type: StockItem["type"]) => {
    switch (type) {
      case "raw":
        return "bg-amber-500";
      case "ready":
        return "bg-green-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <Card data-testid="card-stock-summary">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5 text-primary" />
          Stock Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4"
            data-testid={`stock-item-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="p-2 bg-muted rounded-md">{getIcon(item.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium truncate">{item.name}</span>
                <span className="text-sm font-semibold whitespace-nowrap">
                  {item.currentStock} {item.unit}
                </span>
              </div>
              {item.maxCapacity && (
                <div className="mt-2">
                  <Progress
                    value={(item.currentStock / item.maxCapacity) * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((item.currentStock / item.maxCapacity) * 100)}%
                    of capacity
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
