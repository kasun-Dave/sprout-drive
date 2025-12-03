import { useState } from "react";
import { PlantingForm } from "@/components/PlantingForm";
import { PlantingCalendar } from "@/components/PlantingCalendar";
import { DemandPrediction } from "@/components/DemandPrediction";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Sprout, Calendar } from "lucide-react";
import { addDays, format } from "date-fns";

interface PlantingBatch {
  id: string;
  plantingDate: string;
  beds: number;
  beansUsed: number;
  expectedSprouts: number;
  readyDate: string;
  status: "growing" | "ready" | "harvested";
}

export default function Planting() {
  // todo: remove mock functionality
  const today = new Date();
  const beansToSproutsRatio = 6;

  const mockPlantingDays = [
    { date: today, bedsReady: 15, kgAvailable: 450, orderedKg: 380 },
    { date: addDays(today, 1), bedsReady: 12, kgAvailable: 360, orderedKg: 400 },
    { date: addDays(today, 2), bedsReady: 18, kgAvailable: 540, orderedKg: 420 },
    { date: addDays(today, 3), bedsReady: 14, kgAvailable: 420, orderedKg: 350 },
    { date: addDays(today, 4), bedsReady: 10, kgAvailable: 300, orderedKg: 380 },
    { date: addDays(today, 5), bedsReady: 16, kgAvailable: 480, orderedKg: 400 },
    { date: addDays(today, 6), bedsReady: 13, kgAvailable: 390, orderedKg: 360 },
  ];

  const predictions = [
    { period: "This Week", predictedDemand: 420, suggestedBeds: 14, suggestedBeans: 70, confidence: "high" as const },
    { period: "Next Week", predictedDemand: 450, suggestedBeds: 15, suggestedBeans: 75, confidence: "medium" as const },
    { period: "Week 3", predictedDemand: 480, suggestedBeds: 16, suggestedBeans: 80, confidence: "low" as const },
  ];

  const [batches] = useState<PlantingBatch[]>([
    { id: "1", plantingDate: format(addDays(today, -5), "yyyy-MM-dd"), beds: 15, beansUsed: 75, expectedSprouts: 450, readyDate: format(addDays(today, 1), "yyyy-MM-dd"), status: "growing" },
    { id: "2", plantingDate: format(addDays(today, -6), "yyyy-MM-dd"), beds: 15, beansUsed: 75, expectedSprouts: 450, readyDate: format(today, "yyyy-MM-dd"), status: "ready" },
    { id: "3", plantingDate: format(addDays(today, -7), "yyyy-MM-dd"), beds: 14, beansUsed: 70, expectedSprouts: 420, readyDate: format(addDays(today, -1), "yyyy-MM-dd"), status: "harvested" },
  ]);

  const batchColumns = [
    { key: "plantingDate", header: "Planted" },
    { key: "beds", header: "Beds", render: (item: PlantingBatch) => `${item.beds} beds` },
    { key: "beansUsed", header: "Beans Used", render: (item: PlantingBatch) => `${item.beansUsed} kg` },
    { key: "expectedSprouts", header: "Expected", render: (item: PlantingBatch) => `${item.expectedSprouts} kg` },
    { key: "readyDate", header: "Ready Date" },
    {
      key: "status",
      header: "Status",
      render: (item: PlantingBatch) => {
        const colors = {
          growing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
          ready: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          harvested: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
        };
        return <Badge className={colors[item.status]}>{item.status}</Badge>;
      },
    },
  ];

  const handleCreateBatch = (data: any) => {
    console.log("Planting batch created:", data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Planting & Planning</h1>
        <p className="text-muted-foreground">Manage planting batches and view harvest forecasts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlantingForm beansToSproutsRatio={beansToSproutsRatio} onSubmit={handleCreateBatch} />
        <DemandPrediction predictions={predictions} beansToSproutsRatio={beansToSproutsRatio} />
      </div>

      <PlantingCalendar days={mockPlantingDays} />

      <DataTable
        title="Planting Batches"
        icon={Sprout}
        data={batches}
        columns={batchColumns}
        searchable={false}
        onEdit={(item) => console.log("Edit batch:", item)}
      />
    </div>
  );
}
