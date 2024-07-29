import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";

import { CoingeckoService } from "./services";

@Module({
    imports: [HttpModule],
    providers: [CoingeckoService],
    exports: [CoingeckoService],
})
export class PricingModule {}
