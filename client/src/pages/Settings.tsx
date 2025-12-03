import { useQuery, useMutation } from "@tanstack/react-query";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Setting, InsertSetting } from "@shared/schema";

interface SettingsData {
  beansToSproutsRatio: number;
  sproutGrowthDays: number;
  serviceIntervalMonths: number;
  expiryWarningDays: number;
  companyName: string;
  companyPhone: string;
  companyAddress: string;
  enableNotifications: boolean;
}

export default function Settings() {
  const { toast } = useToast();

  const { data: settingsData = [], isLoading } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const res = await apiRequest("PUT", `/api/settings/${key}`, { value });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createSettingMutation = useMutation({
    mutationFn: async (data: InsertSetting) => {
      const res = await apiRequest("POST", "/api/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const settingsMap = settingsData.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string>);

  const initialSettings: SettingsData = {
    beansToSproutsRatio: Number(settingsMap.beansToSproutsRatio) || 6,
    sproutGrowthDays: Number(settingsMap.sproutGrowthDays) || 6,
    serviceIntervalMonths: Number(settingsMap.serviceIntervalMonths) || 6,
    expiryWarningDays: Number(settingsMap.expiryWarningDays) || 30,
    companyName: settingsMap.companyName || "SproutDrive",
    companyPhone: settingsMap.companyPhone || "(555) 123-4567",
    companyAddress: settingsMap.companyAddress || "123 Farm Road, Green Valley, CA 94000",
    enableNotifications: settingsMap.enableNotifications === "true",
  };

  const handleSave = async (settings: SettingsData) => {
    const settingsToSave = [
      { key: "beansToSproutsRatio", value: String(settings.beansToSproutsRatio) },
      { key: "sproutGrowthDays", value: String(settings.sproutGrowthDays) },
      { key: "serviceIntervalMonths", value: String(settings.serviceIntervalMonths) },
      { key: "expiryWarningDays", value: String(settings.expiryWarningDays) },
      { key: "companyName", value: settings.companyName },
      { key: "companyPhone", value: settings.companyPhone },
      { key: "companyAddress", value: settings.companyAddress },
      { key: "enableNotifications", value: String(settings.enableNotifications) },
    ];

    try {
      for (const setting of settingsToSave) {
        const existing = settingsData.find((s) => s.key === setting.key);
        if (existing) {
          await updateSettingMutation.mutateAsync(setting);
        } else {
          await createSettingMutation.mutateAsync({
            key: setting.key,
            value: setting.value,
            description: `${setting.key} setting`,
          });
        }
      }
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully.",
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
        <p className="text-muted-foreground">Configure system settings and preferences</p>
      </div>

      <SettingsPanel 
        initialSettings={initialSettings} 
        onSave={handleSave}
        isPending={updateSettingMutation.isPending || createSettingMutation.isPending}
      />
    </div>
  );
}
