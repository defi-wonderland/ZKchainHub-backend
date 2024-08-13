import { DynamicModule, Logger, Module } from "@nestjs/common";
import { Address } from "abitype";

import {
    IPricingService,
    PRICING_PROVIDER,
    PricingModule,
    PricingModuleOptions,
    PricingOptions,
} from "@zkchainhub/pricing";
import { EvmProviderService, ProvidersModule, ProvidersModuleOptions } from "@zkchainhub/providers";
import { LoggerModule } from "@zkchainhub/shared";

import { L1MetricsService } from "./l1";

interface MetricsModuleOptions<PricingConfig extends PricingOptions> {
    pricingModuleOptions: PricingModuleOptions<PricingConfig>;
    providerModuleOptions: ProvidersModuleOptions;
    contracts: {
        bridgeHub: Address;
        sharedBridge: Address;
        stateTransitionManager: Address[];
    };
}

const metricsProviderFactory = <PricingConfig extends PricingOptions>(
    options: MetricsModuleOptions<PricingConfig>,
) => {
    const { bridgeHub, sharedBridge, stateTransitionManager } = options.contracts;
    return {
        provide: L1MetricsService,
        useFactory: (
            evmProviderService: EvmProviderService,
            pricing: IPricingService,
            logger: Logger,
        ) => {
            return new L1MetricsService(
                bridgeHub,
                sharedBridge,
                stateTransitionManager,
                evmProviderService,
                pricing,
                logger,
            );
        },
        inject: [EvmProviderService, PRICING_PROVIDER, Logger],
    };
};

/**
 * Module for managing provider services.
 * This module exports Services for interacting with EVM-based blockchains.
 */
@Module({})
export class MetricsModule {
    static forRoot<PricingConfig extends PricingOptions>(
        options: MetricsModuleOptions<PricingConfig>,
    ): DynamicModule {
        return {
            module: MetricsModule,
            imports: [
                LoggerModule,
                PricingModule.forRoot(options.pricingModuleOptions),
                ProvidersModule.forRoot(options.providerModuleOptions),
            ],
            providers: [metricsProviderFactory(options), Logger],
            exports: [L1MetricsService],
        };
    }
}
