import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

// Driver Health — DOT med cards, vitals, physicals. 49 CFR 391 thresholds. In-memory demo.
type MedCard = { id: string; driverId: string; issued: string; expiryDate: string; examiner: string; restrictions: string };
type Vital = { id: string; driverId: string; at: number; systolic: number; diastolic: number; weight: number; height: number; glucose?: number };
type Appt = { id: string; driverId: string; type: string; date: string; provider: string };

const medCards: MedCard[] = [
  { id: "mc-1", driverId: "drv-1", issued: "2025-08-15", expiryDate: "2027-08-15", examiner: "Dr. Patel, DOT", restrictions: "Corrective lenses" },
  { id: "mc-2", driverId: "drv-4", issued: "2024-09-01", expiryDate: "2026-09-01", examiner: "Dr. Nguyen, DOT", restrictions: "None" },
];
const vitals: Vital[] = [
  { id: "v-1", driverId: "drv-1", at: Date.now() - 86400000 * 3, systolic: 128, diastolic: 82, weight: 210, height: 71 },
  { id: "v-2", driverId: "drv-1", at: Date.now() - 86400000 * 30, systolic: 134, diastolic: 86, weight: 214, height: 71 },
];
const appts: Appt[] = [
  { id: "a-1", driverId: "drv-1", type: "DOT Physical", date: "2027-07-15", provider: "Concentra" },
];

function bpCategory(sys: number, dia: number) {
  if (sys >= 180 || dia >= 110) return { level: "danger", label: "Stage 3 — disqualifying (49 CFR 391)" };
  if (sys >= 160 || dia >= 100) return { level: "warning", label: "Stage 2 — 1-yr cert max" };
  if (sys >= 140 || dia >= 90) return { level: "warning", label: "Stage 1 — monitor" };
  if (sys >= 120) return { level: "info", label: "Elevated" };
  return { level: "success", label: "Normal" };
}
function bmi(w: number, h: number) { return +((w / (h * h)) * 703).toFixed(1); }

function reminders() {
  const out: { driverId: string; level: string; msg: string; expiryDate?: string }[] = [];
  const now = Date.now();
  for (const mc of medCards) {
    const days = Math.round((+new Date(mc.expiryDate) - now) / 86400000);
    if (days < 0) out.push({ driverId: mc.driverId, level: "danger", msg: "Med card EXPIRED", expiryDate: mc.expiryDate });
    else if (days <= 30) out.push({ driverId: mc.driverId, level: "danger", msg: `Med card expires in ${days} days`, expiryDate: mc.expiryDate });
    else if (days <= 60) out.push({ driverId: mc.driverId, level: "warning", msg: `Med card expires in ${days} days`, expiryDate: mc.expiryDate });
  }
  return out;
}

export const health = new Hono()
  .get("/reminders", (c) => c.json({ reminders: reminders() }, 200))
  .get("/:driverId", (c) => {
    const id = c.req.param("driverId");
    const mc = medCards.filter((m) => m.driverId === id);
    const vs = vitals.filter((v) => v.driverId === id).sort((a, b) => b.at - a.at);
    const latest = vs[0];
    const flags: { level: string; msg: string }[] = [];
    if (latest) {
      const bp = bpCategory(latest.systolic, latest.diastolic);
      if (bp.level !== "success") flags.push({ level: bp.level, msg: `Blood pressure: ${bp.label} (${latest.systolic}/${latest.diastolic})` });
      const b = bmi(latest.weight, latest.height);
      if (b >= 35) flags.push({ level: "warning", msg: `BMI ${b} — sleep apnea screening recommended` });
      if (latest.glucose && latest.glucose >= 126) flags.push({ level: "warning", msg: `Fasting glucose ${latest.glucose} — elevated` });
    }
    return c.json({ medCards: mc, vitals: vs, appointments: appts.filter((a) => a.driverId === id), flags, reminders: reminders().filter((r) => r.driverId === id) }, 200);
  })
  .post("/:driverId/vitals", zValidator("json", z.object({ systolic: z.number(), diastolic: z.number(), weight: z.number(), height: z.number(), glucose: z.number().optional() })), async (c) => {
    const b = c.req.valid("json");
    const v: Vital = { id: Math.random().toString(36).slice(2), driverId: c.req.param("driverId"), at: Date.now(), systolic: b.systolic, diastolic: b.diastolic, weight: b.weight, height: b.height, glucose: b.glucose };
    vitals.push(v);
    return c.json({ vital: v, bp: bpCategory(v.systolic, v.diastolic), bmi: bmi(v.weight, v.height) }, 201);
  });
