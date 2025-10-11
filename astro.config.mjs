// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";

import mdx from "@astrojs/mdx";

import path from "path";

import { fileURLToPath } from "url";

import expressiveCode from "astro-expressive-code";

import behead from "remark-behead";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
	site: "https://mahibulhaque.me",
	integrations: [
		expressiveCode({
			themes: ["rose-pine-moon"],
			styleOverrides: {
				codeFontSize: "1.05rem",
				borderRadius: "0.6rem",
				frames: {
					shadowColor: "transparent",
				},
			},
		}),
		react(),
		mdx(),
	],
	markdown: {
		remarkPlugins: [
			[
				behead,
				{
					minDepth: 2,
				},
			],
		],
		gfm: true,
		shikiConfig: {
			theme: "rose-pine-moon",
		},
	},

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
