/** Canonical setting keys — use these everywhere (client, server, seed). */
export const SETTING_KEYS = {
  beansToSproutsRatio: "beansToSproutsRatio",
  sproutGrowthDays: "sproutGrowthDays",
  defaultPricePerKg: "defaultPricePerKg",
  currency: "currency",
  currencySymbol: "currencySymbol",
  taxRate: "taxRate",
  serviceIntervalMonths: "serviceIntervalMonths",
  expiryWarningDays: "expiryWarningDays",
  companyName: "companyName",
  companyPhone: "companyPhone",
  companyAddress: "companyAddress",
  enableNotifications: "enableNotifications",
} as const;

export type BusinessConfig = {
  beansToSproutsRatio: number;
  sproutGrowthDays: number;
  defaultPricePerKg: number;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  serviceIntervalMonths: number;
  expiryWarningDays: number;
  companyName: string;
  companyPhone: string;
  companyAddress: string;
  enableNotifications: boolean;
};

export const DEFAULT_BUSINESS_CONFIG: BusinessConfig = {
  beansToSproutsRatio: 7,
  sproutGrowthDays: 6,
  defaultPricePerKg: 3.5,
  currency: "USD",
  currencySymbol: "$",
  taxRate: 0,
  serviceIntervalMonths: 6,
  expiryWarningDays: 30,
  companyName: "SproutDrive",
  companyPhone: "(555) 123-4567",
  companyAddress: "123 Farm Road, Green Valley, CA 94000",
  enableNotifications: true,
};

/** Legacy keys from older seeds — mapped to canonical keys on read. */
const LEGACY_KEY_ALIASES: Record<string, keyof BusinessConfig> = {
  bean_to_sprout_ratio: "beansToSproutsRatio",
  yield_multiplier: "beansToSproutsRatio",
  growth_cycle_days: "sproutGrowthDays",
  default_price_per_kg: "defaultPricePerKg",
  tax_rate: "taxRate",
  business_name: "companyName",
  company_name: "companyName",
  company_phone: "companyPhone",
  company_address: "companyAddress",
};

export function settingsArrayToMap(
  settings: Array<{ key: string; value: string }>,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const setting of settings) {
    const canonicalKey = LEGACY_KEY_ALIASES[setting.key] ?? setting.key;
    if (!(canonicalKey in map)) {
      map[canonicalKey] = setting.value;
    }
  }
  return map;
}

export function parseBusinessConfig(
  settings: Record<string, string> | Array<{ key: string; value: string }>,
): BusinessConfig {
  const map = Array.isArray(settings) ? settingsArrayToMap(settings) : settings;

  const num = (key: keyof BusinessConfig, fallback: number) => {
    const raw = map[key];
    const parsed = raw !== undefined ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const str = (key: keyof BusinessConfig, fallback: string) =>
    map[key] ?? fallback;

  return {
    beansToSproutsRatio: num("beansToSproutsRatio", DEFAULT_BUSINESS_CONFIG.beansToSproutsRatio),
    sproutGrowthDays: num("sproutGrowthDays", DEFAULT_BUSINESS_CONFIG.sproutGrowthDays),
    defaultPricePerKg: num("defaultPricePerKg", DEFAULT_BUSINESS_CONFIG.defaultPricePerKg),
    currency: str("currency", DEFAULT_BUSINESS_CONFIG.currency),
    currencySymbol: str("currencySymbol", DEFAULT_BUSINESS_CONFIG.currencySymbol),
    taxRate: num("taxRate", DEFAULT_BUSINESS_CONFIG.taxRate),
    serviceIntervalMonths: num("serviceIntervalMonths", DEFAULT_BUSINESS_CONFIG.serviceIntervalMonths),
    expiryWarningDays: num("expiryWarningDays", DEFAULT_BUSINESS_CONFIG.expiryWarningDays),
    companyName: str("companyName", DEFAULT_BUSINESS_CONFIG.companyName),
    companyPhone: str("companyPhone", DEFAULT_BUSINESS_CONFIG.companyPhone),
    companyAddress: str("companyAddress", DEFAULT_BUSINESS_CONFIG.companyAddress),
    enableNotifications: map.enableNotifications !== "false",
  };
}

export function businessConfigToSettingsEntries(
  config: BusinessConfig,
): Array<{ key: string; value: string; description: string }> {
  return [
    { key: SETTING_KEYS.beansToSproutsRatio, value: String(config.beansToSproutsRatio), description: "Kg sprouts produced per 1 kg beans" },
    { key: SETTING_KEYS.sproutGrowthDays, value: String(config.sproutGrowthDays), description: "Days from planting to harvest" },
    { key: SETTING_KEYS.defaultPricePerKg, value: String(config.defaultPricePerKg), description: "Default selling price per kg" },
    { key: SETTING_KEYS.currency, value: config.currency, description: "ISO currency code" },
    { key: SETTING_KEYS.currencySymbol, value: config.currencySymbol, description: "Currency symbol for display" },
    { key: SETTING_KEYS.taxRate, value: String(config.taxRate), description: "Tax rate percentage applied to orders" },
    { key: SETTING_KEYS.serviceIntervalMonths, value: String(config.serviceIntervalMonths), description: "Vehicle service interval in months" },
    { key: SETTING_KEYS.expiryWarningDays, value: String(config.expiryWarningDays), description: "Days before expiry to show alerts" },
    { key: SETTING_KEYS.companyName, value: config.companyName, description: "Company name for invoices" },
    { key: SETTING_KEYS.companyPhone, value: config.companyPhone, description: "Company phone number" },
    { key: SETTING_KEYS.companyAddress, value: config.companyAddress, description: "Company address" },
    { key: SETTING_KEYS.enableNotifications, value: String(config.enableNotifications), description: "Enable system notifications" },
  ];
}

/** 1 kg beans → expected kg sprouts */
export function calculateExpectedYield(beansKg: number, ratio: number): number {
  return beansKg * ratio;
}

/** kg sprouts needed → kg beans to plant */
export function calculateBeansNeeded(sproutsKg: number, ratio: number): number {
  if (ratio <= 0) return 0;
  return sproutsKg / ratio;
}

/** Order total with optional tax */
export function calculateOrderTotal(
  quantityKg: number,
  pricePerKg: number,
  taxRate = 0,
): number {
  const subtotal = quantityKg * pricePerKg;
  return subtotal * (1 + taxRate / 100);
}

export function resolvePricePerKg(
  customerPrice: string | number | null | undefined,
  config: Pick<BusinessConfig, "defaultPricePerKg">,
): number {
  const parsed = customerPrice != null ? Number(customerPrice) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : config.defaultPricePerKg;
}

export function formatCurrency(
  amount: number,
  config: Pick<BusinessConfig, "currency" | "currencySymbol">,
): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: config.currency,
    }).format(amount);
  } catch {
    return `${config.currencySymbol}${amount.toFixed(2)}`;
  }
}

export type DemandPrediction = {
  period: string;
  predictedDemand: number;
  suggestedBeds: number;
  suggestedBeans: number;
  confidence: "high" | "medium" | "low";
};

/** Weekly planting demand from average daily order volume (kg). */
export function calculateDemandPredictions(
  avgDailyOrdersKg: number,
  config: Pick<BusinessConfig, "beansToSproutsRatio">,
  weeks = 3,
): DemandPrediction[] {
  const labels = ["This Week", "Next Week", "Week 3", "Week 4"];
  const growthFactors = [1, 1.05, 1.1, 1.15];
  const confidences: DemandPrediction["confidence"][] = ["high", "medium", "low", "low"];

  return Array.from({ length: weeks }, (_, i) => {
    const weeklyDemand = avgDailyOrdersKg * 7 * growthFactors[i];
    return {
      period: labels[i] ?? `Week ${i + 1}`,
      predictedDemand: Math.round(weeklyDemand),
      suggestedBeds: Math.max(1, Math.round(weeklyDemand / 30)),
      suggestedBeans: Math.round(calculateBeansNeeded(weeklyDemand, config.beansToSproutsRatio)),
      confidence: confidences[i] ?? "low",
    };
  });
}

export type DashboardStats = {
  readySproutsKg: number;
  todaysOrdersKg: number;
  todaysOrdersCount: number;
  todayRevenue: number;
  deliveriesInProgress: number;
  pendingDeliveries: number;
  activeCustomers: number;
  ordersGrowth: number;
  customersGrowth: number;
};

export function computeGrowthPercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}
