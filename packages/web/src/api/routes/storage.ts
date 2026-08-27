import { Hono } from "hono";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3_BUCKET, s3, storageConfigured, storageInfo, storageKey } from "../lib/s3";

/**
 * Object storage — presigned URLs only.
 *
 * The browser never sees a key or a secret. It asks for a presigned URL, PUTs
 * the file straight to the bucket, and gets a short-lived GET URL back when it
 * needs to read the file. Nothing streams through this server.
 *
 * Folders in use: hr/ (HR documents), dvir/ (inspection photos),
 * bol/ (scanned BOLs and invoices), incidents/, misc/.
 */

const bad = (msg: string) => ({ error: msg });
const MAX_BYTES = 500 * 1024 * 1024; // 500 MB — e2 handles more, this is a sanity cap

export const storage = new Hono()

  .get("/", (c) =>
    c.json({
      ...storageInfo(),
      folders: ["hr", "dvir", "bol", "incidents", "misc"],
      maxBytes: MAX_BYTES,
      note: "Credentials are server-side only. Clients upload with a presigned PUT URL that expires in 10 minutes.",
    }),
  )

  /** Live check — proves the bucket answers with the configured credentials. */
  .get("/health", async (c) => {
    if (!storageConfigured) return c.json({ connected: false, ...storageInfo(), error: "storage env vars missing" }, 200);
    try {
      const out = await s3.send(new ListObjectsV2Command({ Bucket: S3_BUCKET, MaxKeys: 1 }));
      return c.json({ connected: true, ...storageInfo(), objectsSampled: out.KeyCount ?? 0 });
    } catch (e) {
      const err = e as { name?: string; message?: string; $metadata?: { httpStatusCode?: number } };
      return c.json(
        {
          connected: false,
          ...storageInfo(),
          error: err.name ?? "error",
          message: err.message ?? "unknown",
          httpStatus: err.$metadata?.httpStatusCode ?? null,
        },
        502,
      );
    }
  })

  /** Presigned PUT. Returns the key the client must store on its record. */
  .post("/presign-upload", async (c) => {
    if (!storageConfigured) return c.json(bad("Object storage is not configured on this server."), 503);
    const body = await c.req.json().catch(() => ({}));
    const filename = String(body.filename || "").trim();
    if (!filename) return c.json(bad("filename is required"), 400);
    const contentType = String(body.contentType || "application/octet-stream");
    const size = Number(body.size || 0);
    if (size && size > MAX_BYTES) return c.json(bad(`File is larger than the ${MAX_BYTES} byte limit.`), 400);

    const key = storageKey(String(body.folder || "misc"), filename);
    try {
      const url = await getSignedUrl(
        s3,
        new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, ContentType: contentType }),
        { expiresIn: 600 },
      );
      return c.json({ url, key, bucket: S3_BUCKET, contentType, expiresIn: 600, method: "PUT" });
    } catch (e) {
      return c.json(bad(`Could not sign an upload URL: ${(e as Error).message}`), 502);
    }
  })

  /** Presigned GET for reading a stored file back. */
  .post("/presign-download", async (c) => {
    if (!storageConfigured) return c.json(bad("Object storage is not configured on this server."), 503);
    const body = await c.req.json().catch(() => ({}));
    const key = String(body.key || "").trim();
    if (!key) return c.json(bad("key is required"), 400);
    try {
      await s3.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    } catch {
      return c.json(bad("That key does not exist in the bucket."), 404);
    }
    const expiresIn = Number(body.expiresIn) > 0 ? Math.min(Number(body.expiresIn), 86400) : 900;
    const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }), { expiresIn });
    return c.json({ url, key, expiresIn });
  })

  /** List what is actually in the bucket, optionally by folder. */
  .get("/list", async (c) => {
    if (!storageConfigured) return c.json(bad("Object storage is not configured on this server."), 503);
    const prefix = c.req.query("folder") ? `${c.req.query("folder")}/` : undefined;
    try {
      const out = await s3.send(new ListObjectsV2Command({ Bucket: S3_BUCKET, Prefix: prefix, MaxKeys: 200 }));
      return c.json({
        objects: (out.Contents ?? []).map((o) => ({ key: o.Key, size: o.Size, modified: o.LastModified })),
        count: out.KeyCount ?? 0,
        truncated: Boolean(out.IsTruncated),
        bucket: S3_BUCKET,
      });
    } catch (e) {
      return c.json(bad(`Bucket listing failed: ${(e as Error).message}`), 502);
    }
  })

  .delete("/object", async (c) => {
    if (!storageConfigured) return c.json(bad("Object storage is not configured on this server."), 503);
    const key = c.req.query("key");
    if (!key) return c.json(bad("key query param is required"), 400);
    try {
      await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
      return c.json({ deleted: true, key });
    } catch (e) {
      return c.json(bad(`Delete failed: ${(e as Error).message}`), 502);
    }
  });
