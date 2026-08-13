export const siteConfig = {
  siteTitle: "Mahib's Margins",
  siteUrl: "https://mahibulhaque.me",
  locale: "en_US",
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
