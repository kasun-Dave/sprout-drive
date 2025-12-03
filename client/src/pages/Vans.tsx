import { useState } from "react";
import { DataTable } from "@/components/DataTable";
import { VanAlertCard } from "@/components/VanAlertCard";
import { MetricCard } from "@/components/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Wrench, AlertTriangle, CheckCircle } from "lucide-react";
import { addDays, format } from "date-fns";

interface Van {
  id: string;
  vehicleNumber: string;
  model: string;
  insuranceExpiry: string;
  licenseExpiry: string;
  lastService: string;
  notes: string;
  status: "active" | "maintenance" | "inactive";
}

interface MaintenanceLog {
  id: string;
  date: string;
  vanNumber: string;
  serviceType: string;
  cost: number;
  notes: string;
}

export default function Vans() {
  // todo: remove mock functionality
  const today = new Date();

  const [vans] = useState<Van[]>([
    { id: "1", vehicleNumber: "ABC-1234", model: "Toyota HiAce", insuranceExpiry: format(addDays(today, 5), "yyyy-MM-dd"), licenseExpiry: format(addDays(today, 45), "yyyy-MM-dd"), lastService: format(addDays(today, -60), "yyyy-MM-dd"), notes: "Primary delivery van", status: "active" },
    { id: "2", vehicleNumber: "XYZ-5678", model: "Nissan NV200", insuranceExpiry: format(addDays(today, 120), "yyyy-MM-dd"), licenseExpiry: format(addDays(today, 25), "yyyy-MM-dd"), lastService: format(addDays(today, -30), "yyyy-MM-dd"), notes: "Backup van", status: "active" },
    { id: "3", vehicleNumber: "DEF-9012", model: "Ford Transit", insuranceExpiry: format(addDays(today, 200), "yyyy-MM-dd"), licenseExpiry: format(addDays(today, 180), "yyyy-MM-dd"), lastService: format(addDays(today, -150), "yyyy-MM-dd"), notes: "Service due soon", status: "active" },
  ]);

  const [maintenanceLogs] = useState<MaintenanceLog[]>([
    { id: "1", date: format(addDays(today, -30), "yyyy-MM-dd"), vanNumber: "XYZ-5678", serviceType: "Oil Change", cost: 150, notes: "Routine maintenance" },
    { id: "2", date: format(addDays(today, -60), "yyyy-MM-dd"), vanNumber: "ABC-1234", serviceType: "Brake Service", cost: 350, notes: "Replaced brake pads" },
    { id: "3", date: format(addDays(today, -90), "yyyy-MM-dd"), vanNumber: "DEF-9012", serviceType: "Full Service", cost: 500, notes: "Annual service" },
  ]);

  const alerts = [
    { vehicleNumber: "ABC-1234", alertType: "insurance" as const, expiryDate: addDays(today, 5) },
    { vehicleNumber: "XYZ-5678", alertType: "license" as const, expiryDate: addDays(today, 25) },
    { vehicleNumber: "DEF-9012", alertType: "service" as const, expiryDate: addDays(today, 15) },
  ];

  const vanColumns = [
    { key: "vehicleNumber", header: "Vehicle" },
    { key: "model", header: "Model" },
    { key: "insuranceExpiry", header: "Insurance Expiry" },
    { key: "licenseExpiry", header: "License Expiry" },
    { key: "lastService", header: "Last Service" },
    {
      key: "status",
      header: "Status",
      render: (item: Van) => {
        const colors = {
          active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          maintenance: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
          inactive: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        };
        return <Badge className={colors[item.status]}>{item.status}</Badge>;
      },
    },
  ];

  const logColumns = [
    { key: "date", header: "Date" },
    { key: "vanNumber", header: "Vehicle" },
    { key: "serviceType", header: "Service Type" },
    {
      key: "cost",
      header: "Cost",
      render: (item: MaintenanceLog) => `$${item.cost.toFixed(2)}`,
    },
    { key: "notes", header: "Notes" },
  ];

  const activeVans = vans.filter((v) => v.status === "active").length;
  const upcomingAlerts = alerts.length;
  const totalMaintenance = maintenanceLogs.reduce((sum, l) => sum + l.cost, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Van Management</h1>
        <p className="text-muted-foreground">Manage delivery vehicles and maintenance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Active Vans"
          value={activeVans}
          subtitle={`${vans.length} total vehicles`}
          icon={Truck}
          variant="success"
        />
        <MetricCard
          title="Upcoming Alerts"
          value={upcomingAlerts}
          subtitle="Expiries within 30 days"
          icon={AlertTriangle}
          variant={upcomingAlerts > 0 ? "warning" : "default"}
        />
        <MetricCard
          title="Maintenance YTD"
          value={`$${totalMaintenance}`}
          subtitle="Total costs this year"
          icon={Wrench}
        />
      </div>

      <Tabs defaultValue="vans">
        <TabsList>
          <TabsTrigger value="vans" data-testid="tab-vans">
            <Truck className="h-4 w-4 mr-2" />
            Vehicles
          </TabsTrigger>
          <TabsTrigger value="maintenance" data-testid="tab-maintenance">
            <Wrench className="h-4 w-4 mr-2" />
            Maintenance Log
          </TabsTrigger>
          <TabsTrigger value="alerts" data-testid="tab-alerts">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alerts ({alerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vans" className="mt-6">
          <DataTable
            title="Delivery Vehicles"
            icon={Truck}
            data={vans}
            columns={vanColumns}
            searchKey="vehicleNumber"
            addButtonLabel="Add Vehicle"
            onAdd={() => console.log("Add vehicle")}
            onEdit={(item) => console.log("Edit vehicle:", item)}
            onDelete={(item) => console.log("Delete vehicle:", item)}
          />
        </TabsContent>

        <TabsContent value="maintenance" className="mt-6">
          <DataTable
            title="Maintenance History"
            icon={Wrench}
            data={maintenanceLogs}
            columns={logColumns}
            searchKey="vanNumber"
            addButtonLabel="Add Log Entry"
            onAdd={() => console.log("Add maintenance log")}
            onEdit={(item) => console.log("Edit log:", item)}
          />
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Upcoming Expiries & Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.length > 0 ? (
                alerts.map((alert, idx) => (
                  <VanAlertCard
                    key={idx}
                    vehicleNumber={alert.vehicleNumber}
                    alertType={alert.alertType}
                    expiryDate={alert.expiryDate}
                    onAction={() => console.log(`Action for ${alert.vehicleNumber}`)}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
                  <p className="font-medium">All Clear!</p>
                  <p className="text-sm text-muted-foreground">
                    No upcoming expiries or services due
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
