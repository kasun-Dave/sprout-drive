import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sprout, Calendar, Save } from "lucide-react";
import { format, addDays } from "date-fns";

interface PlantingFormProps {
  beansToSproutsRatio: number;
  sproutGrowthDays: number;
  onSubmit: (data: {
    plantingDate: string;
    beds: number;
    beansUsed: number;
  }) => void;
  isPending?: boolean;
}

export function PlantingForm({ beansToSproutsRatio, sproutGrowthDays, onSubmit, isPending }: PlantingFormProps) {
  const [plantingDate, setPlantingDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [numberOfBeds, setNumberOfBeds] = useState(10);
  const [beansUsed, setBeansUsed] = useState(50);

  const expectedSprouts = beansUsed * beansToSproutsRatio;
  const readyDate = addDays(new Date(plantingDate), sproutGrowthDays);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      plantingDate,
      beds: numberOfBeds,
      beansUsed,
    });
  };

  return (
    <Card data-testid="card-planting-form">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sprout className="h-5 w-5 text-primary" />
          New Planting Batch
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plantingDate">Planting Date</Label>
              <Input
                id="plantingDate"
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                data-testid="input-planting-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beds">Number of Beds</Label>
              <Input
                id="beds"
                type="number"
                min="1"
                value={numberOfBeds}
                onChange={(e) => setNumberOfBeds(Number(e.target.value))}
                data-testid="input-beds"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="beans">Beans Used (kg)</Label>
            <Input
              id="beans"
              type="number"
              min="0"
              step="0.1"
              value={beansUsed}
              onChange={(e) => setBeansUsed(Number(e.target.value))}
              data-testid="input-beans"
            />
            <p className="text-sm text-muted-foreground">
              Ratio: 1 kg beans = {beansToSproutsRatio} kg sprouts
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-md">
                <Sprout className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expected Sprouts</p>
                <p className="text-xl font-bold">{expectedSprouts} kg</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ready Date</p>
                <p className="text-xl font-bold">{format(readyDate, "MMM d, yyyy")}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Button type="submit" className="w-full sm:w-auto" disabled={isPending} data-testid="button-create-planting">
            <Save className="h-4 w-4 mr-2" />
            {isPending ? "Creating..." : "Create Planting Batch"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
