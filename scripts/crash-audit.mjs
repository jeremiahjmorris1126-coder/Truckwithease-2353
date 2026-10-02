#!/usr/bin/env node
// Runtime crash audit — ported from Jeremiah's legacy verify-pages.cjs.
// Keeps ONLY the three real crash checks (file-scope forward references,
// hooks after a conditional return, missing export default).
// Dropped from the original: REQUIRED_PAGES / PAGES_SUBDIR (stale flat-src
// paths) and REQUIRED_CONSTANTS (NAVY/ORANGE/AMBER — abandoned palette).
//
// Usage: node scripts/crash-audit.mjs            (report only, exit 0)
//        node scripts/crash-audit.mjs --strict   (exit 1 on findings)

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const LEGACY = path.join(ROOT, "packages/web/src/web/legacy");
const STRICT = process.argv.includes("--strict");

const KEYWORDS = new Set([
  "import","from","export","default","return","function","const","let","var","if","else",
  "for","of","in","true","false","null","undefined","new","this","class","extends","super",
  "typeof","instanceof","async","await","try","catch","switch","case","break","continue",
  "throw","React","useState","useEffect","useRef","useCallback","useMemo","useLayoutEffect",
  "Fragment","window","document","console","Math","JSON","Object","Array","String","Number",
  "Boolean","Date","Promise","Map","Set","localStorage","sessionStorage","fetch","setTimeout",
  "setInterval","navigator","location",
]);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(jsx|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

const files = walk(LEGACY);
const findings = { forward: [], hooks: [], noExport: [] };

for (const file of files) {
  const rel = path.relative(ROOT, file);
  const src = fs.readFileSync(file, "utf8");
  const lines = src.split("\n");

  // Only the default-exported component counts as the component body.
  // Matching bare `function Foo(` also caught plain helpers, whose early
  // returns then flagged every later hook in the file as a false positive.
  let compStart = lines.findIndex((l) => /^export default (function|\()/.test(l));
  if (compStart === -1) compStart = lines.length;

  // Mask template literals: legacy pages embed huge CSS blocks in backticks,
  // and class names like ".fk-benefits-bg" were matching as identifiers.
  let inTpl = false;
  const code = lines.map((l) => {
    const stripped = l.replace(/`[^`]*`/g, "``");
    const open = inTpl;
    if ((stripped.match(/`/g) || []).length % 2 === 1) inTpl = !inTpl;
    return open ? "" : stripped;
  });

  // ── 1. file-scope forward references ──
  const decls = {};
  code.slice(0, compStart).forEach((l, i) => {
    const m = l.match(/^(?:const|let|var)\s+(\w+)\s*=/);
    if (m) decls[m[1]] = i + 1;
  });
  code.slice(0, compStart).forEach((l, i) => {
    const lineNum = i + 1;
    if (/^\s*(import|const|let|var|\/\/|\/\*|\*|export)/.test(l)) return;
    for (const id of l.match(/\b([a-zA-Z_][a-zA-Z0-9_]+)\b/g) || []) {
      if (KEYWORDS.has(id)) continue;
      if (decls[id] && decls[id] > lineNum) {
        findings.forward.push(`${rel}:${lineNum} uses "${id}" declared at line ${decls[id]}`);
      }
    }
  });

  // ── 2. hooks after a conditional return ──
  const body = lines.slice(compStart);
  let firstReturn = -1;
  body.forEach((l, i) => {
    const t = l.trim();
    if (firstReturn === -1 && /^if\s*\(.*\)\s*return\s+</.test(t)) firstReturn = i;
    if (
      firstReturn !== -1 &&
      i > firstReturn &&
      /^(const \[|useEffect\(|useRef\(|useCallback\(|useMemo\()/.test(t)
    ) {
      findings.hooks.push(`${rel}:${compStart + i + 1} — hook after conditional return`);
    }
  });

  // ── 3. missing export default ──
  if (!src.includes("export default")) findings.noExport.push(rel);
}

const total = findings.forward.length + findings.hooks.length + findings.noExport.length;

const show = (title, arr) => {
  console.log(`\n${title} — ${arr.length}`);
  arr.forEach((x) => console.log("  " + x));
};

console.log(`Crash audit — ${files.length} files scanned under ${path.relative(ROOT, LEGACY)}`);
show("Forward references (file scope)", findings.forward);
show("Hooks after conditional return", findings.hooks);
show("Missing export default", findings.noExport);
console.log(`\nTotal: ${total}`);

if (STRICT && total > 0) process.exit(1);
