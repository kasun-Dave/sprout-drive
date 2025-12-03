import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Truck, ChevronDown, ChevronUp, DollarSign, Save } from "lucide-react";

interface DeliveryItem {
  id: string;
  customerName: string;
  shopName?: string;
  address: string;
  orderedQty: number;
  baggedQty: number;
  deliveredQty: number;
  cashCollected: number;
  isDelivered: boolean;
}

interface DeliveryChecklistProps {
  items: DeliveryItem[];
  onUpdateItem: (id: string, updates: Partial<DeliveryItem>) => void;
  onSaveAll: () => void;
}

export function DeliveryChecklist({
  items,
  onUpdateItem,
  onSaveAll,
}: DeliveryChecklistProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalOrdered = items.reduce((sum, item) => sum + item.orderedQty, 0);
  const totalDelivered = items.reduce((sum, item) => sum + item.deliveredQty, 0);
  const totalCash = items.reduce((sum, item) => sum + item.cashCollected, 0);
  const completedCount = items.filter((item) => item.isDelivered).length;

  return (
    <Card data-testid="card-delivery-checklist">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Truck className="h-5 w-5 text-primary" />
          Today's Deliveries
          <Badge variant="secondary" className="ml-2">
            {completedCount}/{items.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <Collapsible
            key={item.id}
            open={expandedId === item.id}
            onOpenChange={() =>
              setExpandedId(expandedId === item.id ? null : item.id)
            }
          >
            <div
              className={`p-3 border rounded-md ${
                item.isDelivered
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-card"
              }`}
              data-testid={`delivery-item-${item.id}`}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={item.isDelivered}
                  onCheckedChange={(checked) =>
                    onUpdateItem(item.id, { isDelivered: !!checked })
                  }
                  data-testid={`checkbox-delivered-${item.id}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-medium">{item.customerName}</span>
                      {item.shopName && (
                        <span className="text-muted-foreground ml-1">
                          ({item.shopName})
                        </span>
                      )}
                    </div>
                    <Badge variant="outline">{item.orderedQty} kg</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {item.address}
                  </p>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid={`button-expand-${item.id}`}>
                    {expandedId === item.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Bagged (kg)</label>
                    <Input
                      type="number"
                      value={item.baggedQty}
                      onChange={(e) =>
                        onUpdateItem(item.id, {
                          baggedQty: Number(e.target.value),
                        })
                      }
                      className="mt-1"
                      data-testid={`input-bagged-${item.id}`}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Delivered (kg)</label>
                    <Input
                      type="number"
                      value={item.deliveredQty}
                      onChange={(e) =>
                        onUpdateItem(item.id, {
                          deliveredQty: Number(e.target.value),
                        })
                      }
                      className="mt-1"
                      data-testid={`input-delivered-${item.id}`}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Cash Collected ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.cashCollected}
                      onChange={(e) =>
                        onUpdateItem(item.id, {
                          cashCollected: Number(e.target.value),
                        })
                      }
                      className="mt-1"
                      data-testid={`input-cash-${item.id}`}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </CardContent>
      <CardFooter className="flex-col sm:flex-row gap-4 border-t pt-4">
        <div className="flex flex-wrap gap-4 flex-1">
          <div className="text-sm">
            <span className="text-muted-foreground">Total Ordered:</span>{" "}
            <span className="font-semibold">{totalOrdered} kg</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Total Delivered:</span>{" "}
            <span className="font-semibold">{totalDelivered} kg</span>
          </div>
          <div className="text-sm flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="font-semibold">${totalCash.toFixed(2)}</span>
          </div>
        </div>
        <Button onClick={onSaveAll} data-testid="button-save-deliveries">
          <Save className="h-4 w-4 mr-2" />
          Save All
        </Button>
      </CardFooter>
    </Card>
  );
}
