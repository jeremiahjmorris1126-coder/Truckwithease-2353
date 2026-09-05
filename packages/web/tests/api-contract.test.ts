import { expect, test } from "bun:test";
import handler from "../api/[...path]";

const origin = "https://truckwithease.example";

test("Vercel Function forwards the public health endpoint", async () => {
  const response = await handler(new Request(`${origin}/api/health`));

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ status: "ok" });
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
