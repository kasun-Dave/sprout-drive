import { useQuery } from "@tanstack/react-query";
import {
  parseBusinessConfig,
  type BusinessConfig,
  DEFAULT_BUSINESS_CONFIG,
} from "@shared/businessConfig";
import type { Setting } from "@shared/schema";

export function useBusinessConfig(): {
  config: BusinessConfig;
  isLoading: boolean;
} {
  const { data: settings = [], isLoading } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
  });

  const config = settings.length > 0
    ? parseBusinessConfig(settings)
    : DEFAULT_BUSINESS_CONFIG;

  return { config, isLoading };
}
