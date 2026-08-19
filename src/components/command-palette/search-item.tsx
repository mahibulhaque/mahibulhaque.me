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
      className="flex items-center py-3"
    >
      <div className="flex w-full min-w-fit items-center gap-3">
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
