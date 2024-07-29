import { createMock } from "@golevelup/ts-jest";
import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AxiosError, AxiosInstance, AxiosResponseHeaders } from "axios";

import { ApiNotAvailable, RateLimitExceeded } from "@zkchainhub/pricing/exceptions";
import { TokenPrices } from "@zkchainhub/pricing/types/tokenPrice.type";

import { CoingeckoService } from "./coingecko.service";

describe("CoingeckoService", () => {
    let service: CoingeckoService;
    let httpService: HttpService;
    const apiKey = "COINGECKO_API_KEY";

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CoingeckoService,
                {
                    provide: CoingeckoService,
                    useFactory: (httpService: HttpService) => {
                        const apiKey = "COINGECKO_API_KEY";
                        const apiBaseUrl = "https://api.coingecko.com/api/v3/";
                        return new CoingeckoService(apiKey, apiBaseUrl, httpService);
                    },
                    inject: [HttpService],
                },
                {
                    provide: HttpService,
                    useValue: createMock<HttpService>({
                        axiosRef: createMock<AxiosInstance>(),
                    }),
                },
            ],
        }).compile();

        service = module.get<CoingeckoService>(CoingeckoService);
        httpService = module.get<HttpService>(HttpService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("getTokenPrices", () => {
        it("return token prices", async () => {
            const tokenIds = ["token1", "token2"];
            const currency = "usd";
            const expectedResponse: TokenPrices = {
                token1: { usd: 1.23 },
                token2: { usd: 4.56 },
            };

            jest.spyOn(httpService.axiosRef, "get").mockResolvedValueOnce({
                data: expectedResponse,
            });

            const result = await service.getTokenPrices(tokenIds, { currency });

            expect(result).toEqual({
                token1: 1.23,
                token2: 4.56,
            });
            expect(httpService.axiosRef.get).toHaveBeenCalledWith(
                `${service["apiBaseUrl"]}/simple/price`,
                {
                    params: {
                        vs_currencies: currency,
                        ids: tokenIds.join(","),
                        precision: service["DECIMALS_PRECISION"].toString(),
                    },
                    headers: {
                        "x-cg-pro-api-key": apiKey,
                        Accept: "application/json",
                    },
                },
            );
        });

        it("throw ApiNotAvailable when Coingecko returns a 500 family exception", async () => {
            const tokenIds = ["token1", "token2"];
            const currency = "usd";

            jest.spyOn(httpService.axiosRef, "get").mockRejectedValueOnce(
                new AxiosError("Service not available", "503", undefined, null, {
                    status: 503,
                    data: {},
                    statusText: "Too Many Requests",
                    headers: createMock<AxiosResponseHeaders>(),
                    config: { headers: createMock<AxiosResponseHeaders>() },
                }),
            );

            await expect(service.getTokenPrices(tokenIds, { currency })).rejects.toThrow(
                new ApiNotAvailable("Coingecko"),
            );
        });

        it("throw RateLimitExceeded when Coingecko returns 429 exception", async () => {
            const tokenIds = ["token1", "token2"];
            const currency = "usd";

            jest.spyOn(httpService.axiosRef, "get").mockRejectedValueOnce(
                new AxiosError("Rate limit exceeded", "429", undefined, null, {
                    status: 429,
                    data: {},
                    statusText: "Too Many Requests",
                    headers: createMock<AxiosResponseHeaders>(),
                    config: { headers: createMock<AxiosResponseHeaders>() },
                }),
            );

            await expect(service.getTokenPrices(tokenIds, { currency })).rejects.toThrow(
                new RateLimitExceeded(),
            );
        });

        it("throw an HttpException with the error message when an error occurs", async () => {
            const tokenIds = ["invalidTokenId", "token2"];
            const currency = "usd";

            jest.spyOn(httpService.axiosRef, "get").mockRejectedValueOnce(
                new AxiosError("Invalid token ID", "400"),
            );

            await expect(service.getTokenPrices(tokenIds, { currency })).rejects.toThrow();
        });

        it("throw an HttpException with the default error message when a non-network related error occurs", async () => {
            const tokenIds = ["token1", "token2"];
            const currency = "usd";

            jest.spyOn(httpService.axiosRef, "get").mockRejectedValueOnce(new Error());

            await expect(service.getTokenPrices(tokenIds, { currency })).rejects.toThrow(
                new HttpException(
                    "A non network related error occurred",
                    HttpStatus.INTERNAL_SERVER_ERROR,
                ),
            );
        });
    });
});
