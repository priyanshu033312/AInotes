import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  DocumentRecord,
  PresentationRecord,
  StudyMaterial,
} from "./types";
import { SAMPLE_DOCUMENTS } from "./sample";

const STORAGE_ROOT =
  process.env.NOTEWISE_STORAGE_DIR ?? path.join(process.cwd(), "storage");
const DB_FILE = path.join(STORAGE_ROOT, "db.json");
const UPLOAD_DIR = path.join(STORAGE_ROOT, "uploads");
const EXPORT_DIR = path.join(STORAGE_ROOT, "exports");

interface Database {
  version: number;
  documents: DocumentRecord[];
}

export const DEFAULT_OWNER = "local-user";

let queue: Promise<unknown> = Promise.resolve();

/** Serialise read-modify-write cycles so concurrent requests never clobber data. */
function withLock<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

async function ensureDirs() {
  await fs.mkdir(STORAGE_ROOT, { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.mkdir(EXPORT_DIR, { recursive: true });
}

async function readDbFile(): Promise<Database> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    const parsed = JSON.parse(raw) as Database;
    if (!Array.isArray(parsed.documents)) throw new Error("Malformed database");
    return parsed;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code && code !== "ENOENT") {
      console.warn("[notewise] db read failed, starting fresh:", error);
    }
    const seeded: Database = {
      version: 1,
      documents: SAMPLE_DOCUMENTS.map((build) => build()),
    };
    await writeDbFile(seeded);
    return seeded;
  }
}

async function writeDbFile(db: Database) {
  await ensureDirs();
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tmp, DB_FILE);
}

export async function listDocuments(ownerId = DEFAULT_OWNER) {
  return withLock(async () => {
    const db = await readDbFile();
    return db.documents
      .filter((doc) => doc.ownerId === ownerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });
}

export async function getDocument(id: string, ownerId = DEFAULT_OWNER) {
  return withLock(async () => {
    const db = await readDbFile();
    return (
      db.documents.find((doc) => doc.id === id && doc.ownerId === ownerId) ??
      null
    );
  });
}

export async function createDocument(record: DocumentRecord) {
  return withLock(async () => {
    const db = await readDbFile();
    db.documents = [record, ...db.documents.filter((d) => d.id !== record.id)];
    await writeDbFile(db);
    return record;
  });
}

export async function updateDocument(
  id: string,
  patch: Partial<Omit<DocumentRecord, "id">>,
  ownerId = DEFAULT_OWNER,
) {
  return withLock(async () => {
    const db = await readDbFile();
    const index = db.documents.findIndex(
      (doc) => doc.id === id && doc.ownerId === ownerId,
    );
    if (index < 0) return null;
    const next: DocumentRecord = { ...db.documents[index], ...patch, id };
    db.documents[index] = next;
    await writeDbFile(db);
    return next;
  });
}

export async function saveStudyMaterial(
  id: string,
  study: StudyMaterial,
  ownerId = DEFAULT_OWNER,
) {
  return updateDocument(
    id,
    {
      study,
      status: "ready",
      stage: "done",
      processedAt: new Date().toISOString(),
      error: undefined,
    },
    ownerId,
  );
}

export async function savePresentation(
  id: string,
  presentation: PresentationRecord,
  ownerId = DEFAULT_OWNER,
) {
  return updateDocument(id, { presentation }, ownerId);
}

export async function deleteDocument(id: string, ownerId = DEFAULT_OWNER) {
  return withLock(async () => {
    const db = await readDbFile();
    const record = db.documents.find(
      (doc) => doc.id === id && doc.ownerId === ownerId,
    );
    if (!record) return false;
    db.documents = db.documents.filter((doc) => doc.id !== id);
    await writeDbFile(db);
    await removeFilesFor(record);
    return true;
  });
}

async function removeFilesFor(record: DocumentRecord) {
  const uploadPath = documentUploadPath(record.id, record.kind);
  const deletions = [fs.rm(uploadPath, { force: true })];
  if (record.presentation?.file) {
    deletions.push(
      fs.rm(path.join(EXPORT_DIR, record.presentation.file), { force: true }),
    );
  }
  await Promise.allSettled(deletions);
}

export function documentUploadPath(id: string, kind: DocumentRecord["kind"]) {
  return path.join(UPLOAD_DIR, `${id}.${kind}`);
}

export function exportFilePath(fileName: string) {
  return path.join(EXPORT_DIR, fileName);
}

export async function saveUpload(
  id: string,
  kind: DocumentRecord["kind"],
  data: Uint8Array,
) {
  await ensureDirs();
  await fs.writeFile(documentUploadPath(id, kind), data);
}

export async function readUpload(id: string, kind: DocumentRecord["kind"]) {
  return fs.readFile(documentUploadPath(id, kind));
}

export async function fileExists(target: string) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

export async function writeExport(fileName: string, data: Uint8Array) {
  await ensureDirs();
  const target = exportFilePath(fileName);
  await fs.writeFile(target, data);
  return target;
}
