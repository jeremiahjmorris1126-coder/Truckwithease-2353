##
## TruckWithEase — Render web service.
##
## Why Docker and not Render's native runtime: Render has no first-class Bun
## runtime, and this app is Bun end to end (Bun.serve in
## packages/web/src/server.ts, bun workspaces, turbo). The official Bun image
## removes the "install Bun in the build command" fragility entirely.
##
## What this serves that Cloudflare Pages cannot: /api/*. Pages is static, so
## POST /api/comms/inbound -- the Twilio inbound webhook that drives Sealed Line
## auto-replies and clock answers -- has no endpoint there. This container is
## that endpoint.
##
FROM oven/bun:1.3.14 AS build

WORKDIR /app

# Manifests first so the dependency layer caches across code-only deploys.
COPY package.json bun.lock ./
COPY packages/web/package.json packages/web/package.json
COPY packages/mobile/package.json packages/mobile/package.json
COPY packages/desktop/package.json packages/desktop/package.json

# Workspace install. Mobile/desktop deps come along because bun installs the
# whole workspace; they are dropped from the runtime image below.
RUN bun install --frozen-lockfile

COPY . .

# build:web is `vite build` only -- deliberately not the package-level `build`,
# which prefixes `tsc --noEmit`. Typechecking is a CI concern, not a deploy
# concern; a type error must not take the Twilio webhook offline.
RUN bun run build:web

##
## Runtime image. Carries the built dist and node_modules, not the toolchain.
##
FROM oven/bun:1.3.14-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/packages/web ./packages/web

# Render injects PORT. server.ts reads it (`process.env.PORT ?? 3000`) and
# Bun.serve binds 0.0.0.0 by default, which is what Render's health probe needs.
EXPOSE 10000

CMD ["bun", "packages/web/src/server.ts"]
