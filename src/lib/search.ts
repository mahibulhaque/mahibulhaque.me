import type { SearchDocument } from "@/types/search";

function rank(doc: SearchDocument, query: string) {
  const q = query.toLowerCase();

  const title = doc.title.toLowerCase();
  const description = doc.description.toLowerCase();
  const tags = doc.tags.join(" ").toLowerCase();
  const category = doc.category.toLowerCase();

  if (title.startsWith(q)) return 0;
  if (title.includes(q)) return 1;
  if (tags.includes(q)) return 2;
  if (category.includes(q)) return 3;
  if (description.includes(q)) return 4;

  return Infinity;
}

export function searchDocuments(
  documents: SearchDocument[],
  query: string,
  limit = 8,
) {
  if (!query.trim()) return [];

  return documents
    .map((doc) => ({ doc, score: rank(doc, query) }))
    .filter(({ score }) => Number.isFinite(score))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map(({ doc }) => doc);
}
