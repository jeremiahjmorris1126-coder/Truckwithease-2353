/**
 * Real symmetric encryption for the API key vault.
 *
 * Why this file exists: the previous vault ran in the browser and "encrypted"
 * with `Buffer.from(key + value).toString("base64")` against a hardcoded key
 * that shipped inside the JS bundle. That is not encryption — it is plaintext
 * with extra steps, readable by anyone with devtools.
 *
 * This is AES-256-GCM (authenticated), server-side only. The key is derived
 * from BETTER_AUTH_SECRET, which already exists in the root .env, so no new
 * secret has to be collected or managed.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync } from "node:crypto";

const SALT = "twe-vault-v1";

let cachedKey: Buffer | null = null;

function vaultKey(): Buffer {
  if (cachedKey) return cachedKey;
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "BETTER_AUTH_SECRET is not set — the API key vault cannot encrypt without it.",
    );
  }
  cachedKey = scryptSync(secret, SALT, 32);
  return cachedKey;
}

const b64u = (b: Buffer) => b.toString("base64url");

/** Encrypt a plaintext secret. Returns `iv.tag.ciphertext`, all base64url. */
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", vaultKey(), iv);
  const data = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return [b64u(iv), b64u(cipher.getAuthTag()), b64u(data)].join(".");
}

/**
 * Decrypt a stored value. Throws if the payload was tampered with — GCM
 * authenticates, so a modified ciphertext fails instead of returning garbage.
 */
export function decryptSecret(payload: string): string {
  const parts = payload.split(".");
  if (parts.length !== 3) throw new Error("malformed vault payload");
  const [iv, tag, data] = parts.map((p) => Buffer.from(p, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", vaultKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

/** sha256 of a plaintext — lets us detect "rotated" to the same value. */
export function fingerprint(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex");
}

/** sha256 of any string, hex. Used for agent prompt baselines. */
export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/** Last 4 characters, safe to render in a UI. */
export function maskHint(plaintext: string): string {
  return plaintext.length <= 4 ? "****" : plaintext.slice(-4);
}

/** `••••••••1234` style preview built from a stored hint. */
export function maskedPreview(hint: string): string {
  return `${"•".repeat(8)}${hint}`;
}

/** True when the vault has a usable derivation secret. */
export function vaultReady(): boolean {
  try {
    vaultKey();
    return true;
  } catch {
    return false;
  }
}
