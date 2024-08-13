import { CacheModule } from "@nestjs/cache-manager";
import { DynamicModule, Logger, Module, Provider } from "@nestjs/common";

import {
    CoingeckoOptions,
    PRICING_OPTIONS,
    PRICING_PROVIDER,
    PricingModuleOptions,
    PricingProvider,
} from "@zkchainhub/pricing/configuration";
import { LoggerModule } from "@zkchainhub/shared";

import { CoingeckoService } from "./services";

const coingeckoPricingServiceFactory = (options: CoingeckoOptions): [Provider, Provider[]] => {
    return [
        {
            provide: PRICING_PROVIDER,
            useClass: CoingeckoService,
        },
        [
            {
                provide: PRICING_OPTIONS,
                useValue: options,
            },
            Logger,
        ],
    ];
};

@Module({})
export class PricingModule {
    static register<CacheConfig extends Record<string, any>, T extends PricingProvider>(
        options: PricingModuleOptions<CacheConfig, T>,
    ): DynamicModule {
        let pricingProvider: Provider | undefined,
            additionalProviders: Provider[] = [];
        if (options.pricingOptions.provider === "coingecko") {
            const res = coingeckoPricingServiceFactory(options.pricingOptions);
            pricingProvider = res[0];
            additionalProviders = res[1];
        }

        if (!pricingProvider) throw new Error("Error initializing pricing module");
        return {
            module: PricingModule,
            imports: [LoggerModule, CacheModule.register(options.cacheOptions)],
            providers: [pricingProvider, ...additionalProviders],
            exports: [pricingProvider],
        };
    }
}
