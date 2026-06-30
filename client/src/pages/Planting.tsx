import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PlantingForm } from "@/components/PlantingForm";
import { PlantingCalendar } from "@/components/PlantingCalendar";
import { DemandPrediction } from "@/components/DemandPrediction";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sprout } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useBusinessConfig } from "@/hooks/useBusinessConfig";
import { calculateExpectedYield, calculateDemandPredictions } from "@shared/businessConfig";
import type { PlantingBatch, InsertPlantingBatch, Order as DbOrder, Customer } from "@shared/schema";
import { addDays, format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Planting() {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<PlantingBatch | null>(null);

  const { data: batches = [], isLoading: batchesLoading } = useQuery<PlantingBatch[]>({
    queryKey: ["/api/planting-batches"],
  });

  const { config } = useBusinessConfig();
  const { beansToSproutsRatio, sproutGrowthDays } = config;

  const { data: recentOrders = [] } = useQuery<Array<DbOrder & { customer?: Customer }>>({
    queryKey: ["/api/orders"],
  });

  const createBatchMutation = useMutation({
    mutationFn: async (data: InsertPlantingBatch) => {
      const res = await apiRequest("POST", "/api/planting-batches", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/planting-batches"] });
      toast({ title: "Success", description: "Planting batch created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateBatchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertPlantingBatch> }) => {
      const res = await apiRequest("PATCH", `/api/planting-batches/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/planting-batches"] });
      toast({ title: "Success", description: "Batch updated successfully" });
      setIsEditDialogOpen(false);
      setEditingBatch(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleCreateBatch = (data: { plantingDate: string; beds: number; beansUsed: number }) => {
    const expectedSprouts = calculateExpectedYield(data.beansUsed, beansToSproutsRatio);
    const expectedHarvestDate = format(addDays(parseISO(data.plantingDate), sproutGrowthDays), "yyyy-MM-dd");
    const batchCode = `BATCH-${format(new Date(), "yyyyMMdd")}-${String(batches.length + 1).padStart(3, "0")}`;
    
    const batchData: InsertPlantingBatch = {
      batchCode,
      plantedDate: data.plantingDate,
      expectedHarvestDate,
      beansUsedKg: String(data.beansUsed),
      expectedYieldKg: String(expectedSprouts),
      status: "growing",
      notes: `${data.beds} beds planted`,
    };
    createBatchMutation.mutate(batchData);
  };

  const handleEditBatch = (batch: PlantingBatch) => {
    setEditingBatch(batch);
    setIsEditDialogOpen(true);
  };

  const handleUpdateBatch = () => {
    if (!editingBatch) return;
    updateBatchMutation.mutate({
      id: editingBatch.id,
      data: {
        status: editingBatch.status,
        actualYieldKg: editingBatch.actualYieldKg,
        notes: editingBatch.notes,
      },
    });
  };

  const today = new Date();
  const plantingDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const batchesForDay = batches.filter(
      (b) => b.expectedHarvestDate === dateStr && (b.status === "growing" || b.status === "ready")
    );
    const kgAvailable = batchesForDay.reduce((sum, b) => sum + Number(b.expectedYieldKg), 0);
    const bedsReady = batchesForDay.length;
    const orderedKg = recentOrders
      .filter((o) => o.deliveryDate === dateStr)
      .reduce((sum, o) => sum + Number(o.quantityKg), 0);
    return { date, bedsReady, kgAvailable, orderedKg };
  });

  const avgDailyOrdersKg =
    recentOrders.length > 0
      ? recentOrders.reduce((sum, o) => sum + Number(o.quantityKg), 0) /
        Math.max(1, new Set(recentOrders.map((o) => o.deliveryDate)).size)
      : 0;

  const predictions = calculateDemandPredictions(avgDailyOrdersKg, config, 3);

  const batchColumns = [
    { key: "batchCode", header: "Batch Code" },
    { key: "plantedDate", header: "Planted" },
    { key: "beansUsedKg", header: "Beans Used", render: (item: PlantingBatch) => `${item.beansUsedKg} kg` },
    { key: "expectedYieldKg", header: "Expected Yield", render: (item: PlantingBatch) => `${item.expectedYieldKg} kg` },
    { key: "expectedHarvestDate", header: "Ready Date" },
    {
      key: "status",
      header: "Status",
      render: (item: PlantingBatch) => {
        const colors: Record<string, string> = {
          growing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
          ready: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          harvested: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
        };
        return <Badge className={colors[item.status] || colors.growing}>{item.status}</Badge>;
      },
    },
  ];

  if (batchesLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Planting & Planning</h1>
          <p className="text-muted-foreground">Manage planting batches and view harvest forecasts</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-40" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Planting & Planning</h1>
        <p className="text-muted-foreground">Manage planting batches and view harvest forecasts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlantingForm 
          beansToSproutsRatio={beansToSproutsRatio} 
          sproutGrowthDays={sproutGrowthDays}
          onSubmit={handleCreateBatch}
          isPending={createBatchMutation.isPending}
        />
        <DemandPrediction predictions={predictions} beansToSproutsRatio={beansToSproutsRatio} />
      </div>

      <PlantingCalendar days={plantingDays} />

      <DataTable
        title="Planting Batches"
        icon={Sprout}
        data={batches}
        columns={batchColumns}
        searchable={false}
        onEdit={handleEditBatch}
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Batch: {editingBatch?.batchCode}</DialogTitle>
          </DialogHeader>
          {editingBatch && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editingBatch.status}
                  onValueChange={(value) => setEditingBatch({ ...editingBatch, status: value })}
                >
                  <SelectTrigger data-testid="select-batch-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="growing">Growing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="harvested">Harvested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingBatch.status === "harvested" && (
                <div className="space-y-2">
                  <Label>Actual Yield (kg)</Label>
                  <input
                    type="number"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={editingBatch.actualYieldKg || ""}
                    onChange={(e) => setEditingBatch({ ...editingBatch, actualYieldKg: e.target.value })}
                    placeholder="Enter actual yield"
                    data-testid="input-actual-yield"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Notes</Label>
                <input
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={editingBatch.notes || ""}
                  onChange={(e) => setEditingBatch({ ...editingBatch, notes: e.target.value })}
                  placeholder="Add notes"
                  data-testid="input-batch-notes"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateBatch} 
              disabled={updateBatchMutation.isPending}
              data-testid="button-update-batch"
            >
              {updateBatchMutation.isPending ? "Updating..." : "Update Batch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
