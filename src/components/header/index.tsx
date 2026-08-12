import { siteConfig } from "@/config/site";
import { CommandPalette } from "../command-palette";

export default function SiteHeader() {
  return (
    <header className="relative z-20 mx-auto flex max-w-none flex-nowrap items-center justify-between gap-2 px-[clamp(0.5rem,2vw,2rem)] py-3">
      <a
        href="/"
        className="box-border block h-[32px] min-w-0 shrink overflow-hidden font-mono font-normal tracking-tight text-ellipsis whitespace-nowrap uppercase"
      >
        {siteConfig.siteTitle}
      </a>
      <CommandPalette />
    </header>
  );
}
