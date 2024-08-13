import { CacheModule, CacheModuleOptions } from "@nestjs/cache-manager";
import { DynamicModule, Logger, Module, Provider } from "@nestjs/common";

import { PRICING_PROVIDER } from "@zkchainhub/pricing/interfaces";
import { LoggerModule } from "@zkchainhub/shared";

import { CoingeckoService } from "./services";

interface CoingeckoOptions {
    provider: "coingecko";
    apiKey: string;
    apiBaseUrl?: string;
}

export type PricingOptions = CoingeckoOptions;

export interface PricingModuleOptions<PricingConfig extends PricingOptions> {
    cacheOptions: CacheModuleOptions;
    pricingOptions: PricingConfig;
}

const coingeckoPricingServiceFactory = (options: CoingeckoOptions): [Provider, Provider[]] => {
    return [
        {
            provide: PRICING_PROVIDER,
            useClass: CoingeckoService,
        },
        [
            {
                provide: "COINGECKO_API_KEY",
                useValue: options.apiKey,
            },
            {
                provide: "COINGECKO_API_URL",
                useValue: options.apiBaseUrl,
            },
            Logger,
        ],
    ];
};

@Module({})
export class PricingModule {
    static forRoot<T extends PricingOptions>(options: PricingModuleOptions<T>): DynamicModule {
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
