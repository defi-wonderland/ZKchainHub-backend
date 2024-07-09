import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        include: ["{apps,libs}/**/*.e2e-spec.ts"],
        globals: true,
        root: "./",
    },
    plugins: [swc.vite()],
});
