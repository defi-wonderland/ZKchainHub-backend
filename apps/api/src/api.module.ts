import { Logger, MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { config } from "apps/api/src/config";

import { MetricsModule } from "@zkchainhub/metrics";
import { LoggerModule } from "@zkchainhub/shared";

import { RequestLoggerMiddleware } from "./common/middleware/request.middleware";
import { MetricsController } from "./metrics/metrics.controller";

/**
 * The main API module of the application.
 * Here we import all required modules and register the controllers for the ZKchainHub API.
 */
@Module({
    imports: [
        LoggerModule,
        MetricsModule.forRoot({
            pricingModuleOptions: {
                cacheOptions: config.cacheOptions,
                pricingOptions: {
                    provider: "coingecko",
                    apiKey: config.coingecko.apiKey,
                    apiBaseUrl: config.coingecko.baseUrl,
                },
            },
            providerModuleOptions: {
                l1: {
                    rpcUrls: config.l1.rpcUrls,
                    chain: config.l1.chain,
                },
            },
            contracts: {
                bridgeHub: config.bridgeHubAddress,
                sharedBridge: config.sharedBridgeAddress,
                stateTransitionManager: config.stateTransitionManagerAddresses,
            },
        }),
    ],
    controllers: [MetricsController],
    providers: [Logger],
})
export class ApiModule implements NestModule {
    /**
     * Configures middleware for the module.
     * Applies RequestLoggerMiddleware to all routes except '/docs' and '/docs/(.*)'.
     *
     * @param {MiddlewareConsumer} consumer - The middleware consumer provided by NestJS.
     */
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(RequestLoggerMiddleware).exclude("/docs", "/docs/(.*)").forRoutes("*");
    }
}
