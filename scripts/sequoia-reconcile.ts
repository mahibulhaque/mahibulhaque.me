// scripts/sequoia-reconcile.ts
import { readFile } from "node:fs/promises";

interface DocumentRecord {
  uri: string;
  path: string;
}

async function main() {
  const identifier = process.env.ATP_IDENTIFIER?.trim();
  const password = process.env.ATP_APP_PASSWORD?.trim();
  if (!identifier || !password) {
    console.log("ATP credentials not set, skipping reconcile.");
    return;
  }

  const config = JSON.parse(await readFile("sequoia.json", "utf8"));
  const did = extractDID(config.publicationUri);
  const pds = config.pdsUrl ?? (await resolvePDS(did));

  const referenced = await stateAtURIs(".sequoia-state.json");
  const records = await listDocuments(pds, did);
  const orphans = orphanDocuments(records, referenced);

  if (orphans.length === 0) {
    console.log("No orphaned Standard.site documents.");
    return;
  }

  const token = await createSession(pds, identifier, password);
  for (const doc of orphans) {
    const rkey = doc.uri.slice(doc.uri.lastIndexOf("/") + 1);
    await httpJSON(
      "POST",
      `${pds}/xrpc/com.atproto.repo.deleteRecord`,
      {
        repo: did,
        collection: "site.standard.document",
        rkey,
      },
      token,
    );
    console.log("Deleted orphaned document:", doc.uri);
  }
}

function extractDID(publicationUri: string): string {
  const rest = publicationUri.replace(/^at:\/\//, "");
  const did = rest.split("/")[0];
  if (!did.startsWith("did:")) {
    throw new Error(`unexpected publication DID: ${did}`);
  }
  return did;
}

async function resolvePDS(did: string): Promise<string> {
  const doc = (await httpJSON(
    "GET",
    `https://plc.directory/${did}`,
    undefined,
    undefined,
  )) as {
    service: { id: string; serviceEndpoint: string }[];
  };
  const svc = doc.service.find((s) => s.id === "#atproto_pds");
  if (!svc) throw new Error(`no PDS endpoint for ${did}`);
  return svc.serviceEndpoint;
}

async function stateAtURIs(statePath: string): Promise<Set<string>> {
  const raw = await readFile(statePath, "utf8").catch(() => null);
  if (!raw) return new Set();
  const state = JSON.parse(raw) as {
    posts?: Record<string, { atUri?: string }>;
  };
  const referenced = new Set<string>();
  for (const post of Object.values(state.posts ?? {})) {
    if (post.atUri) referenced.add(post.atUri);
  }
  return referenced;
}

async function listDocuments(
  pds: string,
  did: string,
): Promise<DocumentRecord[]> {
  const docs: DocumentRecord[] = [];
  let cursor = "";
  for (;;) {
    const url = new URL(`${pds}/xrpc/com.atproto.repo.listRecords`);
    url.searchParams.set("repo", did);
    url.searchParams.set("collection", "site.standard.document");
    url.searchParams.set("limit", "100");
    if (cursor) url.searchParams.set("cursor", cursor);

    const page = (await httpJSON(
      "GET",
      url.toString(),
      undefined,
      undefined,
    )) as {
      records: { uri: string; value: { path?: string } }[];
      cursor?: string;
    };
    for (const r of page.records) {
      docs.push({ uri: r.uri, path: r.value.path ?? "" });
    }
    if (!page.cursor || page.records.length === 0) return docs;
    cursor = page.cursor;
  }
}

function orphanDocuments(
  records: DocumentRecord[],
  referenced: Set<string>,
): DocumentRecord[] {
  // Only treat a record as orphaned if we've seen another *referenced*
  // record for the same path — i.e. a stale duplicate from a
  // renamed/republished post, not a post we've simply never touched.
  const byPath = new Set<string>();
  for (const r of records) {
    if (r.path && referenced.has(r.uri)) byPath.add(r.path);
  }
  return records.filter(
    (r) => r.path && !referenced.has(r.uri) && byPath.has(r.path),
  );
}

async function createSession(
  pds: string,
  identifier: string,
  password: string,
): Promise<string> {
  const session = (await httpJSON(
    "POST",
    `${pds}/xrpc/com.atproto.server.createSession`,
    {
      identifier,
      password,
    },
    undefined,
  )) as { accessJwt: string };
  return session.accessJwt;
}

async function httpJSON(
  method: string,
  url: string,
  body: unknown,
  token: string | undefined,
) {
  const res = await fetch(url, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${method} ${url}: ${res.status} ${text.slice(0, 200)}`);
  }
  return text ? JSON.parse(text) : null;
}

main().catch((err) => {
  console.error("reconcile:", err.message);
  // non-fatal, matches rednafi's "skipping document reconcile" behavior
});
