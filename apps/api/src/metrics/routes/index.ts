import type { Router } from "express";
import { z } from "zod";

import { ChainNotFound, MetricsService } from "../index.js";

const ChainIdSchema = z.object({
    params: z.object({
        chainId: z
            .number({ required_error: "Chain ID is required", coerce: true })
            .positive("Chain ID must be positive integer")
            .int("Chain ID must be a positive integer"),
    }),
});

export const metricsRoutes = (router: Router, metricsService: MetricsService) => {
    router.get("/metrics/ecosystem", async (_req, res, next) => {
        try {
            const data = await metricsService.getEcosystem();
            res.json(data);
        } catch (error: unknown) {
            next(error);
        }
    });

    router.get("/metrics/zkchain/:chainId", async (req, res, next) => {
        try {
            const { params } = ChainIdSchema.parse(req);

            const data = await metricsService.getChain(params.chainId);
            res.json(data);
        } catch (error: unknown) {
            if (error instanceof ChainNotFound) {
                return res.status(404).json({
                    message: error.message,
                });
            }
            next(error);
        }
    });

    return router;
};
