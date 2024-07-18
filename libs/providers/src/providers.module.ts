import { Module } from "@nestjs/common";
import { EthersEvmProviderService, EvmProviderService } from "@packages/providers/providers";

@Module({
    providers: [EvmProviderService, EthersEvmProviderService],
    exports: [EvmProviderService, EthersEvmProviderService],
})
export class ProvidersModule {}
