import { expect, test } from "bun:test";
import handler from "../api/[...path]";

const origin = "https://truckwithease.example";

test("Vercel Function forwards the public health endpoint", async () => {
  const response = await handler(new Request(`${origin}/api/health`));

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ status: "ok" });
});

test("Google navigation endpoints require a Better Auth session", async () => {
  const [routes, places, geocode, matrix] = await Promise.all([
    handler(new Request(`${origin}/api/routing/routes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ origin: "St. Louis, MO", destination: "Chicago, IL" }) })),
    handler(new Request(`${origin}/api/routing/places`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: "truck stops near St. Louis" }) })),
    handler(new Request(`${origin}/api/routing/geocode?address=St.%20Louis%2C%20MO`)),
    handler(new Request(`${origin}/api/routing/matrix`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ origins: [{ id: "T-104", address: "St. Louis, MO" }], destination: "Chicago, IL" }) })),
  ]);
  expect([routes.status, places.status, geocode.status, matrix.status]).toEqual([401, 401, 401, 401]);
});

test("Quantum Operations requires a Better Auth session", async () => {
  const response = await handler(new Request(`${origin}/api/quantum-operations`));
  expect(response.status).toBe(401);
  expect(await response.json()).toMatchObject({ error: "Authentication required." });
});

test("asset tracker requires a Better Auth session", async () => {
  const response = await handler(new Request(`${origin}/api/assets`));
  expect(response.status).toBe(401);
  expect(await response.json()).toMatchObject({ error: "Authentication required." });
});

test("Fleet Chief requires a Better Auth session", async () => {
  const response = await handler(
    new Request(`${origin}/api/agent/fleet-chief`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "DEF pressure fault" }] }),
    }),
  );

  expect(response.status).toBe(401);
  expect(await response.json()).toMatchObject({
    error: "Authentication required.",
    signIn: "/api/auth/sign-in/email",
  });
});

test("maintenance endpoints require a Better Auth session", async () => {
  const response = await handler(new Request(`${origin}/api/maintenance/pm-intervals`));

  expect(response.status).toBe(401);
  expect(await response.json()).toMatchObject({ error: "Authentication required." });
});
