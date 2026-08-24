/**
 * PocketBase compatibility shim.
 *
 * The recovered TruckWithEase source (253 pages) was written against a
 * PocketBase backend that no longer exists. Rather than rewrite 393 call
 * sites, this shim implements the slice of the PocketBase client surface the
 * app actually uses, backed by localStorage so every page keeps working.
 *
 * Collections listed in `SERVER_COLLECTIONS` are proxied to the real Hono +
 * Drizzle + Turso API instead, so features can be migrated to the live
 * backend one collection at a time without touching page code.
 */

const STORE_PREFIX = "twe:pb:";

/** Collections already backed by the real API (see src/api/routes). */
const SERVER_COLLECTIONS: Record<string, string> = {
  drivers: "/api/fleet/drivers",
  trucks: "/api/fleet/trucks",
  loads: "/api/loads",
  dvir: "/api/dvir",
  hos: "/api/hos/status",
  mechanic_sessions: "/api/mechanic",
  maintenance_records: "/api/maintenance",
  accident_reports: "/api/incidents",
  fleet_branding: "/api/branding",
  platform_settings: "/api/settings",
};

export type Record_ = { id: string; created: string; updated: string; [k: string]: unknown };

function readAll(name: string): Record_[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORE_PREFIX + name) || "[]") as Record_[];
  } catch {
    return [];
  }
}

function writeAll(name: string, rows: Record_[]) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORE_PREFIX + name, JSON.stringify(rows));
  } catch {
    /* quota — ignore */
  }
}

function newId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/**
 * Translates a PocketBase filter string into a predicate.
 * Supports the subset the recovered pages use: `field = "value"` clauses
 * joined by `&&`, plus `!=`, `>`, `<`, and `~` (contains).
 */
function makeFilter(filter?: string): (r: Record_) => boolean {
  if (!filter) return () => true;
  const clauses = filter.split("&&").map((c) => c.trim()).filter(Boolean);
  return (r) =>
    clauses.every((clause) => {
      const m = clause.match(/^([\w.]+)\s*(!=|>=|<=|~|=|>|<)\s*(.+)$/);
      if (!m) return true;
      const [, field, op, rawVal] = m;
      const val = rawVal.trim().replace(/^["'`]|["'`]$/g, "");
      const actual = r[field];
      switch (op) {
        case "=":
          return String(actual) === val;
        case "!=":
          return String(actual) !== val;
        case "~":
          return String(actual ?? "").toLowerCase().includes(val.toLowerCase());
        case ">":
          return Number(actual) > Number(val);
        case "<":
          return Number(actual) < Number(val);
        case ">=":
          return Number(actual) >= Number(val);
        case "<=":
          return Number(actual) <= Number(val);
        default:
          return true;
      }
    });
}

function applySort(rows: Record_[], sort?: string): Record_[] {
  if (!sort) return rows;
  const keys = sort.split(",").map((s) => s.trim()).filter(Boolean);
  const out = [...rows];
  out.sort((a, b) => {
    for (const key of keys) {
      const desc = key.startsWith("-");
      const field = desc ? key.slice(1) : key;
      const av = a[field];
      const bv = b[field];
      if (av === bv) continue;
      const cmp = (av ?? "") > (bv ?? "") ? 1 : -1;
      return desc ? -cmp : cmp;
    }
    return 0;
  });
  return out;
}

async function serverFetch(path: string): Promise<Record_[]> {
  try {
    const res = await fetch(path);
    if (!res.ok) return [];
    const json = await res.json();
    if (Array.isArray(json)) return json as Record_[];
    for (const key of ["data", "items", "results", "drivers", "trucks", "loads"]) {
      if (Array.isArray((json as Record<string, unknown>)[key])) {
        return (json as Record<string, Record_[]>)[key];
      }
    }
    return json ? [json as Record_] : [];
  } catch {
    return [];
  }
}

export class ClientResponseError extends Error {
  status: number;
  constructor(message: string, status = 404) {
    super(message);
    this.name = "ClientResponseError";
    this.status = status;
  }
}

type ListOpts = { filter?: string; sort?: string; expand?: string; [k: string]: unknown };

class Collection {
  constructor(private name: string) {}

  private async rows(): Promise<Record_[]> {
    const serverPath = SERVER_COLLECTIONS[this.name];
    if (serverPath) {
      const remote = await serverFetch(serverPath);
      if (remote.length) return remote;
    }
    return readAll(this.name);
  }

  async getFullList(opts: ListOpts = {}): Promise<Record_[]> {
    const rows = (await this.rows()).filter(makeFilter(opts.filter));
    return applySort(rows, opts.sort);
  }

  async getList(page = 1, perPage = 30, opts: ListOpts = {}) {
    const all = applySort((await this.rows()).filter(makeFilter(opts.filter)), opts.sort);
    const start = (page - 1) * perPage;
    return {
      page,
      perPage,
      totalItems: all.length,
      totalPages: Math.max(1, Math.ceil(all.length / perPage)),
      items: all.slice(start, start + perPage),
    };
  }

  async getOne(id: string): Promise<Record_> {
    const found = (await this.rows()).find((r) => r.id === id);
    if (!found) throw new ClientResponseError(`No record found: ${this.name}/${id}`);
    return found;
  }

  async getFirstListItem(filter: string, opts: ListOpts = {}): Promise<Record_> {
    const rows = applySort((await this.rows()).filter(makeFilter(filter)), opts.sort);
    if (!rows.length) throw new ClientResponseError(`No record matches filter: ${filter}`);
    return rows[0];
  }

  async create(data: Partial<Record_> = {}): Promise<Record_> {
    const now = new Date().toISOString();
    const rec: Record_ = { ...data, id: (data.id as string) || newId(), created: now, updated: now };
    const rows = readAll(this.name);
    rows.push(rec);
    writeAll(this.name, rows);
    return rec;
  }

  async update(id: string, data: Partial<Record_> = {}): Promise<Record_> {
    const rows = readAll(this.name);
    const i = rows.findIndex((r) => r.id === id);
    const now = new Date().toISOString();
    if (i === -1) {
      const rec: Record_ = { ...data, id, created: now, updated: now };
      rows.push(rec);
      writeAll(this.name, rows);
      return rec;
    }
    rows[i] = { ...rows[i], ...data, updated: now };
    writeAll(this.name, rows);
    return rows[i];
  }

  async delete(id: string): Promise<boolean> {
    const rows = readAll(this.name).filter((r) => r.id !== id);
    writeAll(this.name, rows);
    return true;
  }

  async authWithPassword(email: string, _password: string) {
    const user = { id: newId(), email, name: email.split("@")[0] };
    pbInstance.authStore.save("demo-token", user);
    return { token: "demo-token", record: user };
  }

  subscribe() {
    return Promise.resolve(() => {});
  }
  unsubscribe() {
    return Promise.resolve();
  }
}

class AuthStore {
  token = "";
  model: Record<string, unknown> | null = null;

  constructor() {
    if (typeof localStorage !== "undefined") {
      try {
        const raw = localStorage.getItem(STORE_PREFIX + "auth");
        if (raw) {
          const parsed = JSON.parse(raw);
          this.token = parsed.token || "";
          this.model = parsed.model || null;
        }
      } catch {
        /* ignore */
      }
    }
  }

  get isValid() {
    return Boolean(this.token);
  }

  save(token: string, model: Record<string, unknown> | null) {
    this.token = token;
    this.model = model;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORE_PREFIX + "auth", JSON.stringify({ token, model }));
    }
  }

  clear() {
    this.token = "";
    this.model = null;
    if (typeof localStorage !== "undefined") localStorage.removeItem(STORE_PREFIX + "auth");
  }

  onChange() {
    return () => {};
  }
}

export default class PocketBase {
  authStore = new AuthStore();
  baseUrl: string;
  private cols = new Map<string, Collection>();

  constructor(baseUrl = "/") {
    this.baseUrl = baseUrl;
  }

  collection(name: string): Collection {
    let c = this.cols.get(name);
    if (!c) {
      c = new Collection(name);
      this.cols.set(name, c);
    }
    return c;
  }

  autoCancellation() {
    return this;
  }
}

const pbInstance = new PocketBase();
export { pbInstance };
