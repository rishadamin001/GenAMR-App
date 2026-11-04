import { useState } from "react";
import { supabase, syncStore } from "@/lib/data/genamr-store";
import type { Store } from "@/lib/types";
import { Button } from "../ui/button";
export function CloudConnection({ store }: { store: Store }) {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  if (!supabase) return null;
  return (
    <details className="card no-print">
      <summary>Optional private Supabase connection</summary>
      <p>
        Sign in with an existing research account. Only synthetic records are
        supported. Each account owns its own copy.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            const { error } = await supabase!.auth.signInWithPassword({
              email,
              password,
            });
            setPassword("");
            setMessage(error ? error.message : await syncStore(store));
          } catch {
            setMessage("Connection unavailable. Local data retained.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="form-grid">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
        </div>
        <div className="actions">
          <Button disabled={busy}>
            {busy ? "Connecting…" : "Sign in & sync"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              await supabase!.auth.signOut();
              setMessage(
                "Signed out. Local synthetic data remains on this device.",
              );
            }}
          >
            Sign out
          </Button>
        </div>
      </form>
      <p role="status">{message}</p>
    </details>
  );
}
