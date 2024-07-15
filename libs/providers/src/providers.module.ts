import { Module } from "@nestjs/common";
import { EthersEvmProviderService } from "@packages/providers/ethersEvmProvider.service";

import { EvmProviderService } from "./evmProvider.service";

@Module({
    providers: [EvmProviderService, EthersEvmProviderService],
    exports: [EvmProviderService, EthersEvmProviderService],
})
export class ProvidersModule {}
