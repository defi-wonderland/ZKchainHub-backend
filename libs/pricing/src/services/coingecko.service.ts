import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { isAxiosError } from "axios";

import { ApiNotAvailable, RateLimitExceeded } from "@zkchainhub/pricing/exceptions";
import { IPricingService } from "@zkchainhub/pricing/interfaces";
import { TokenPrices } from "@zkchainhub/pricing/types/tokenPrice.type";

@Injectable()
export class CoingeckoService implements IPricingService {
    private readonly logger = new Logger(CoingeckoService.name);

    private readonly AUTH_HEADER = "x-cg-pro-api-key";
    constructor(
        private readonly apiKey: string,
        private readonly apiBaseUrl: string = "https://api.coingecko.com/api/v3/",
        private readonly httpService: HttpService,
    ) {}

    async getTokenPrices(
        tokenIds: string[],
        config: { currency: string } = { currency: "usd" },
    ): Promise<Record<string, number>> {
        const { currency } = config;
        return this.get<TokenPrices>("/simple/price", {
            vs_currencies: currency,
            ids: tokenIds.join(","),
        }).then((data) => {
            return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value.usd]));
        });
    }

    private async get<ResponseType>(endpoint: string, params: Record<string, string> = {}) {
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
