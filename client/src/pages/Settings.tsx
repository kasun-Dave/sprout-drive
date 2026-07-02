import { useQuery, useMutation } from "@tanstack/react-query";
import { SettingsPanel } from "@/components/SettingsPanel";
import { StorageInfoCard } from "@/components/StorageInfoCard";
import { UserManagementPanel } from "@/components/UserManagementPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  parseBusinessConfig,
  businessConfigToSettingsEntries,
  type BusinessConfig,
} from "@shared/businessConfig";
import type { Setting } from "@shared/schema";

export default function Settings() {
  const { toast } = useToast();

  const { data: settingsData = [], isLoading } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
  });

  const saveSettingMutation = useMutation({
    mutationFn: async ({ key, value, description }: { key: string; value: string; description: string }) => {
      const existing = settingsData.find((s) => s.key === key);
      if (existing) {
        const res = await apiRequest("PUT", `/api/settings/${key}`, { value, description });
        return res.json();
      }
      const res = await apiRequest("POST", "/api/settings", { key, value, description });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/business-config"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const initialSettings = parseBusinessConfig(settingsData);

  const handleSave = async (settings: BusinessConfig) => {
    try {
      for (const entry of businessConfigToSettingsEntries(settings)) {
        await saveSettingMutation.mutateAsync(entry);
      }
      toast({
        title: "Settings Saved",
        description: "Conversion, pricing, and company settings updated.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure system settings and preferences</p>
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure conversion rates, pricing, currency, and company details
        </p>
      </div>

      <StorageInfoCard />

      <UserManagementPanel />

      <SettingsPanel
        initialSettings={initialSettings}
        onSave={handleSave}
        isPending={saveSettingMutation.isPending}
      />
    </div>
  );
}
