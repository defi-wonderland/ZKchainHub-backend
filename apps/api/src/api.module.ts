import { CacheModule } from "@nestjs/cache-manager";
import { Logger, MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { MetricsModule } from "@zkchainhub/metrics";
import { PricingModule } from "@zkchainhub/pricing";
import { ProvidersModule } from "@zkchainhub/providers";
import { LoggerModule } from "@zkchainhub/shared";

import { RequestLoggerMiddleware } from "./common/middleware/request.middleware";
import { config, ConfigType, validationSchema } from "./config";
import { MetricsController } from "./metrics/metrics.controller";

/**
 * The main API module of the application.
 * Here we import all required modules and register the controllers for the ZKchainHub API.
 */
@Module({
    imports: [
        LoggerModule,
        ConfigModule.forRoot({
            load: [config],
            validationSchema: validationSchema,
            validationOptions: {
                abortEarly: true,
            },
        }),
        MetricsModule.registerAsync({
            imports: [
                ConfigModule,
                ProvidersModule.registerAsync({
                    imports: [ConfigModule],
                    useFactory: (config: ConfigService<ConfigType, true>) => {
                        return {
                            l1: {
                                rpcUrls: config.get("l1.rpcUrls", { infer: true }),
                                chain: config.get("l1.chain", { infer: true }),
                            },
                        };
                    },
                    extraProviders: [Logger],
                }),
                PricingModule.registerAsync({
                    imports: [
                        ConfigModule,
                        CacheModule.registerAsync({
                            imports: [ConfigModule],
                            inject: [ConfigService],
                            useFactory: (
                                config: ConfigService<ConfigType["pricing"]["cacheOptions"], true>,
                            ) => ({
                                cacheOptions: {
                                    store: "memory",
                                    ttl: config.get("ttl", { infer: true }),
                                },
                            }),
                        }),
                    ],
                    useFactory: (
                        config: ConfigService<Omit<ConfigType["pricing"], "cacheOptions">, true>,
                    ) => {
                        return {
                            pricingOptions: {
                                provider: "coingecko",
                                apiKey: config.get("apiKey", { infer: true }),
                                apiBaseUrl: config.get("apiBaseUrl", { infer: true }),
                                apiType: config.get("apiType", { infer: true }),
                            },
                        };
                    },
                    extraProviders: [Logger],
                }),
            ],
            useFactory: (config: ConfigService) => {
                return {
                    contracts: {
                        bridgeHub: config.get("bridgeHubAddress")!,
                        sharedBridge: config.get("sharedBridgeAddress")!,
                        stateTransitionManager: config.get("stateTransitionManagerAddresses")!,
                    },
                };
            },
            inject: [ConfigService],
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
