import { DemandPrediction } from "../DemandPrediction";

export default function DemandPredictionExample() {
  // todo: remove mock functionality
  const predictions = [
    {
      period: "This Week",
      predictedDemand: 420,
      suggestedBeds: 14,
      suggestedBeans: 70,
      confidence: "high" as const,
    },
    {
      period: "Next Week",
      predictedDemand: 450,
      suggestedBeds: 15,
      suggestedBeans: 75,
      confidence: "medium" as const,
    },
    {
      period: "Week 3",
      predictedDemand: 480,
      suggestedBeds: 16,
      suggestedBeans: 80,
      confidence: "low" as const,
    },
  ];

  return <DemandPrediction predictions={predictions} beansToSproutsRatio={6} />;
}
