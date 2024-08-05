import { createMock } from "@golevelup/ts-jest";
import { Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { encodeFunctionData, erc20Abi, parseEther, zeroAddress } from "viem";

import { L1ProviderException } from "@zkchainhub/metrics/exceptions/provider.exception";
import { L1MetricsService } from "@zkchainhub/metrics/l1/";
import { bridgeHubAbi, sharedBridgeAbi } from "@zkchainhub/metrics/l1/abis";
import { IPricingService, PRICING_PROVIDER } from "@zkchainhub/pricing";
import { EvmProviderService } from "@zkchainhub/providers";
import { L1_CONTRACTS, vitalikAddress } from "@zkchainhub/shared";
import { ETH, WETH } from "@zkchainhub/shared/tokens/tokens";

// Mock implementations of the dependencies
const mockEvmProviderService = createMock<EvmProviderService>();

const mockPricingService = createMock<IPricingService>();

const ONE_ETHER = parseEther("1");

export const mockLogger: Partial<Logger> = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
};

describe("L1MetricsService", () => {
    let l1MetricsService: L1MetricsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                L1MetricsService,
                {
                    provide: L1MetricsService,
                    useFactory: (
                        mockEvmProviderService: EvmProviderService,
                        mockPricingService: IPricingService,
                        logger: Logger,
                    ) => {
                        return new L1MetricsService(
                            mockEvmProviderService,
                            mockPricingService,
                            logger,
                        );
                    },
                    inject: [EvmProviderService, PRICING_PROVIDER, WINSTON_MODULE_PROVIDER],
                },
                {
                    provide: EvmProviderService,
                    useValue: mockEvmProviderService,
                },
                {
                    provide: PRICING_PROVIDER,
                    useValue: mockPricingService,
                },
                {
                    provide: WINSTON_MODULE_PROVIDER,
                    useValue: mockLogger,
                },
            ],
        }).compile();

        l1MetricsService = module.get<L1MetricsService>(L1MetricsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("constructor", () => {
        it("initialize bridgeHub and sharedBridge", () => {
            expect(l1MetricsService["bridgeHub"]).toEqual({
                abi: bridgeHubAbi,
                address: L1_CONTRACTS.BRIDGE_HUB,
            });
            expect(l1MetricsService["sharedBridge"]).toEqual({
                abi: sharedBridgeAbi,
                address: L1_CONTRACTS.SHARED_BRIDGE,
            });
        });

        it("initialize diamondContracts map as empty", () => {
            expect(l1MetricsService["diamondContracts"].size).toBe(0);
        });
    });

    describe("l1Tvl", () => {
        it("return l1Tvl", async () => {
            const result = await l1MetricsService.l1Tvl();
            expect(result).toEqual({ ETH: { amount: 1000000, amountUsd: 1000000 } });
        });
    });

    describe("getBatchesInfo", () => {
        it("return getBatchesInfo", async () => {
            const result = await l1MetricsService.getBatchesInfo(1);
            expect(result).toEqual({ commited: 100, verified: 100, proved: 100 });
        });
    });

    describe("tvl", () => {
        it("return tvl", async () => {
            const result = await l1MetricsService.tvl(1);
            expect(result).toEqual({ ETH: { amount: 1000000, amountUsd: 1000000 } });
        });
    });

    describe("chainType", () => {
        it("return chainType", async () => {
            const result = await l1MetricsService.chainType(1);
            expect(result).toBe("rollup");
        });
    });

    describe("ethGasInfo", () => {
        it("returns gas information from L1", async () => {
            // Mock the necessary dependencies
            const mockEstimateGas = jest.spyOn(mockEvmProviderService, "estimateGas");
            mockEstimateGas.mockResolvedValueOnce(BigInt(21000)); // ethTransferGasCost
            mockEstimateGas.mockResolvedValueOnce(BigInt(65000)); // erc20TransferGasCost'
            const mockGetGasPrice = jest.spyOn(mockEvmProviderService, "getGasPrice");
            mockGetGasPrice.mockResolvedValueOnce(BigInt(50000000000)); // gasPrice

            const mockGetTokenPrices = jest.spyOn(mockPricingService, "getTokenPrices");
            mockGetTokenPrices.mockResolvedValueOnce({ [ETH.coingeckoId]: 2000 }); // ethPriceInUsd

            // Call the method
            const result = await l1MetricsService.ethGasInfo();

            // Assertions
            expect(mockEstimateGas).toHaveBeenCalledTimes(2);
            expect(mockEstimateGas).toHaveBeenNthCalledWith(1, {
                account: vitalikAddress,
                to: zeroAddress,
                value: ONE_ETHER,
            });
            expect(mockEstimateGas).toHaveBeenNthCalledWith(2, {
                account: vitalikAddress,
                to: WETH.contractAddress,
                data: encodeFunctionData({
                    abi: erc20Abi,
                    functionName: "transfer",
                    args: [L1_CONTRACTS.SHARED_BRIDGE, ONE_ETHER],
                }),
            });

            expect(mockGetGasPrice).toHaveBeenCalledTimes(1);

            expect(mockGetTokenPrices).toHaveBeenCalledTimes(1);
            expect(mockGetTokenPrices).toHaveBeenCalledWith([ETH.coingeckoId]);

            expect(result).toEqual({
                gasPriceInGwei: 50,
                ethPrice: 2000,
                ethTransferGas: 21000,
                erc20TransferGas: 65000,
            });
        });

        it("returns gas information from L1 without ether price", async () => {
            const mockEstimateGas = jest.spyOn(mockEvmProviderService, "estimateGas");
            mockEstimateGas.mockResolvedValueOnce(BigInt(21000)); // ethTransferGasCost
            mockEstimateGas.mockResolvedValueOnce(BigInt(65000)); // erc20TransferGasCost

            const mockGetGasPrice = jest.spyOn(mockEvmProviderService, "getGasPrice");
            mockGetGasPrice.mockResolvedValueOnce(BigInt(50000000000)); // gasPrice

            const mockGetTokenPrices = jest.spyOn(mockPricingService, "getTokenPrices");
            mockGetTokenPrices.mockRejectedValueOnce(new Error("Failed to get token prices"));

            const result = await l1MetricsService.ethGasInfo();

            // Assertions
            expect(result).toEqual({
                gasPriceInGwei: 50,
                ethPrice: undefined,
                ethTransferGas: 21000,
                erc20TransferGas: 65000,
            });
            expect(mockEstimateGas).toHaveBeenCalledTimes(2);
            expect(mockEstimateGas).toHaveBeenNthCalledWith(1, {
                account: vitalikAddress,
                to: zeroAddress,
                value: ONE_ETHER,
            });
            expect(mockEstimateGas).toHaveBeenNthCalledWith(2, {
                account: vitalikAddress,
                to: WETH.contractAddress,
                data: encodeFunctionData({
                    abi: erc20Abi,
                    functionName: "transfer",
                    args: [L1_CONTRACTS.SHARED_BRIDGE, ONE_ETHER],
                }),
            });

            expect(mockGetGasPrice).toHaveBeenCalledTimes(1);

            expect(mockGetTokenPrices).toHaveBeenCalledTimes(1);
            expect(mockGetTokenPrices).toHaveBeenCalledWith([ETH.coingeckoId]);
        });

        it("throws L1ProviderException when estimateGas fails", async () => {
            // Mock the necessary dependencies
            const mockEstimateGas = jest.spyOn(mockEvmProviderService, "estimateGas");
            mockEstimateGas.mockRejectedValueOnce(new Error("Failed to estimate gas"));

            const mockGetGasPrice = jest.spyOn(mockEvmProviderService, "getGasPrice");
            mockGetGasPrice.mockResolvedValueOnce(BigInt(50000000000)); // gasPrice

            const mockGetTokenPrices = jest.spyOn(mockPricingService, "getTokenPrices");
            mockGetTokenPrices.mockResolvedValueOnce({ [ETH.coingeckoId]: 2000 }); // ethPriceInUsd

            // Call the method and expect it to throw L1ProviderException
            await expect(l1MetricsService.ethGasInfo()).rejects.toThrow(L1ProviderException);

            // Assertions
            expect(mockEstimateGas).toHaveBeenCalledWith({
                account: vitalikAddress,
                to: zeroAddress,
                value: ONE_ETHER,
            });

            expect(mockGetTokenPrices).not.toHaveBeenCalled();
        });

        it("throws L1ProviderException when getGasPrice fails", async () => {
            // Mock the necessary dependencies
            const mockEstimateGas = jest.spyOn(mockEvmProviderService, "estimateGas");
            mockEstimateGas.mockResolvedValueOnce(BigInt(21000)); // ethTransferGasCost
            mockEstimateGas.mockResolvedValueOnce(BigInt(65000)); // erc20TransferGasCost

            const mockGetGasPrice = jest.spyOn(mockEvmProviderService, "getGasPrice");
            mockGetGasPrice.mockRejectedValueOnce(new Error("Failed to get gas price"));

            const mockGetTokenPrices = jest.spyOn(mockPricingService, "getTokenPrices");
            mockGetTokenPrices.mockResolvedValueOnce({ [ETH.coingeckoId]: 2000 }); // ethPriceInUsd

            // Call the method and expect it to throw L1ProviderException
            await expect(l1MetricsService.ethGasInfo()).rejects.toThrow(L1ProviderException);

            // Assertions
            expect(mockEstimateGas).toHaveBeenCalledTimes(2);
            expect(mockEstimateGas).toHaveBeenNthCalledWith(1, {
                account: vitalikAddress,
                to: zeroAddress,
                value: ONE_ETHER,
            });
            expect(mockEstimateGas).toHaveBeenNthCalledWith(2, {
                account: vitalikAddress,
                to: WETH.contractAddress,
                data: encodeFunctionData({
                    abi: erc20Abi,
                    functionName: "transfer",
                    args: [L1_CONTRACTS.SHARED_BRIDGE, ONE_ETHER],
                }),
            });

            expect(mockGetGasPrice).toHaveBeenCalledTimes(1);

            expect(mockGetTokenPrices).not.toHaveBeenCalled();
        });
    });

    describe("feeParams", () => {
        it("return feeParams", async () => {
            const result = await l1MetricsService.feeParams(1);
            expect(result).toEqual({
                batchOverheadL1Gas: 50000,
                maxPubdataPerBatch: 120000,
                maxL2GasPerBatch: 10000000,
                priorityTxMaxPubdata: 15000,
                minimalL2GasPrice: 10000000,
            });
        });
    });
});
