import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export const setupOpenApiConfiguration = (app: INestApplication<any>) => {
    const config = new DocumentBuilder()
        .setTitle("zkChainHub API")
        .setDescription("Documentation for zkChainHub API")
        .setVersion("1.0")
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, document, {
        customSiteTitle: "zkChainHub API Documentation",
    });
};
