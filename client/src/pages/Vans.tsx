import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { VanAlertCard } from "@/components/VanAlertCard";
import { MetricCard } from "@/components/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Wrench, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Van, InsertVan, Setting } from "@shared/schema";
import { addDays, differenceInDays, parseISO, format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VanAlert {
  vehicleNumber: string;
  alertType: "insurance" | "license" | "service";
  expiryDate: Date;
}

export default function Vans() {
  const { toast } = useToast();
  const today = new Date();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVan, setEditingVan] = useState<Van | null>(null);
  const [newVan, setNewVan] = useState<Partial<InsertVan>>({
    registrationNumber: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    status: "active",
  });

  const { data: vans = [], isLoading: vansLoading } = useQuery<Van[]>({
    queryKey: ["/api/vans"],
  });

  const { data: settings = [] } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
  });

  const expiryWarningDays = Number(settings.find(s => s.key === "expiryWarningDays")?.value) || 30;
  const serviceIntervalMonths = Number(settings.find(s => s.key === "serviceIntervalMonths")?.value) || 6;

  const createVanMutation = useMutation({
    mutationFn: async (data: InsertVan) => {
      const res = await apiRequest("POST", "/api/vans", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vans"] });
      toast({ title: "Success", description: "Van added successfully" });
      setIsAddDialogOpen(false);
      setNewVan({ registrationNumber: "", make: "", model: "", year: new Date().getFullYear(), status: "active" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateVanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertVan> }) => {
      const res = await apiRequest("PATCH", `/api/vans/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vans"] });
      toast({ title: "Success", description: "Van updated successfully" });
      setIsEditDialogOpen(false);
      setEditingVan(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteVanMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/vans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vans"] });
      toast({ title: "Success", description: "Van deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleAddVan = () => {
    if (!newVan.registrationNumber) {
      toast({ title: "Error", description: "Registration number is required", variant: "destructive" });
      return;
    }
    createVanMutation.mutate(newVan as InsertVan);
  };

  const handleEditVan = (van: Van) => {
    setEditingVan(van);
    setIsEditDialogOpen(true);
  };

  const handleUpdateVan = () => {
    if (!editingVan) return;
    updateVanMutation.mutate({
      id: editingVan.id,
      data: {
        registrationNumber: editingVan.registrationNumber,
        make: editingVan.make,
        model: editingVan.model,
        year: editingVan.year,
        insuranceExpiry: editingVan.insuranceExpiry,
        licenseExpiry: editingVan.licenseExpiry,
        lastServiceDate: editingVan.lastServiceDate,
        nextServiceDate: editingVan.nextServiceDate,
        status: editingVan.status,
        notes: editingVan.notes,
      },
    });
  };

  const alerts: VanAlert[] = vans.flatMap((van) => {
    const vanAlerts: VanAlert[] = [];
    
    if (van.insuranceExpiry) {
      const expiryDate = parseISO(van.insuranceExpiry);
      const daysUntil = differenceInDays(expiryDate, today);
      if (daysUntil <= expiryWarningDays && daysUntil >= 0) {
        vanAlerts.push({ vehicleNumber: van.registrationNumber, alertType: "insurance", expiryDate });
      }
    }
    
    if (van.licenseExpiry) {
      const expiryDate = parseISO(van.licenseExpiry);
      const daysUntil = differenceInDays(expiryDate, today);
      if (daysUntil <= expiryWarningDays && daysUntil >= 0) {
        vanAlerts.push({ vehicleNumber: van.registrationNumber, alertType: "license", expiryDate });
      }
    }
    
    if (van.lastServiceDate) {
      const lastService = parseISO(van.lastServiceDate);
      const nextServiceDue = addDays(lastService, serviceIntervalMonths * 30);
      const daysUntil = differenceInDays(nextServiceDue, today);
      if (daysUntil <= expiryWarningDays && daysUntil >= 0) {
        vanAlerts.push({ vehicleNumber: van.registrationNumber, alertType: "service", expiryDate: nextServiceDue });
      }
    }
    
    return vanAlerts;
  });

  const vanColumns = [
    { key: "registrationNumber", header: "Vehicle" },
    { key: "model", header: "Model", render: (item: Van) => `${item.make || ""} ${item.model || ""}`.trim() || "—" },
    { key: "insuranceExpiry", header: "Insurance Expiry", render: (item: Van) => item.insuranceExpiry || "—" },
    { key: "licenseExpiry", header: "License Expiry", render: (item: Van) => item.licenseExpiry || "—" },
    { key: "lastServiceDate", header: "Last Service", render: (item: Van) => item.lastServiceDate || "—" },
    {
      key: "status",
      header: "Status",
      render: (item: Van) => {
        const colors: Record<string, string> = {
          active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          maintenance: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
          inactive: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        };
        return <Badge className={colors[item.status] || colors.active}>{item.status}</Badge>;
      },
    },
  ];

  const activeVans = vans.filter((v) => v.status === "active").length;

  if (vansLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Van Management</h1>
          <p className="text-muted-foreground">Manage delivery vehicles and maintenance</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

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
          value={alerts.length}
          subtitle="Expiries within 30 days"
          icon={AlertTriangle}
          variant={alerts.length > 0 ? "warning" : "default"}
        />
        <MetricCard
          title="Maintenance Due"
          value={alerts.filter(a => a.alertType === "service").length}
          subtitle="Services needed"
          icon={Wrench}
        />
      </div>

      <Tabs defaultValue="vans">
        <TabsList>
          <TabsTrigger value="vans" data-testid="tab-vans">
            <Truck className="h-4 w-4 mr-2" />
            Vehicles
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
            searchKey="registrationNumber"
            addButtonLabel="Add Vehicle"
            onAdd={() => setIsAddDialogOpen(true)}
            onEdit={handleEditVan}
            onDelete={(item) => deleteVanMutation.mutate(item.id)}
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

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Registration Number *</Label>
              <Input
                value={newVan.registrationNumber || ""}
                onChange={(e) => setNewVan({ ...newVan, registrationNumber: e.target.value })}
                placeholder="ABC-1234"
                data-testid="input-reg-number"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Make</Label>
                <Input
                  value={newVan.make || ""}
                  onChange={(e) => setNewVan({ ...newVan, make: e.target.value })}
                  placeholder="Toyota"
                  data-testid="input-make"
                />
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Input
                  value={newVan.model || ""}
                  onChange={(e) => setNewVan({ ...newVan, model: e.target.value })}
                  placeholder="HiAce"
                  data-testid="input-model"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Year</Label>
                <Input
                  type="number"
                  value={newVan.year || ""}
                  onChange={(e) => setNewVan({ ...newVan, year: parseInt(e.target.value) })}
                  placeholder="2024"
                  data-testid="input-year"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={newVan.status || "active"}
                  onValueChange={(value) => setNewVan({ ...newVan, status: value })}
                >
                  <SelectTrigger data-testid="select-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Insurance Expiry</Label>
                <Input
                  type="date"
                  value={newVan.insuranceExpiry || ""}
                  onChange={(e) => setNewVan({ ...newVan, insuranceExpiry: e.target.value })}
                  data-testid="input-insurance-expiry"
                />
              </div>
              <div className="space-y-2">
                <Label>License Expiry</Label>
                <Input
                  type="date"
                  value={newVan.licenseExpiry || ""}
                  onChange={(e) => setNewVan({ ...newVan, licenseExpiry: e.target.value })}
                  data-testid="input-license-expiry"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddVan} 
              disabled={createVanMutation.isPending}
              data-testid="button-save-van"
            >
              {createVanMutation.isPending ? "Adding..." : "Add Vehicle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
          </DialogHeader>
          {editingVan && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Registration Number *</Label>
                <Input
                  value={editingVan.registrationNumber || ""}
                  onChange={(e) => setEditingVan({ ...editingVan, registrationNumber: e.target.value })}
                  data-testid="input-edit-reg-number"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Make</Label>
                  <Input
                    value={editingVan.make || ""}
                    onChange={(e) => setEditingVan({ ...editingVan, make: e.target.value })}
                    data-testid="input-edit-make"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Input
                    value={editingVan.model || ""}
                    onChange={(e) => setEditingVan({ ...editingVan, model: e.target.value })}
                    data-testid="input-edit-model"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Insurance Expiry</Label>
                  <Input
                    type="date"
                    value={editingVan.insuranceExpiry || ""}
                    onChange={(e) => setEditingVan({ ...editingVan, insuranceExpiry: e.target.value })}
                    data-testid="input-edit-insurance-expiry"
                  />
                </div>
                <div className="space-y-2">
                  <Label>License Expiry</Label>
                  <Input
                    type="date"
                    value={editingVan.licenseExpiry || ""}
                    onChange={(e) => setEditingVan({ ...editingVan, licenseExpiry: e.target.value })}
                    data-testid="input-edit-license-expiry"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Last Service Date</Label>
                  <Input
                    type="date"
                    value={editingVan.lastServiceDate || ""}
                    onChange={(e) => setEditingVan({ ...editingVan, lastServiceDate: e.target.value })}
                    data-testid="input-edit-last-service"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editingVan.status}
                    onValueChange={(value) => setEditingVan({ ...editingVan, status: value })}
                  >
                    <SelectTrigger data-testid="select-edit-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateVan} 
              disabled={updateVanMutation.isPending}
              data-testid="button-update-van"
            >
              {updateVanMutation.isPending ? "Updating..." : "Update Vehicle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
