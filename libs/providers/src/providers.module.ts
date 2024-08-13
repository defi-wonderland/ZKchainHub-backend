import { DynamicModule, Logger, Module } from "@nestjs/common";
import { Chain } from "viem";

import { LoggerModule } from "@zkchainhub/shared";

import { EvmProviderService } from "./providers";
import { ZKChainProviderService } from "./providers/zkChainProvider.service";

export interface ProvidersModuleOptions {
    l1: {
        rpcUrls: string[];
        chain: Chain;
    };
    l2?: {
        rpcUrls: string[];
        chain: Chain;
    };
}

const evmProviderFactory = (options: ProvidersModuleOptions["l1"]) => {
    return {
        provide: EvmProviderService,
        useFactory: (logger: Logger) => {
            return new EvmProviderService(options.rpcUrls, options.chain, logger);
        },
        inject: [Logger],
    };
};
const zkProviderFactory = (options: ProvidersModuleOptions["l2"]) => {
    if (!options) throw new Error("Error initializazing zkProvider");

    return {
        provide: ZKChainProviderService,
        useFactory: (logger: Logger) => {
            return new ZKChainProviderService(options.rpcUrls, options.chain, logger);
        },
        inject: [Logger],
    };
};

/**
 * Module for managing provider services.
 * This module exports Services for interacting with EVM-based blockchains.
 */
@Module({})
export class ProvidersModule {
    static forRoot(options: ProvidersModuleOptions): DynamicModule {
        if (options.l2) {
            return {
                module: ProvidersModule,
                imports: [LoggerModule],
                providers: [evmProviderFactory(options.l1), zkProviderFactory(options.l2), Logger],
                exports: [EvmProviderService, ZKChainProviderService],
            };
        } else {
            return {
                module: ProvidersModule,
                imports: [LoggerModule],
                providers: [evmProviderFactory(options.l1), Logger],
                exports: [EvmProviderService],
            };
        }
    }
}
