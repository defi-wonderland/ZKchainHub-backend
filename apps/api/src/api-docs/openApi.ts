import { Express } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import { ConfigType } from "../common/config/index.js";

export const setupOpenApiConfiguration = (app: Express, config: ConfigType) => {
    const options = {
        definition: {
            openapi: "3.0.0",
            info: {
                title: "ZKchainHub API",
                description: "Documentation for ZKchainHub API",
                version: "1.0",
            },
            servers: [
                {
                    url: `http://localhost:${config.port}`, // Update this URL as needed
                },
            ],
        },
        apis: ["./src/**/routes/*.ts"],
    };

    const swaggerSpec = swaggerJSDoc(options);

    app.use(
        "/docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, {
            customSiteTitle: "ZKchainHub API Documentation",
        }),
    );
};
