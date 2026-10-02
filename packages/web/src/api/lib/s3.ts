import { S3Client } from "@aws-sdk/client-s3";

/**
 * Object storage — iDrive e2 (S3-compatible).
 *
 * e2 needs two things Tigris does not: a real region code and path-style
 * addressing (`https://s3.<region>.idrivee2.com/<bucket>/<key>`). Both are read
 * from env so the endpoint can be swapped without touching code.
 *
 * Credentials are server-side only. They are never sent to the browser — the
 * client gets a short-lived presigned URL and nothing else.
 */

export const S3_BUCKET = process.env.S3_BUCKET ?? "";
export const S3_ENDPOINT = process.env.S3_ENDPOINT ?? "";
export const S3_REGION = process.env.S3_REGION ?? "auto";

/** Path-style is required by iDrive e2; Tigris uses virtual-host style. */
const forcePathStyle =
  (process.env.S3_FORCE_PATH_STYLE ?? "").toLowerCase() === "true" || S3_ENDPOINT.includes("idrivee2.com");

export const storageConfigured = Boolean(
  S3_ENDPOINT && S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY,
);

export const s3 = new S3Client({
  region: S3_REGION,
  endpoint: S3_ENDPOINT,
  forcePathStyle,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  },
});

export const storageInfo = () => ({
  configured: storageConfigured,
  provider: S3_ENDPOINT.includes("idrivee2.com")
    ? "idrive_e2"
    : S3_ENDPOINT.includes("t3.storage.dev")
      ? "tigris"
      : S3_ENDPOINT
        ? "s3_compatible"
        : null,
  endpoint: S3_ENDPOINT || null,
  region: S3_REGION,
  bucket: S3_BUCKET || null,
  pathStyle: forcePathStyle,
});

/** Keys are namespaced so one bucket can hold every kind of file safely. */
export const storageKey = (folder: string, filename: string) => {
  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, "").replace(/^\/+|\/+$/g, "") || "misc";
  const safeName = filename.replace(/[^a-z0-9._-]/gi, "_").slice(-120) || "file";
  return `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
};
