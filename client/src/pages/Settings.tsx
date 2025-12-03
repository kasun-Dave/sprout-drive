import { SettingsPanel } from "@/components/SettingsPanel";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();

  // todo: remove mock functionality
  const initialSettings = {
    beansToSproutsRatio: 6,
    sproutGrowthDays: 6,
    serviceIntervalMonths: 6,
    expiryWarningDays: 30,
    companyName: "SproutDrive",
    companyPhone: "(555) 123-4567",
    companyAddress: "123 Farm Road, Green Valley, CA 94000",
    enableNotifications: true,
  };

  const handleSave = (settings: any) => {
    console.log("Settings saved:", settings);
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure system settings and preferences</p>
      </div>

      <SettingsPanel initialSettings={initialSettings} onSave={handleSave} />
    </div>
  );
}
