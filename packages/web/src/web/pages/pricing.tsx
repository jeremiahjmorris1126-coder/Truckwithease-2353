/**
 * pricing.tsx — the in-app pricing page.
 *
 * READS
 *   GET /api/signup — PLANS in api/routes/signup.ts is the ONLY price list in this
 *                     product. This page renders whatever the server returns and
 *                     nothing else, including the server's own notes.payment
 *                     admission that billing is not live.
 *
 * REMOVED IN THIS REWRITE
 *   - The hardcoded PLANS array (Solo 29.99 / Pro 39.99 / Fleet 49.99) — a second
 *     price list that could drift from the API. Deleted.
 *   - The invented feature bullets attached to those cards, by name:
 *     "HOS / ELD logging (49 CFR 395)" (this is not an ELD),
 *     "Live GPS tracking", "Load board access" (there is NO load board
 *     integration of any kind), "EaseRewards loyalty points",
 *     "$100 in-app Fuel Card", "Weigh-station bypass account setup guidance",
 *     "Digital permit book", "Priority support" (support has one tier and real
 *     published hours), "Health Chief AI wellness coach",
 *     "Toll cost + cheapest-route engine", "Volume pricing available",
 *     and "Everything in Solo" / "Everything in Pro" ladders built on them.
 *   - The "MOST POPULAR" badge on Pro — there is no adoption data. 1 subscription
 *     record exists and it is cancelled.
 *   - "Start 14-day free trial" as a button that did nothing, and the
 *     "Add the dashcam bundle / Records video, syncs to the app, cloud storage +
 *     incident clips" card with its "Add hardware" button. No hardware ships and
 *     no dashcam product exists.
 *   - "No contracts. Cancel anytime." presented next to a checkout that cannot
 *     charge. Replaced with the server's own statement about billing.
 *   - The sentence comparing against "other vendors' prices". No competitor is
 *     referenced anywhere in this product.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { PageHeader, Card } from "../components/ui/kit";
import { AlertTriangle, Loader2 } from "lucide-react";

const PLAN_ORDER = ["solo", "pro", "fleet_lease", "fleet_owned"];

export default function Pricing() {
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [err, setErr] = useState("");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/signup", { credentials: "include" });
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error((body && body.error) || `/api/signup returned ${res.status}`);
        if (!alive) return;
        setData(body);
        setState("ok");
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message ?? "unknown error");
        setState("error");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const plans = data?.plans
    ? PLAN_ORDER.filter((k) => data.plans[k]).map((k) => ({ key: k, ...data.plans[k] }))
    : [];

  return (
    <div>
      <PageHeader
        title="Plans & Pricing"
        subtitle="Read live from GET /api/signup. This page holds no price list of its own."
      />

      {state === "loading" ? (
        <div className="flex items-center gap-2 text-sm text-[#8A8A8A]">
          <Loader2 className="h-4 w-4 animate-spin text-[#C9A84C]" /> reading /api/signup
        </div>
      ) : null}

      {state === "error" ? (
        <Card className="p-5 border border-[#332222]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-[#c96a4c] mt-0.5 shrink-0" />
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-[#c96a4c]">
                MISSING / NOT TRACKED
              </div>
              <div className="text-sm text-[#F5F5F5] mt-1">Plan pricing</div>
              <pre className="mt-2 whitespace-pre-wrap font-mono-data text-xs text-[#c96a4c]">
                {err}
              </pre>
              <p className="text-sm text-[#8A8A8A] mt-2">
                No price is shown rather than a remembered one.
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      {state === "ok" ? (
        <>
          <div className="grid md:grid-cols-4 gap-5">
            {plans.map((p) => (
              <Card key={p.key} className="p-6 flex flex-col">
                <span className="font-mono-data text-xs text-[#666666]">{p.key}</span>
                <span className="font-bold text-lg text-[#F5F5F5] mt-1">{p.name ?? p.key}</span>
                <div className="mt-4">
                  <span className="text-4xl font-bold font-mono-data text-[#FFD700]">
                    {p.price != null ? `$${p.price}` : "—"}
                  </span>
                  <span className="text-sm text-[#8A8A8A]"> {p.unit ?? ""}</span>
                </div>
                {p.note ? (
                  <p className="text-sm text-[#8A8A8A] mt-3 leading-relaxed">{p.note}</p>
                ) : null}
              </Card>
            ))}
          </div>

          <div className="grid gap-4 mt-6">
            {data?.trialDays != null ? (
              <Card className="p-5 text-sm text-[#F5F5F5]">
                <b>{data.trialDays}-day free trial</b> — the trial length is set by the server
                (<span className="font-mono-data text-xs text-[#C9A84C]">trialDays</span> on
                GET /api/signup).
              </Card>
            ) : null}

            {data?.notes?.payment ? (
              <Card className="p-5 border border-[#333333]">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-[#c96a4c] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[#c96a4c]">
                      MISSING / NOT TRACKED
                    </div>
                    <div className="text-sm text-[#F5F5F5] mt-1">Billing is not live</div>
                    <p className="text-sm text-[#8A8A8A] mt-1 leading-relaxed">
                      {data.notes.payment}
                    </p>
                  </div>
                </div>
              </Card>
            ) : null}

            {data?.notes?.mcCheck ? (
              <Card className="p-5 border border-[#333333]">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-[#c96a4c] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[#c96a4c]">
                      MISSING / NOT TRACKED
                    </div>
                    <div className="text-sm text-[#F5F5F5] mt-1">
                      MC number is not verified with FMCSA
                    </div>
                    <p className="text-sm text-[#8A8A8A] mt-1 leading-relaxed">
                      {data.notes.mcCheck}
                    </p>
                  </div>
                </div>
              </Card>
            ) : null}

            <Card className="p-5 text-sm text-[#8A8A8A] leading-relaxed">
              TruckWithEase is compliance and fleet-management software. It is not an electronic
              logging device and is not registered with FMCSA as an ELD provider. No hardware ships
              today — the hardware lines above are plan pricing, not a shipping product. See the{" "}
              <Link href="/entitled" className="text-[#C9A84C]">
                capability index
              </Link>{" "}
              for what is built and what is not.
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
