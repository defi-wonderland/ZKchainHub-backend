import { z } from "zod";

import { ILogger } from "@zkchainhub/shared";

import { BaseRouter } from "../../common/routes/baseRouter.js";
import { ChainNotFound, MetricsController } from "../index.js";

const ChainIdSchema = z.object({
    params: z.object({
        chainId: z
            .number({ required_error: "Chain ID is required", coerce: true })
            .positive("Chain ID must be positive integer")
            .int("Chain ID must be a positive integer"),
    }),
});

/**
 * @swagger
 * tags:
 *   name: Metrics
 *   description: Metrics related API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AssetDistribution:
 *       type: object
 *       additionalProperties:
 *         type: number
 *       example:
 *         ETH: 1000000
 *         ZK: 500000
 *       description: A map of asset names to their respective amounts.
 *     BatchesInfo:
 *       type: object
 *       properties:
 *         commited:
 *           type: string
 *           example: "100"
 *           description: The number of committed batches.
 *         verified:
 *           type: string
 *           example: "80"
 *           description: The string of verified batches.
 *         executed:
 *           type: string
 *           example: "60"
 *           description: The string of executed batches.
 *     FeeParams:
 *       type: object
 *       properties:
 *         batchOverheadL1Gas:
 *           type: number
 *           example: 200
 *           description: The overhead L1 gas for batch.
 *         maxPubdataPerBatch:
 *           type: number
 *           example: 1000
 *           description: The maximum pubdata per batch.
 *         maxL2GasPerBatch:
 *           type: number
 *           example: 500
 *           description: The maximum L2 gas per batch.
 *         priorityTxMaxPubdata:
 *           type: number
 *           example: 100
 *           description: The maximum pubdata for priority transactions.
 *         minimalL2GasPrice:
 *           type: string
 *           example: "0.001"
 *           description: The minimal L2 gas price.
 *     EthGasInfo:
 *       type: object
 *       properties:
 *         gasPrice:
 *           type: string
 *           example: "100"
 *           description: The gas price.
 *         ethTransfer:
 *           type: string
 *           example: "21000"
 *           description: The gas cost for ETH transfer.
 *         erc20Transfer:
 *           type: string
 *           example: "30000"
 *           description: The gas cost for ERC20 transfer.
 *         ethPrice:
 *           type: string
 *           example: "3000"
 *           description: The price of ETH in USD.
 *     L2ChainInfo:
 *       type: object
 *       properties:
 *         tps:
 *           type: number
 *           example: 1000
 *           description: Transactions per second.
 *         avgBlockTime:
 *           type: number
 *           example: 5
 *           description: Average block time in seconds.
 *         lastBlock:
 *           type: number
 *           example: 123456
 *           description: The number of the last block.
 *         lastBlockVerified:
 *           type: number
 *           example: 123455
 *           description: The number of the last verified block.
 *     ZKChainInfo:
 *       type: object
 *       properties:
 *         chainType:
 *           type: string
 *           example: "rollup"
 *           description: The type of chain.
 *         baseToken:
 *           type: object
 *           properties:
 *             symbol:
 *               type: string
 *               example: "ETH"
 *               description: Token symbol.
 *             decimals:
 *               type: number
 *               example: 18
 *               description: Number of decimals.
 *           description: The native token of the chain (optional).
 *         tvl:
 *           $ref: "#/components/schemas/AssetDistribution"
 *           description: A map of asset names to their respective amounts.
 *         batchesInfo:
 *           $ref: "#/components/schemas/BatchesInfo"
 *           description: Optional batches information.
 *         feeParams:
 *           $ref: "#/components/schemas/FeeParams"
 *           description: The fee parameters.
 *         metadata:
 *           $ref: "#/components/schemas/ZkChainMetadata"
 *           description: Optional metadata.
 *         l2ChainInfo:
 *           $ref: "#/components/schemas/L2ChainInfo"
 *           description: Optional Layer 2 chain information.
 *     EcosystemInfo:
 *       type: object
 *       properties:
 *         l1Tvl:
 *           $ref: "#/components/schemas/AssetDistribution"
 *           description: A map of asset names to their respective amounts for L1.
 *         ethGasInfo:
 *           $ref: "#/components/schemas/EthGasInfo"
 *           description: The Ethereum gas information.
 *         zkChains:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/ZKChainSummary"
 *           description: An array of ZK chain summaries.
 *     ZKChainSummary:
 *       type: object
 *       properties:
 *         chainId:
 *           type: string
 *           example: "1"
 *           description: The ID of the chain.
 *         chainType:
 *           type: string
 *           example: "rollup"
 *           description: The type of chain.
 *         baseToken:
 *           type: object
 *           properties:
 *             symbol:
 *               type: string
 *               example: "ETH"
 *               description: Token symbol.
 *             decimals:
 *               type: number
 *               example: 18
 *               description: Number of decimals.
 *           description: The native token of the chain (optional).
 *         tvl:
 *           type: string
 *           example: "5000000"
 *           description: The total value locked in the chain.
 *         metadata:
 *           type: object
 *           description: Metadata flag (optional).
 *         rpc:
 *           type: boolean
 *           example: true
 *           description: RPC flag (optional).
 *     ZkChainMetadata:
 *       type: object
 *       properties:
 *         iconUrl:
 *           type: string
 *           example: "https://example.com/icon.png"
 *           description: The URL of the chain's icon (optional).
 *         name:
 *           type: string
 *           example: "Example Chain"
 *           description: The name of the chain.
 *         publicRpcs:
 *           type: array
 *           items:
 *             type: string
 *           example: ["https://rpc.example.com"]
 *           description: An array of public RPCs.
 *         explorerUrl:
 *           type: string
 *           example: "https://explorer.example.com"
 *           description: The URL of the chain's explorer.
 *         launchDate:
 *           type: number
 *           example: 1638307200
 *           description: The launch date of the chain (timestamp).
 */
export class MetricsRouter extends BaseRouter {
    constructor(
        private readonly metricsController: MetricsController,
        private readonly logger: ILogger,
    ) {
        super("/metrics");
    }

    protected initializeRoutes(): void {
        /**
         * @swagger
         * /metrics/ecosystem:
         *   get:
         *     summary: Get ecosystem metrics
         *     tags: [Metrics]
         *     responses:
         *       200:
         *         description: Returns the ecosystem information.
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/EcosystemInfo'
         *       500:
         *         description: Internal server error.
         */
        /**
         * Retrieves the ecosystem information.
         * @returns {Promise<EcosystemInfo>} The ecosystem information.
         */
        this.router.get("/ecosystem", async (_req, res, next) => {
            try {
                const data = await this.metricsController.getEcosystem();
                res.json(data);
            } catch (error: unknown) {
                this.logger.error(JSON.stringify(error));
                next(error);
            }
        });

        /**
         * @swagger
         * /metrics/zkchain/{chainId}:
         *   get:
         *     summary: Get metrics for a specific chain
         *     tags: [Metrics]
         *     parameters:
         *       - in: path
         *         name: chainId
         *         required: true
         *         schema:
         *           type: integer
         *           minimum: 1
         *         description: The ID of the chain
         *     responses:
         *       200:
         *         description: Returns the chain information.
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/ZKChainInfo'
         *       404:
         *         description: Chain not found.
         *       500:
         *         description: Internal server error.
         */
        /**
         * Retrieves the chain information for the specified chain ID.
         * @param {number} chainId - The ID of the chain.
         * @returns {Promise<ZKChainInfo>} The chain information.
         */
        this.router.get("/zkchain/:chainId", async (req, res, next) => {
            try {
                const { params } = ChainIdSchema.parse(req);

                const data = await this.metricsController.getChain(params.chainId);
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
    }
}
