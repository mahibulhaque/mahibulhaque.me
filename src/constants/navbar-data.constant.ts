import {
  IconHouse,
  IconLibrary,
  IconGithub,
  IconLinkedIn,
  IconX,
} from "@/components/icons";

export const NAVBAR_DATA = {
  navbar: [
    { href: "/", icon: IconHouse, label: "Home" },
    { href: "/blog", icon: IconLibrary, label: "Blog" },
  ],
  contact: {
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/mahibulhaque",
        icon: IconGithub,
        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://linkedin.com/in/mahibulhaque",
        icon: IconLinkedIn,
        navbar: true,
      },
      X: {
        name: "X",
        url: "https://x.com/MdMahibulHaque",
        icon: IconX,
        navbar: true,
      },
    },
  },
} as const;
