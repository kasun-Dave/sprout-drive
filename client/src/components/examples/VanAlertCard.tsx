import { VanAlertCard } from "../VanAlertCard";
import { addDays } from "date-fns";

export default function VanAlertCardExample() {
  const today = new Date();
  
  return (
    <div className="space-y-3">
      <VanAlertCard
        vehicleNumber="ABC-1234"
        alertType="insurance"
        expiryDate={addDays(today, 5)}
        onAction={() => console.log("Renew insurance clicked")}
      />
      <VanAlertCard
        vehicleNumber="XYZ-5678"
        alertType="license"
        expiryDate={addDays(today, 25)}
        onAction={() => console.log("Renew license clicked")}
      />
      <VanAlertCard
        vehicleNumber="DEF-9012"
        alertType="service"
        expiryDate={addDays(today, 15)}
        onAction={() => console.log("Schedule service clicked")}
      />
    </div>
  );
}
