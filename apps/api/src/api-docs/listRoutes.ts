import { Application } from "express";

import { ILogger } from "@zkchainhub/shared";

// Function to list all routes
export const listRoutes = (app: Application, logger: ILogger) => {
    const routes: string[] = [];

    app._router.stack.forEach((middleware: any) => {
        if (middleware.route) {
            // Route middleware
            const methods = Object.keys(middleware.route.methods).map((method) =>
                method.toUpperCase(),
            );
            routes.push(`Mapped { ${methods.join(", ")} ${middleware.route.path} } route`);
        } else if (middleware.name === "router") {
            // Router middleware (nested routes)
            middleware.handle.stack.forEach((handler: any) => {
                const methods = Object.keys(handler.route.methods).map((method) =>
                    method.toUpperCase(),
                );
                routes.push(`${methods.join(", ")} ${middleware.regexp} -> ${handler.route.path}`);
            });
        }
    });

    routes.forEach((route) => logger.info(route));
};
