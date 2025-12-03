import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Save } from "lucide-react";

interface SettingsPanelProps {
  initialSettings: {
    beansToSproutsRatio: number;
    sproutGrowthDays: number;
    serviceIntervalMonths: number;
    expiryWarningDays: number;
    companyName: string;
    companyPhone: string;
    companyAddress: string;
    enableNotifications: boolean;
  };
  onSave: (settings: any) => void;
  isPending?: boolean;
}

export function SettingsPanel({ initialSettings, onSave, isPending }: SettingsPanelProps) {
  const [settings, setSettings] = useState(initialSettings);

  const handleSave = () => {
    onSave(settings);
  };

  return (
    <div className="space-y-6">
      <Card data-testid="card-conversion-settings">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-primary" />
            Conversion Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ratio">Beans to Sprouts Ratio</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">1 kg beans =</span>
                <Input
                  id="ratio"
                  type="number"
                  min="1"
                  step="0.1"
                  value={settings.beansToSproutsRatio}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      beansToSproutsRatio: Number(e.target.value),
                    })
                  }
                  className="w-20"
                  data-testid="input-ratio"
                />
                <span className="text-sm text-muted-foreground">kg sprouts</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="growthDays">Sprout Growth Days</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="growthDays"
                  type="number"
                  min="1"
                  value={settings.sproutGrowthDays}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      sproutGrowthDays: Number(e.target.value),
                    })
                  }
                  className="w-20"
                  data-testid="input-growth-days"
                />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-maintenance-settings">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Vehicle Maintenance Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serviceInterval">Service Interval</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Every</span>
                <Input
                  id="serviceInterval"
                  type="number"
                  min="1"
                  value={settings.serviceIntervalMonths}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      serviceIntervalMonths: Number(e.target.value),
                    })
                  }
                  className="w-20"
                  data-testid="input-service-interval"
                />
                <span className="text-sm text-muted-foreground">months</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryWarning">Expiry Warning</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="expiryWarning"
                  type="number"
                  min="1"
                  value={settings.expiryWarningDays}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      expiryWarningDays: Number(e.target.value),
                    })
                  }
                  className="w-20"
                  data-testid="input-expiry-warning"
                />
                <span className="text-sm text-muted-foreground">days before</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-company-settings">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={settings.companyName}
              onChange={(e) =>
                setSettings({ ...settings, companyName: e.target.value })
              }
              data-testid="input-company-name"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyPhone">Phone</Label>
              <Input
                id="companyPhone"
                value={settings.companyPhone}
                onChange={(e) =>
                  setSettings({ ...settings, companyPhone: e.target.value })
                }
                data-testid="input-company-phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyAddress">Address</Label>
              <Input
                id="companyAddress"
                value={settings.companyAddress}
                onChange={(e) =>
                  setSettings({ ...settings, companyAddress: e.target.value })
                }
                data-testid="input-company-address"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-notification-settings">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Notifications</p>
              <p className="text-sm text-muted-foreground">
                Get alerts for expiring licenses and upcoming services
              </p>
            </div>
            <Switch
              checked={settings.enableNotifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableNotifications: checked })
              }
              data-testid="switch-notifications"
            />
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Button onClick={handleSave} disabled={isPending} data-testid="button-save-settings">
            <Save className="h-4 w-4 mr-2" />
            {isPending ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
