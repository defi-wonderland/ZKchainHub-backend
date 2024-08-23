import * as fs from "fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Cache, ILogger, ZKChainMetadataItem } from "@zkchainhub/shared";

import { FileNotFound, InvalidSchema, LocalFileMetadataProvider } from "../../../src/internal";
import { mockChainData, mockTokenData } from "../../fixtures/metadata.fixtures.js";

// Mock the logger
const mockLogger: ILogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
};

const mockCache: Cache = {
    store: {} as any,
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    reset: vi.fn(),
};

// Mock the file system functions
vi.mock("fs", () => ({
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
}));

describe("LocalFileMetadataProvider", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("constructor", () => {
        it("throws FileNotFound error if token JSON file does not exist", () => {
            vi.spyOn(fs, "existsSync").mockReturnValueOnce(false);

            expect(
                () =>
                    new LocalFileMetadataProvider(
                        "token.json",
                        "chain.json",
                        mockLogger,
                        mockCache,
                    ),
            ).toThrow(FileNotFound);
        });

        it("throws FileNotFound error if chain JSON file does not exist", () => {
            vi.spyOn(fs, "existsSync").mockReturnValueOnce(true).mockReturnValueOnce(false);

            expect(
                () =>
                    new LocalFileMetadataProvider(
                        "token.json",
                        "chain.json",
                        mockLogger,
                        mockCache,
                    ),
            ).toThrow(FileNotFound);
        });

        it("not throws any error if both token JSON file and chain JSON file exist", () => {
            vi.spyOn(fs, "existsSync").mockReturnValue(true);
            expect(
                () =>
                    new LocalFileMetadataProvider(
                        "token.json",
                        "chain.json",
                        mockLogger,
                        mockCache,
                    ),
            ).not.toThrow();
        });
    });

    describe("getChainsMetadata", () => {
        it("return the cached chain data if it exists", async () => {
            const cachedData = new Map<bigint, ZKChainMetadataItem>();
            vi.spyOn(fs, "existsSync").mockReturnValue(true);
            vi.spyOn(mockCache, "get").mockResolvedValue(cachedData);

            const provider = new LocalFileMetadataProvider(
                "token.json",
                "chain.json",
                mockLogger,
                mockCache,
            );

            const result = await provider.getChainsMetadata();

            expect(result).toEqual(cachedData);
            expect(mockCache.get).toHaveBeenCalledWith("local-metadata-chains");
            expect(fs.readFileSync).not.toHaveBeenCalled();
        });

        it("read and parse the chain JSON file if the cached chain data does not exist", async () => {
            vi.spyOn(mockCache, "get").mockResolvedValue(undefined);
            vi.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(mockChainData));
            vi.spyOn(fs, "existsSync").mockReturnValue(true);
            const expectedMap = new Map<bigint, ZKChainMetadataItem>();
            for (const chain of mockChainData) {
                const { chainId, ...rest } = chain;
                const chainIdBn = BigInt(chainId);
                expectedMap.set(chainIdBn, { ...rest, chainId: chainIdBn } as ZKChainMetadataItem);
            }

            const provider = new LocalFileMetadataProvider(
                "token.json",
                "chain.json",
                mockLogger,
                mockCache,
            );

            const result = await provider.getChainsMetadata();

            expect(result).toEqual(expectedMap);
            expect(fs.readFileSync).toHaveBeenCalledWith("chain.json", "utf-8");
            expect(mockCache.set).toHaveBeenCalledWith("local-metadata-chains", expectedMap);
        });

        it("throws an error if schema validation fails", async () => {
            const invalidChainData = [
                {
                    name: "Ethereum",
                    symbol: "ETH",
                    decimals: 18,
                    rpcUrl: "https://mainnet.infura.io/v3/your-infura-key",
                    explorerUrl: "https://etherscan.io",
                },
                {
                    chainId: 3,

                    symbol: "BNB",
                    decimals: 18,
                    rpcUrl: "https://bsc-dataseed.binance.org",
                    explorerUrl: "https://bscscan.com",
                },
            ];

            vi.spyOn(mockCache, "get").mockResolvedValue(undefined);
            vi.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(invalidChainData));
            vi.spyOn(fs, "existsSync").mockReturnValue(true);

            const provider = new LocalFileMetadataProvider(
                "token.json",
                "chain.json",
                mockLogger,
                mockCache,
            );

            await expect(provider.getChainsMetadata()).rejects.toThrow(InvalidSchema);
        });
    });

    describe("getTokensMetadata", () => {
        it("returns the cached token data if it exists", async () => {
            vi.spyOn(fs, "existsSync").mockReturnValue(true);
            vi.spyOn(mockCache, "get").mockResolvedValue(mockTokenData);

            const provider = new LocalFileMetadataProvider(
                "token.json",
                "chain.json",
                mockLogger,
                mockCache,
            );

            const result = await provider.getTokensMetadata();

            expect(result).toBe(mockTokenData);
            expect(mockCache.get).toHaveBeenCalledWith("local-metadata-tokens");
            expect(fs.readFileSync).not.toHaveBeenCalled();
        });

        it("read and parse the token JSON file if the cached token data does not exist", async () => {
            vi.spyOn(mockCache, "get").mockResolvedValue(undefined);
            vi.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(mockTokenData));
            vi.spyOn(fs, "existsSync").mockReturnValue(true);

            const provider = new LocalFileMetadataProvider(
                "token.json",
                "chain.json",
                mockLogger,
                mockCache,
            );

            const result = await provider.getTokensMetadata();

            expect(result).toEqual(mockTokenData);
            expect(fs.readFileSync).toHaveBeenCalledWith("token.json", "utf-8");
            expect(mockCache.set).toHaveBeenCalledWith("local-metadata-tokens", mockTokenData);
        });

        it("throws an error if schema validation fails", async () => {
            const invalidTokenData = [
                {
                    name: "Ethereum",
                    symbol: "ETH",
                    decimals: 18,
                    rpcUrl: "https://mainnet.infura.io/v3/your-infura-key",
                    explorerUrl: "https://etherscan.io",
                },
                {
                    name: "Wrapped Ether",
                    decimals: 18.5,
                    rpcUrl: "https://mainnet.infura.io/v3/your-infura-key",
                    explorerUrl: "https://etherscan.io",
                },
            ];

            vi.spyOn(mockCache, "get").mockResolvedValue(undefined);
            vi.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(invalidTokenData));
            vi.spyOn(fs, "existsSync").mockReturnValue(true);

            const provider = new LocalFileMetadataProvider(
                "token.json",
                "chain.json",
                mockLogger,
                mockCache,
            );

            await expect(provider.getTokensMetadata()).rejects.toThrow(InvalidSchema);
        });
    });
});
