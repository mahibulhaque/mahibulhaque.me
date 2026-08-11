// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import cloudflare from "@astrojs/cloudflare";

import mdx from "@astrojs/mdx";

import { siteConfig } from "./src/config/site.ts";

import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import rehypeSlug from "rehype-slug";
import { blogTheme } from "@/lib/shiki-theme.ts";

// https://astro.build/config
export default defineConfig({
  site: siteConfig.siteUrl,
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) =>
        // eslint-disable-next-line no-undef
        page !== new URL("/search/", siteConfig.siteUrl).toString(),
    }),
  ],

  markdown: {
    processor: unified({
      rehypePlugins: [rehypeSlug],
    }),
    shikiConfig: {
      themes: {
        light: blogTheme,
        dark: blogTheme,
      },
    },
  },
  adapter: cloudflare(),
});
