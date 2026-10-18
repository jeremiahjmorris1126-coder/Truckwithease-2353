import { Hono } from "hono";
import Stripe from "stripe";
import { auth } from "../auth";
import { PLANS, TRIAL_DAYS } from "./signup";

/**
 * Stripe Checkout for the plans on the Billing page.
 *
 * The browser only sends a plan id, a quantity and a request id. The price is
 * always taken from PLANS on the server, so a tampered request cannot change
 * what a customer is charged.
 */

const MAX_UNITS = 500;
const REQUEST_ID = /^[A-Za-z0-9-]{8,64}$/;

let client: Stripe | null = null;
function stripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client ??= new Stripe(key);
  return client;
}

const keyMode = () => {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  if (key.startsWith("sk_live_") || key.startsWith("rk_live_")) return "live";
  if (key.startsWith("sk_test_") || key.startsWith("rk_test_")) return "test";
  return null;
};

function returnOrigin(header: string | undefined, requestUrl: string): string {
  if (header) {
    try {
      const u = new URL(header);
      if (u.protocol === "https:" || u.hostname === "localhost") return u.origin;
    } catch {
      /* fall through */
    }
  }
  return new URL(requestUrl).origin;
}

export const billing = new Hono()

  .get("/", (c) =>
    c.json({
      configured: Boolean(process.env.STRIPE_SECRET_KEY),
      mode: keyMode(),
      trialDays: TRIAL_DAYS,
      maxUnits: MAX_UNITS,
      plans: PLANS,
    }),
  )

  .post("/checkout", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user) return c.json({ error: "Sign in to start a subscription." }, 401);

    const s = stripe();
    if (!s) return c.json({ error: "Payments are not configured yet. STRIPE_SECRET_KEY is missing." }, 503);

    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const planId = typeof body.planId === "string" ? body.planId : "";
    const plan = PLANS[planId];
    if (!plan) return c.json({ error: "Unknown plan.", field: "planId" }, 400);

    const quantity = Number(body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_UNITS) {
      return c.json({ error: `Quantity must be a whole number from 1 to ${MAX_UNITS}.`, field: "quantity" }, 400);
    }

    const requestId = typeof body.requestId === "string" ? body.requestId : "";
    if (!REQUEST_ID.test(requestId)) return c.json({ error: "Invalid request id." }, 400);

    const origin = returnOrigin(c.req.header("origin"), c.req.url);
    const metadata = { userId: session.user.id, planId, quantity: String(quantity) };

    try {
      const checkout = await s.checkout.sessions.create(
        {
          mode: "subscription",
          customer_email: session.user.email,
          client_reference_id: session.user.id,
          line_items: [
            {
              quantity,
              price_data: {
                currency: "usd",
                unit_amount: Math.round(plan.unitPrice * 100),
                recurring: { interval: "month" },
                product_data: { name: `TruckWithEase ${plan.name}`, description: `Billed per ${plan.unit.replace("/mo", "")}` },
              },
            },
          ],
          subscription_data: { trial_period_days: TRIAL_DAYS, metadata },
          metadata,
          success_url: `${origin}/app/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/app/billing?checkout=cancelled`,
        },
        { idempotencyKey: `checkout:${session.user.id}:${planId}:${quantity}:${requestId}` },
      );
      if (!checkout.url) return c.json({ error: "Stripe did not return a checkout link." }, 502);
      return c.json({ url: checkout.url, id: checkout.id });
    } catch (err) {
      const message = err instanceof Stripe.errors.StripeError ? err.message : "Could not start checkout.";
      console.error("[billing] checkout failed:", message);
      return c.json({ error: message }, 502);
    }
  })

  .get("/checkout/:id", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user) return c.json({ error: "Sign in required." }, 401);

    const s = stripe();
    if (!s) return c.json({ error: "Payments are not configured yet." }, 503);

    const id = c.req.param("id");
    if (!/^cs_[A-Za-z0-9_]{10,200}$/.test(id)) return c.json({ error: "Invalid checkout id." }, 400);

    try {
      const checkout = await s.checkout.sessions.retrieve(id);
      if (checkout.metadata?.userId !== session.user.id) return c.json({ error: "Not found." }, 404);
      const plan = PLANS[checkout.metadata?.planId ?? ""];
      return c.json({
        status: checkout.status,
        paymentStatus: checkout.payment_status,
        plan: plan?.name ?? null,
        quantity: Number(checkout.metadata?.quantity ?? 0),
        trialDays: TRIAL_DAYS,
      });
    } catch (err) {
      const message = err instanceof Stripe.errors.StripeError ? err.message : "Could not load checkout.";
      return c.json({ error: message }, 502);
    }
  });
