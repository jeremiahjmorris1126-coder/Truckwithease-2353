// Validates that required release environment variables are set.
// Usage: bun run scripts/validate-env.ts <mobile|desktop-mac|desktop-win|all>
const REQUIRED: Record<string, string[]> = {
  mobile: ["EXPO_TOKEN", "GOOGLE_MAPS_MOBILE_API_KEY"],
  "desktop-mac": ["CSC_LINK", "CSC_KEY_PASSWORD", "APPLE_ID", "APPLE_APP_SPECIFIC_PASSWORD", "APPLE_TEAM_ID"],
  "desktop-win": ["WIN_CSC_LINK", "WIN_CSC_KEY_PASSWORD"],
};
const target = process.argv[2] ?? "all";
const groups = target === "all" ? Object.keys(REQUIRED) : [target];
const missing: string[] = [];
for (const g of groups) {
  if (!REQUIRED[g]) {
    console.error(`Unknown target: ${g}`);
    process.exit(2);
  }
  for (const k of REQUIRED[g]) if (!process.env[k]) missing.push(k);
}
if (missing.length) {
  console.error(`Missing required environment variables:\n  ${missing.join("\n  ")}`);
  process.exit(1);
}
console.log("Environment OK");
