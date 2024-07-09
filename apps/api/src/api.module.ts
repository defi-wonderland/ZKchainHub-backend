import { Module } from "@nestjs/common";

import { AnotherTestService } from "./anotherTest.service";
import { ApiController } from "./api.controller";
import { ApiService } from "./api.service";

@Module({
    imports: [],
    controllers: [ApiController],
    providers: [ApiService, AnotherTestService],
})
export class ApiModule {}
