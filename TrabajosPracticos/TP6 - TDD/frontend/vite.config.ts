import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";

// https://vite.dev/config/
const apiTarget = process.env.API_TARGET ?? "http://127.0.0.1:3000";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        host: "127.0.0.1",
        proxy: { "/api": apiTarget },
    },
    preview: {
        host: "127.0.0.1",
        proxy: { "/api": apiTarget },
    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
});
