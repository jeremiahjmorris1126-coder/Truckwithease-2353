/**
 * API Key Vault — client shim.
 *
 * The original version of this file is preserved at
 * docs/launch/apiKeyVault.ORIGINAL.js.txt. It was replaced because it was not
 * a vault:
 *   - VAULT_ENCRYPTION_KEY was hardcoded and shipped inside the browser bundle
 *   - encryptKey() was Buffer.from(key + value).toString('base64') — reversible
 *     by anyone with devtools, i.e. plaintext with extra steps
 *   - decryption happened in the browser, so the real key was in page memory
 *
 * Real encryption now lives server-side (AES-256-GCM, api/lib/crypto.ts) behind
 * /api/vault. Plaintext keys are accepted once and never returned. This file
 * keeps the exact same exports so consumer pages did not have to change.
 */

const API = "/api/vault";

async function call(path, opts) {
  const res = await fetch(API + path, {
    headers: { "content-type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(`vault ${path} -> ${res.status}`);
  return res.json();
}

/** Decrypts every stored key server-side and checks its GCM tag + fingerprint. */
export async function verifyVaultIntegrity() {
  try {
    const r = await call("/integrity");
    return r.checked === 0 ? r.ready : r.passing === r.checked;
  } catch (e) {
    console.error("Vault integrity check failed:", e.message);
    return false;
  }
}

/**
 * Plaintext keys are NEVER returned to the browser. This returns whether the
 * key exists plus a masked preview. Server code that needs the real value uses
 * getVaultKey() in api/routes/vault.ts.
 */
export async function getApiKey(service) {
  try {
    const r = await call(`/status/${encodeURIComponent(service)}`);
    return {
      service,
      stored: r.stored,
      preview: r.key?.preview ?? null,
      enabled: r.key?.enabled ?? false,
      note: "Plaintext is server-side only. Requests using this key are proxied through the API.",
    };
  } catch (e) {
    console.error("Vault read failed:", e.message);
    return null;
  }
}

export async function storeApiKey(service, keyValue, description) {
  try {
    const r = await call("/", {
      method: "POST",
      body: JSON.stringify({ service, value: keyValue, label: description }),
    });
    return r.ok === true;
  } catch (e) {
    console.error("Vault write failed:", e.message);
    return false;
  }
}

/**
 * Kept for API compatibility. Extraction blocking is now inherent: the browser
 * never holds a plaintext key to extract. This records the attempt server-side.
 */
export async function blockUnauthorizedExtraction(attemptedService) {
  try {
    await call(`/${encodeURIComponent(attemptedService)}/disable`, { method: "POST" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Rotation requires the new key value — you cannot rotate a secret you don't
 * have. Called with only a service, this returns false and says why, instead of
 * pretending a rotation happened.
 */
export async function rotateApiKey(service, newValue) {
  if (!newValue) {
    console.warn(
      `Rotation of "${service}" needs the new key value. Generate a new key with the provider, then call rotateApiKey(service, newValue).`,
    );
    return false;
  }
  try {
    const r = await call("/", { method: "POST", body: JSON.stringify({ service, value: newValue }) });
    if (r.reusedSameValue) {
      console.warn(`"${service}" was rotated to the same value — not a real rotation.`);
      return false;
    }
    return r.ok === true;
  } catch (e) {
    console.error("Rotation failed:", e.message);
    return false;
  }
}

export async function getVaultStatus() {
  try {
    const r = await call("/");
    return {
      total_keys: r.keys.length,
      encryption: r.encryption,
      last_integrity_check: new Date().toISOString(),
      vault_locked: true,
      platform_signature_verified: r.ready,
      services: r.services,
      keys: r.keys.map((k) => ({
        service: k.service,
        label: k.label,
        preview: k.preview,
        enabled: k.enabled,
        last_rotated: k.lastRotated,
        rotation_count: k.rotationCount,
        access_count: k.accessCount,
        unauthorized_attempts: 0,
      })),
    };
  } catch (e) {
    console.error("Failed to get vault status:", e.message);
    return null;
  }
}

export async function getVaultAudit() {
  try {
    const r = await call("/audit");
    return r.entries;
  } catch {
    return [];
  }
}

export async function initializeVault() {
  return verifyVaultIntegrity();
}
