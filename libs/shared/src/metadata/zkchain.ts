import { ZKChainMetadata } from "../types";
import { nativeToken } from "./index";

export const zkChainsMetadata: ZKChainMetadata = new Map([
    [
        324n,
        {
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
            baseToken: nativeToken,
            tokenImgUrl:
                "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
        },
    ],
    [
        388n,
        {
            chainId: 388n,
            name: "Cronos",
            iconUrl:
                "https://s3.coinmarketcap.com/static-gravity/image/84e1ec1257dd4a6da6ee5584338a2460.jpeg",
            chainType: "Rollup",
            publicRpcs: ["https://mainnet.zkevm.cronos.org"],
            explorerUrl: "https://explorer.zkevm.cronos.org/",
            baseToken: nativeToken,
            launchDate: 1679626800,
            tokenImgUrl:
                "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
        },
    ],
]);
