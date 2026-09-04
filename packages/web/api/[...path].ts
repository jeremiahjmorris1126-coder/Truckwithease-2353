import app from "../src/api";

/** Vercel Function entry point for every Hono API route. */
export default function handler(request: Request) {
  return app.fetch(request);
}
