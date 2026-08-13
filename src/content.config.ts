import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blogs = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/blogs",
  }),

  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
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

const categoryPages = defineCollection({
  loader: glob({
    pattern: "**/[_]*.{md,mdx}",
    base: "./src/content/blogs",
  }),

  schema: () =>
    z.object({
      title: z.string(),
      description: z.string(),
    }),
});

export const collections = {
  blogs: blogs,
  categoryPages: categoryPages,
};
