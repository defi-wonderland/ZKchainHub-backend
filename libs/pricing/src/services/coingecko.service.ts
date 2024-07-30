import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, LoggerService } from "@nestjs/common";
import axios, { AxiosInstance, isAxiosError } from "axios";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

import { ApiNotAvailable, RateLimitExceeded } from "@zkchainhub/pricing/exceptions";
import { IPricingService } from "@zkchainhub/pricing/interfaces";
import { TokenPrices } from "@zkchainhub/pricing/types/tokenPrice.type";

/**
 * Service for fetching token prices from Coingecko API.
 */
@Injectable()
export class CoingeckoService implements IPricingService {
    private readonly AUTH_HEADER = "x-cg-pro-api-key";
    private readonly DECIMALS_PRECISION = 3;
    private readonly axios: AxiosInstance;

    /**
     *
     * @param apiKey  * @param apiKey - Coingecko API key.
     * @param apiBaseUrl - Base URL for Coingecko API. If you have a Pro account, you can use the Pro API URL.
     */
    constructor(
        private readonly apiKey: string,
        private readonly apiBaseUrl: string = "https://api.coingecko.com/api/v3/",
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) {
        this.axios = axios.create({
            baseURL: apiBaseUrl,
            headers: {
                common: {
                    [this.AUTH_HEADER]: apiKey,
                    Accept: "application/json",
                },
            },
        });
        this.axios.interceptors.response.use(
            (response) => response,
            (error: unknown) => this.handleError(error),
        );
    }

    /**
     * @param tokenIds - An array of Coingecko Tokens IDs.
     * @param config.currency - The currency in which the prices should be returned (default: "usd").
     */
    async getTokenPrices(
        tokenIds: string[],
        config: { currency: string } = { currency: "usd" },
    ): Promise<Record<string, number>> {
        const { currency } = config;

        const cacheKeys = tokenIds.map((tokenId) => this.formatTokenCacheKey(tokenId, currency));
        const cachedTokenPrices = await this.getTokenPricesFromCache(cacheKeys);
        const cachedMap = cachedTokenPrices.reduce(
            (result, price, index) => {
                if (price !== null) result[tokenIds.at(index) as string] = price;
                return result;
            },
            {} as Record<string, number>,
        );

        const missingTokenIds = tokenIds.filter((_, index) => !cachedTokenPrices[index]);
        const missingTokenPrices = await this.fetchTokenPrices(missingTokenIds, currency);

        await this.saveTokenPricesToCache(missingTokenPrices, currency);

        return { ...cachedMap, ...missingTokenPrices };
    }

    private formatTokenCacheKey(tokenId: string, currency: string) {
        return `${tokenId}.${currency}`;
    }

    /**
     * Retrieves multiple token prices from the cache at once.
     * @param keys - An array of cache keys.
     * @returns A promise that resolves to an array of token prices (number or null).
     */
    private async getTokenPricesFromCache(keys: string[]): Promise<(number | null)[]> {
        return this.cacheManager.store.mget(...keys) as Promise<(number | null)[]>;
    }

    /**
     * Saves multiple token prices to the cache at once.
     *
     * @param prices - The token prices to be saved.
     * @param currency - The currency in which the prices are denominated.
     */
    private async saveTokenPricesToCache(prices: Record<string, number>, currency: string) {
        if (Object.keys(prices).length === 0) return;

        this.cacheManager.store.mset(
            Object.entries(prices).map(([key, value]) => [
                this.formatTokenCacheKey(key, currency),
                value,
            ]),
        );
    }

    private async fetchTokenPrices(
        tokenIds: string[],
        currency: string,
    ): Promise<Record<string, number>> {
        if (tokenIds.length === 0) {
            return {};
        }

        return this.axios
            .get<TokenPrices>("simple/price", {
                params: {
                    vs_currencies: currency,
                    ids: tokenIds.join(","),
                    precision: this.DECIMALS_PRECISION.toString(),
                },
            })
            .then((response) => {
                const { data } = response;
                return Object.fromEntries(
                    Object.entries(data).map(([key, value]) => [key, value.usd]),
                );
            });
    }

    /**
     * Handles errors that occur during API requests.
     * @param error - The error object to handle.
     * @throws {ApiNotAvailable} - If the error is a server-side error (status code >= 500).
     * @throws {RateLimitExceeded} - If the error is a rate limit exceeded error (status code 429).
     * @throws {Error} - If the error is a client-side error or an unknown error.
     * @throws {Error} - If the error is a non-network related error.
     */
    private handleError(error: unknown) {
        let exception;

        if (isAxiosError(error)) {
            const statusCode = error.response?.status ?? 0;
            if (statusCode >= 500) {
                exception = new ApiNotAvailable("Coingecko");
            } else if (statusCode === 429) {
                exception = new RateLimitExceeded();
            } else {
                exception = new Error(
                    error.response?.data || "An error occurred while fetching data",
                );
            }

            throw exception;
        } else {
            this.logger.error(error);
            throw new Error("A non network related error occurred");
        }
    }
}
