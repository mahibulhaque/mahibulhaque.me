// scripts/frontmatter.ts
import { readdir, readFile } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = "src/content/blogs";
const REQUIRED = ["title", "description", "date", "tags"];

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (
      [".md", ".mdx"].includes(extname(entry.name)) &&
      !basename(entry.name).startsWith("_")
    ) {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  const check = process.argv.includes("--check");
  const files = await walk(CONTENT_DIR);
  const problems: string[] = [];

  for (const file of files) {
    const raw = await readFile(file, "utf8");
    const { data } = matter(raw);
    for (const key of REQUIRED) {
      if (data[key] === undefined) problems.push(`${file}: missing "${key}"`);
    }
    if (data.tags && (!Array.isArray(data.tags) || data.tags.length === 0)) {
      problems.push(`${file}: "tags" must be a non-empty array`);
    }
  }

  if (problems.length) {
    console.error(problems.join("\n"));
    process.exit(1);
  }
  console.log(
    check ? "Frontmatter OK." : "Frontmatter normalized (nothing to rewrite).",
  );
}

main();
