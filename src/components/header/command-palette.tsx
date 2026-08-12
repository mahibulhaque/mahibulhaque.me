import { HomeIcon, InboxIcon, SearchIcon } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

type ActionItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut: string[]; // e.g. ["G", "H"]
  action: () => void;
};

function goTo(path: string) {
  window.location.href = path;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  const runAction = useCallback((fn: () => void) => {
    fn();
    setOpen(false);
  }, []);

  const navItems: ActionItem[] = [
    {
      id: "home",
      label: "Home",
      icon: <HomeIcon />,
      shortcut: ["G", "H"],
      action: () => goTo("/"),
    },
    {
      id: "archives",
      label: "Archives",
      icon: <InboxIcon />,
      shortcut: ["G", "A"],
      action: () => goTo("/archives"),
    },
    {
      id: "tags",
      label: "Tags",
      shortcut: ["G", "T"],
      action: () => goTo("/tags"),
    },
    {
      id: "about",
      label: "About",
      shortcut: ["G", "P"],
      action: () => goTo("/about"),
    },
    {
      id: "maxims",
      label: "Maxims",
      shortcut: ["G", "M"],
      action: () => goTo("/maxims"),
    },
  ];

  const actionItems: ActionItem[] = [
    {
      id: "theme",
      label: "Toggle Theme",
      shortcut: ["G", "D"],
      action: () => {
        document.documentElement.classList.toggle("dark");
      },
    },
  ];

  const allItems = [...navItems, ...actionItems];

  useEffect(() => {
    let sequence = "";
    let sequenceTimer: ReturnType<typeof setTimeout>;

    const down = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isTyping) return;

      if (e.key === "/") {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }

      clearTimeout(sequenceTimer);
      sequence += e.key.toLowerCase();
      sequenceTimer = setTimeout(() => (sequence = ""), 600);

      const match = allItems.find(
        (item) => item.shortcut.join("").toLowerCase() === sequence,
      );
      if (match) {
        e.preventDefault();
        runAction(match.action);
        sequence = "";
      }
    };

    document.addEventListener("keydown", down);
    return () => {
      document.removeEventListener("keydown", down);
      clearTimeout(sequenceTimer);
    };
  }, [allItems, runAction]);

  return (
    <div className="flex flex-col gap-4">
      <Button onClick={() => setOpen(true)} variant="outline" className="w-fit">
        <SearchIcon />
        Search
        <Kbd data-icon="inline-end" className="translate-x-0.5">
          /
        </Kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              {navItems.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => runAction(item.action)}
                >
                  {item.icon}
                  <span>{item.label}</span>
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
            <CommandGroup heading="Actions">
              {actionItems.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => runAction(item.action)}
                >
                  <span>{item.label}</span>
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
