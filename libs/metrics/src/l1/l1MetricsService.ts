import { Injectable } from "@nestjs/common";

import { bridgeHubAbi, sharedBridgeAbi } from "@zkchainhub/metrics/l1/abis";
import { IPricingService } from "@zkchainhub/pricing";
import { EvmProviderService } from "@zkchainhub/providers";
import { AbiWithAddress, ChainId, L1_CONTRACTS } from "@zkchainhub/shared";

/**
 * Acts as a wrapper around Viem library to provide methods to interact with an EVM-based blockchain.
 */
@Injectable()
export class L1MetricsService {
    private readonly bridgeHub: Readonly<AbiWithAddress> = {
        abi: bridgeHubAbi,
        address: L1_CONTRACTS.BRIDGE_HUB,
    };
    private readonly sharedBridge: Readonly<AbiWithAddress> = {
        abi: sharedBridgeAbi,
        address: L1_CONTRACTS.SHARED_BRIDGE,
    };
    private readonly diamondContracts: Map<ChainId, AbiWithAddress> = new Map();

    constructor(
        private readonly evmProviderService: EvmProviderService,
        private readonly pricingService: IPricingService,
    ) {}
}
