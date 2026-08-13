import type { CollectionEntry } from "astro:content";

export type Blog = CollectionEntry<"blogs">;

export const blogSlug = (blog: Blog) => blog.id.replace(/\/index$/, "");

export const blogHref = (post: Blog) => `/blog/${blogSlug(post)}/`;

export const byNewest = (a: Blog, b: Blog) =>
  b.data.date.getTime() - a.data.date.getTime();

export const visibleBlog = (posts: Blog[]) =>
  posts.filter((post) => !post.data.draft).sort(byNewest);

/**
 * Reading time from the raw Markdown body at 220 words per minute, so posts
 * never have to carry a hand-maintained `readMinutes` field.
 */
export const readingMinutes = (blog: Blog) => {
  const words = (blog.body ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
};

export const readingLabel = (blog: Blog) => `${readingMinutes(blog)} min read`;

export const getFeatured = (blog: Blog[], limit = 5) =>
  visibleBlog(blog)
    .filter((blog) => blog.data.featured)
    .slice(0, limit);
