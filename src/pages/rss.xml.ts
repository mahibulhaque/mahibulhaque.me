import { getCollection } from "astro:content";
import { siteConfig } from "@/config/site";
import { blogHref, visibleBlog } from "@/utils/post";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET() {
  const posts = visibleBlog(await getCollection("blogs")).slice(0, 20);
  const items = posts
    .map((post) => {
      const url = new URL(blogHref(post), siteConfig.url).toString();
      return `<item>
  <title>${escapeXml(post.data.title)}</title>
  <link>${url}</link>
  <guid>${url}</guid>
  <pubDate>${post.data.date.toUTCString()}</pubDate>
  <description>${escapeXml(post.data.description ?? '')}</description>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(siteConfig.title)}</title>
  <link>${siteConfig.url}</link>
  <description>${escapeXml(siteConfig.description)}</description>
  <language>${escapeXml(siteConfig.language)}</language>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
