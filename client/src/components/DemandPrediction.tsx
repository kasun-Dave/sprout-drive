import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Sprout, Package } from "lucide-react";

interface PredictionData {
  period: string;
  predictedDemand: number;
  suggestedBeds: number;
  suggestedBeans: number;
  confidence: "high" | "medium" | "low";
}

interface DemandPredictionProps {
  predictions: PredictionData[];
  beansToSproutsRatio: number;
}

export function DemandPrediction({
  predictions,
  beansToSproutsRatio,
}: DemandPredictionProps) {
  const confidenceColors = {
    high: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    low: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <Card data-testid="card-demand-prediction">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Planting Predictions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Based on historical data (1 kg beans = {beansToSproutsRatio} kg sprouts)
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {predictions.map((pred, idx) => (
            <div
              key={idx}
              className="p-4 bg-muted/50 rounded-md"
              data-testid={`prediction-${idx}`}
            >
              <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{pred.period}</span>
                </div>
                <Badge className={confidenceColors[pred.confidence]}>
                  {pred.confidence} confidence
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expected Demand</p>
                    <p className="font-semibold">{pred.predictedDemand} kg/day</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-md">
                    <Sprout className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Plant Beds</p>
                    <p className="font-semibold">{pred.suggestedBeds} beds/day</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-md">
                    <Package className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Use Beans</p>
                    <p className="font-semibold">{pred.suggestedBeans} kg/day</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
