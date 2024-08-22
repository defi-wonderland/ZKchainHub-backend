import MockAdapter from "axios-mock-adapter";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ILogger, ZKChainMetadataItem } from "@zkchainhub/shared";

import { FetchError, InvalidSchema } from "../../../src/internal";
import { GithubMetadataProvider } from "../../../src/providers/githubMetadata.provider";
import {
    chainJsonUrl,
    mockChainData,
    mockTokenData,
    tokenJsonUrl,
} from "../../fixtures/metadata.fixtures";

const mockLogger: ILogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
};

describe("GithubMetadataProvider", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe("getChainsMetadata", () => {
        it("should return the chains metadata", async () => {
            const provider = new GithubMetadataProvider(tokenJsonUrl, chainJsonUrl, mockLogger);
            const axios = provider["axios"];
            const axiosGetMock = vi
                .spyOn(axios, "get")
                .mockResolvedValueOnce({ data: mockChainData });

            const result = await provider.getChainsMetadata();

            expect(axiosGetMock).toHaveBeenCalledWith(chainJsonUrl);
            expect(result).toBeInstanceOf(Map);
            expect(result.size).toBe(2);

            const chain1 = result.get(324n) as ZKChainMetadataItem;
            expect(chain1).toBeDefined();
            expect(chain1).toMatchObject({
                chainId: 324n,
                name: "ZKsyncERA",
                iconUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/24091.png",
                publicRpcs: [
                    "https://mainnet.era.zksync.io",
                    "https://zksync.drpc.org",
                    "https://zksync.meowrpc.com",
                ],
                explorerUrl: "https://explorer.zksync.io/",
                launchDate: 1679626800,
                chainType: "Rollup",
                baseToken: {
                    name: "Ethereum",
                    symbol: "ETH",
                    coingeckoId: "ethereum",
                    type: "native",
                    contractAddress: null,
                    decimals: 18,
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
                },
            });

            const chain2 = result.get(388n) as ZKChainMetadataItem;
            expect(chain2).toBeDefined();
            expect(chain2).toMatchObject({
                chainId: 388n,
                name: "Cronos",
                chainType: "Validium",
                publicRpcs: ["https://mainnet.zkevm.cronos.org"],
                explorerUrl: "https://explorer.zkevm.cronos.org/",
                launchDate: 1679626800,
                baseToken: {
                    name: "zkCRO",
                    symbol: "zkCRO",
                    coingeckoId: "unknown",
                    type: "erc20",
                    contractAddress: "0x28Ff2E4dD1B58efEB0fC138602A28D5aE81e44e2",
                    decimals: 18,
                    imageUrl: "https://zkevm.cronos.org/images/chains/zkevm.svg",
                },
            });
        });

        it("should throw an error if the schema is invalid", async () => {
            const provider = new GithubMetadataProvider(tokenJsonUrl, chainJsonUrl, mockLogger);
            const axios = provider["axios"];

            const axiosGetMock = vi
                .spyOn(axios, "get")
                .mockResolvedValueOnce({ data: [{ invalid: "data" }] });

            await expect(provider.getChainsMetadata()).rejects.toThrow(InvalidSchema);
            expect(axiosGetMock).toHaveBeenCalledWith(chainJsonUrl);
        });

        it("should throw an error if the fetch fails with 404 error", async () => {
            const provider = new GithubMetadataProvider(tokenJsonUrl, chainJsonUrl, mockLogger);
            const axios = new MockAdapter(provider["axios"]);

            axios.onGet().replyOnce(404, {
                data: {},
                status: 404,
                statusText: "Not found",
            });

            await expect(provider.getChainsMetadata()).rejects.toThrow(FetchError);
        });

        it("should throw an error if the fetch fails with 500 error", async () => {
            const provider = new GithubMetadataProvider(tokenJsonUrl, chainJsonUrl, mockLogger);
            const axios = new MockAdapter(provider["axios"]);

            axios.onGet().replyOnce(500, {
                data: {},
                status: 500,
                statusText: "Internal Server Error",
            });

            await expect(provider.getChainsMetadata()).rejects.toThrow(FetchError);
        });
    });

    describe("getTokensMetadata", () => {
        it("should return the tokens metadata", async () => {
            const provider = new GithubMetadataProvider(tokenJsonUrl, chainJsonUrl, mockLogger);
            const axios = provider["axios"];
            const axiosGetMock = vi
                .spyOn(axios, "get")
                .mockResolvedValueOnce({ data: mockTokenData });

            const result = await provider.getTokensMetadata();

            expect(axiosGetMock).toHaveBeenCalledWith(tokenJsonUrl);
            expect(result).toEqual(mockTokenData);
        });

        it("should throw an error if the schema is invalid", async () => {
            const provider = new GithubMetadataProvider(tokenJsonUrl, chainJsonUrl, mockLogger);
            const axios = provider["axios"];
            const axiosGetMock = vi
                .spyOn(axios, "get")
                .mockResolvedValueOnce({ data: [{ invalid: "data" }] });

            await expect(provider.getTokensMetadata()).rejects.toThrow(InvalidSchema);
            expect(axiosGetMock).toHaveBeenCalledWith(tokenJsonUrl);
        });

        it("should throw an error if the fetch fails with 404 error", async () => {
            const provider = new GithubMetadataProvider(tokenJsonUrl, chainJsonUrl, mockLogger);
            const axios = new MockAdapter(provider["axios"]);

            axios.onGet().replyOnce(404, {
                data: {},
                status: 404,
                statusText: "Not found",
            });

            await expect(provider.getTokensMetadata()).rejects.toThrow(FetchError);
        });

        it("should throw an error if the fetch fails with 500 error", async () => {
            const provider = new GithubMetadataProvider(tokenJsonUrl, chainJsonUrl, mockLogger);
            const axios = new MockAdapter(provider["axios"]);

            axios.onGet().replyOnce(500, {
                data: {},
                status: 500,
                statusText: "Internal Server Error",
            });

            await expect(provider.getTokensMetadata()).rejects.toThrow(FetchError);
        });
    });
});
