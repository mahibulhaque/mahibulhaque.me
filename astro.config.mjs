// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import mdx from "@astrojs/mdx";

import { siteConfig } from "./src/config/site.ts";

import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import rehypeSlug from "rehype-slug";

import expressiveCode from "astro-expressive-code";
import { expressiveCodeOptions } from "@/config/expressive-code.ts";

// https://astro.build/config
export default defineConfig({
  site: siteConfig.url,
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    react(),
    expressiveCode(expressiveCodeOptions),
    mdx(),
    sitemap({
      filter: (page) =>
        // eslint-disable-next-line no-undef
        page !== new URL("/search/", siteConfig.url).toString(),
    }),
  ],

  markdown: {
    processor: unified({
      rehypePlugins: [rehypeSlug],
    }),
  },
});
