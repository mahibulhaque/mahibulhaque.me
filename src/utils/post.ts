import { getCollection, type CollectionEntry } from "astro:content";

export type Blog = CollectionEntry<"blogs">;

const blogSlug = (blog: Blog) => blog.id.replace(/\/index$/, "");

export const blogHref = (post: Blog) => `/blog/${blogSlug(post)}/`;

const byNewest = (a: Blog, b: Blog) =>
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


/** Category is derived from the top-level folder, e.g. "go/circuit-breaker" -> "go" */
export function getCategory(post: Blog): string {
  return post.id.split("/")[0];
}

/** Adjust to match your actual post route (e.g. /blogs/[...slug].astro) */
export function getPostHref(post: Blog): string {
  return `/${post.id}`;
}

export function formatPostDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export async function getPublishedPosts(): Promise<Blog[]> {
  const posts = await getCollection("blogs", ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Pulls the most recent `featured: true` post out as the hero; falls back to the latest post. */
export function pickFeaturedPost(posts: Blog[]): {
  featured: Blog;
  rest: Blog[];
} {
  const featuredIndex = posts.findIndex((post) => post.data.featured);
  const index = featuredIndex === -1 ? 0 : featuredIndex;
  return {
    featured: posts[index],
    rest: posts.filter((_, i) => i !== index),
  };
}
// ...existing imports and exports above stay the same

export interface YearGroup {
  year: number;
  posts: Blog[];
}

/** Groups posts by calendar year, years sorted descending. Assumes input is already sorted (newest first). */
export function groupPostsByYear(posts: Blog[]): YearGroup[] {
  const groups = new Map<number, Blog[]>();

  for (const post of posts) {
    const year = post.data.date.getFullYear();
    const existing = groups.get(year);
    if (existing) {
      existing.push(post);
    } else {
      groups.set(year, [post]);
    }
  }

  return Array.from(groups.entries())
    .map(([year, yearPosts]) => ({ year, posts: yearPosts }))
    .sort((a, b) => b.year - a.year);
}

/** "Jul 30" style date, used in the archive list where the year is already shown as a group heading. */
export function formatArchiveDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}
export function slugify(tag: string) {
  return tag.toLowerCase().trim().replace(/\s+/g, "-");
}
