import { inspect } from "util";

import { ILogger } from "@zkchainhub/shared";

import { App } from "./app.js";
import { config } from "./common/config/index.js";
import { Container } from "./container.js";

const container = new Container(config);
const logger = container.get<ILogger>("ILogger");

const main = async (): Promise<void> => {
    const app = new App(config, [container.get("MetricsRouter")], logger);

    app.listen();
};

process.on("unhandledRejection", (reason, p) => {
    logger.error(`Unhandled Rejection at: \n${inspect(p, undefined, 100)}, \nreason: ${reason}`);
});

process.on("uncaughtException", (error: Error) => {
    logger.error(`An uncaught exception occurred: ${error}\n` + `Exception origin: ${error.stack}`);
});

main().catch((err) => {
    logger.error(`Caught error in main handler: ${err}`);
});
