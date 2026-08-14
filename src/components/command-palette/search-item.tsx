import type { SearchDocument } from "@/types/search";
import { CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

interface Props {
  post: SearchDocument;
  onSelect: () => void;
}

export function SearchResultItem({ post, onSelect }: Props) {
  return (
    <CommandItem
      value={`${post.title} ${post.tags.join(" ")}`}
      onSelect={onSelect}
      className="py-3 flex items-center"
    >
      <div className="flex w-full items-center gap-3 min-w-fit">
        {/* Takes all available space */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{post.title}</p>

          <p className="text-muted-foreground line-clamp-1 text-xs">
            {post.description}
          </p>
        </div>

        {/* Fixed-width metadata */}
        <Badge variant="default" className="capitalize">
          {post.category}
        </Badge>
      </div>
    </CommandItem>
  );
}
