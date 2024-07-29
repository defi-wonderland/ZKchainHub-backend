import { Injectable } from "@nestjs/common";

import { IPricingService } from "@zkchainhub/pricing/interfaces";

@Injectable()
export class CoingeckoService implements IPricingService {
    private readonly API_BASE_URL = "https://api.coingecko.com/api/v3/";
    constructor(private readonly apiKey: string) {}

    async getTokenPrices(
        _tokenIds: string[],
        _config: { currency: string } = { currency: "usd" },
    ): Promise<Record<string, number>> {
        throw new Error("Method not implemented.");
    }
}
