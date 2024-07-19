import { Module } from "@nestjs/common";

import { EvmProviderService } from "./evmProvider.service";
import { ViemProviderService } from "./providers";

/**
 * Module for managing provider services.
 * This module exports Services for interacting with EVM-based blockchains.
 */
@Module({
    providers: [EvmProviderService, ViemProviderService],
    exports: [EvmProviderService, ViemProviderService],
})
export class ProvidersModule {}
