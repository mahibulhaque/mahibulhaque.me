export function renderInlineLinks(text: string): string {
  if (!text) return "";

  // Escape HTML special chars first so we don't accidentally
  // inject anything unexpected from the markdown source.
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Convert [label](url) -> <a href="url">label</a>
  return escaped.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_match, label, url) =>
      `<a href="${url}" class="text-primary underline underline-offset-2 hover:no-underline" target="_blank" rel="noopener noreferrer">${label}</a>`,
  );
}
