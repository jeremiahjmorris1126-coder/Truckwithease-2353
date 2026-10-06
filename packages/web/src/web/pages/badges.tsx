import { useEffect, useState } from "react";
import { Award, RefreshCw } from "lucide-react";
import BadgeShowcase, { ALL_BADGE_KEYS } from "../components/badge-showcase";

type BadgeResponse = {
  achievements: string[];
  all: string[];
  counters: { bookedLoads: number; inspections: number; trips: number; actions: number; ageDays: number };
};

export default function Badges() {
  const [data, setData] = useState<BadgeResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const driverId = new URLSearchParams(window.location.search).get("driver") ?? "drv-1";

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`/api/rewards/${driverId}/badges`);
      if (!r.ok) throw new Error(`API ${r.status}`);
      setData((await r.json()) as BadgeResponse);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load badges");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverId]);

  const earned = data?.achievements ?? [];

  return (
    <div className="min-h-screen bg-twblack px-5 py-10 text-white md:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-twborder pb-6">
          <div>
            <div className="flex items-center gap-2 text-twgold">
              <Award size={18} />
              <span className="font-heading text-[11px] uppercase tracking-[0.22em]">EaseRewards</span>
            </div>
            <h1 className="mt-2 font-display text-4xl uppercase tracking-wide text-gold-gradient md:text-5xl">
              Driver Badges
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/50">
              Earned from real activity — booked loads, submitted DVIRs, saved trips and account age. Nothing here is
              awarded by hand.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="flex items-center gap-2 rounded border border-twgold/40 px-4 py-2 font-heading text-[11px] uppercase tracking-[0.16em] text-twgold transition-colors hover:bg-twgold/10"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Stat label="Earned" value={`${earned.length} / ${ALL_BADGE_KEYS.length}`} />
          <Stat label="Loads booked" value={String(data?.counters.bookedLoads ?? "—")} />
          <Stat label="DVIRs" value={String(data?.counters.inspections ?? "—")} />
          <Stat label="Trips saved" value={String(data?.counters.trips ?? "—")} />
          <Stat label="Days active" value={String(data?.counters.ageDays ?? "—")} />
        </div>

        {err && (
          <div className="mt-6 rounded border border-red-500/40 bg-red-500/5 p-4 text-sm text-red-300">
            Couldn’t load badges: {err}
          </div>
        )}

        <div className="mt-8">
          <BadgeShowcase achievements={earned} showLocked />
        </div>

        <p className="mt-8 text-xs text-white/30">
          Scout (10+ stops rated) and Fleet Protector (broker warning) stay locked until those tables exist — they are
          never faked.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-twborder bg-twcard px-4 py-3">
      <div className="font-mono text-lg text-twgoldbright">{value}</div>
      <div className="font-heading text-[10px] uppercase tracking-[0.16em] text-white/40">{label}</div>
    </div>
  );
}
