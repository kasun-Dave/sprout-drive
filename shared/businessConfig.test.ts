import { describe, it, expect } from "vitest";
import {
  parseBusinessConfig,
  calculateExpectedYield,
  calculateBeansNeeded,
  calculateOrderTotal,
  resolvePricePerKg,
  formatCurrency,
  calculateDemandPredictions,
  computeGrowthPercent,
  settingsArrayToMap,
  DEFAULT_BUSINESS_CONFIG,
} from "./businessConfig";

describe("parseBusinessConfig", () => {
  it("uses defaults when settings are empty", () => {
    expect(parseBusinessConfig({})).toEqual(DEFAULT_BUSINESS_CONFIG);
  });

  it("maps legacy seed keys to canonical keys", () => {
    const config = parseBusinessConfig([
      { key: "yield_multiplier", value: "9" },
      { key: "growth_cycle_days", value: "5" },
      { key: "default_price_per_kg", value: "4.25" },
      { key: "tax_rate", value: "10" },
    ]);
    expect(config.beansToSproutsRatio).toBe(9);
    expect(config.sproutGrowthDays).toBe(5);
    expect(config.defaultPricePerKg).toBe(4.25);
    expect(config.taxRate).toBe(10);
  });

  it("prefers canonical keys over legacy aliases", () => {
    const map = settingsArrayToMap([
      { key: "beansToSproutsRatio", value: "7" },
      { key: "yield_multiplier", value: "9" },
    ]);
    expect(map.beansToSproutsRatio).toBe("7");
  });
});

describe("conversion calculations", () => {
  it("calculates expected yield from beans", () => {
    expect(calculateExpectedYield(10, 7)).toBe(70);
  });

  it("calculates beans needed from sprout demand", () => {
    expect(calculateBeansNeeded(70, 7)).toBe(10);
  });

  it("returns 0 beans when ratio is invalid", () => {
    expect(calculateBeansNeeded(100, 0)).toBe(0);
  });
});

describe("pricing calculations", () => {
  it("calculates order total without tax", () => {
    expect(calculateOrderTotal(20, 3.5)).toBe(70);
  });

  it("applies tax rate to order total", () => {
    expect(calculateOrderTotal(100, 5, 10)).toBe(550);
  });

  it("falls back to default price when customer price missing", () => {
    expect(resolvePricePerKg(null, { defaultPricePerKg: 3.5 })).toBe(3.5);
    expect(resolvePricePerKg("4.00", { defaultPricePerKg: 3.5 })).toBe(4);
  });

  it("formats currency with symbol fallback", () => {
    const formatted = formatCurrency(12.5, { currency: "USD", currencySymbol: "$" });
    expect(formatted).toMatch(/\$12\.50|USD\s*12\.50/);
  });
});

describe("demand predictions", () => {
  it("scales weekly demand from daily average using conversion ratio", () => {
    const predictions = calculateDemandPredictions(30, { beansToSproutsRatio: 7 }, 2);
    expect(predictions[0].predictedDemand).toBe(210);
    expect(predictions[0].suggestedBeans).toBe(30);
    expect(predictions[1].predictedDemand).toBe(Math.round(210 * 1.05));
  });
});

describe("computeGrowthPercent", () => {
  it("returns 100 when growing from zero", () => {
    expect(computeGrowthPercent(5, 0)).toBe(100);
  });

  it("returns rounded percentage change", () => {
    expect(computeGrowthPercent(110, 100)).toBe(10);
  });
});
