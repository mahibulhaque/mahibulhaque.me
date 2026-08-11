import type { ThemeRegistration } from "shiki";

export const blogTheme: ThemeRegistration = {
  name: "blog",
  type: "dark",

  fg: "var(--shiki-foreground)",
  bg: "var(--shiki-background)",

  settings: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: {
        foreground: "var(--shiki-token-comment)",
        fontStyle: "italic",
      },
    },
    {
      scope: ["keyword", "storage", "storage.type", "storage.modifier"],
      settings: {
        foreground: "var(--shiki-token-keyword)",
      },
    },
    {
      scope: ["entity.name.function", "support.function"],
      settings: {
        foreground: "var(--shiki-token-function)",
      },
    },
    {
      scope: ["entity.name.type", "entity.name.class", "support.class"],
      settings: {
        foreground: "var(--shiki-token-type)",
      },
    },
    {
      scope: ["string", "string.quoted"],
      settings: {
        foreground: "var(--shiki-token-string)",
      },
    },
    {
      scope: ["constant.numeric", "constant.language"],
      settings: {
        foreground: "var(--shiki-token-constant)",
      },
    },
    {
      scope: ["variable", "variable.other"],
      settings: {
        foreground: "var(--shiki-token-variable)",
      },
    },
    {
      scope: ["entity.name.tag"],
      settings: {
        foreground: "var(--shiki-token-tag)",
      },
    },
    {
      scope: ["entity.other.attribute-name"],
      settings: {
        foreground: "var(--shiki-token-attribute)",
      },
    },
    {
      scope: ["punctuation", "meta.brace"],
      settings: {
        foreground: "var(--shiki-token-punctuation)",
      },
    },
  ],
};
