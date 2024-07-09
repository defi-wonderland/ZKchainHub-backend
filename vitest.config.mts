import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        include: ["{apps,libs}/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
        root: "./",
        coverage: {
            include: ["{apps,libs}/**/*.?(c|m)[jt]s"],
            exclude: [
                "node_modules/**",
                "dist/**",
                "coverage/**",
                "**/[.]**",
                "**/*.d.ts",
                "**/main.ts",
                "**/*.module.ts",
                "**/*{.,-}{test,spec}?(-d).?(c|m)[jt]s?(x)",
                "**/__tests__/**",
            ],
            provider: "v8",
            reporter: ["text", "json", "html"],
        },
    },
    plugins: [
        // This is required to build the test files with SWC
        swc.vite({
            // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
            module: { type: "es6" },
        }),
    ],
});
