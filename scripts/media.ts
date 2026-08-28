#!/usr/bin/env -S npx tsx

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";

const DEFAULT_PUBLIC_BASE = "https://blob.mahibulhaque.me";
const DEFAULT_BUCKET = "mahibulhaque-me-k74qgd";
const DEFAULT_WRANGLER = "npx -y wrangler@latest";
const DEFAULT_CONTENT_ROOT = "src/content/blogs";
const DEFAULT_LOCAL_IMAGE_ROOTS = ["public", "src/assets/images"];
const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";
const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"]);

function fatal(message: string): never {
  console.error(`media: ${message}`);
  process.exit(1);
}

// ---------- slug helpers ----------

function slugifySegment(segment: string): string {
  const cleaned = segment
    .toLowerCase()
    .trim()
    .replace(/_/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned === "" ? "image" : cleaned;
}

function slugifyPath(value: string): string {
  return value.split("/").map(slugifySegment).join("/");
}

// ---------- image type sniffing (mirrors Go's http.DetectContentType coverage) ----------

function sniffImageExt(buf: Buffer): string {
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return ".png";
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return ".jpg";
  }
  if (buf.length >= 6 && (buf.subarray(0, 6).toString("ascii") === "GIF87a" || buf.subarray(0, 6).toString("ascii") === "GIF89a")) {
    return ".gif";
  }
  if (buf.length >= 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") {
    return ".webp";
  }
  // Like the Go version's http.DetectContentType, we don't magic-sniff SVG
  // (it's XML/text); it falls back to the file extension below.
  return "";
}

function detectImageExt(raw: Buffer, sourcePath: string): string {
  const sniffed = sniffImageExt(raw);
  if (sniffed) return sniffed;
  return path.extname(sourcePath).toLowerCase();
}

// ---------- content-type / optimization / upload ----------

function contentType(key: string): string {
  const ext = path.extname(key).toLowerCase();
  switch (ext) {
    case ".svg":
      return "image/svg+xml; charset=utf-8";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

function optimizeLosslessly(filePath: string, ext: string): void {
  if (ext !== ".png") return;
  const result = spawnSync("oxipng", ["-o", "max", "--strip", "safe", filePath], { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`oxipng failed on ${filePath}`);
  }
}

function putR2Object(wrangler: string, bucket: string, key: string, filePath: string, ct: string): void {
  const [cmd, ...cmdArgs] = wrangler.split(" ").filter(Boolean);
  const args = [
    ...cmdArgs,
    "r2",
    "object",
    "put",
    `${bucket}/${key}`,
    "--file",
    filePath,
    "--content-type",
    ct,
    "--cache-control",
    IMMUTABLE_CACHE,
    "--remote",
  ];
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`wrangler upload failed for ${key}`);
  }
}

// ---------- directory derivation ----------

function canonicalDir(postPath: string, contentRoot: string): string {
  const rel = path.relative(contentRoot, postPath).split(path.sep).join("/");
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`${postPath}: not under content root ${contentRoot}, cannot derive media directory`);
  }
  const noExt = rel.replace(/\.(md|mdx)$/i, "");
  if (noExt === "" || noExt === rel) {
    // either post path equals contentRoot, or it wasn't a .md/.mdx file
    if (!/\.(md|mdx)$/i.test(rel)) {
      throw new Error(`${postPath}: expected a .md or .mdx file under ${contentRoot}`);
    }
  }
  return slugifyPath(noExt);
}

// ---------- upload command ----------

interface UploadOpts {
  publicBase: string;
  bucket: string;
  wrangler: string;
  contentRoot: string;
  postPath: string;
  sourcePath: string;
  imageName: string;
}

function uploadPostImage(opts: UploadOpts): void {
  const { publicBase, bucket, wrangler, contentRoot, postPath, sourcePath, imageName } = opts;

  if (!postPath || !sourcePath || !imageName) {
    throw new Error("--post, --file, and --name are required for image upload");
  }
  if (imageName.includes("_")) {
    throw new Error("--name must use kebab-case, not underscores");
  }

  const raw = readFileSync(sourcePath);
  const ext = detectImageExt(raw, sourcePath);
  if (!ext) {
    throw new Error(`${sourcePath}: cannot detect image type`);
  }

  const dir = mkdtempSync(path.join(tmpdir(), "rednafi-media-upload-"));
  try {
    const canonicalName = slugifyPath(imageName);
    const tmpFile = path.join(dir, canonicalName + ext);
    writeFileSync(tmpFile, raw);
    optimizeLosslessly(tmpFile, ext);

    const optimized = readFileSync(tmpFile);
    const hash = createHash("sha256").update(optimized).digest("hex").slice(0, 12);

    const mediaDir = canonicalDir(postPath, contentRoot);
    const key = [mediaDir, `${canonicalName}-${hash}${ext}`].filter(Boolean).join("/");

    putR2Object(wrangler, bucket, key, tmpFile, contentType(key));

    console.log(`${publicBase.replace(/\/+$/, "")}/${key}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ---------- --check command ----------

function walkFiles(root: string, filter: (filePath: string) => boolean, out: string[]): void {
  if (!existsSync(root)) return;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, filter, out);
    } else if (filter(full)) {
      out.push(full);
    }
  }
}

function nonCanonicalURLsInFile(filePath: string, publicBase: string): string[] {
  const raw = readFileSync(filePath, "utf8");
  const escapedBase = publicBase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`${escapedBase}/[^\\s\\]\\)"'<>]+`, "g");
  const violations: string[] = [];
  for (const rawUrl of raw.match(pattern) ?? []) {
    let u: URL;
    try {
      u = new URL(rawUrl);
    } catch {
      violations.push(`${filePath}: invalid R2 URL ${rawUrl}`);
      continue;
    }
    if (u.pathname.includes("_")) {
      violations.push(`${filePath}: underscore in R2 path ${rawUrl}`);
    }
  }
  return violations;
}

function committedLocalImages(roots: string[]): string[] {
  const found: string[] = [];
  for (const root of roots) {
    walkFiles(root, (filePath) => IMAGE_EXTS.has(path.extname(filePath).toLowerCase()), found);
  }
  return found.map((f) => f.split(path.sep).join("/"));
}

interface CheckOpts {
  contentRoot: string;
  localImageRoots: string[];
  publicBase: string;
}

function checkCanonicalMedia(opts: CheckOpts): void {
  const { contentRoot, localImageRoots, publicBase } = opts;
  const problems: string[] = [];

  const mdFiles: string[] = [];
  walkFiles(
    contentRoot,
    (filePath) => /\.(md|mdx)$/i.test(filePath) && !path.basename(filePath).startsWith("_"),
    mdFiles,
  );
  for (const filePath of mdFiles) {
    problems.push(...nonCanonicalURLsInFile(filePath, publicBase));
  }

  for (const filePath of committedLocalImages(localImageRoots)) {
    problems.push(`${filePath}: static post images belong in R2, not the repo`);
  }

  if (problems.length > 0) {
    throw new Error(`media URLs are not canonical:\n  ${problems.join("\n  ")}`);
  }
}

// ---------- CLI ----------

function main(): void {
  const { values } = parseArgs({
    options: {
      check: { type: "boolean", default: false },
      post: { type: "string", default: "" },
      file: { type: "string", default: "" },
      name: { type: "string", default: "" },
      "public-base": { type: "string", default: DEFAULT_PUBLIC_BASE },
      bucket: { type: "string", default: DEFAULT_BUCKET },
      wrangler: { type: "string", default: DEFAULT_WRANGLER },
      "content-root": { type: "string", default: DEFAULT_CONTENT_ROOT },
      "local-image-root": { type: "string", multiple: true, default: DEFAULT_LOCAL_IMAGE_ROOTS },
    },
  });

  try {
    if (values.check) {
      checkCanonicalMedia({
        contentRoot: values["content-root"] as string,
        localImageRoots: values["local-image-root"] as string[],
        publicBase: values["public-base"] as string,
      });
      return;
    }
    if (values.post || values.file || values.name) {
      uploadPostImage({
        publicBase: values["public-base"] as string,
        bucket: values.bucket as string,
        wrangler: values.wrangler as string,
        contentRoot: values["content-root"] as string,
        postPath: values.post as string,
        sourcePath: values.file as string,
        imageName: values.name as string,
      });
      return;
    }
    fatal("pass --check or --post/--file/--name");
  } catch (err) {
    fatal(err instanceof Error ? err.message : String(err));
  }
}

main();
