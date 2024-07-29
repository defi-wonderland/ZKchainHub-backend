import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { isAxiosError } from "axios";

import { ApiNotAvailable, RateLimitExceeded } from "@zkchainhub/pricing/exceptions";
import { IPricingService } from "@zkchainhub/pricing/interfaces";
import { TokenPrices } from "@zkchainhub/pricing/types/tokenPrice.type";

/**
 * Service for fetching token prices from Coingecko API.
 */
@Injectable()
export class CoingeckoService implements IPricingService {
    private readonly logger = new Logger(CoingeckoService.name);

    private readonly AUTH_HEADER = "x-cg-pro-api-key";
    private readonly DECIMALS_PRECISION = 3;

    /**
     *
     * @param apiKey  * @param apiKey - Coingecko API key.
     * @param apiBaseUrl - Base URL for Coingecko API. If you have a Pro account, you can use the Pro API URL.
     */
    constructor(
        private readonly apiKey: string,
        private readonly apiBaseUrl: string = "https://api.coingecko.com/api/v3/",
        private readonly httpService: HttpService,
    ) {}

    /**
     * @param tokenIds - An array of Coingecko Tokens IDs.
     * @param config.currency - The currency in which the prices should be returned (default: "usd").
     */
    async getTokenPrices(
        tokenIds: string[],
        config: { currency: string } = { currency: "usd" },
    ): Promise<Record<string, number>> {
        const { currency } = config;
        return this.httpGet<TokenPrices>("/simple/price", {
            vs_currencies: currency,
            ids: tokenIds.join(","),
            precision: this.DECIMALS_PRECISION.toString(),
        }).then((data) => {
            return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value.usd]));
        });
    }

    /**
     * HTTP GET wrapper to perform a GET request to the specified endpoint with optional parameters.
     * Also injects the API key and sets the Accept header to "application/json".
     * @param endpoint - The endpoint to send the GET request to.
     * @param params - Optional parameters to include in the request.
     * @returns A promise that resolves to the response data.
     * @throws {ApiNotAvailable} If the Coingecko API is not available (status code >= 500).
     * @throws {RateLimitExceeded} If the rate limit for the API is exceeded (status code 429).
     * @throws {Error} If an error occurs while fetching data or a non-network related error occurs.
     */
    private async httpGet<ResponseType>(endpoint: string, params: Record<string, string> = {}) {
        try {
            const response = await this.httpService.axiosRef.get<ResponseType>(
                `${this.apiBaseUrl}${endpoint}`,
                {
                    params,
                    headers: {
                        [this.AUTH_HEADER]: this.apiKey,
                        Accept: "application/json",
                    },
                },
            );
            return response.data;
        } catch (error: unknown) {
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
}
