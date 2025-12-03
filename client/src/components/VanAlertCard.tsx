import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, Truck, Wrench } from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface VanAlertCardProps {
  vehicleNumber: string;
  alertType: "insurance" | "license" | "service";
  expiryDate: Date;
  onAction?: () => void;
}

export function VanAlertCard({
  vehicleNumber,
  alertType,
  expiryDate,
  onAction,
}: VanAlertCardProps) {
  const daysUntil = differenceInDays(expiryDate, new Date());
  const isUrgent = daysUntil <= 7;

  const alertConfig = {
    insurance: {
      title: "Insurance Expiring",
      icon: AlertTriangle,
      action: "Renew Insurance",
    },
    license: {
      title: "License Expiring",
      icon: Calendar,
      action: "Renew License",
    },
    service: {
      title: "Service Due",
      icon: Wrench,
      action: "Schedule Service",
    },
  };

  const config = alertConfig[alertType];
  const Icon = config.icon;

  return (
    <Card
      className={`${
        isUrgent
          ? "border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/20"
          : "border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-900/20"
      }`}
      data-testid={`van-alert-${vehicleNumber}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-md ${
                isUrgent ? "bg-red-100 dark:bg-red-900/40" : "bg-amber-100 dark:bg-amber-900/40"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  isUrgent ? "text-red-600" : "text-amber-600"
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{vehicleNumber}</span>
              </div>
              <p className="text-sm font-medium mt-1">{config.title}</p>
              <p className="text-sm text-muted-foreground">
                {format(expiryDate, "MMM d, yyyy")} ({daysUntil} days)
              </p>
            </div>
          </div>
          <Button
            variant={isUrgent ? "destructive" : "outline"}
            size="sm"
            onClick={onAction}
            data-testid={`button-van-action-${vehicleNumber}`}
          >
            {config.action}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
