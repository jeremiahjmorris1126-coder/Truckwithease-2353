// AWS Service Layer — TruckWithEase
//
// WHAT THIS FILE USED TO BE (preserved at docs/launch/AWSService.ORIGINAL.js.txt):
// a browser-side module that read `aws_access_key_id` / `aws_secret_access_key` out of a
// PocketBase `platform_settings` collection — in the browser — and then made no AWS calls
// at all. Every function returned hardcoded values stamped with a `source` string naming
// a real AWS product:
//   - calculateTruckRoute()   -> "847 miles / 12h 34m / $312.40" for every input, plus
//                                invented avoided restrictions ("Low bridge I-80 Exit 44")
//   - scanDocument()          -> a fabricated CDL for "James R. Wilson" at 98.4% confidence,
//                                plus fake VIN / BOL / medical-card records
//   - transcribeVoice()       -> a canned accident narrative at 97.3% confidence
//   - storeDocument()         -> { stored: true } and an s3.amazonaws.com URL for a bucket
//                                (twe-documents) that does not exist. Nothing was stored.
//   - sendPushNotification()  -> { sent: true }. Nothing was sent.
//   - getABSEvents()          -> fake brake-wear percentages and safetyScoreImpact: -3,
//                                stamped "Bendix ACom API". No Bendix account exists.
//
// Two separate defects: AWS credentials would have been handed to the browser, and
// fabricated compliance documents were presented as machine-read with a confidence score.
// A fake CDL with a confidence number is the worst thing in this codebase's history.
//
// WHAT IT IS NOW: a thin façade over the services this platform actually has, and an
// honest refusal for the ones it does not. There is no AWS account wired to this app.
//   REAL  document OCR       -> POST /api/gemini/ocr        (Gemini, server-side key)
//   REAL  document storage   -> POST /api/storage/presign-upload (iDrive e2, server-side)
//   NONE  truck routing      -> no truck-attribute routing provider is connected
//   NONE  voice transcription-> no server transcription route exists
//   NONE  push notifications -> no SNS/FCM sender is configured
//   NONE  ABS / brake data   -> no Bendix or telematics brake feed
// Export names and call signatures are unchanged so any future import keeps working.

/**
 * Every "not connected" answer uses this shape. `available: false` is the flag callers
 * should branch on. There is no `fallback: true` returning plausible-looking numbers.
 */
function unavailable(capability, reason, alternative = null) {
  return {
    available: false,
    live: false,
    capability,
    reason,
    alternative,
    source: null,
    error: `${capability} is not connected.`,
  };
}

/** No AWS account is wired to this app. Kept because callers may still check it. */
export function isAWSActive() {
  return false;
}

/**
 * Truck-attribute routing (height/weight/hazmat restrictions).
 *
 * Not available. This needs a routing provider that understands bridge heights, weight
 * limits and hazmat corridors — AWS Location Service, HERE, or PC*MILER. None is
 * connected, and the two Google Maps keys in this repo are public and unrotated.
 *
 * Returning a guessed route in a compliance app is how a driver ends up under a 13'2"
 * bridge, so this refuses instead of estimating.
 */
export async function calculateTruckRoute({ origin, destination, truckHeight, truckWeight, hazmat } = {}) {
  return {
    ...unavailable(
      "Truck-attribute routing",
      "No truck-routing provider is connected. Bridge heights, weight limits and hazmat corridors require a commercial routing API (HERE, PC*MILER, or AWS Location Service).",
      "Plan the route manually and verify restrictions against the state DOT before dispatch.",
    ),
    requested: { origin: origin ?? null, destination: destination ?? null, truckHeight: truckHeight ?? null, truckWeight: truckWeight ?? null, hazmat: !!hazmat },
    distance: null,
    duration: null,
    fuelEstimate: null,
    avoidedRestrictions: null,
    waypoints: null,
  };
}

/**
 * Document OCR. This one is real — it goes to Gemini through the server, which holds
 * the key. Extraction is transcription, never verification: `verified` is always false
 * and unreadable fields come back null rather than guessed.
 *
 * Supported docTypes server-side: bol, rate_confirmation, invoice, dvir, generic.
 * cdl / vin / medical are NOT dedicated extractors — they fall through to `generic`,
 * and that is reported in the response instead of being hidden.
 */
const SERVER_DOC_TYPES = ["bol", "rate_confirmation", "invoice", "dvir", "generic"];

export async function scanDocument({ imageBase64, documentType, mimeType = "image/jpeg" } = {}) {
  if (!imageBase64) {
    return { available: true, live: false, error: "imageBase64_required", verified: false, fields: null };
  }
  const requested = String(documentType || "generic").toLowerCase();
  const docType = SERVER_DOC_TYPES.includes(requested) ? requested : "generic";

  try {
    const res = await fetch("/api/gemini/ocr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64, mimeType, docType }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok || !body) {
      return {
        available: true,
        live: false,
        error: body?.error || `OCR failed (${res.status})`,
        verified: false,
        fields: null,
        source: "Gemini (via /api/gemini/ocr)",
      };
    }
    return {
      available: true,
      live: !!body.live,
      docTypeRequested: requested,
      docTypeUsed: docType,
      docTypeNote:
        docType === requested
          ? null
          : `There is no dedicated "${requested}" extractor. This was read with the generic extractor, so field names are not ${requested}-specific.`,
      fields: body.fields ?? null,
      unreadable: body.unreadable ?? [],
      notes: body.notes ?? null,
      // Transcription, not verification. No confidence score is invented here: the model
      // does not return a calibrated one, so none is reported.
      verified: false,
      verificationNote:
        "OCR transcribes what is printed on the document. It does not confirm the document is genuine, current, or valid. A human must verify before it is used for compliance.",
      confidence: null,
      model: body.model ?? null,
      source: "Gemini (via /api/gemini/ocr)",
    };
  } catch (err) {
    return {
      available: true,
      live: false,
      error: `OCR unreachable: ${err?.message || "network error"}`,
      verified: false,
      fields: null,
    };
  }
}

/**
 * Voice-to-text. Not available in-app: there is no server transcription route, and no
 * AWS Transcribe account. The original returned a canned accident narrative at 97.3%
 * confidence — a fabricated statement about a crash, which is not survivable in a
 * compliance record.
 */
export async function transcribeVoice({ audioBlob, context } = {}) {
  return {
    ...unavailable(
      "Voice transcription",
      "No transcription service is wired to the app. AWS Transcribe is not connected and there is no server-side speech-to-text route.",
      "Type the report, or dictate with the phone keyboard's own dictation and review the text before saving.",
    ),
    requestedContext: context ?? null,
    receivedAudio: !!audioBlob,
    transcript: null,
    confidence: null,
  };
}

/**
 * Document storage. This one is real — but it is iDrive e2, not S3, and the flow is a
 * presigned PUT so credentials never reach the browser. Returns the storage key plus the
 * signed URL the caller must PUT the bytes to; it does NOT claim `stored: true` before
 * the upload has actually happened.
 */
const STORAGE_FOLDERS = ["hr", "dvir", "bol", "incidents", "misc"];

export async function storeDocument({ fileName, documentType, fleetId, driverId, contentType, size } = {}) {
  if (!fileName) {
    return { available: true, stored: false, error: "fileName_required" };
  }
  const folder = STORAGE_FOLDERS.includes(String(documentType)) ? String(documentType) : "misc";
  try {
    const res = await fetch("/api/storage/presign-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: fileName,
        folder,
        contentType: contentType || "application/octet-stream",
        size: size || 0,
      }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok || !body?.url) {
      return {
        available: true,
        stored: false,
        error: body?.error || body?.message || `Could not sign an upload URL (${res.status}).`,
        source: "iDrive e2 (via /api/storage)",
      };
    }
    return {
      available: true,
      // Nothing is stored until the caller PUTs the bytes to uploadUrl. Saying otherwise
      // was the original bug.
      stored: false,
      uploadUrl: body.url,
      method: body.method || "PUT",
      key: body.key,
      bucket: body.bucket,
      folder,
      expiresIn: body.expiresIn,
      fleetId: fleetId ?? null,
      driverId: driverId ?? null,
      note: "PUT the file bytes to uploadUrl, then confirm the upload succeeded. Read it back with POST /api/storage/presign-download.",
      source: "iDrive e2 (via /api/storage)",
    };
  } catch (err) {
    return { available: true, stored: false, error: `Storage unreachable: ${err?.message || "network error"}` };
  }
}

/**
 * Push notifications. Not available — no SNS topic, no FCM sender key, no APNs cert is
 * configured. The original returned { sent: true } unconditionally, so a dispatcher
 * would believe a driver had been alerted when nothing left the browser.
 */
export async function sendPushNotification({ to, title, message, type } = {}) {
  return {
    ...unavailable(
      "Push notifications",
      "No push sender is configured. AWS SNS is not connected, and no FCM sender key or APNs certificate is set on the server.",
      "SMS through the existing Twilio number once an A2P campaign is approved, or in-app messaging.",
    ),
    sent: false,
    requested: { to: to ?? null, title: title ?? null, message: message ?? null, type: type ?? null },
  };
}

/**
 * ABS / brake intelligence. Not available — there is no Bendix ACom account and no
 * telematics provider feeding brake data. The original returned invented brake-wear
 * percentages and a safetyScoreImpact of -3, which could have fed a driver's safety
 * score off nothing.
 */
export async function getABSEvents({ truckId, dateRange } = {}) {
  return {
    ...unavailable(
      "ABS and brake-wear telemetry",
      "No Bendix ACom or telematics brake feed is connected. Brake wear and ABS activations cannot be read from this platform.",
      "Record brake condition on the DVIR at inspection, and log it against the truck in Maintenance.",
    ),
    truckId: truckId ?? null,
    dateRange: dateRange ?? null,
    events: null,
    brakeWear: null,
    recommendation: null,
    // Never let an unmeasured value move a driver's safety score.
    safetyScoreImpact: null,
  };
}

export default {
  calculateTruckRoute,
  scanDocument,
  transcribeVoice,
  storeDocument,
  sendPushNotification,
  getABSEvents,
  isAWSActive,
};
