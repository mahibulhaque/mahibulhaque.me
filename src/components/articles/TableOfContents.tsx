import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface Heading {
  depth: number;
  slug: string;
  text: string;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const items = headings.filter((h) => h.depth === 2 || h.depth === 3);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveSlug(visible.target.id);
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );

    items.forEach(({ slug }) => {
      const el = document.getElementById(slug);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border-border bg-card/40 mb-10 rounded-md border"
    >
      <CollapsibleTrigger className="text-foreground flex w-full items-center justify-between px-4 py-3 text-sm font-medium">
        Table of contents
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <nav
          aria-label="Table of contents"
          className="border-border border-t px-4 py-3"
        >
          <ul className="space-y-2 text-sm">
            {items.map((heading) => (
              <li
                key={heading.slug}
                style={{ paddingLeft: `${(heading.depth - 2) * 1}rem` }}
              >
                <a
                  href={`#${heading.slug}`}
                  className={cn(
                    "text-muted-foreground hover:text-foreground block transition-colors",
                    activeSlug === heading.slug &&
                      "text-foreground font-medium",
                  )}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </CollapsibleContent>
    </Collapsible>
  );
}
