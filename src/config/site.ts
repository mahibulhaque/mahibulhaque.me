export const siteConfig = {
  title: "Mahib's Margins",
  url: "https://mahibulhaque.me",
  description:"Recent content on Mahib's Margins",
  locale: "en_US",
  language:"en",
  author: {
    name: "Mahibul Haque",
  },
  seo: {
    titleTemplate: "%s | %n",
    twitterCard: "summary_large_image",
    robots: "index, follow",
  },
  ogImagePath: "/og_image.png",
  posts: {
    postsPerPage: 10,
  },
} as const;



export const HERO_SECTION_INFO = {
  eyebrow: "Independent field notes",
  coordinates: "23.7278° N · 90.4135° E",
  name: "Mahibul Haque",
  role: "Software Engineer",
  location: "Dhaka",
  greeting: "Hi, I'm Mahib.",
  tagline: "I work with computers.",
  subtext: "…and sometimes I write about them too.",
  sinceYear: 2024,
  heroImageSrc:
    "https://images.unsplash.com/photo-1569412148958-600837f89a65?fm=jpg&q=80&w=1200&auto=format&fit=crop",
  heroImageAlt: "A weathered, wind-carved tree trunk in black and white",
} as const;
