import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "./navbar";
import { ThemeProvider } from "../providers/theme-provider";

export function NavbarIsland() {
  return (
    <ThemeProvider>
      <TooltipProvider delay={0}>
        <Navbar />
      </TooltipProvider>
    </ThemeProvider>
  );
}
