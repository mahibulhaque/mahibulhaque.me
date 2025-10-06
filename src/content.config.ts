import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

export const postSchema = z.object({
	pageTitle: z.string().optional(),
	title: z.string(),
	published: z.date(),
	edited: z.date().optional(),
	tags: z.array(z.string()),
	unlisted: z.boolean().optional(),
	shortDescription: z.string().optional(),
	onPageTitlePrefix: z.string().optional(),
	contents: z
		.union([
			z.boolean(),
			z.object({
				enabled: z.boolean().optional(),
				open: z.boolean().optional(),
			}),
		])
		.optional(),
});

const posts = defineCollection({
	loader: glob({
		pattern: "**/*.{md,mdx}", // match all Markdown/MDX files
		base: "./src/content/posts", // folder where posts live
	}),
	schema: postSchema,
});

export const collections = {
	posts,
};
