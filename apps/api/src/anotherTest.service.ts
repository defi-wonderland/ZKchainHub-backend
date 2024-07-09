import { Injectable } from "@nestjs/common";

import { ApiService } from "./api.service";

// this is just a service to show testing setup and dependency mocking
@Injectable()
export class AnotherTestService {
    constructor(private readonly apiService: ApiService) {}
    getHello(): string {
        return "Hello World!";
    }

    getHelloFromApiService(): string {
        return this.apiService.getHello();
    }
}
