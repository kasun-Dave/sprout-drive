import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sprout, AlertTriangle } from "lucide-react";
import { format, addDays } from "date-fns";

interface PlantingDay {
  date: Date;
  bedsReady: number;
  kgAvailable: number;
  orderedKg: number;
}

interface PlantingCalendarProps {
  days: PlantingDay[];
}

export function PlantingCalendar({ days }: PlantingCalendarProps) {
  const getStatusColor = (available: number, ordered: number) => {
    const ratio = available / ordered;
    if (ratio >= 1.2) return "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800";
    if (ratio >= 1) return "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800";
    return "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800";
  };

  return (
    <Card data-testid="card-planting-calendar">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sprout className="h-5 w-5 text-primary" />
          7-Day Planting Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {days.map((day, idx) => {
            const isLow = day.kgAvailable < day.orderedKg;
            return (
              <div
                key={idx}
                className={`p-3 rounded-md border ${getStatusColor(day.kgAvailable, day.orderedKg)} hover-elevate`}
                data-testid={`planting-day-${idx}`}
              >
                <div className="text-xs font-medium text-muted-foreground">
                  {format(day.date, "EEE")}
                </div>
                <div className="text-sm font-semibold">
                  {format(day.date, "MMM d")}
                </div>
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-muted-foreground">
                    {day.bedsReady} beds
                  </div>
                  <div className="text-lg font-bold flex items-center gap-1">
                    {day.kgAvailable} kg
                    {isLow && (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <Badge variant={isLow ? "destructive" : "secondary"} className="text-xs">
                    Need: {day.orderedKg} kg
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
