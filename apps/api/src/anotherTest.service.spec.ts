import { createMock } from "@golevelup/ts-vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { vi } from "vitest";

import { AnotherTestService } from "./anotherTest.service";
import { ApiService } from "./api.service";

describe("AnotherTestService", () => {
    let anotherTestService: AnotherTestService;
    let apiService: ApiService;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            providers: [AnotherTestService, ApiService],
        })
            .useMocker(createMock())
            .compile();

        anotherTestService = app.get<AnotherTestService>(AnotherTestService);
        apiService = app.get<ApiService>(ApiService);
    });

    describe("getHello", () => {
        it('should return "Hello World!"', () => {
            const result = anotherTestService.getHello();
            expect(result).toBe("Hello World!");
        });
    });

    describe("getHelloFromApiService", () => {
        it("should return the result from apiService.getHello", () => {
            console.log(apiService);
            vi.spyOn(apiService, "getHello").mockReturnValue("Hello from ApiService");
            const result = anotherTestService.getHelloFromApiService();
            expect(result).toBe("Hello from ApiService");
            expect(apiService.getHello).toHaveBeenCalled();
        });
    });
});
