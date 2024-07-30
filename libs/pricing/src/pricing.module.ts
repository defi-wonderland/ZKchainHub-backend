import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";

import { LoggerModule } from "@zkchainhub/shared";

import { CoingeckoService } from "./services";

@Module({
    imports: [
        LoggerModule,
        CacheModule.register({
            store: "memory",
            ttl: 60, // seconds
        }),
    ],
    providers: [CoingeckoService],
    exports: [CoingeckoService],
})
export class PricingModule {}
