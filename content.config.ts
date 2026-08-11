import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const posts = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/posts",
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string(),
      date: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).min(1),
      aliases: z.array(z.string()).optional(),
      discussions: z
        .array(
          z.object({
            label: z.string(),
            url: z.url(),
          }),
        )
        .default([]),

      cover: z
        .object({
          src: image(),
          alt: z.string(),
          creditName: z.string().optional(),
          creditUrl: z.url().optional(),
        })
        .optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

export const collections = { posts };
