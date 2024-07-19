import { createMock } from "@golevelup/ts-jest";
import { Test, TestingModule } from "@nestjs/testing";
import { parseAbi } from "abitype";
import * as viem from "viem";
import { localhost } from "viem/chains";

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
        const abi = [
            {
                inputs: [
                    {
                        internalType: "address[]",
                        name: "_tokenAddresses",
                        type: "address[]",
                    },
                ],
                stateMutability: "nonpayable",
                type: "constructor",
            },
        ] as const;
        const bytecode =
            "0x608060405234801561001057600080fd5b506040516108aa3803806108aa833981810160405281019061003291906104f2565b60008151905060008167ffffffffffffffff81111561007a577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6040519080825280602002602001820160405280156100b357816020015b6100a06103a6565b8152602001906001900390816100985790505b50905060005b828110156103775760008482815181106100fc577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002602001015190508073ffffffffffffffffffffffffffffffffffffffff1663313ce5676040518163ffffffff1660e01b815260040160206040518083038186803b15801561014c57600080fd5b505afa158015610160573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101849190610574565b8383815181106101bd577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200260200101516000019060ff16908160ff16815250508073ffffffffffffffffffffffffffffffffffffffff166395d89b416040518163ffffffff1660e01b815260040160006040518083038186803b15801561021b57600080fd5b505afa15801561022f573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f820116820180604052508101906102589190610533565b838381518110610291577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020026020010151602001819052508073ffffffffffffffffffffffffffffffffffffffff166306fdde036040518163ffffffff1660e01b815260040160006040518083038186803b1580156102e657600080fd5b505afa1580156102fa573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f820116820180604052508101906103239190610533565b83838151811061035c577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002602001015160400181905250816001019150506100b9565b5060008160405160200161038b91906106c5565b60405160208183030381529060405290506020810180590381f35b6040518060600160405280600060ff16815260200160608152602001606081525090565b60006103dd6103d884610718565b6106e7565b905080838252602082019050828560208602820111156103fc57600080fd5b60005b8581101561042c57816104128882610474565b8452602084019350602083019250506001810190506103ff565b5050509392505050565b600061044961044484610744565b6106e7565b90508281526020810184848401111561046157600080fd5b61046c848285610808565b509392505050565b6000815190506104838161087b565b92915050565b600082601f83011261049a57600080fd5b81516104aa8482602086016103ca565b91505092915050565b600082601f8301126104c457600080fd5b81516104d4848260208601610436565b91505092915050565b6000815190506104ec81610892565b92915050565b60006020828403121561050457600080fd5b600082015167ffffffffffffffff81111561051e57600080fd5b61052a84828501610489565b91505092915050565b60006020828403121561054557600080fd5b600082015167ffffffffffffffff81111561055f57600080fd5b61056b848285016104b3565b91505092915050565b60006020828403121561058657600080fd5b6000610594848285016104dd565b91505092915050565b60006105a9838361065f565b905092915050565b60006105bc82610784565b6105c681856107a7565b9350836020820285016105d885610774565b8060005b8581101561061457848403895281516105f5858261059d565b94506106008361079a565b925060208a019950506001810190506105dc565b50829750879550505050505092915050565b60006106318261078f565b61063b81856107b8565b935061064b818560208601610808565b6106548161086a565b840191505092915050565b600060608301600083015161067760008601826106b6565b506020830151848203602086015261068f8282610626565b915050604083015184820360408601526106a98282610626565b9150508091505092915050565b6106bf816107fb565b82525050565b600060208201905081810360008301526106df81846105b1565b905092915050565b6000604051905081810181811067ffffffffffffffff8211171561070e5761070d61083b565b5b8060405250919050565b600067ffffffffffffffff8211156107335761073261083b565b5b602082029050602081019050919050565b600067ffffffffffffffff82111561075f5761075e61083b565b5b601f19601f8301169050602081019050919050565b6000819050602082019050919050565b600081519050919050565b600081519050919050565b6000602082019050919050565b600082825260208201905092915050565b600082825260208201905092915050565b60006107d4826107db565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600060ff82169050919050565b60005b8381101561082657808201518184015260208101905061080b565b83811115610835576000848401525b50505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6000601f19601f8301169050919050565b610884816107c9565b811461088f57600080fd5b50565b61089b816107fb565b81146108a657600080fd5b5056fe";
        it("should properly encode bytecode data and decode return data from batch request call", async () => {
            const expectedReturnValue = {
                data: `0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000045745544800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d57726170706564204574686572000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000045553444300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000855534420436f696e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000`,
            } as const;

            const args = [
                [
                    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                ],
            ] as const;
            const returnAbiParams = viem.parseAbiParameters([
                "TokenData[] returnData",
                "struct TokenData { uint8 tokenDecimals; string tokenSymbol; string tokenName; }",
            ]);

            // Mock the readContract method of the Viem client
            jest.spyOn(mockClient, "call").mockResolvedValue(expectedReturnValue);

            const returnValue = await viemProvider.batchRequest(
                abi,
                bytecode,
                args,
                returnAbiParams,
            );

            expect(returnValue).toStrictEqual([
                [
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
                ],
            ]);
        });
    });
});
