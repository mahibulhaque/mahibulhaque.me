import type { AstroExpressiveCodeOptions } from "astro-expressive-code";

export const expressiveCodeOptions: AstroExpressiveCodeOptions = {
  styleOverrides: {
    borderRadius: "4px",
    codeFontSize: "0.875rem",
    codeLineHeight: "1.7142857rem",
    codePaddingInline: "1rem",
    frames: {
      frameBoxShadowCssValue: "none",
    },
    uiLineHeight: "inherit",
  },
  themes: ["tokyo-night", "one-light"],
  useThemedScrollbars: false,
  useDarkModeMediaQuery: false,
  themeCssSelector: (theme) =>
    theme.type === "dark" ? ".dark" : ":root:not(.dark)",
};
