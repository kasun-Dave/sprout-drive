import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StockSummary } from "@/components/StockSummary";
import { DataTable } from "@/components/DataTable";
import { MetricCard } from "@/components/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Sprout, Leaf, Plus, Minus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { StockItem, InsertStockItem, InsertStockTransaction } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Stock() {
  const { toast } = useToast();
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState(0);
  const [adjustmentType, setAdjustmentType] = useState<"add" | "remove">("add");
  const [adjustmentNotes, setAdjustmentNotes] = useState("");
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<InsertStockItem>>({
    name: "",
    itemType: "raw",
    currentQuantity: "0",
    unit: "kg",
    minimumLevel: "0",
  });

  const { data: stockItems = [], isLoading } = useQuery<StockItem[]>({
    queryKey: ["/api/stock"],
  });

  const createStockItemMutation = useMutation({
    mutationFn: async (data: InsertStockItem) => {
      const res = await apiRequest("POST", "/api/stock", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stock"] });
      toast({ title: "Success", description: "Stock item created successfully" });
      setIsAddDialogOpen(false);
      setNewItem({ name: "", itemType: "raw", currentQuantity: "0", unit: "kg", minimumLevel: "0" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data: InsertStockTransaction) => {
      const res = await apiRequest("POST", "/api/stock-transactions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stock"] });
      toast({ title: "Success", description: "Stock adjusted successfully" });
      setAdjustmentDialogOpen(false);
      setSelectedItem(null);
      setAdjustmentAmount(0);
      setAdjustmentNotes("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleAdjust = (item: StockItem) => {
    setSelectedItem(item);
    setAdjustmentAmount(0);
    setAdjustmentType("add");
    setAdjustmentNotes("");
    setAdjustmentDialogOpen(true);
  };

  const handleSaveAdjustment = () => {
    if (!selectedItem || adjustmentAmount === 0) return;
    
    const quantity = adjustmentType === "add" ? adjustmentAmount : -adjustmentAmount;
    
    const transactionData: InsertStockTransaction = {
      stockItemId: selectedItem.id,
      transactionType: adjustmentType === "add" ? "add" : "remove",
      quantity: String(Math.abs(quantity)),
      notes: adjustmentNotes || null,
    };
    
    createTransactionMutation.mutate(transactionData);
  };

  const handleAddItem = () => {
    if (!newItem.name) {
      toast({ title: "Error", description: "Item name is required", variant: "destructive" });
      return;
    }
    createStockItemMutation.mutate(newItem as InsertStockItem);
  };

  const stockSummaryItems = stockItems.map((item) => ({
    name: item.name,
    currentStock: Number(item.currentQuantity),
    unit: item.unit,
    maxCapacity: Number(item.minimumLevel || 0) * 10 || 500,
    type: item.itemType as "raw" | "ready" | "other",
  }));

  const columns = [
    { key: "name", header: "Product" },
    {
      key: "itemType",
      header: "Category",
      render: (item: StockItem) => {
        const colors: Record<string, string> = {
          raw: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
          ready: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          other: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        };
        return <Badge className={colors[item.itemType] || colors.other}>{item.itemType}</Badge>;
      },
    },
    {
      key: "currentQuantity",
      header: "Current Stock",
      render: (item: StockItem) => {
        const current = Number(item.currentQuantity);
        const minimum = Number(item.minimumLevel || 0);
        return (
          <span className={current <= minimum ? "text-red-600 font-semibold" : "font-semibold"}>
            {current} {item.unit}
          </span>
        );
      },
    },
    {
      key: "minimumLevel",
      header: "Min Stock",
      render: (item: StockItem) => `${item.minimumLevel || 0} ${item.unit}`,
    },
    {
      key: "lastUpdated",
      header: "Last Updated",
      render: (item: StockItem) => {
        if (!item.lastUpdated) return "—";
        return new Date(item.lastUpdated).toLocaleDateString();
      },
    },
    {
      key: "actions",
      header: "Adjust",
      render: (item: StockItem) => (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleAdjust(item)}
            data-testid={`button-adjust-${item.id}`}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  const totalRawStock = stockItems
    .filter((i) => i.itemType === "raw")
    .reduce((sum, i) => sum + Number(i.currentQuantity), 0);
  const totalReadyStock = stockItems
    .filter((i) => i.itemType === "ready")
    .reduce((sum, i) => sum + Number(i.currentQuantity), 0);
  const lowStockCount = stockItems.filter(
    (i) => Number(i.currentQuantity) <= Number(i.minimumLevel || 0)
  ).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Stock Management</h1>
          <p className="text-muted-foreground">Monitor and adjust inventory levels</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

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
            onAdd={() => setIsAddDialogOpen(true)}
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
              Current stock: {selectedItem?.currentQuantity} {selectedItem?.unit}
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Adjustment Type</Label>
                <Select
                  value={adjustmentType}
                  onValueChange={(value: "add" | "remove") => setAdjustmentType(value)}
                >
                  <SelectTrigger data-testid="select-adjustment-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add Stock</SelectItem>
                    <SelectItem value="remove">Remove Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setAdjustmentAmount((prev) => Math.max(0, prev - 10))}
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
                  New stock: {Number(selectedItem?.currentQuantity || 0) + (adjustmentType === "add" ? adjustmentAmount : -adjustmentAmount)} {selectedItem?.unit}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input
                  value={adjustmentNotes}
                  onChange={(e) => setAdjustmentNotes(e.target.value)}
                  placeholder="Reason for adjustment"
                  data-testid="input-adjustment-notes"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveAdjustment} 
              disabled={createTransactionMutation.isPending || adjustmentAmount === 0}
              data-testid="button-save-adjustment"
            >
              {createTransactionMutation.isPending ? "Saving..." : "Save Adjustment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Stock Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Item Name *</Label>
              <Input
                value={newItem.name || ""}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Item name"
                data-testid="input-item-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newItem.itemType || "raw"}
                  onValueChange={(value) => setNewItem({ ...newItem, itemType: value })}
                >
                  <SelectTrigger data-testid="select-item-type">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="raw">Raw Material</SelectItem>
                    <SelectItem value="ready">Ready Product</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select
                  value={newItem.unit || "kg"}
                  onValueChange={(value) => setNewItem({ ...newItem, unit: value })}
                >
                  <SelectTrigger data-testid="select-unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="units">units</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Initial Quantity</Label>
                <Input
                  type="number"
                  value={newItem.currentQuantity || ""}
                  onChange={(e) => setNewItem({ ...newItem, currentQuantity: e.target.value })}
                  placeholder="0"
                  data-testid="input-initial-qty"
                />
              </div>
              <div className="space-y-2">
                <Label>Minimum Level</Label>
                <Input
                  type="number"
                  value={newItem.minimumLevel || ""}
                  onChange={(e) => setNewItem({ ...newItem, minimumLevel: e.target.value })}
                  placeholder="0"
                  data-testid="input-min-level"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddItem} 
              disabled={createStockItemMutation.isPending}
              data-testid="button-save-item"
            >
              {createStockItemMutation.isPending ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
