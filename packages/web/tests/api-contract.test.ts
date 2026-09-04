import { expect, test } from "bun:test";
import handler from "../api/[...path]";

const origin = "https://truckwithease.example";

test("Vercel Function forwards the public health endpoint", async () => {
  const response = await handler(new Request(`${origin}/api/health`));

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ status: "ok" });
});

test("integration status is publicly available with provider metadata", async () => {
  const response = await handler(new Request(`${origin}/api/integrations/status`));

  expect(response.status).toBe(200);
  const body = await response.json() as { providers: Array<{ envKeys: string[] }> };
  expect(Array.isArray(body.providers)).toBe(true);
  expect(body.providers.every((provider) => Array.isArray(provider.envKeys))).toBe(true);
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

test("broker verification requires a Better Auth session", async () => {
  const response = await handler(
    new Request(`${origin}/api/intel/broker/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "dispatch@example.com" }),
    }),
  );

  expect(response.status).toBe(401);
  expect(await response.json()).toMatchObject({ error: "Authentication required." });
});
