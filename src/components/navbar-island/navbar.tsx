import { Dock, DockIcon } from "@/components/ui/dock";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NAVBAR_DATA } from "@/constants/navbar-data.constant";
import { AnimatedThemeToggler } from "../ui/animated-theme-toggler";
import { useTheme } from "../providers/theme-provider";

export default function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30">
      <Dock className="bg-card/90 shadow-primary/5 pointer-events-auto relative z-50 mx-auto flex h-14 w-fit gap-2 border p-2 shadow-[0_0_10px_3px] backdrop-blur-3xl">
        {NAVBAR_DATA.navbar.map((item) => {
          const isExternal = item.href.startsWith("http");

          return (
            <DockIcon
              key={item.href}
              className="border-border bg-background text-foreground hover:bg-muted hover:text-foreground relative size-full cursor-pointer rounded-2xl border p-0 transition-colors"
            >
              <Tooltip>
                <TooltipTrigger
                  render={
                    <a
                      href={item.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="absolute inset-0 flex items-center justify-center rounded-2xl"
                    />
                  }
                >
                  <item.icon className="size-6 shrink-0" />
                </TooltipTrigger>

                <TooltipContent
                  side="top"
                  sideOffset={8}
                  className="bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
                >
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          );
        })}

        <Separator
          orientation="vertical"
          className="bg-border m-auto h-2/3 w-px"
        />

        {Object.entries(NAVBAR_DATA.contact.social)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .filter(([_, social]) => social.navbar)
          .map(([name, social], index) => {
            const isExternal = social.url.startsWith("http");
            const IconComponent = social.icon;

            return (
              <DockIcon
                key={`social-${name}-${index}`}
                className="border-border bg-background text-foreground hover:bg-muted hover:text-foreground relative size-full cursor-pointer rounded-3xl border p-0 transition-colors"
              >
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <a
                        href={social.url}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        className="absolute inset-0 flex items-center justify-center rounded-3xl"
                      />
                    }
                  >
                    <IconComponent className="size-6 shrink-0" />
                  </TooltipTrigger>

                  <TooltipContent
                    side="top"
                    sideOffset={8}
                    className="bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
                  >
                    <p>{name}</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>
            );
          })}

        <Separator
          orientation="vertical"
          className="bg-border m-auto h-2/3 w-px"
        />

        <DockIcon className="border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground relative size-full cursor-pointer rounded-3xl border p-0 transition-colors">
          <Tooltip>
            <TooltipTrigger
              render={
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl" />
              }
            >
              <AnimatedThemeToggler
                className="flex h-full w-full cursor-pointer items-center justify-center self-center"
                theme={theme}
                onThemeChange={setTheme}
              />
            </TooltipTrigger>

            <TooltipContent
              side="top"
              sideOffset={8}
              className="bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
            >
              <p>Theme</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
      </Dock>
    </div>
  );
}
