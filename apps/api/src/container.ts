// container.ts

import { L1MetricsService } from "@zkchainhub/metrics";
import { CoingeckoService, IPricingService } from "@zkchainhub/pricing";
import { EvmProviderService } from "@zkchainhub/providers";
import { ILogger, Logger } from "@zkchainhub/shared";

import { InMemoryCache } from "./common/cache/inMemoryCache.js";
import { ConfigType } from "./common/config/index.js";
import { MetricsController, MetricsRouter } from "./metrics/index.js";

export class Container {
    private services = new Map<string, any>();

    constructor(private config: ConfigType) {}

    public get<T>(serviceName: string): T {
        if (!this.services.has(serviceName)) {
            this.instantiate(serviceName);
        }
        return this.services.get(serviceName);
    }

    private instantiate(serviceName: string) {
        switch (serviceName) {
            case "ILogger":
                this.services.set("ILogger", Logger.getInstance());
                break;
            case "EvmProviderService":
                this.services.set(
                    "EvmProviderService",
                    new EvmProviderService(
                        this.config.l1.rpcUrls,
                        this.config.l1.chain,
                        this.get<ILogger>("ILogger"),
                    ),
                );
                break;
            case "IPricingService":
                this.services.set(
                    "IPricingService",
                    new CoingeckoService(
                        {
                            apiBaseUrl: this.config.pricing.pricingOptions.apiBaseUrl,
                            apiKey: this.config.pricing.pricingOptions.apiKey,
                            apiType: this.config.pricing.pricingOptions.apiType,
                        },
                        new InMemoryCache(),
                        this.get<ILogger>("ILogger"),
                    ),
                );
                break;
            case "L1MetricsService":
                this.services.set(
                    "L1MetricsService",
                    new L1MetricsService(
                        this.config.bridgeHubAddress,
                        this.config.sharedBridgeAddress,
                        this.config.stateTransitionManagerAddresses,
                        this.get<EvmProviderService>("EvmProviderService"),
                        this.get<IPricingService>("IPricingService"),
                        this.get<ILogger>("ILogger"),
                    ),
                );
                break;
            case "MetricsController":
                this.services.set(
                    "MetricsController",
                    new MetricsController(
                        this.get<L1MetricsService>("L1MetricsService"),
                        this.get<ILogger>("ILogger"),
                    ),
                );
                break;
            case "MetricsRouter":
                this.services.set(
                    "MetricsRouter",
                    new MetricsRouter(
                        this.get<MetricsController>("MetricsController"),
                        this.get<ILogger>("ILogger"),
                    ),
                );
                break;
            default:
                throw new Error(`Service ${serviceName} not found in container`);
        }
    }
}
