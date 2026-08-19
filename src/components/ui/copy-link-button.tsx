import { useState } from "react";
import { Check, Link } from "lucide-react";
import { cn } from "@/lib/utils";

type CopyLinkButtonProps = {
  url: string;
  title: string;
  className?: string;
};

export function CopyLinkButton({ url, title, className }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "border-border text-muted-foreground hover:text-link hover:border-link flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all hover:-translate-y-0.5",
        className,
      )}
      aria-label={copied ? "Link copied" : `Copy link to ${title}`}
    >
      {copied ? <Check className="h-4 w-4" /> : <Link className="h-4 w-4" />}
    </button>
  );
}
