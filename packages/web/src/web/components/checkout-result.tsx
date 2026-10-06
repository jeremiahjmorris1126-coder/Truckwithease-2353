import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";

type Result = { status: string | null; plan: string | null; quantity: number; trialDays: number; error?: string };

export function CheckoutResult() {
  const params = new URLSearchParams(window.location.search);
  const outcome = params.get("checkout");
  const sessionId = params.get("session_id");

  const { data, isLoading } = useQuery({
    queryKey: ["checkout", sessionId],
    enabled: outcome === "success" && Boolean(sessionId),
    queryFn: async (): Promise<Result> => {
      const res = await fetch(`/api/billing/checkout/${encodeURIComponent(sessionId ?? "")}`, { credentials: "include" });
      return res.json();
    },
  });

  if (outcome === "cancelled") {
    return (
      <div role="status" className="mt-8 flex items-start gap-3 rounded-xl border border-twborder bg-twcard p-4 text-sm text-neutral-300">
        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-neutral-500" aria-hidden="true" />
        Checkout was cancelled. Nothing was charged.
      </div>
    );
  }
  if (outcome !== "success") return null;

  const done = data?.status === "complete";
  return (
    <div role="status" className="mt-8 flex items-start gap-3 rounded-xl border border-emerald-500 bg-twcard p-4 text-sm text-neutral-200">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
      <p className="text-pretty">
        {isLoading
          ? "Confirming your subscription..."
          : done
            ? `You're subscribed to ${data?.plan} for ${data?.quantity}. Your ${data?.trialDays}-day free trial has started.`
            : data?.error ?? "We couldn't confirm this checkout yet. Refresh in a moment."}
      </p>
    </div>
  );
}
