import { CacheModuleOptions } from "@nestjs/cache-manager";

import { IPricingOptions } from "@zkchainhub/pricing/interfaces";

// symbols

/**
 * Represents the symbol used to inject the pricing service interface.
 */

export const PRICING_PROVIDER = Symbol("IPricingService");

/**
 * Represents the symbol used to inject the pricing service options interface
 */
export const PRICING_OPTIONS = Symbol("PRICING_OPTIONS");

// types

export type PricingProvider = "coingecko";

export type PricingProviderOptions<P extends PricingProvider> = P extends "coingecko"
    ? CoingeckoOptions
    : never;

// interfaces
export interface CoingeckoOptions extends IPricingOptions {
    provider: "coingecko";
    apiKey: string;
    apiBaseUrl: string;
}

/**
 * Represents the options for the PricingModule.
 */
export interface PricingModuleOptions<
    CacheConfig extends Record<string, any>,
    P extends PricingProvider,
> {
    cacheOptions: CacheModuleOptions<CacheConfig>;
    pricingOptions: PricingProviderOptions<P>;
}
