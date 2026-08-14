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
    twitterCard: "summary_large_image" as const,
    robots: "index, follow",
  },
  ogImagePath: "/og_image.png",
  posts: {
    postsPerPage: 10,
  },
} as const;
