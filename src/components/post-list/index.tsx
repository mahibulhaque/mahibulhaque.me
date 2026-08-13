import { useState, useRef } from "react";

interface Post {
  id: string;
  title: string;
  date: string;
}

interface PostListProps {
  posts: Post[];
  pageSize?: number;
}

export function PostList({ posts, pageSize = 15 }: PostListProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const totalPages = Math.ceil(posts.length / pageSize);

  const start = currentPage * pageSize;
  const end = start + pageSize;
  const currentPosts = posts.slice(start, end);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

  const goTo = (page: number) => {
    setCurrentPage(page);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={listRef}>
      <ul className="divide-border/60 divide-y">
        {currentPosts.map((post) => (
          <li key={post.id} className="py-5 first:pt-0 last:pb-0">
            <a
              href={`/${post.id}`}
              className="group flex items-baseline justify-between gap-6"
            >
              <span className="text-foreground/90 group-hover:text-foreground text-[15px] leading-snug font-normal transition-colors sm:text-base">
                {post.title}
              </span>
              <time
                className="text-muted-foreground/50 shrink-0 text-xs tabular-nums"
                dateTime={post.date}
              >
                {formatDate(post.date)}
              </time>
            </a>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <nav
          className="border-border/60 mt-10 flex items-center justify-between border-t pt-6"
          aria-label="Pagination"
        >
          <button
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage === 0}
            className="disabled:text-muted-foreground/25 text-muted-foreground hover:text-foreground text-sm transition-colors disabled:cursor-default"
          >
            ← Previous
          </button>

          <span className="text-muted-foreground/40 text-xs tabular-nums">
            {currentPage + 1} / {totalPages}
          </span>

          <button
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="disabled:text-muted-foreground/25 text-muted-foreground hover:text-foreground text-sm transition-colors disabled:cursor-default"
          >
            Next →
          </button>
        </nav>
      )}
    </div>
  );
}
