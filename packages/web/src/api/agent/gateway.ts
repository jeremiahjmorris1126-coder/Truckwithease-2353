import { createGateway } from "ai";

/**
 * AI Gateway client.
 *
 * Auth needs only an API key. The base URL is OPTIONAL — when it is not set the
 * provider defaults to Vercel's AI Gateway. Requiring a base URL here is exactly
 * what forced every agent into demo mode on a deployment that had a valid key
 * but no explicit AI_GATEWAY_BASE_URL, so liveness keys off the API key alone
 * and the base URL is only passed through when it is actually present.
 */
const baseURL = process.env.AI_GATEWAY_BASE_URL;

export const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  ...(baseURL ? { baseURL } : {}),
});

export const hasAI = () => !!process.env.AI_GATEWAY_API_KEY;
