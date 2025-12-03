import { SettingsPanel } from "../SettingsPanel";

export default function SettingsPanelExample() {
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
  };

  return <SettingsPanel initialSettings={initialSettings} onSave={handleSave} />;
}
