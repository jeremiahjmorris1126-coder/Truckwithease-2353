/**
 * /sign-in — the real sign-in page.
 *
 * ENDPOINTS THIS PAGE USES
 *   POST /api/auth/sign-in/email        (Better Auth, email + password)
 *   POST /api/auth/sign-up/email        (Better Auth, create account)
 *   POST /api/auth/managed/exchange     (via authClient.managedAuth.signIn)
 *   GET  /api/session/me                (who am I + what role)
 *   GET  /api/session/status            (is auth actually configured)
 *
 * WHAT THIS REPLACED
 *   This route used to render AccessibleSignupPage, a marketing form that
 *   created no account and set no session. Nothing here is simulated: every
 *   message shown below is the server's own error string, printed raw.
 *
 * WHAT THIS DOES NOT CLAIM
 *   - Google / Apple / Microsoft go through Runable managed auth. This app
 *     holds no provider secret and no provider key is ever typed into a page.
 *   - A session gates this page and /api/session/role. It does NOT yet gate
 *     the other 40+ API routers — GET /api/session/coverage says so plainly.
 *   - Email is not verified on sign-up: Postmark has not approved the account
 *     yet, so no verification mail can be sent. Stated, not hidden.
 */
import { useEffect, useState } from "react";
import { LogIn, ShieldCheck, AlertTriangle, UserPlus, KeyRound } from "lucide-react";
import { authClient } from "../../lib/auth";

const GOLD = "#C9A84C";
const GOLDB = "#FFD700";
const WARN = "#c96a4c";
const C = {
  black: "#0a0a0a",
  card: "#161616",
  border: "#222222",
  white: "#f5f5f5",
  muted: "#8a8a8a",
  dim: "#666666",
};

async function getJSON(url) {
  const r = await fetch(url);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `${url} returned ${r.status}`);
  return j;
}

function Panel({ title, note, right, icon, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 4 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "14px 18px",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {icon}
          <div>
            <div
              style={{
                fontFamily: "Oswald, sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                fontSize: 12,
                color: GOLD,
              }}
            >
              {title}
            </div>
            {note ? (
              <div style={{ fontSize: 11, color: C.dim, marginTop: 4, fontFamily: "Inter, sans-serif" }}>{note}</div>
            ) : null}
          </div>
        </div>
        {right}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

function Err({ msg }) {
  if (!msg) return null;
  return (
    <div
      style={{
        marginTop: 12,
        border: `1px solid ${WARN}`,
        background: "rgba(201,106,76,0.08)",
        borderRadius: 4,
        padding: "10px 12px",
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
      }}
    >
      <AlertTriangle size={14} color={WARN} style={{ marginTop: 2, flexShrink: 0 }} />
      <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11.5, color: "#e6c7bb", lineHeight: 1.5 }}>
        {msg}
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontFamily: "Oswald, sans-serif",
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  fontSize: 10.5,
  color: C.muted,
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  background: "#0d0d0d",
  border: `1px solid ${C.border}`,
  borderRadius: 3,
  padding: "11px 12px",
  color: C.white,
  fontFamily: "Inter, sans-serif",
  fontSize: 14,
  outline: "none",
};

function Btn({ children, onClick, disabled, primary, full }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: full ? "100%" : undefined,
        background: primary ? `linear-gradient(90deg, ${GOLD}, ${GOLDB})` : "transparent",
        color: primary ? "#0a0a0a" : GOLD,
        border: `1px solid ${primary ? GOLDB : C.border}`,
        borderRadius: 3,
        padding: "11px 18px",
        fontFamily: "Oswald, sans-serif",
        textTransform: "uppercase",
        letterSpacing: "0.16em",
        fontSize: 12,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      {children}
    </button>
  );
}

export default function SignInPage() {
  const { data: session, isPending } = authClient.useSession();
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [status, setStatus] = useState(null);
  const [statusErr, setStatusErr] = useState("");
  const [me, setMe] = useState(null);

  useEffect(() => {
    getJSON("/api/session/status")
      .then(setStatus)
      .catch((e) => setStatusErr(String(e.message || e)));
  }, []);

  useEffect(() => {
    if (!session) {
      setMe(null);
      return;
    }
    const token = (() => {
      try {
        return authClient.managedAuth.getToken() || "";
      } catch {
        return "";
      }
    })();
    fetch("/api/session/me", token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
      .then((r) => r.json())
      .then(setMe)
      .catch(() => setMe(null));
  }, [session]);

  async function managed(provider) {
    setErr("");
    setBusy(true);
    try {
      const res = await authClient.managedAuth.signIn({ provider });
      if (res?.error && res.error.code !== "POPUP_CLOSED") {
        setErr(res.error.message || res.error.code || "Sign-in failed.");
      }
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function emailSubmit() {
    setErr("");
    if (!email.trim() || !password) {
      setErr("Email and password are both required.");
      return;
    }
    setBusy(true);
    try {
      const res =
        mode === "signup"
          ? await authClient.signUp.email({ email: email.trim(), password, name: name.trim() || email.trim() })
          : await authClient.signIn.email({ email: email.trim(), password });
      if (res?.error) {
        setErr(res.error.message || res.error.statusText || `Request failed (${res.error.status ?? "?"}).`);
      } else {
        window.location.href = "/app";
      }
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function demoSignIn() {
    setErr("");
    setBusy(true);
    try {
      const r = await fetch("/api/session/demo", { method: "POST" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErr(j.error || `Demo sign-in failed (${r.status}).`);
        return;
      }
      window.location.href = j.redirect || "/app";
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  const managedLive = Boolean(status?.methods?.managedGoogle);

  return (
    <div style={{ minHeight: "100vh", background: C.black, color: C.white }}>
      {/* header band */}
      <div
        style={{
          borderBottom: `1px solid ${C.border}`,
          background: "linear-gradient(180deg, #111111, #0a0a0a)",
          padding: "34px 22px 28px",
        }}
      >
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              border: `1px solid ${C.border}`,
              borderRadius: 3,
              padding: "5px 10px",
              marginBottom: 14,
            }}
          >
            <ShieldCheck size={13} color={GOLD} />
            <span
              style={{
                fontFamily: "Oswald, sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                fontSize: 10.5,
                color: GOLD,
              }}
            >
              Account access
            </span>
          </div>
          <h1
            style={{
              fontFamily: "Bebas Neue, sans-serif",
              fontSize: 52,
              lineHeight: 1,
              letterSpacing: "0.02em",
              margin: 0,
            }}
          >
            SIGN <span style={{ color: GOLDB }}>IN</span>
          </h1>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              color: C.muted,
              maxWidth: 660,
              marginTop: 12,
              lineHeight: 1.6,
            }}
          >
            One account for the web app and the phone. Google, Apple and Microsoft go through Runable managed login, so
            TruckWithEase never stores a provider password. Email and password work too. New accounts start as{" "}
            <strong style={{ color: C.white }}>driver</strong> — never admin.
          </p>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "26px 22px 60px",
          display: "grid",
          gap: 18,
          gridTemplateColumns: "minmax(0,1fr) minmax(0,0.85fr)",
        }}
      >
        {/* left: the form */}
        <div style={{ display: "grid", gap: 18 }}>
          {isPending ? null : session ? (
            <Panel
              title="You are signed in"
              note="Reads GET /api/session/me for the role."
              icon={<ShieldCheck size={15} color={GOLD} />}
            >
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.7 }}>
                <div>
                  <span style={{ color: C.muted }}>Email</span>{" "}
                  <span style={{ fontFamily: "JetBrains Mono, monospace" }}>{session.user?.email}</span>
                </div>
                <div>
                  <span style={{ color: C.muted }}>Role</span>{" "}
                  <span style={{ fontFamily: "JetBrains Mono, monospace", color: GOLDB }}>
                    {me?.role ?? "loading…"}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                <Btn primary onClick={() => (window.location.href = "/app")}>
                  Go to dashboard
                </Btn>
                <Btn
                  onClick={async () => {
                    await authClient.signOut();
                    window.location.reload();
                  }}
                >
                  Sign out
                </Btn>
              </div>
            </Panel>
          ) : (
            <Panel
              title={mode === "signup" ? "Create account" : "Email and password"}
              note="POST /api/auth/sign-in/email · POST /api/auth/sign-up/email"
              icon={mode === "signup" ? <UserPlus size={15} color={GOLD} /> : <KeyRound size={15} color={GOLD} />}
              right={
                <button
                  onClick={() => {
                    setMode(mode === "signup" ? "signin" : "signup");
                    setErr("");
                  }}
                  style={{
                    background: "transparent",
                    border: `1px solid ${C.border}`,
                    color: GOLD,
                    borderRadius: 3,
                    padding: "6px 10px",
                    fontFamily: "Oswald, sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    fontSize: 10.5,
                    cursor: "pointer",
                  }}
                >
                  {mode === "signup" ? "Have an account" : "Create one"}
                </button>
              }
            >
              <div style={{ display: "grid", gap: 14 }}>
                <div style={{ display: "grid", gap: 8 }}>
                  <Btn primary full disabled={busy} onClick={demoSignIn}>
                    <LogIn size={14} />
                    {busy ? "Working…" : "Try the live demo — no account needed"}
                  </Btn>
                  <div style={{ fontSize: 11, color: C.dim, fontFamily: "Inter, sans-serif", lineHeight: 1.6 }}>
                    Signs you into a shared demo driver account so every page and API works immediately. Data is not
                    private and may be reset. The demo is never an admin.
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ height: 1, background: C.border, flex: 1 }} />
                  <span
                    style={{
                      fontFamily: "Oswald, sans-serif",
                      letterSpacing: "0.2em",
                      fontSize: 10,
                      color: C.dim,
                      textTransform: "uppercase",
                    }}
                  >
                    or
                  </span>
                  <div style={{ height: 1, background: C.border, flex: 1 }} />
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                  <Btn full disabled={busy || !managedLive} onClick={() => managed("google")}>
                    Continue with Google
                  </Btn>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Btn full disabled={busy || !managedLive} onClick={() => managed("apple")}>
                      Apple
                    </Btn>
                    <Btn full disabled={busy || !managedLive} onClick={() => managed("microsoft")}>
                      Microsoft
                    </Btn>
                  </div>
                  {!managedLive && status ? (
                    <div style={{ fontSize: 11, color: WARN, fontFamily: "Inter, sans-serif" }}>
                      Managed login is unavailable: APPLICATION_ID or VITE_RUNABLE_AUTH_ISSUER is not set on this server.
                    </div>
                  ) : null}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ height: 1, background: C.border, flex: 1 }} />
                  <span
                    style={{
                      fontFamily: "Oswald, sans-serif",
                      letterSpacing: "0.2em",
                      fontSize: 10,
                      color: C.dim,
                      textTransform: "uppercase",
                    }}
                  >
                    or
                  </span>
                  <div style={{ height: 1, background: C.border, flex: 1 }} />
                </div>

                {mode === "signup" ? (
                  <div>
                    <label style={labelStyle}>Full name</label>
                    <input
                      style={inputStyle}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jeremiah Morris"
                      autoComplete="name"
                    />
                  </div>
                ) : null}
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    style={inputStyle}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Password</label>
                  <input
                    style={inputStyle}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") emailSubmit();
                    }}
                    placeholder="At least 8 characters"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  />
                </div>
                <Btn primary full disabled={busy} onClick={emailSubmit}>
                  <LogIn size={14} />
                  {busy ? "Working…" : mode === "signup" ? "Create account" : "Sign in"}
                </Btn>
                <Err msg={err} />
                {mode === "signup" ? (
                  <div style={{ fontSize: 11, color: C.dim, fontFamily: "Inter, sans-serif", lineHeight: 1.6 }}>
                    No verification email is sent yet. Our Postmark account is still awaiting approval, so email
                    verification is off rather than pretending to work.
                  </div>
                ) : null}
              </div>
            </Panel>
          )}
        </div>

        {/* right: honest status */}
        <div style={{ display: "grid", gap: 18, alignContent: "start" }}>
          <Panel
            title="Auth status"
            note="Live read of GET /api/session/status — no cached values."
            icon={<ShieldCheck size={15} color={GOLD} />}
          >
            {statusErr ? (
              <Err msg={statusErr} />
            ) : !status ? (
              <div style={{ color: C.dim, fontSize: 12, fontFamily: "Inter, sans-serif" }}>Loading…</div>
            ) : (
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, lineHeight: 1.9 }}>
                <div>
                  <span style={{ color: C.muted }}>configured</span>{" "}
                  <span style={{ color: status.live ? GOLDB : WARN }}>{String(status.live)}</span>
                </div>
                <div>
                  <span style={{ color: C.muted }}>email+password</span>{" "}
                  <span style={{ color: GOLDB }}>{String(status.methods?.emailPassword)}</span>
                </div>
                <div>
                  <span style={{ color: C.muted }}>managed google</span>{" "}
                  <span style={{ color: status.methods?.managedGoogle ? GOLDB : WARN }}>
                    {String(status.methods?.managedGoogle)}
                  </span>
                </div>
                <div>
                  <span style={{ color: C.muted }}>accounts</span> <span>{String(status.counts?.users ?? "—")}</span>
                </div>
                <div>
                  <span style={{ color: C.muted }}>admins</span> <span>{String(status.counts?.admins ?? "—")}</span>
                </div>
              </div>
            )}
          </Panel>

          <Panel title="What auth does not cover yet" icon={<AlertTriangle size={15} color={WARN} />}>
            <ol
              style={{
                margin: 0,
                paddingLeft: 18,
                fontFamily: "Inter, sans-serif",
                fontSize: 12.5,
                color: C.muted,
                lineHeight: 1.75,
              }}
            >
              <li>
                Signing in gates the <code>/app/*</code> pages. It does not yet gate every API router — see{" "}
                <code>/api/session/coverage</code>.
              </li>
              <li>Email verification is off until Postmark approves the account.</li>
              <li>Password reset is not built yet.</li>
              <li>Roles are driver, dispatch, hr, admin. Only an admin can assign one.</li>
            </ol>
          </Panel>
        </div>
      </div>

      <div
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: "18px 22px 40px",
          fontFamily: "Inter, sans-serif",
          fontSize: 11.5,
          color: C.dim,
          maxWidth: 1080,
          margin: "0 auto",
          lineHeight: 1.7,
        }}
      >
        Sessions are bearer tokens over TLS. That is not a compliance certification and TruckWithEase claims none.
        TruckWithEase is not a registered ELD and files nothing with any agency.
      </div>
    </div>
  );
}
