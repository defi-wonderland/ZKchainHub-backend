import { ChainId, ChainType } from "@zkchainhub/shared";

export type ZKChainMetadataItem = {
    chainId: ChainId;
    name: string;
    iconUrl: string;
    chainType: ChainType;
    baseToken: string;
    tokenImgUrl: string;
};

export type ZKChainMetadata = Map<ChainId, ZKChainMetadataItem>;
