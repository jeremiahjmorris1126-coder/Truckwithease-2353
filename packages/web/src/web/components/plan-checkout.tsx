import { useState } from "react";
import { Minus, Plus, Loader2 } from "lucide-react";

type Option = { planId: string; label: string; unit: string };

const MAX_UNITS = 500;

export function PlanCheckout({ options, featured }: { options: Option[]; featured: boolean }) {
  const [optionIndex, setOptionIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const option = options[optionIndex];

  const clamp = (n: number) => Math.min(MAX_UNITS, Math.max(1, Math.floor(n) || 1));

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: option.planId, quantity, requestId: crypto.randomUUID() }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (res.status === 401) {
        window.location.href = "/sign-in?next=/app/billing";
        return;
      }
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not start checkout.");
      if (window.self !== window.top) window.open(data.url, "_blank", "noopener");
      else window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      {options.length > 1 && (
        <div role="radiogroup" aria-label="Hardware option" className="grid grid-cols-2 gap-2">
          {options.map((o, i) => (
            <button
              key={o.planId}
              type="button"
              role="radio"
              aria-checked={i === optionIndex}
              onClick={() => setOptionIndex(i)}
              className={`min-h-11 rounded-lg border px-2 text-sm font-semibold transition-colors ${
                i === optionIndex ? "border-twgoldbright bg-twnav text-twgoldbright" : "border-twborder text-neutral-400"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <label htmlFor={`qty-${option.planId}`} className="text-sm text-neutral-300">
          {option.unit === "truck" ? "Trucks" : "Drivers"}
        </label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Decrease"
            onClick={() => setQuantity((q) => clamp(q - 1))}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-twborder text-twgold"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            id={`qty-${option.planId}`}
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_UNITS}
            value={quantity}
            onChange={(e) => setQuantity(clamp(Number(e.target.value)))}
            className="h-11 w-16 rounded-lg border border-twborder bg-twnav text-center font-mono-data text-base text-white"
          />
          <button
            type="button"
            aria-label="Increase"
            onClick={() => setQuantity((q) => clamp(q + 1))}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-twborder text-twgold"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-lg py-3 font-heading text-sm uppercase tracking-wide transition-colors disabled:opacity-60 ${
          featured
            ? "bg-twgoldbright text-twblack hover:bg-twgold"
            : "border border-twgold text-twgold hover:bg-twgold hover:text-twblack"
        }`}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {loading ? "Opening checkout" : "Start 14-day free trial"}
      </button>
      <p className="text-center text-xs text-neutral-500">Card required. No charge until the trial ends.</p>
      {error && (
        <p role="alert" className="text-center text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
