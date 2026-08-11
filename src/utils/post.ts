import type { CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

export const postSlug = (post: Post) => post.id.replace(/\/index$/, "");

export const postHref = (post: Post) => `/post/${postSlug(post)}/`;

export const byNewest = (a: Post, b: Post) =>
  b.data.date.getTime() - a.data.date.getTime();

export const visiblePosts = (posts: Post[]) =>
  posts.filter((post) => !post.data.draft).sort(byNewest);

/**
 * Reading time from the raw Markdown body at 220 words per minute, so posts
 * never have to carry a hand-maintained `readMinutes` field.
 */
export const readingMinutes = (post: Post) => {
  const words = (post.body ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
};

export const readingLabel = (post: Post) => `${readingMinutes(post)} min read`;

export const getFeatured = (posts: Post[], limit = 5) =>
  visiblePosts(posts)
    .filter((post) => post.data.featured)
    .slice(0, limit);
