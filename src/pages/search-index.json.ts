import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import type { SearchDocument } from "@/types/search";

export const GET: APIRoute = async () => {
  const posts = await getCollection("blogs", ({ data }) => !data.draft);

  const index: SearchDocument[] = posts.map((post) => ({
    id: post.id,
    title: post.data.title,
    description: post.data.description ?? "",
    tags: post.data.tags,
    category: post.id.split("/")[0],
    date: post.data.date.toISOString(),
    url: `/${post.id}/`,
  }));

  return new Response(JSON.stringify(index), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
};
