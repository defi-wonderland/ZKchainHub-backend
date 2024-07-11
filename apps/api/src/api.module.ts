import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ProvidersModule } from "@packages/providers";

import { ApiController } from "./api.controller";
import { RequestLoggerMiddleware } from "./common/middleware/request.middleware";
import { MetricsController } from "./metrics/metrics.controller";

@Module({
    imports: [ProvidersModule],
    controllers: [ApiController, MetricsController],
    providers: [],
})
export class ApiModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(RequestLoggerMiddleware).exclude("/docs", "/docs/(.*)").forRoutes("*");
    }
}
