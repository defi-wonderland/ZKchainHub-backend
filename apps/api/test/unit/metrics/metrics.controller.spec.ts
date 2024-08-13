import { createMock } from "@golevelup/ts-jest";
import { Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { L1MetricsService } from "@zkchainhub/metrics/l1";

import { MetricsController } from "../../../src/metrics/metrics.controller";
import { getEcosystemInfo, getZKChainInfo } from "../../../src/metrics/mocks/metrics.mock";

export const mockLogger: Partial<Logger> = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
};

describe("MetricsController", () => {
    let controller: MetricsController;
    let l1MetricsService: L1MetricsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: Logger,
                    useValue: mockLogger,
                },
                {
                    provide: L1MetricsService,
                    useValue: createMock<L1MetricsService>(),
                },
            ],
            controllers: [MetricsController],
        }).compile();

        controller = module.get<MetricsController>(MetricsController);
        l1MetricsService = module.get<L1MetricsService>(L1MetricsService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
        expect(l1MetricsService).toBeDefined();
    });

    describe("getEcosystem", () => {
        it("should return the ecosystem information", async () => {
            const expectedInfo = getEcosystemInfo();

            const result = await controller.getEcosystem();

            expect(result).toEqual(expectedInfo);
        });
    });

    describe("getChain", () => {
        it("should return the chain information for the specified chain ID", async () => {
            const chainId = 123;
            const expectedInfo = getZKChainInfo(chainId);

            const result = await controller.getChain(chainId);

            expect(result).toEqual(expectedInfo);
        });
    });
});
