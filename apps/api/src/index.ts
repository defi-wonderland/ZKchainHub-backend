import cors from "cors";
import express, { json } from "express";

import { L1MetricsService } from "@zkchainhub/metrics";
import { CoingeckoService, IPricingService } from "@zkchainhub/pricing";
import { Logger } from "@zkchainhub/shared";

import { EvmProviderService } from "../../../packages/providers/dist/src/internal.js";
import { InMemoryCache } from "./common/cache/inMemoryCache.js";
import { config } from "./common/config/index.js";
import { zodErrorHandler } from "./common/middleware/index.js";
import { MetricsService, metricsRoutes as registerMetricsRoutes } from "./metrics/index.js";

const port = config.port;
const server = express();

const logger = Logger.getInstance();

// instantiate services
const evmProvider = new EvmProviderService(config.l1.rpcUrls, config.l1.chain, logger);
const pricingService: IPricingService = new CoingeckoService(
    {
        apiBaseUrl: config.pricing.pricingOptions.apiBaseUrl,
        apiKey: config.pricing.pricingOptions.apiKey,
        apiType: config.pricing.pricingOptions.apiType,
    },
    new InMemoryCache(),
    logger,
);

const l1Metrics = new L1MetricsService(
    config.bridgeHubAddress,
    config.sharedBridgeAddress,
    config.stateTransitionManagerAddresses,
    evmProvider,
    pricingService,
    logger,
);

const metricsService = new MetricsService(l1Metrics, logger);

// register routes
registerMetricsRoutes(server, metricsService);

// register middlewares
server.use(zodErrorHandler).use(json()).use(cors());

// start server
server.listen(port, () => {
    console.log(`api running on ${port}`);
});
