import { Address } from "abitype";
import { mainnet, zkSync } from "viem/chains";

export const config = {
    l1: {
        rpcUrls: ["https://eth.llamarpc.com", "https://rpc.flashbots.net/fast"],
        chain: mainnet,
    },
    l2: {
        rpcUrls: ["https://mainnet.era.zksync.io"],
        chain: zkSync,
    },
    bridgeHubAddress: "0x303a465B659cBB0ab36eE643eA362c509EEb5213" as Address,
    sharedBridgeAddress: "0xD7f9f54194C633F36CCD5F3da84ad4a1c38cB2cB" as Address,
    stateTransitionManagerAddresses: ["0xc2eE6b6af7d616f6e27ce7F4A451Aedc2b0F5f5C"] as Address[],
    cacheOptions: {
        store: "memory",
        ttl: 60,
    },
    coingecko: {
        apiKey: "<YOUR_API_KEY>",
        baseUrl: "https://api.coingecko.com/api/v3/",
    },
};
