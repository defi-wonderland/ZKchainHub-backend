import type { Express } from "express";
import cors from "cors";
import express, { json } from "express";

export const createServer = (): Express => {
    const app = express();
    app.use(json()).use(cors());

    return app;
};
