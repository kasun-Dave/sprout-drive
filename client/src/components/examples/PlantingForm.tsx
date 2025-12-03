import { PlantingForm } from "../PlantingForm";

export default function PlantingFormExample() {
  const handleSubmit = (data: any) => {
    console.log("Planting batch created:", data);
  };

  return <PlantingForm beansToSproutsRatio={6} onSubmit={handleSubmit} />;
}
