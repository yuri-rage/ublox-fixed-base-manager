import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import express from "./express-plugin";

export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: [['module:@preact/signals-react-transform']],
            },
        }),
        express('src/server/server.ts'),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
