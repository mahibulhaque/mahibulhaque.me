import { navigate } from "astro:transitions/client";
import { SearchIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useHotkey,
  useHotkeySequences,
  type Hotkey,
} from "@tanstack/react-hotkeys";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useDocumentSearch } from "@/hooks/useDocumentSearch";
import { SearchResultItem } from "./search-item";

type ActionItem = {
  id: string;
  label: string;
  description: string;
  shortcut: Hotkey[];
  action: () => void;
};

function goTo(path: string) {
  navigate(path);
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState<string>("");

  const { results, loading } = useDocumentSearch({ query:query , enabled:open});

  const runAction = useCallback((fn: () => void) => {
    fn();
    setOpen(false);
  }, []);

  const navItems: ActionItem[] = useMemo(
    () => [
      {
        id: "home",
        label: "Home",
        description: "Return to latest writing",
        shortcut: ["G", "H"],
        action: () => goTo("/"),
      },
      {
        id: "archives",
        label: "Archives",
        description: "Browse every post",
        shortcut: ["G", "A"],
        action: () => goTo("/archives"),
      },
      {
        id: "tags",
        label: "Tags",
        description: "Browse writing by topic",
        shortcut: ["G", "T"],
        action: () => goTo("/tags"),
      },
      {
        id: "about",
        label: "About",
        description: "Profile, work, and ways to connect",
        shortcut: ["G", "P"],
        action: () => goTo("/about"),
      },
      {
        id: "maxims",
        label: "Maxims",
        description: "Short principles and reminders",
        shortcut: ["G", "M"],
        action: () => goTo("/maxims"),
      },
      {
        id: 'papershelf',
        label: "Papershelf",
        description: "Collection of papers I read",
        shortcut: ["G", "S"],
        action: ()=>goTo("/papershelf")
      }
    ],
    [],
  );

  const actionItems: ActionItem[] = useMemo(
    () => [
      {
        id: "theme",
        label: "Toggle Theme",
        description: "Switch between light and dark",
        shortcut: ["G", "D"],
        action: () => {
          document.documentElement.classList.toggle("dark");
        },
      },
    ],
    [],
  );

  const allItems = useMemo(
    () => [...navItems, ...actionItems],
    [navItems, actionItems],
  );

  // Toggle the palette. Single-key hotkeys are ignored while typing in a
  // real input by default, so this won't fire out from under someone
  // typing "/" into a text field.
  useHotkey("/", () => setOpen((prev) => !prev));

  // Every nav/action item also gets its "G <key>" chord registered as a
  // sequence, derived straight from the item list.
  useHotkeySequences(
    allItems.map((item) => ({
      sequence: item.shortcut,
      callback: () => runAction(item.action),
      options: {
        meta: { name: item.label, description: item.description },
      },
    })),
  );


  useEffect(() => {
    setQuery("")
  }, [open])

  return (
    <div className="flex flex-col gap-4">
      <Button
        onClick={() => setOpen(true)}
        variant={"outline"}
        className="w-fit"
      >
        <SearchIcon />
        Search
        <Kbd data-icon="inline-end" className="translate-x-0.5">
          /
        </Kbd>
      </Button>
      <CommandDialog className="min-w-[90vw] sm:min-w-xl " open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Search everything..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandSeparator alwaysRender className="my-2" />
          <CommandList>
            {query.length > 0 && (
              <>
                <CommandGroup heading="SEARCH RESULTS">
                  {loading && <CommandItem disabled>Loading...</CommandItem>}

                  {!loading &&
                    results.map((post) => (
                      <SearchResultItem
                        key={post.id}
                        post={post}
                        onSelect={() => runAction(() => goTo(post.url))}
                      />
                    ))}
                </CommandGroup>

                <CommandSeparator  alwaysRender className="my-2"/>
              </>
            )}
            <CommandGroup heading="NAVIGATION">
              {navItems.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => runAction(item.action)}
                >
                  <span className="flex flex-col gap-1">
                    <strong className="text-foreground text-sm font-medium">
                      {item.label}
                    </strong>
                    <small className="text-muted-foreground text-xs font-normal">
                      {item.description}
                    </small>
                  </span>
                  <CommandShortcut>
                    <KbdGroup>
                      {item.shortcut.map((key) => (
                        <Kbd key={key}>{key}</Kbd>
                      ))}
                    </KbdGroup>
                  </CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="ACTIONS">
              {actionItems.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => runAction(item.action)}
                >
                  <span className="flex flex-col gap-1">
                    <strong className="text-foreground text-sm font-medium">
                      {item.label}
                    </strong>
                    <small className="text-muted-foreground text-xs font-normal">
                      {item.description}
                    </small>
                  </span>
                  <CommandShortcut>
                    <KbdGroup>
                      {item.shortcut.map((key) => (
                        <Kbd key={key}>{key}</Kbd>
                      ))}
                    </KbdGroup>
                  </CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}
