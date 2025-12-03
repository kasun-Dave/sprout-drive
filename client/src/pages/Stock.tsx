import { useState } from "react";
import { StockSummary } from "@/components/StockSummary";
import { DataTable } from "@/components/DataTable";
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Sprout, Leaf, Plus, Minus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

interface StockItem {
  id: string;
  name: string;
  category: "raw" | "ready" | "other";
  currentStock: number;
  unit: string;
  minStock: number;
  lastUpdated: string;
}

export default function Stock() {
  // todo: remove mock functionality
  const [stockItems, setStockItems] = useState<StockItem[]>([
    { id: "1", name: "Mung Beans (Raw)", category: "raw", currentStock: 150, unit: "kg", minStock: 50, lastUpdated: "2024-01-15" },
    { id: "2", name: "Ready Sprouts", category: "ready", currentStock: 450, unit: "kg", minStock: 100, lastUpdated: "2024-01-15" },
    { id: "3", name: "Broccoli", category: "other", currentStock: 45, unit: "kg", minStock: 20, lastUpdated: "2024-01-15" },
    { id: "4", name: "Other Vegetables", category: "other", currentStock: 30, unit: "kg", minStock: 15, lastUpdated: "2024-01-14" },
  ]);

  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState(0);

  const stockSummaryItems = stockItems.map((item) => ({
    name: item.name,
    currentStock: item.currentStock,
    unit: item.unit,
    maxCapacity: item.minStock * 10,
    type: item.category,
  }));

  const handleAdjust = (item: StockItem, type: "add" | "remove") => {
    setSelectedItem(item);
    setAdjustmentAmount(0);
    setAdjustmentDialogOpen(true);
  };

  const handleSaveAdjustment = () => {
    if (selectedItem) {
      setStockItems((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id
            ? { ...item, currentStock: item.currentStock + adjustmentAmount }
            : item
        )
      );
      setAdjustmentDialogOpen(false);
      setSelectedItem(null);
    }
  };

  const columns = [
    { key: "name", header: "Product" },
    {
      key: "category",
      header: "Category",
      render: (item: StockItem) => {
        const colors = {
          raw: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
          ready: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          other: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        };
        return <Badge className={colors[item.category]}>{item.category}</Badge>;
      },
    },
    {
      key: "currentStock",
      header: "Current Stock",
      render: (item: StockItem) => (
        <span className={item.currentStock <= item.minStock ? "text-red-600 font-semibold" : "font-semibold"}>
          {item.currentStock} {item.unit}
        </span>
      ),
    },
    {
      key: "minStock",
      header: "Min Stock",
      render: (item: StockItem) => `${item.minStock} ${item.unit}`,
    },
    { key: "lastUpdated", header: "Last Updated" },
    {
      key: "actions",
      header: "Adjust",
      render: (item: StockItem) => (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleAdjust(item, "add")}
            data-testid={`button-adjust-${item.id}`}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  const totalRawStock = stockItems.filter((i) => i.category === "raw").reduce((sum, i) => sum + i.currentStock, 0);
  const totalReadyStock = stockItems.filter((i) => i.category === "ready").reduce((sum, i) => sum + i.currentStock, 0);
  const lowStockCount = stockItems.filter((i) => i.currentStock <= i.minStock).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stock Management</h1>
        <p className="text-muted-foreground">Monitor and adjust inventory levels</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Raw Materials"
          value={`${totalRawStock} kg`}
          subtitle="Mung beans available"
          icon={Package}
        />
        <MetricCard
          title="Ready Sprouts"
          value={`${totalReadyStock} kg`}
          subtitle="Available for delivery"
          icon={Sprout}
          variant="success"
        />
        <MetricCard
          title="Low Stock Items"
          value={lowStockCount}
          subtitle={lowStockCount > 0 ? "Need attention" : "All good"}
          icon={Leaf}
          variant={lowStockCount > 0 ? "warning" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable
            title="Stock Items"
            icon={Package}
            data={stockItems}
            columns={columns}
            searchKey="name"
            addButtonLabel="Add Item"
            onAdd={() => console.log("Add stock item")}
          />
        </div>
        <div>
          <StockSummary items={stockSummaryItems} />
        </div>
      </div>

      <Dialog open={adjustmentDialogOpen} onOpenChange={setAdjustmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock: {selectedItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Current stock: {selectedItem?.currentStock} {selectedItem?.unit}
            </p>
            <div className="space-y-2">
              <Label>Adjustment Amount</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setAdjustmentAmount((prev) => prev - 10)}
                  data-testid="button-decrease"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                  className="text-center"
                  data-testid="input-adjustment"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setAdjustmentAmount((prev) => prev + 10)}
                  data-testid="button-increase"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                New stock: {(selectedItem?.currentStock || 0) + adjustmentAmount} {selectedItem?.unit}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAdjustment} data-testid="button-save-adjustment">
              Save Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
