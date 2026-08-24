import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, desc } from "drizzle-orm";
import { ensureSeed } from "../lib/seed";
import { ensureHrSeed } from "../lib/hr-seed";
import { runAgent, generateScreeningQuestions, evaluateScreening } from "../agent";
import { hasAI } from "../agent/gateway";

const rid = () => Math.random().toString(36).slice(2, 10);
const round2 = (n: number) => Math.round(n * 100) / 100;

// Simple, transparent payroll withholding model (demo). A real processor files taxes.
function computeDeductions(gross: number) {
  const fed = round2(gross * 0.1);
  const fica = round2(gross * 0.0765);
  const state = round2(gross * 0.04);
  const deductions = [
    { label: "Federal W/H", amount: fed },
    { label: "FICA (SS + Medicare)", amount: fica },
    { label: "State W/H", amount: state },
  ];
  const totalDeductions = round2(fed + fica + state);
  return { deductions, totalDeductions, net: round2(gross - totalDeductions) };
}

export const hr = new Hono()
  .use("*", async (_c, next) => { await ensureSeed(); await ensureHrSeed(); await next(); })

  /* ---------- Dashboard summary ---------- */
  .get("/summary", async (c) => {
    const people = await db.select().from(schema.hrPeople);
    const occ = await db.select().from(schema.hrOccurrences);
    const docs = await db.select().from(schema.hrDocuments);
    const runs = await db.select().from(schema.hrRuns);
    const payrolls = await db.select().from(schema.hrPayrollRuns).orderBy(desc(schema.hrPayrollRuns.createdAt));
    const today = new Date();
    const soon = new Date(today.getTime() + 45 * 86_400_000);
    const expiring = docs.filter((d) => d.expiresOn && new Date(d.expiresOn) <= soon);
    const revenue = runs.reduce((a, r) => a + (r.revenue ?? 0), 0);
    const cost = runs.reduce((a, r) => a + (r.fuelCost ?? 0) + (r.driverPay ?? 0) + (r.tolls ?? 0) + (r.maintenance ?? 0) + (r.otherCost ?? 0), 0);
    return c.json({
      headcount: people.filter((p) => p.type !== "prospect").length,
      prospects: people.filter((p) => p.type === "prospect").length,
      activeDrivers: people.filter((p) => p.status === "active").length,
      openOccurrences: occ.filter((o) => o.status !== "resolved").length,
      criticalOccurrences: occ.filter((o) => o.severity === "critical" || o.severity === "major").length,
      expiringDocs: expiring.length,
      lastPayroll: payrolls[0] ?? null,
      profit: { revenue: round2(revenue), cost: round2(cost), net: round2(revenue - cost) },
    }, 200);
  })

  /* ---------- People ---------- */
  .get("/people", async (c) => {
    const rows = await db.select().from(schema.hrPeople).orderBy(desc(schema.hrPeople.createdAt));
    return c.json({ people: rows }, 200);
  })
  .get("/people/:id", async (c) => {
    const id = c.req.param("id");
    const [person] = await db.select().from(schema.hrPeople).where(eq(schema.hrPeople.id, id));
    if (!person) return c.json({ error: "not found" }, 404);
    const occurrences = await db.select().from(schema.hrOccurrences).where(eq(schema.hrOccurrences.personId, id)).orderBy(desc(schema.hrOccurrences.createdAt));
    const documents = await db.select().from(schema.hrDocuments).where(eq(schema.hrDocuments.personId, id)).orderBy(desc(schema.hrDocuments.createdAt));
    const screenings = await db.select().from(schema.hrScreenings).where(eq(schema.hrScreenings.personId, id));
    const backgroundChecks = await db.select().from(schema.hrBackgroundChecks).where(eq(schema.hrBackgroundChecks.personId, id));
    return c.json({ person, occurrences, documents, screenings, backgroundChecks }, 200);
  })
  .post("/people", async (c) => {
    const b = await c.req.json();
    const [p] = await db.insert(schema.hrPeople).values({
      id: `hp-${rid()}`, driverId: b.driverId ?? null, name: b.name, type: b.type ?? "prospect",
      status: b.status ?? "applicant", position: b.position ?? "Company Driver", phone: b.phone,
      email: b.email, cdlNumber: b.cdlNumber, cdlClass: b.cdlClass ?? "A", cdlState: b.cdlState,
      endorsements: b.endorsements, homeBase: b.homeBase, yearsExperience: b.yearsExperience ?? 0,
      payType: b.payType ?? "mileage", payRate: b.payRate ?? 0, hireDate: b.hireDate ?? null, notes: b.notes,
    }).returning();
    return c.json({ person: p }, 201);
  })
  .patch("/people/:id", async (c) => {
    const id = c.req.param("id");
    const b = await c.req.json();
    const [p] = await db.update(schema.hrPeople).set(b).where(eq(schema.hrPeople.id, id)).returning();
    return c.json({ person: p }, 200);
  })
  .delete("/people/:id", async (c) => {
    await db.delete(schema.hrPeople).where(eq(schema.hrPeople.id, c.req.param("id")));
    return c.json({ ok: true }, 200);
  })

  /* ---------- Occurrences ---------- */
  .get("/occurrences", async (c) => {
    const rows = await db.select().from(schema.hrOccurrences).orderBy(desc(schema.hrOccurrences.createdAt));
    return c.json({ occurrences: rows }, 200);
  })
  .post("/occurrences", async (c) => {
    const b = await c.req.json();
    const [o] = await db.insert(schema.hrOccurrences).values({
      id: `ho-${rid()}`, personId: b.personId, category: b.category ?? "coaching",
      severity: b.severity ?? "minor", occurredOn: b.occurredOn, title: b.title,
      description: b.description, location: b.location, actionTaken: b.actionTaken,
      points: b.points ?? 0, status: b.status ?? "open", reportedBy: b.reportedBy ?? "HR",
    }).returning();
    return c.json({ occurrence: o }, 201);
  })
  .patch("/occurrences/:id", async (c) => {
    const id = c.req.param("id");
    const b = await c.req.json();
    const [o] = await db.update(schema.hrOccurrences).set(b).where(eq(schema.hrOccurrences.id, id)).returning();
    return c.json({ occurrence: o }, 200);
  })

  /* ---------- Documents ---------- */
  .get("/documents", async (c) => {
    const rows = await db.select().from(schema.hrDocuments).orderBy(desc(schema.hrDocuments.createdAt));
    return c.json({ documents: rows }, 200);
  })
  .post("/documents", async (c) => {
    const b = await c.req.json();
    const [d] = await db.insert(schema.hrDocuments).values({
      id: `hd-${rid()}`, personId: b.personId, category: b.category ?? "misc", name: b.name,
      dataUrl: b.dataUrl, sizeBytes: b.sizeBytes ?? 0, notes: b.notes,
      issuedOn: b.issuedOn, expiresOn: b.expiresOn,
    }).returning();
    return c.json({ document: d }, 201);
  })
  .delete("/documents/:id", async (c) => {
    await db.delete(schema.hrDocuments).where(eq(schema.hrDocuments.id, c.req.param("id")));
    return c.json({ ok: true }, 200);
  })

  /* ---------- Screening (AI pre-screen interview) ---------- */
  .get("/screenings", async (c) => {
    const rows = await db.select().from(schema.hrScreenings).orderBy(desc(schema.hrScreenings.createdAt));
    return c.json({ screenings: rows }, 200);
  })
  .post("/screenings/questions", async (c) => {
    const b = await c.req.json();
    const questions = await generateScreeningQuestions(b.position ?? "Company Driver", b.experience);
    return c.json({ questions, live: hasAI() }, 200);
  })
  .post("/screenings", async (c) => {
    const b = await c.req.json();
    const transcript: { q: string; a: string }[] = b.transcript ?? [];
    const evalResult = await evaluateScreening(b.position ?? "Company Driver", transcript);
    const [s] = await db.insert(schema.hrScreenings).values({
      id: `hs-${rid()}`, personId: b.personId ?? null, candidateName: b.candidateName,
      position: b.position ?? "Company Driver", transcript: JSON.stringify(transcript),
      score: evalResult.score, recommendation: evalResult.recommendation, summary: evalResult.summary,
      redFlags: JSON.stringify(evalResult.redFlags), status: "completed",
    }).returning();
    return c.json({ screening: s, live: hasAI() }, 201);
  })

  /* ---------- Background checks (intake + report) ---------- */
  .get("/background", async (c) => {
    const rows = await db.select().from(schema.hrBackgroundChecks).orderBy(desc(schema.hrBackgroundChecks.createdAt));
    return c.json({ backgroundChecks: rows }, 200);
  })
  .post("/background", async (c) => {
    const b = await c.req.json();
    const checkTypes: string[] = b.checkTypes ?? ["mvr", "criminal", "employment", "drug"];
    // Structured intake — report is generated as a compliant template pending a real provider.
    const [bg] = await db.insert(schema.hrBackgroundChecks).values({
      id: `hb-${rid()}`, personId: b.personId, ssnLast4: b.ssnLast4, dob: b.dob,
      licenseState: b.licenseState, consent: !!b.consent, checkTypes: JSON.stringify(checkTypes),
      status: b.consent ? "pending" : "intake",
      findings: JSON.stringify({}), reportSummary: b.consent
        ? "Consent captured. Checks queued. Results pending provider integration — no findings on file yet. Do not take adverse action until results return and FCRA pre-adverse-action steps are followed."
        : "Awaiting signed FCRA disclosure & authorization before any check can run.",
      adjudication: b.consent ? "review" : "intake",
    }).returning();
    return c.json({ backgroundCheck: bg }, 201);
  })
  .patch("/background/:id", async (c) => {
    const id = c.req.param("id");
    const b = await c.req.json();
    const set: Record<string, unknown> = { ...b };
    if (b.checkTypes) set.checkTypes = JSON.stringify(b.checkTypes);
    if (b.findings) set.findings = JSON.stringify(b.findings);
    const [bg] = await db.update(schema.hrBackgroundChecks).set(set).where(eq(schema.hrBackgroundChecks.id, id)).returning();
    return c.json({ backgroundCheck: bg }, 200);
  })

  /* ---------- Payroll ---------- */
  .get("/payroll", async (c) => {
    const runs = await db.select().from(schema.hrPayrollRuns).orderBy(desc(schema.hrPayrollRuns.createdAt));
    return c.json({ runs }, 200);
  })
  // Auto-build lines from active people + their run miles / default hours (static route before :id)
  .get("/payroll/suggest", async (c) => {
    const people = await db.select().from(schema.hrPeople);
    const runs = await db.select().from(schema.hrRuns);
    const lines = people.filter((p) => p.status === "active" || p.type === "driver").map((p) => {
      const miles = runs.filter((r) => r.personId === p.id).reduce((a, r) => a + (r.miles ?? 0), 0);
      const units = p.payType === "mileage" ? (miles || 2000) : p.payType === "hourly" ? 40 : 1;
      return { personId: p.id, personName: p.name, payType: p.payType, units: round2(units), rate: p.payRate };
    });
    return c.json({ lines }, 200);
  })
  .get("/payroll/:id", async (c) => {
    const id = c.req.param("id");
    const [run] = await db.select().from(schema.hrPayrollRuns).where(eq(schema.hrPayrollRuns.id, id));
    if (!run) return c.json({ error: "not found" }, 404);
    const statements = await db.select().from(schema.hrPayStatements).where(eq(schema.hrPayStatements.runId, id));
    return c.json({ run, statements }, 200);
  })
  .get("/payroll/:id/export", async (c) => {
    const id = c.req.param("id");
    const [run] = await db.select().from(schema.hrPayrollRuns).where(eq(schema.hrPayrollRuns.id, id));
    if (!run) return c.json({ error: "not found" }, 404);
    const statements = await db.select().from(schema.hrPayStatements).where(eq(schema.hrPayStatements.runId, id));
    const header = "Employee,Pay Type,Units,Rate,Gross,Federal,FICA,State,Total Deductions,Net\n";
    const rows = statements.map((s) => {
      const d: { label: string; amount: number }[] = JSON.parse(s.deductions ?? "[]");
      const fed = d.find((x) => x.label.startsWith("Federal"))?.amount ?? 0;
      const fica = d.find((x) => x.label.startsWith("FICA"))?.amount ?? 0;
      const state = d.find((x) => x.label.startsWith("State"))?.amount ?? 0;
      return [s.personName, s.payType, s.units, s.rate, s.gross, fed, fica, state, s.totalDeductions, s.net].join(",");
    }).join("\n");
    const csv = `# Payroll ${run.periodStart} to ${run.periodEnd} — status ${run.status}\n${header}${rows}\n`;
    return c.body(csv, 200, {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="payroll-${run.periodStart}_${run.periodEnd}.csv"`,
    });
  })
  // Preview computes pay from provided lines without persisting
  .post("/payroll/preview", async (c) => {
    const b = await c.req.json();
    const lines: { personId: string; personName: string; payType: string; units: number; rate: number }[] = b.lines ?? [];
    const statements = lines.map((l) => {
      const gross = round2((l.units ?? 0) * (l.rate ?? 0));
      const { deductions, totalDeductions, net } = computeDeductions(gross);
      return { ...l, gross, deductions, totalDeductions, net };
    });
    return c.json({
      statements,
      totalGross: round2(statements.reduce((a, s) => a + s.gross, 0)),
      totalNet: round2(statements.reduce((a, s) => a + s.net, 0)),
    }, 200);
  })
  .post("/payroll/run", async (c) => {
    const b = await c.req.json();
    const lines: { personId: string; personName: string; payType: string; units: number; rate: number }[] = b.lines ?? [];
    const runId = `hr-pr-${rid()}`;
    const stmts = lines.map((l) => {
      const gross = round2((l.units ?? 0) * (l.rate ?? 0));
      const { deductions, totalDeductions, net } = computeDeductions(gross);
      return {
        id: `hr-ps-${rid()}`, runId, personId: l.personId, personName: l.personName,
        payType: l.payType, units: l.units, rate: l.rate, gross,
        deductions: JSON.stringify(deductions), totalDeductions, net,
      };
    });
    const totalGross = round2(stmts.reduce((a, s) => a + s.gross, 0));
    const totalNet = round2(stmts.reduce((a, s) => a + s.net, 0));
    const [run] = await db.insert(schema.hrPayrollRuns).values({
      id: runId, periodStart: b.periodStart, periodEnd: b.periodEnd,
      status: b.finalize ? "finalized" : "draft", totalGross, totalNet, headcount: stmts.length,
    }).returning();
    if (stmts.length) await db.insert(schema.hrPayStatements).values(stmts);
    return c.json({ run, statements: stmts }, 201);
  })

  /* ---------- Profitability ---------- */
  .get("/profitability", async (c) => {
    const runs = await db.select().from(schema.hrRuns).orderBy(desc(schema.hrRuns.createdAt));
    const withNet = runs.map((r) => {
      const cost = (r.fuelCost ?? 0) + (r.driverPay ?? 0) + (r.tolls ?? 0) + (r.maintenance ?? 0) + (r.otherCost ?? 0);
      const net = round2((r.revenue ?? 0) - cost);
      const rpm = r.miles ? round2((r.revenue ?? 0) / r.miles) : 0;
      const cpm = r.miles ? round2(cost / r.miles) : 0;
      return { ...r, cost: round2(cost), net, rpm, cpm, margin: r.revenue ? round2((net / r.revenue) * 100) : 0 };
    });
    // Aggregate per driver
    const byDriver: Record<string, { driverName: string; personId: string | null; miles: number; revenue: number; cost: number; net: number; runs: number }> = {};
    for (const r of withNet) {
      const key = r.personId ?? r.driverName ?? "unknown";
      byDriver[key] ??= { driverName: r.driverName ?? "—", personId: r.personId, miles: 0, revenue: 0, cost: 0, net: 0, runs: 0 };
      byDriver[key].miles += r.miles ?? 0;
      byDriver[key].revenue += r.revenue ?? 0;
      byDriver[key].cost += r.cost;
      byDriver[key].net += r.net;
      byDriver[key].runs += 1;
    }
    const drivers = Object.values(byDriver).map((d) => ({
      ...d, revenue: round2(d.revenue), cost: round2(d.cost), net: round2(d.net),
      rpm: d.miles ? round2(d.revenue / d.miles) : 0, cpm: d.miles ? round2(d.cost / d.miles) : 0,
      margin: d.revenue ? round2((d.net / d.revenue) * 100) : 0,
    }));
    return c.json({ runs: withNet, drivers }, 200);
  })
  .post("/profitability", async (c) => {
    const b = await c.req.json();
    const [r] = await db.insert(schema.hrRuns).values({
      id: `hr-run-${rid()}`, personId: b.personId ?? null, driverName: b.driverName,
      origin: b.origin, destination: b.destination, miles: b.miles ?? 0, revenue: b.revenue ?? 0,
      fuelCost: b.fuelCost ?? 0, driverPay: b.driverPay ?? 0, tolls: b.tolls ?? 0,
      maintenance: b.maintenance ?? 0, otherCost: b.otherCost ?? 0, ranOn: b.ranOn,
    }).returning();
    return c.json({ run: r }, 201);
  })

  /* ---------- HumanAI chat (data-aware) ---------- */
  .get("/status", (c) => c.json({ live: hasAI() }, 200))
  .post("/chat", async (c) => {
    const { messages } = await c.req.json();
    // Give the agent a live snapshot so it advises on real records.
    const people = await db.select().from(schema.hrPeople);
    const occ = await db.select().from(schema.hrOccurrences);
    const snapshot = [
      `LIVE HR DATA SNAPSHOT (${new Date().toISOString().slice(0, 10)}):`,
      `Headcount ${people.filter((p) => p.type !== "prospect").length}, prospects ${people.filter((p) => p.type === "prospect").length}.`,
      `People: ${people.map((p) => `${p.name} (${p.type}/${p.status}, ${p.position}, ${p.payType} $${p.payRate})`).join("; ")}.`,
      `Open occurrences: ${occ.filter((o) => o.status !== "resolved").map((o) => `${o.title} [${o.severity}]`).join("; ") || "none"}.`,
    ].join("\n");
    const text = await runAgent("humanai", messages, snapshot);
    return c.json({ text, live: hasAI() }, 200);
  });
