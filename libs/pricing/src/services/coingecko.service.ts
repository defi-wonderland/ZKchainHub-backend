import { Injectable } from "@nestjs/common";

@Injectable()
export class CoingeckoService {
    private readonly API_BASE_URL = "https://api.coingecko.com/api/v3/";
    constructor(private readonly apiKey: string) {}
}
