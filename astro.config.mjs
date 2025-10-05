// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";

import mdx from "@astrojs/mdx";

import path from "path";

import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
	site: "https://mahibulhaque.me",
	integrations: [react(), mdx()],

	vite: {
		resolve: {
			alias: {
				"@components": path.resolve(__dirname, "./src/components"),
				"@layouts": path.resolve(__dirname, "./src/layouts"),
				"@utils": path.resolve(__dirname, "./src/utils"),
			},
		},
		plugins: [tailwindcss()],
	},
});
