"use client";
import { useEffect, useState } from "react";
import { CloudConnection } from "./CloudConnection";
import {
  Dna,
  FlaskConical,
  GitBranch,
  ScanLine,
  FileCheck2,
  Globe2,
  ShieldCheck,
  ClipboardPlus,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import { seed, hospitals } from "@/lib/seed/bangladesh-amr-seed";
import {
  loadStore,
  saveStore,
  syncStore,
  pullStore,
  supabase,
} from "@/lib/data/genamr-store";
import { decide } from "@/lib/bioinformatics/reflex-decision-engine";
import type { Sample, Store } from "@/lib/types";
import { ScenarioController } from "../demo/ScenarioController";
import { Stage1Collect } from "../workflow/Stage1Collect";
import { Stage2Qpcr } from "../workflow/Stage2Qpcr";
import { Stage3Decide } from "../workflow/Stage3Decide";
import { Stage4Sanger } from "../workflow/Stage4Sanger";
import { Stage5Report } from "../workflow/Stage5Report";
import { AstValidationLoop } from "../validation/AstValidationLoop";
import { NationalSurveillanceDashboard } from "../surveillance/NationalSurveillanceDashboard";
const navigation = [
  ["Collect", "সংগ্রহ", ClipboardPlus],
  ["qPCR", "পিসিআর", FlaskConical],
  ["Decide", "সিদ্ধান্ত", GitBranch],
  ["Sanger", "সিকোয়েন্স", ScanLine],
  ["Report", "রিপোর্ট", FileCheck2],
  ["Surveillance", "নজরদারি", Globe2],
  ["Validation", "যাচাই", ShieldCheck],
] as const;
export function AppShell() {
  const [store, setStore] = useState<Store>(() => seed()),
    [dirtyVersion, setDirtyVersion] = useState(0),
    [ready, setReady] = useState(false),
    [selected, setSelected] = useState(seed().samples[0].id),
    [tab, setTab] = useState(1),
    [currency, setCurrency] = useState("BDT"),
    [bn, setBn] = useState(false),
    [persona, setPersona] = useState("Molecular lab workbench"),
    [status, setStatus] = useState("Local-first demo"),
    [now, setNow] = useState(0);
  const s = store.samples.find((v) => v.id === selected) || store.samples[0];
  const d = decide(s);
  useEffect(() => {
    setStore(loadStore());
    setReady(true);
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 60000);
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production")
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!ready || !supabase || dirtyVersion === 0) return;
    let active = true;
    const timer = setTimeout(() => {
      void syncStore(store).then((message) => {
        if (active) setStatus(message);
      });
    }, 1500);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [store, ready, dirtyVersion]);
  function commit(next: Store) {
    setStore(next);
    setDirtyVersion((version) => version + 1);
    const saved = saveStore(next);
    setStatus(
      saved
        ? "Saved on this device"
        : "Memory mode • browser storage unavailable",
    );
  }
  function update(patch: Partial<Sample>) {
    commit({
      ...store,
      samples: store.samples.map((v) =>
        v.id === s.id ? { ...v, ...patch } : v,
      ),
    });
  }
  const props = { sample: s, update };
  const minutes = Math.max(
    0,
    Math.ceil(
      (new Date(s.collected_at).getTime() +
        2 * 3600000 -
        (now || new Date(s.collected_at).getTime())) /
        60000,
    ),
  );
  return (
    <div className="app-shell" data-ready={ready}>
      <aside className="sidebar no-print">
        <a className="brand" href="/">
          <span>
            <Dna size={27} />
          </span>
          GenAMR<i>BD</i>
        </a>
        <div className="workspace-label">MOLECULAR INTELLIGENCE</div>
        <nav aria-label="Main navigation">
          {navigation.map(([en, bengali, Icon], i) => (
            <button
              key={en}
              aria-current={tab === i ? "page" : undefined}
              className={tab === i ? "selected" : ""}
              onClick={() => setTab(i)}
            >
              <Icon size={19} />
              <span>
                {i < 5 ? `${i + 1}. ` : ""}
                {bn ? bengali : en}
              </span>
              {tab === i && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="live-dot" /> Research workspace
          <p>Bangladesh · Ideathon 2026</p>
          <span className="demo-tag">SYNTHETIC DATA ONLY</span>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar no-print">
          <div className="hospital-heading">
            <span className="hospital-icon">✚</span>
            <label>
              <small>HOSPITAL WORKSPACE</small>
              <select
                aria-label="Hospital workspace"
                value={s.hospital_id}
                onChange={(e) =>
                  update({
                    hospital_id: e.target.value,
                    division: hospitals.find((h) => h.id === e.target.value)!
                      .division,
                  })
                }
              >
                {hospitals.map((h) => (
                  <option value={h.id} key={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="top-controls">
            <button
              aria-label="Toggle currency"
              onClick={() => setCurrency(currency === "BDT" ? "USD" : "BDT")}
            >
              {currency === "BDT" ? "৳ BDT" : "$ USD"}
            </button>
            <button aria-label="Toggle language" onClick={() => setBn(!bn)}>
              {bn ? "English" : "বাংলা"}
            </button>
            <span className="avatar">RA</span>
          </div>
        </header>
        <div className="partner-strip no-print">
          Research concept · Proposed collaboration: dBme Research Group{" "}
          <span>•</span> Proposed pilot: Asperia Healthcare Limited
        </div>
        <main>
          <div className="page-intro">
            <div>
              <div className="eyebrow">
                <span /> RAPID AMR WORKFLOW
              </div>
              <h1>
                {bn
                  ? "দ্রুত ফলাফল। সচেতন সিদ্ধান্ত।"
                  : "Earlier answers. Better decisions."}
              </h1>
              <p>
                Fast PCR screening. Targeted sequencing. A clearer path to
                review.
              </p>
            </div>
            <label className="persona no-print">
              WORKSPACE VIEW
              <select
                value={persona}
                onChange={(e) => {
                  setPersona(e.target.value);
                  if (e.target.value.includes("Surveillance")) setTab(5);
                  if (e.target.value.includes("Clinician")) setTab(4);
                }}
              >
                {[
                  "Molecular lab workbench",
                  "ICU Clinician mobile",
                  "dBme & IEDCR Surveillance",
                ].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="overview-grid">
            <div className="stat">
              <div className="stat-icon">
                <Activity />
              </div>
              <div>
                <small>SCREENING TARGET</small>
                <strong>
                  {d.hours}
                  <span> hours</span>
                </strong>
                <p>vs. 48–72h conventional AST</p>
              </div>
            </div>
            <div className="stat">
              <div className="stat-icon">৳</div>
              <div>
                <small>ESTIMATED CASE FEE</small>
                <strong data-testid="fee">
                  {currency === "BDT"
                    ? `৳${d.fee.toLocaleString("en-US")}`
                    : d.reflex
                      ? "$17"
                      : "$10"}
                </strong>
                <p>
                  {d.reflex
                    ? "Includes targeted Sanger"
                    : "No sequencing add-on"}
                </p>
              </div>
            </div>
            <div className="stat">
              <div className="stat-icon">
                <GitBranch />
              </div>
              <div>
                <small>CURRENT ROUTE</small>
                <strong className="route-name">
                  {d.qc
                    ? "QC hold"
                    : d.reflex
                      ? "Targeted reflex"
                      : "Fast track"}
                </strong>
                <p>
                  {d.reflex
                    ? "Additional resolution needed"
                    : "Screening-first approach"}
                </p>
              </div>
            </div>
          </div>
          <section className="case-strip">
            <div>
              <span className="pill">ACTIVE SPECIMEN</span>
              <h2>
                {s.sample_code} <span>{s.title}</span>
              </h2>
              <p>
                <i>{s.organism}</i> · {s.patient_age}
                {s.patient_sex} · {s.specimen_type.replaceAll("_", " ")}
              </p>
            </div>
            <div className="case-status">
              <span className="status-dot" />
              {ready ? "Demo ready" : "Loading"}
              <small>{s.empirical_drug} · empirical therapy</small>
            </div>
          </section>
          <div className="stepper no-print">
            {navigation.slice(0, 5).map(([en, bengali, Icon], i) => (
              <button
                key={en}
                aria-current={tab === i ? "step" : undefined}
                className={tab === i ? "current" : ""}
                onClick={() => setTab(i)}
              >
                <span>
                  <Icon size={17} />
                </span>
                {bn ? bengali : en}
                <small>0{i + 1}</small>
              </button>
            ))}
          </div>
          <div className="content-heading">
            <h2>
              {bn ? navigation[tab][1] : navigation[tab][0]}{" "}
              <span>
                / {tab < 5 ? `Stage ${tab + 1}` : "Research intelligence"}
              </span>
            </h2>
            <span className="local-status">● {status}</span>
          </div>
          {tab === 0 && (
            <>
              <div className="sla">
                SLA countdown:{" "}
                {minutes > 0
                  ? `${Math.floor(minutes / 60)}h ${minutes % 60}m remaining`
                  : "Demo collection elapsed — register a new collection"}
              </div>
              <Stage1Collect {...props} />
            </>
          )}
          {tab === 1 && <Stage2Qpcr {...props} />}{" "}
          {tab === 2 && <Stage3Decide {...props} currency={currency} />}{" "}
          {tab === 3 && <Stage4Sanger {...props} />}{" "}
          {tab === 4 && <Stage5Report {...props} />}{" "}
          {tab === 5 && (
            <NationalSurveillanceDashboard
              samples={store.samples}
              bengali={bn}
            />
          )}{" "}
          {tab === 6 && (
            <AstValidationLoop store={store} sample={s} onChange={commit} />
          )}
          <ScenarioController
            samples={store.samples}
            selected={s.id}
            onSelect={setSelected}
          />
          <CloudConnection store={store} />
          <footer className="no-print">
            <span>GenAMR · Research demo · No external AI services</span>
            <div>
              <button onClick={async () => setStatus(await syncStore(store))}>
                Sync status <ArrowUpRight size={12} />
              </button>
              {supabase && (
                <button
                  onClick={async () => {
                    try {
                      const remote = await pullStore();
                      if (remote) {
                        commit(remote);
                        setStatus("Cloud snapshot loaded");
                      } else setStatus("No signed-in cloud snapshot available");
                    } catch {
                      setStatus("Cloud unavailable • local data retained");
                    }
                  }}
                >
                  Load cloud snapshot
                </button>
              )}
            </div>
          </footer>
        </main>
        <nav className="mobile-nav no-print" aria-label="Mobile navigation">
          {navigation.map(([en, bengali, Icon], i) => (
            <button
              key={en}
              aria-current={tab === i ? "page" : undefined}
              onClick={() => setTab(i)}
            >
              <Icon size={19} />
              <span>{bn ? bengali : en}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
