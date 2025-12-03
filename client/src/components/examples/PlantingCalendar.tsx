import { PlantingCalendar } from "../PlantingCalendar";
import { addDays } from "date-fns";

export default function PlantingCalendarExample() {
  const today = new Date();
  
  // todo: remove mock functionality
  const mockDays = [
    { date: today, bedsReady: 15, kgAvailable: 450, orderedKg: 380 },
    { date: addDays(today, 1), bedsReady: 12, kgAvailable: 360, orderedKg: 400 },
    { date: addDays(today, 2), bedsReady: 18, kgAvailable: 540, orderedKg: 420 },
    { date: addDays(today, 3), bedsReady: 14, kgAvailable: 420, orderedKg: 350 },
    { date: addDays(today, 4), bedsReady: 10, kgAvailable: 300, orderedKg: 380 },
    { date: addDays(today, 5), bedsReady: 16, kgAvailable: 480, orderedKg: 400 },
    { date: addDays(today, 6), bedsReady: 13, kgAvailable: 390, orderedKg: 360 },
  ];

  return <PlantingCalendar days={mockDays} />;
}
