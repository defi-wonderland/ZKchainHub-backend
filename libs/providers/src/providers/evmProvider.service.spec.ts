import { createMock } from "@golevelup/ts-jest";
import { Test, TestingModule } from "@nestjs/testing";
import { parseAbi } from "abitype";
import * as viem from "viem";
import { localhost } from "viem/chains";

import { DataDecodeException } from "@zkchainhub/providers/exceptions";
import {
    arrayAbiFixture,
    structAbiFixture,
} from "@zkchainhub/providers/fixtures/batchRequest.fixture";

import { EvmProviderService } from "./evmProvider.service";

const mockClient = createMock<ReturnType<typeof viem.createPublicClient>>();

jest.mock("viem", () => ({
    ...jest.requireActual("viem"),
    createPublicClient: jest.fn().mockImplementation(() => mockClient),
    http: jest.fn(),
}));

describe("EvmProviderService", () => {
    let viemProvider: EvmProviderService;
    const testAbi = parseAbi([
        "constructor(uint256 totalSupply)",
        "function balanceOf(address owner) view returns (uint256)",
        "function tokenURI(uint256 tokenId) pure returns (string)",
    ]);

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: EvmProviderService,
                    useFactory: () => {
                        const rpcUrl = "http://localhost:8545";
                        const chain = localhost;
                        return new EvmProviderService(rpcUrl, chain);
                    },
                },
            ],
        }).compile();

        viemProvider = app.get<EvmProviderService>(EvmProviderService);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    describe("getBalance", () => {
        it("should return the balance of the specified address", async () => {
            const address = "0x123456789";
            const expectedBalance = 100n;
            jest.spyOn(mockClient, "getBalance").mockResolvedValue(expectedBalance);

            const balance = await viemProvider.getBalance(address);

            expect(balance).toBe(expectedBalance);
            expect(mockClient.getBalance).toHaveBeenCalledWith({ address });
        });
    });

    describe("getBlockNumber", () => {
        it("should return the current block number", async () => {
            const expectedBlockNumber = 1000n;
            jest.spyOn(mockClient, "getBlockNumber").mockResolvedValue(expectedBlockNumber);

            const blockNumber = await viemProvider.getBlockNumber();

            expect(blockNumber).toBe(expectedBlockNumber);
        });
    });

    describe("getGasPrice", () => {
        it("should return the current gas price", async () => {
            const expectedGasPrice = BigInt(100);

            // Mock the getGasPrice method of the Viem client
            jest.spyOn(viemProvider["client"], "getGasPrice").mockResolvedValue(expectedGasPrice);

            const gasPrice = await viemProvider.getGasPrice();

            expect(gasPrice).toBe(expectedGasPrice);
        });
    });

    describe("getStorageAt", () => {
        it("should return the value of the storage slot at the given address and slot number", async () => {
            const address = "0x123456789";
            const slot = 1;
            const expectedValue = "0xabcdef";
            jest.spyOn(mockClient, "getStorageAt").mockResolvedValue(expectedValue);

            const value = await viemProvider.getStorageAt(address, slot);

            expect(value).toBe(expectedValue);
            expect(mockClient.getStorageAt).toHaveBeenCalledWith({ address, slot: "0x1" });
        });

        it("should throw an error if the slot is not a positive integer", async () => {
            const address = "0x123456789";
            const slot = -1;

            await expect(viemProvider.getStorageAt(address, slot)).rejects.toThrowError(
                "Slot must be a positive integer number. Received: -1",
            );
        });
    });

    describe("readContract", () => {
        it("should call the readContract method of the Viem client with the correct arguments", async () => {
            const contractAddress = "0x123456789";
            const abi = testAbi;
            const functionName = "balanceOf";
            const expectedReturnValue = 5n;

            // Mock the readContract method of the Viem client
            jest.spyOn(mockClient, "readContract").mockResolvedValue(expectedReturnValue);

            const returnValue = await viemProvider.readContract(contractAddress, abi, functionName);

            expect(returnValue).toBe(expectedReturnValue);
            expect(mockClient.readContract).toHaveBeenCalledWith({
                address: contractAddress,
                abi,
                functionName,
            });
        });

        it("should call the readContract method of the Viem client with the correct arguments when args are provided", async () => {
            const contractAddress = "0x123456789";
            const functionName = "tokenURI";
            const args = [1n] as const;
            const expectedReturnValue = "tokenUri";

            // Mock the readContract method of the Viem client
            jest.spyOn(mockClient, "readContract").mockResolvedValue(expectedReturnValue);

            const returnValue = await viemProvider.readContract(
                contractAddress,
                testAbi,
                functionName,
                args,
            );

            expect(returnValue).toBe(expectedReturnValue);
            expect(mockClient.readContract).toHaveBeenCalledWith({
                address: contractAddress,
                abi: testAbi,
                functionName,
                args,
            });
        });
    });

    describe("batchRequest", () => {
        it("should properly encode bytecode data and decode return data from batch request call", async () => {
            const returnAbiParams = viem.parseAbiParameters([
                "TokenData[] returnData",
                "struct TokenData { uint8 tokenDecimals; string tokenSymbol; string tokenName; }",
            ]);
            jest.spyOn(mockClient, "call").mockResolvedValue({ data: structAbiFixture.returnData });

            const [returnValue] = await viemProvider.batchRequest(
                structAbiFixture.abi,
                structAbiFixture.bytecode,
                structAbiFixture.args,
                returnAbiParams,
            );

            expect(returnValue).toStrictEqual([
                {
                    tokenDecimals: 18,
                    tokenSymbol: "WETH",
                    tokenName: "Wrapped Ether",
                },
                {
                    tokenDecimals: 6,
                    tokenSymbol: "USDC",
                    tokenName: "USD Coin",
                },
            ]);
        });

        it("should fail if no data is returned", async () => {
            const returnAbiParams = viem.parseAbiParameters([
                "TokenData[] returnData",
                "struct TokenData { uint8 tokenDecimals; string tokenSymbol; string tokenName; }",
            ]);

            jest.spyOn(mockClient, "call").mockResolvedValue({ data: undefined });

            await expect(
                viemProvider.batchRequest(
                    structAbiFixture.abi,
                    structAbiFixture.bytecode,
                    structAbiFixture.args,
                    returnAbiParams,
                ),
            ).rejects.toThrowError(DataDecodeException);
        });

        it("should fail if decoded data does not match validator (missing struct fields)", async () => {
            // this schema is incorrect, it should have 3 fields instead of 2
            const returnAbiParams = viem.parseAbiParameters([
                "WrongTokenData[] returnData",
                "struct WrongTokenData { string tokenSymbol; string tokenName; }",
            ]);

            jest.spyOn(mockClient, "call").mockResolvedValue({ data: structAbiFixture.returnData });

            await expect(
                viemProvider.batchRequest(
                    structAbiFixture.abi,
                    structAbiFixture.bytecode,
                    structAbiFixture.args,
                    returnAbiParams,
                ),
            ).rejects.toThrowError(
                new DataDecodeException("Error decoding return data with given AbiParameters"),
            );
        });

        it("should fail if decoded data does not match validator (not struct vs struct)", async () => {
            // this schema is incorrect, it should have 3 fields instead of 2
            const returnAbiParams = viem.parseAbiParameters("uint8 decimals, address[] owners");

            jest.spyOn(mockClient, "call").mockResolvedValue({ data: structAbiFixture.returnData });

            await expect(
                viemProvider.batchRequest(
                    structAbiFixture.abi,
                    structAbiFixture.bytecode,
                    structAbiFixture.args,
                    returnAbiParams,
                ),
            ).rejects.toThrowError(
                new DataDecodeException("Error decoding return data with given AbiParameters"),
            );
        });

        it("should properly decode address[]", async () => {
            const returnAbiParams = viem.parseAbiParameters("address[]");

            jest.spyOn(mockClient, "call").mockResolvedValue({ data: arrayAbiFixture.returnData });

            const [returnValue] = await viemProvider.batchRequest(
                arrayAbiFixture.abi,
                arrayAbiFixture.bytecode,
                arrayAbiFixture.args,
                returnAbiParams,
            );

            expect(returnValue).toEqual(arrayAbiFixture.args[0]);
        });
    });
});
