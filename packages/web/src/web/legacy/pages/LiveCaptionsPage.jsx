/**
 * LiveCaptionsPage — the UI for /api/captions.
 *
 * New page, 2026-08-26. The captions API was built and live-verified but no
 * screen consumed it, so the capability was invisible to a driver. This page is
 * that screen.
 *
 * Nothing on this page is fabricated. Specifically, and deliberately:
 *
 * - There is no confidence percentage anywhere. Gemini's generateContent
 *   response carries no ASR confidence field, so the API returns
 *   `confidence: null` and this page prints "not reported by the provider"
 *   rather than inventing a number. Every other captions UI on the market shows
 *   a confidence bar; ours would have been a lie.
 * - Latency is the `latencyMs` the server measured with a clock, not a copy
 *   string like "instant" or "real-time".
 * - Sign-language video is rendered as a hard NOT BUILT block, matching
 *   `capabilities.signLanguageVideo: false`. No model produces real ASL/BSL/LSF,
 *   so this page will not imply one does.
 * - "Live captions" here means transcribe-a-recording, not a streaming mic
 *   feed. The dev server buffers responses so nothing streams, and the route is
 *   request/response anyway. That limit is stated on the page instead of being
 *   dressed up with a pulsing LIVE badge.
 * - [inaudible] markers and `inaudibleSegments` are surfaced as-is. The model
 *   does not guess at audio it cannot make out, and neither does this UI.
 * - Translation is labelled machine translation, not certified translation.
 * - No audio file is stored anywhere. Nothing is uploaded to S3.
 *
 * Only the 10 locales with complete translated app copy are offered, read live
 * from the API rather than hardcoded here.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Captions, Languages, Upload, AlertTriangle, ArrowRight, History,
  FileAudio, Trash2, Loader2, ExternalLink, Ban,
} from "lucide-react";

const DRIVER_ID = "drv-1";

const inputCls =
  "w-full rounded-lg border border-[#222222] bg-[#0f0f0f] px-3 py-2 font-[JetBrains_Mono] text-sm text-[#F5F5F5] placeholder:text-[#555] outline-none transition-colors focus:border-[#C9A84C]";

function Panel({ title, note, children, right }) {
  return (
    <section className="rounded-xl border border-[#222222] bg-[#161616]">
      <header className="flex items-start justify-between gap-4 border-b border-[#222222] px-5 py-4">
        <div>
          <h2 className="font-[Oswald] text-[13px] font-semibold uppercase tracking-[0.22em] text-[#F5F5F5]">
            {title}
          </h2>
          {note && <p className="mt-1 text-[12px] leading-snug text-[#8A8A8A]">{note}</p>}
        </div>
        {right}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-[Oswald] text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A8A8A]">
        {label}
      </span>
      {children}
    </label>
  );
}

function Missing({ label, reason }) {
  return (
    <div className="rounded-lg border border-dashed border-[#333333] bg-[#111111] p-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 text-[#c96a4c]" />
        <span className="font-[Oswald] text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c96a4c]">
          Missing / Not built
        </span>
      </div>
      <div className="mt-2 font-[Oswald] text-sm uppercase tracking-[0.1em] text-[#F5F5F5]">{label}</div>
      <p className="mt-1 text-[13px] leading-snug text-[#8A8A8A]">{reason}</p>
    </div>
  );
}

function Row({ k, v, mono = true }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[#1d1d1d] py-2 last:border-0">
      <span className="font-[Oswald] text-[10px] uppercase tracking-[0.18em] text-[#8A8A8A]">{k}</span>
      <span className={`text-right text-[13px] text-[#F5F5F5] ${mono ? "font-[JetBrains_Mono]" : ""}`}>{v}</span>
    </div>
  );
}

/** Reads a File into a bare base64 string (no data: prefix). */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error("Could not read the file off disk."));
    fr.onload = () => {
      const s = String(fr.result || "");
      const comma = s.indexOf(",");
      resolve(comma >= 0 ? s.slice(comma + 1) : s);
    };
    fr.readAsDataURL(file);
  });
}

const fmtBytes = (n) =>
  n == null ? "—" : n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(2)} MB`;

const fmtWhen = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleString();
};

export default function LiveCaptionsPage() {
  // ---- status + languages -------------------------------------------------
  const [status, setStatus] = useState({ state: "loading", data: null, error: null });
  const [langs, setLangs] = useState({});

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch("/api/captions/status", { signal: ac.signal });
        const j = await r.json();
        if (!r.ok) throw new Error(`HTTP ${r.status} — ${JSON.stringify(j)}`);
        setStatus({ state: "ok", data: j, error: null });
        setLangs(j.languages || {});
      } catch (e) {
        if (e.name === "AbortError") return;
        setStatus({ state: "error", data: null, error: String(e.message || e) });
      }
    })();
    return () => ac.abort();
  }, []);

  const langEntries = useMemo(() => Object.entries(langs), [langs]);
  const limits = status.data?.limits || {};

  // ---- transcribe ---------------------------------------------------------
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [languageHint, setLanguageHint] = useState("");
  const [translateTo, setTranslateTo] = useState("");
  const [tr, setTr] = useState({ state: "idle", data: null, error: null });

  const tooBig = file && limits.maxAudioBytes ? file.size > limits.maxAudioBytes : false;

  const runTranscribe = useCallback(async () => {
    if (!file || tooBig) return;
    setTr({ state: "loading", data: null, error: null });
    try {
      const audioBase64 = await fileToBase64(file);
      const r = await fetch("/api/captions/transcribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          audioBase64,
          mimeType: file.type || "audio/wav",
          driverId: DRIVER_ID,
          languageHint: languageHint || undefined,
          translateTo: translateTo || undefined,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(`HTTP ${r.status} — ${JSON.stringify(j)}`);
      setTr({ state: "ok", data: j, error: null });
    } catch (e) {
      setTr({ state: "error", data: null, error: String(e.message || e) });
    }
  }, [file, tooBig, languageHint, translateTo]);

  // ---- translate ----------------------------------------------------------
  const [text, setText] = useState("");
  const [target, setTarget] = useState("es-ES");
  const [tx, setTx] = useState({ state: "idle", data: null, error: null });
  const overLimit = limits.maxTextChars ? text.length > limits.maxTextChars : false;

  const runTranslate = useCallback(async () => {
    if (!text.trim() || overLimit) return;
    setTx({ state: "loading", data: null, error: null });
    try {
      const r = await fetch("/api/captions/translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: text.trim(), targetLanguage: target, driverId: DRIVER_ID }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(`HTTP ${r.status} — ${JSON.stringify(j)}`);
      setTx({ state: "ok", data: j, error: null });
    } catch (e) {
      setTx({ state: "error", data: null, error: String(e.message || e) });
    }
  }, [text, target, overLimit]);

  // ---- history ------------------------------------------------------------
  const [hist, setHist] = useState({ state: "loading", data: null, error: null });
  const loadHistory = useCallback(async () => {
    setHist((h) => ({ ...h, state: "loading" }));
    try {
      const r = await fetch("/api/captions/history?limit=12");
      const j = await r.json();
      if (!r.ok) throw new Error(`HTTP ${r.status} — ${JSON.stringify(j)}`);
      setHist({ state: "ok", data: j, error: null });
    } catch (e) {
      setHist({ state: "error", data: null, error: String(e.message || e) });
    }
  }, []);
  useEffect(() => { loadHistory(); }, [loadHistory]);

  const busy = tr.state === "loading" || tx.state === "loading";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#F5F5F5]">
      {/* Header band */}
      <header className="border-b border-[#222222] bg-gradient-to-b from-[#111111] to-[#0a0a0a]">
        <div className="mx-auto max-w-[1200px] px-6 py-8">
          <div className="inline-flex items-center gap-2 rounded border border-[#222222] bg-[#161616] px-2.5 py-1">
            <Captions className="h-3.5 w-3.5 text-[#C9A84C]" />
            <span className="font-[Oswald] text-[10px] font-semibold uppercase tracking-[0.26em] text-[#C9A84C]">
              Accessibility &amp; Language
            </span>
          </div>
          <h1 className="mt-3 font-[Bebas_Neue] text-5xl leading-none tracking-[0.02em]">
            LIVE <span className="text-[#FFD700]">CAPTIONS</span>
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#8A8A8A]">
            Turn a recording into a verbatim transcript, and turn dispatch text into a driver's language. Runs
            server-side on Gemini. No provider key ever reaches your browser, and no audio file is stored — the
            recording is sent, transcribed, and dropped.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {status.state === "loading" && (
              <span className="inline-flex items-center gap-2 rounded border border-[#222222] px-2.5 py-1 font-[Oswald] text-[10px] uppercase tracking-[0.2em] text-[#8A8A8A]">
                <Loader2 className="h-3 w-3 animate-spin" /> Checking provider
              </span>
            )}
            {status.state === "ok" && (
              <>
                <span
                  className={`rounded border px-2.5 py-1 font-[Oswald] text-[10px] font-semibold uppercase tracking-[0.2em] ${
                    status.data.live
                      ? "border-[#C9A84C]/45 bg-[#1C1C1C] text-[#C9A84C]"
                      : "border-[#c96a4c]/45 bg-[#1C1C1C] text-[#c96a4c]"
                  }`}
                >
                  {status.data.live ? "Provider reachable" : "Provider not configured"}
                </span>
                <span className="rounded border border-[#222222] px-2.5 py-1 font-[JetBrains_Mono] text-[11px] text-[#8A8A8A]">
                  {status.data.provider} · {status.data.models?.transcribe}
                </span>
                <span className="rounded border border-[#222222] px-2.5 py-1 font-[JetBrains_Mono] text-[11px] text-[#8A8A8A]">
                  {langEntries.length} languages
                </span>
              </>
            )}
            {status.state === "error" && (
              <span className="rounded border border-[#c96a4c]/45 bg-[#1C1C1C] px-2.5 py-1 font-[JetBrains_Mono] text-[11px] text-[#c96a4c]">
                /api/captions/status failed — {status.error}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1200px] grid-cols-1 gap-5 px-6 py-8 lg:grid-cols-2">
        {/* ---------------- Transcribe ---------------- */}
        <Panel
          title="Transcribe a recording"
          note="POST /api/captions/transcribe — audio is base64'd in the browser and sent to the server, which calls Gemini. Nothing is written to storage."
        >
          <div className="space-y-4">
            <div
              className="rounded-lg border border-dashed border-[#333333] bg-[#111111] p-5 text-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) { setFile(f); setTr({ state: "idle", data: null, error: null }); }
              }}
            >
              <FileAudio className="mx-auto h-7 w-7 text-[#C9A84C]" />
              <div className="mt-2 font-[Oswald] text-[11px] uppercase tracking-[0.2em] text-[#8A8A8A]">
                Drop an audio file or choose one
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setFile(f);
                  setTr({ state: "idle", data: null, error: null });
                }}
              />
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#222222] px-3 py-2 font-[Oswald] text-[11px] uppercase tracking-[0.18em] text-[#C9A84C] transition-colors hover:border-[#C9A84C] hover:text-[#FFD700]"
                >
                  <Upload className="h-3.5 w-3.5" /> Choose file
                </button>
                {file && (
                  <button
                    type="button"
                    onClick={() => { setFile(null); setTr({ state: "idle", data: null, error: null }); }}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#222222] px-3 py-2 font-[Oswald] text-[11px] uppercase tracking-[0.18em] text-[#8A8A8A] transition-colors hover:border-[#c96a4c] hover:text-[#c96a4c]"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Clear
                  </button>
                )}
              </div>
              {file && (
                <div className="mt-3 font-[JetBrains_Mono] text-[12px] text-[#F5F5F5]">
                  {file.name} · {fmtBytes(file.size)} · {file.type || "type unknown"}
                </div>
              )}
              {tooBig && (
                <div className="mt-2 font-[JetBrains_Mono] text-[12px] text-[#c96a4c]">
                  Over the server limit of {fmtBytes(limits.maxAudioBytes)}. The request would be rejected.
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Language hint (optional)">
                <select className={inputCls} value={languageHint} onChange={(e) => setLanguageHint(e.target.value)}>
                  <option value="">Let Gemini detect it</option>
                  {langEntries.map(([code, label]) => (
                    <option key={code} value={code}>{label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Also translate to (optional)">
                <select className={inputCls} value={translateTo} onChange={(e) => setTranslateTo(e.target.value)}>
                  <option value="">Transcript only</option>
                  {langEntries.map(([code, label]) => (
                    <option key={code} value={code}>{label}</option>
                  ))}
                </select>
              </Field>
            </div>

            <button
              type="button"
              disabled={!file || tooBig || busy}
              onClick={runTranscribe}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#C9A84C] px-4 py-2.5 font-[Oswald] text-[12px] font-semibold uppercase tracking-[0.2em] text-[#0a0a0a] transition-colors hover:bg-[#FFD700] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {tr.state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {tr.state === "loading" ? "Transcribing" : "Transcribe"}
            </button>

            {tr.state === "loading" && (
              <p className="text-[12px] leading-snug text-[#8A8A8A]">
                Gemini audio transcription is not instant — a short clip has taken about 19 seconds in testing. The
                request is still open.
              </p>
            )}

            {tr.state === "error" && (
              <div className="rounded-lg border border-[#c96a4c]/45 bg-[#1C1C1C] p-3 font-[JetBrains_Mono] text-[12px] leading-snug text-[#c96a4c]">
                {tr.error}
              </div>
            )}

            {tr.state === "ok" && (
              <div className="space-y-3">
                {tr.data.speechDetected ? (
                  <div className="rounded-lg border border-[#222222] bg-[#0f0f0f] p-4">
                    <div className="font-[Oswald] text-[10px] uppercase tracking-[0.22em] text-[#C9A84C]">Transcript</div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#F5F5F5]">{tr.data.transcript}</p>
                  </div>
                ) : (
                  <Missing
                    label="No speech detected"
                    reason={tr.data.note || "Gemini reported no speech in this audio. Nothing was transcribed and nothing was guessed."}
                  />
                )}

                {tr.data.translation && (
                  tr.data.translation.text ? (
                    <div className="rounded-lg border border-[#222222] bg-[#0f0f0f] p-4">
                      <div className="font-[Oswald] text-[10px] uppercase tracking-[0.22em] text-[#C9A84C]">
                        Translation — {langs[tr.data.translation.targetLanguage] || tr.data.translation.targetLanguage}
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#F5F5F5]">
                        {tr.data.translation.text}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-[#c96a4c]/45 bg-[#1C1C1C] p-3 font-[JetBrains_Mono] text-[12px] text-[#c96a4c]">
                      Translation step failed — {tr.data.translation.error || "no reason returned"}
                    </div>
                  )
                )}

                <div className="rounded-lg border border-[#222222] bg-[#0f0f0f] px-4 py-2">
                  <Row k="Model" v={tr.data.model || "—"} />
                  <Row k="Detected language" v={tr.data.language || "not reported"} />
                  <Row k="Inaudible segments" v={tr.data.inaudibleSegments == null ? "not reported" : tr.data.inaudibleSegments} />
                  <Row k="Confidence" v="not reported by the provider" mono={false} />
                  <Row k="Latency (measured)" v={`${tr.data.latencyMs} ms`} />
                  <Row k="Request id" v={tr.data.requestId || "—"} />
                </div>
                <p className="text-[12px] leading-snug text-[#666666]">{tr.data.note}</p>
              </div>
            )}
          </div>
        </Panel>

        {/* ---------------- Translate ---------------- */}
        <Panel
          title="Translate dispatch text"
          note="POST /api/captions/translate — machine translation only. Acronyms, dollar amounts and dates are left exactly as written."
        >
          <div className="space-y-4">
            <Field label="Text">
              <textarea
                rows={6}
                className={inputCls}
                placeholder="Paste the dispatch note, broker instruction, or inspection wording."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </Field>
            <div className="flex items-center justify-between">
              <span className={`font-[JetBrains_Mono] text-[11px] ${overLimit ? "text-[#c96a4c]" : "text-[#8A8A8A]"}`}>
                {text.length}
                {limits.maxTextChars ? ` / ${limits.maxTextChars}` : ""} chars
              </span>
              <span className="font-[JetBrains_Mono] text-[11px] text-[#8A8A8A]">driver {DRIVER_ID}</span>
            </div>

            <Field label="Target language">
              <select className={inputCls} value={target} onChange={(e) => setTarget(e.target.value)}>
                {langEntries.map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
            </Field>

            <button
              type="button"
              disabled={!text.trim() || overLimit || busy}
              onClick={runTranslate}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#C9A84C] px-4 py-2.5 font-[Oswald] text-[12px] font-semibold uppercase tracking-[0.2em] text-[#0a0a0a] transition-colors hover:bg-[#FFD700] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {tx.state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
              {tx.state === "loading" ? "Translating" : "Translate"}
            </button>

            {tx.state === "error" && (
              <div className="rounded-lg border border-[#c96a4c]/45 bg-[#1C1C1C] p-3 font-[JetBrains_Mono] text-[12px] leading-snug text-[#c96a4c]">
                {tx.error}
              </div>
            )}

            {tx.state === "ok" && (
              <div className="space-y-3">
                <div className="rounded-lg border border-[#222222] bg-[#0f0f0f] p-4">
                  <div className="font-[Oswald] text-[10px] uppercase tracking-[0.22em] text-[#C9A84C]">
                    {tx.data.targetLanguageLabel || tx.data.targetLanguage}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#F5F5F5]">{tx.data.translatedText}</p>
                </div>
                <div className="rounded-lg border border-[#222222] bg-[#0f0f0f] px-4 py-2">
                  <Row k="Model" v={tx.data.model || "—"} />
                  <Row k="Source language" v={tx.data.sourceLanguage || "not reported"} />
                  <Row k="Confidence" v="not reported by the provider" mono={false} />
                  <Row k="Latency (measured)" v={`${tx.data.latencyMs} ms`} />
                  <Row k="Request id" v={tx.data.requestId || "—"} />
                </div>
                <p className="text-[12px] leading-snug text-[#666666]">{tx.data.note}</p>
              </div>
            )}
          </div>
        </Panel>

        {/* ---------------- What this is not ---------------- */}
        <Panel title="What this does not do" note="Stated plainly so nobody plans around a capability that is not here.">
          <div className="space-y-3">
            <Missing
              label="Streaming microphone captions"
              reason="This transcribes a finished recording. There is no live mic stream: the captions route is request/response, and the dev server buffers responses so nothing would stream on the preview host anyway. Real-time captioning needs a socket transport that is not built."
            />
            <Missing
              label="Sign-language video"
              reason="The API reports signLanguageVideo: false. No model available to us produces genuine ASL, BSL or LSF interpretation, so nothing here will render an avatar and call it sign language."
            />
            <Missing
              label="Certified translation"
              reason="Machine translation is not a certified translation. Do not file it with an agency, submit it to a court, or rely on it for a legal notice."
            />
            <div className="rounded-lg border border-[#222222] bg-[#0f0f0f] p-4">
              <div className="flex items-center gap-2">
                <Ban className="h-4 w-4 text-[#8A8A8A]" />
                <span className="font-[Oswald] text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A8A8A]">
                  Not stored
                </span>
              </div>
              <p className="mt-2 text-[13px] leading-snug text-[#8A8A8A]">
                Your audio file is never written to disk or object storage. Only the resulting text is logged, so the
                accessibility queue can show what was requested and whether it was fulfilled.
              </p>
            </div>
            {status.state === "ok" && (
              <div className="rounded-lg border border-[#222222] bg-[#0f0f0f] px-4 py-2">
                <Row k="Max audio" v={fmtBytes(limits.maxAudioBytes)} />
                <Row k="Max text" v={limits.maxTextChars ? `${limits.maxTextChars} chars` : "—"} />
                <Row k="Speak translation" v={status.data.capabilities?.speakTranslation ? "via /api/gemini/tts" : "not available"} mono={false} />
              </div>
            )}
          </div>
        </Panel>

        {/* ---------------- History ---------------- */}
        <Panel
          title="Recent requests"
          note="GET /api/captions/history — the same accessibility_requests table the queue reads. Unfulfilled rows say why nothing was produced."
          right={
            <button
              type="button"
              onClick={loadHistory}
              className="inline-flex items-center gap-2 rounded border border-[#222222] px-2.5 py-1 font-[Oswald] text-[10px] uppercase tracking-[0.18em] text-[#C9A84C] transition-colors hover:border-[#C9A84C]"
            >
              <History className="h-3 w-3" /> Refresh
            </button>
          }
        >
          {hist.state === "loading" && (
            <div className="flex items-center gap-2 py-6 text-[#8A8A8A]">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="font-[Oswald] text-[11px] uppercase tracking-[0.2em]">Loading</span>
            </div>
          )}
          {hist.state === "error" && (
            <div className="rounded-lg border border-[#c96a4c]/45 bg-[#1C1C1C] p-3 font-[JetBrains_Mono] text-[12px] text-[#c96a4c]">
              {hist.error}
            </div>
          )}
          {hist.state === "ok" && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className="rounded border border-[#222222] px-2.5 py-1 font-[JetBrains_Mono] text-[11px] text-[#8A8A8A]">
                  {hist.data.count} rows
                </span>
                <span className="rounded border border-[#222222] px-2.5 py-1 font-[JetBrains_Mono] text-[11px] text-[#8A8A8A]">
                  {hist.data.fulfilledCount} fulfilled
                </span>
              </div>

              {hist.data.count === 0 ? (
                <Missing
                  label="No requests logged yet"
                  reason="Nothing has been transcribed or translated on this database. This is an empty table, not a failure."
                />
              ) : (
                <ul className="space-y-2">
                  {hist.data.requests.map((r) => (
                    <li key={r.id} className="rounded-lg border border-[#222222] bg-[#0f0f0f] p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-[#C9A84C]/40 bg-[#1C1C1C] px-2 py-0.5 font-[Oswald] text-[9px] font-semibold uppercase tracking-[0.16em] text-[#C9A84C]">
                          {r.kind}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 font-[Oswald] text-[9px] font-semibold uppercase tracking-[0.16em] ${
                            r.fulfilled
                              ? "border-[#FFD700]/40 bg-[#1C1C1C] text-[#FFD700]"
                              : "border-[#c96a4c]/45 bg-[#1C1C1C] text-[#c96a4c]"
                          }`}
                        >
                          {r.fulfilled ? "fulfilled" : "not fulfilled"}
                        </span>
                        <span className="font-[JetBrains_Mono] text-[11px] text-[#8A8A8A]">
                          {r.sourceLanguage || "?"} → {r.targetLanguage || "—"}
                        </span>
                        <span className="ml-auto font-[JetBrains_Mono] text-[11px] text-[#666666]">
                          {fmtWhen(r.createdAt)}
                        </span>
                      </div>
                      {r.resultText && (
                        <p className="mt-2 line-clamp-3 text-[13px] leading-snug text-[#F5F5F5]">{r.resultText}</p>
                      )}
                      {!r.fulfilled && r.note && (
                        <p className="mt-2 text-[12px] leading-snug text-[#8A8A8A]">{r.note}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-[12px] leading-snug text-[#666666]">{hist.data.note}</p>
            </div>
          )}
        </Panel>

        {/* ---------------- Related ---------------- */}
        <Panel title="Related pages" note="Other screens in the app backed by a named source." >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              ["/accessibility", "Accessibility requests", "The queue this history writes to"],
              ["/haptic-language", "Haptic language", "Vibration patterns for deaf drivers"],
              ["/multi-device-haptics", "Multi-device haptics", "Device pairing"],
              ["/dual-ai", "AI gateway status", "Which models are actually reachable"],
            ].map(([href, label, sub]) => (
              <a
                key={href}
                href={href}
                className="flex items-center justify-between gap-3 rounded-lg border border-[#222222] bg-[#0f0f0f] px-4 py-3 transition-colors hover:border-[#C9A84C]"
              >
                <span>
                  <span className="block font-[Oswald] text-[12px] uppercase tracking-[0.14em] text-[#F5F5F5]">{label}</span>
                  <span className="mt-0.5 block text-[12px] text-[#8A8A8A]">{sub}</span>
                </span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#C9A84C]" />
              </a>
            ))}
          </div>
        </Panel>
      </main>

      <footer className="border-t border-[#222222] bg-[#0a0a0a]">
        <div className="mx-auto max-w-[1200px] px-6 py-6 text-[12px] leading-relaxed text-[#666666]">
          Machine transcription and machine translation. TruckWithEase does not certify either one, does not store your
          audio, and does not report a confidence score because the provider does not return one. For anything that goes
          to a regulator, a court, or an insurer, use a human translator.
        </div>
      </footer>
    </div>
  );
}
