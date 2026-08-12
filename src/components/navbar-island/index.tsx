import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "./navbar";

export function NavbarIsland() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider delay={0}>
        <Navbar />
      </TooltipProvider>
    </ThemeProvider>
  );
}
