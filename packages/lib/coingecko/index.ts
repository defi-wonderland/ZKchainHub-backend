import type { AxiosInstance, CreateAxiosDefaults } from "axios";
import axios from "axios";

export default class CoingeckoService {
    private instance: AxiosInstance;
    private baseURL: string;
    private apiKey: string;

    constructor() {
        const baseURL = process.env.COINGECKO_API_URL;
        const apiKey = process.env.COINGECKO_API_KEY;

        if (!baseURL) {
            throw new Error("Missing Coingecko baseUrl");
        }

        if (!apiKey) {
            throw new Error("Missing coingecko api key");
        }

        this.apiKey = apiKey;
        this.baseURL = baseURL;

        const config: CreateAxiosDefaults = {
            baseURL: this.baseURL,
            headers: {
                "x-cg-demo-api-key": this.apiKey,
            },
        };

        this.instance = axios.create(config);
    }

    get(): AxiosInstance {
        if (!this.instance) {
            throw new Error("Client not initialized");
        }
        return this.instance;
    }
}
