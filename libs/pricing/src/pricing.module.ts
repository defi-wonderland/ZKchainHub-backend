import { Module } from "@nestjs/common";

import { CoingeckoService } from "./services";

@Module({
    imports: [],
    providers: [CoingeckoService],
    exports: [CoingeckoService],
})
export class PricingModule {}
