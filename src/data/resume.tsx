import { Icons } from "@/components/icons";
import { House, Library } from "lucide-react";

export const DATA = {
  navbar: [
    { href: "/", icon: House, label: "Home" },
    { href: "/blog", icon: Library, label: "Blog" },
  ],
  contact: {
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/mahibulhaque",
        icon: Icons.github,
        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://linkedin.com/in/mahibulhaque",
        icon: Icons.linkedin,
        navbar: true,
      },
      X: {
        name: "X",
        url: "https://x.com/MdMahibulHaque",
        icon: Icons.x,
        navbar: true,
      },
    },
  },
} as const;
