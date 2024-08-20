import { PricingProvider } from "@zkchainhub/pricing/configuration";

/**
 * Represents a pricing service that retrieves token prices.
 */
export interface IPricingService {
    /**
     * Retrieves the prices of the specified tokens.
     * @param tokenIds - An array of token IDs.
     * @returns A promise that resolves to a record containing the token IDs as keys and their corresponding prices as values.
     */
    getTokenPrices<TokenId extends string = string>(
        tokenIds: TokenId[],
    ): Promise<Record<string, number>>;
}

/**
 * Represents the base interface for Pricing service options
 */
export interface IPricingOptions {
    provider: PricingProvider;
}
