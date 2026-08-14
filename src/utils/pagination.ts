// src/utils/pagination.ts

import type { Blog } from "./post";

export interface PageChunk {
  pageNumber: number;
  posts: Blog[];
}

/**
 * Splits the posts NOT shown on the homepage into page/[page] chunks.
 * Homepage is always page 1, so generated routes start at page 2.
 */
export function buildPaginationChunks(
  remainingPosts: Blog[],
  postsPerPage: number,
): PageChunk[] {
  const totalRemainingPages = Math.ceil(remainingPosts.length / postsPerPage);

  return Array.from({ length: totalRemainingPages }, (_, i) => ({
    pageNumber: i + 2, // +2 because page 1 is the homepage
    posts: remainingPosts.slice(i * postsPerPage, (i + 1) * postsPerPage),
  }));
}
