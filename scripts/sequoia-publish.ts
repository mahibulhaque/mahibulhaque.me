import { readdir, readFile, writeFile, mkdir, rm, cp } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname, basename, relative } from "node:path";
import { execSync } from "node:child_process";
import matter from "gray-matter";

const STAGE_DIR = ".cache/sequoia-publish";
const CONTENT_DIR = "src/content/blogs";
const SITE_COVER_URL = process.env.SITE_COVER_URL!;
const STAGE_COVER_REL = "src/assets/images/site-cover.png";

async function walkBlogs(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkBlogs(full)));
    } else if (
      [".md", ".mdx"].includes(extname(entry.name)) &&
      !basename(entry.name).startsWith("_")
    ) {
      files.push(full);
    }
  }
  return files;
}

async function downloadSiteCover() {
  const dest = join(STAGE_DIR, STAGE_COVER_REL);
  await mkdir(join(dest, ".."), { recursive: true });
  const res = await fetch(SITE_COVER_URL);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
}

async function stageContent() {
  const files = await walkBlogs(CONTENT_DIR);
  for (const file of files) {
    const raw = await readFile(file, "utf8");
    const parsed = matter(raw);

    if (parsed.data.draft === true) continue; // skip drafts

    parsed.data.cover = {
      src: "../../assets/images/site-cover.png", // relative to staged content file
      alt: "Mahib's Margins",
    };
    if (!parsed.data.atUri) delete parsed.data.atUri;

    const rel = relative(CONTENT_DIR, file);
    const dest = join(STAGE_DIR, CONTENT_DIR, rel);
    await mkdir(join(dest, ".."), { recursive: true });
    await writeFile(dest, matter.stringify(parsed.content, parsed.data));
  }
}

async function writeStageConfig() {
  const raw = JSON.parse(await readFile("sequoia.json", "utf8"));
  raw.contentDir = CONTENT_DIR;
  raw.imagesDir = "src/assets/images";
  await writeFile(
    join(STAGE_DIR, "sequoia.json"),
    JSON.stringify(raw, null, 2),
  );
}

async function syncBack() {
  if (existsSync(join(STAGE_DIR, ".sequoia-state.json"))) {
    await cp(join(STAGE_DIR, ".sequoia-state.json"), ".sequoia-state.json");
  }
  const stagedFiles = await walkBlogs(join(STAGE_DIR, CONTENT_DIR));
  for (const stagedFile of stagedFiles) {
    const rel = relative(join(STAGE_DIR, CONTENT_DIR), stagedFile);
    const rootPath = join(CONTENT_DIR, rel);
    if (!existsSync(rootPath)) continue; // e.g. drafts we skipped

    const staged = matter(await readFile(stagedFile, "utf8"));
    if (!staged.data.atUri) continue;

    const root = matter(await readFile(rootPath, "utf8"));
    root.data.atUri = staged.data.atUri;
    await writeFile(rootPath, matter.stringify(root.content, root.data));
  }
}

async function main() {
  await rm(STAGE_DIR, { recursive: true, force: true });
  await mkdir(STAGE_DIR, { recursive: true });
  if (existsSync(".sequoia-state.json")) {
    await cp(".sequoia-state.json", join(STAGE_DIR, ".sequoia-state.json"));
  }

  await downloadSiteCover();
  await stageContent();
  await writeStageConfig();

  execSync(process.env.SEQUOIA_CMD ?? "npx -y sequoia-cli publish", {
    cwd: STAGE_DIR,
    stdio: "inherit",
    env: process.env,
  });

  await syncBack();

  await import("./sequoia-reconcile").catch((err) => {
    console.log("Skipping document reconcile:", err.message);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
