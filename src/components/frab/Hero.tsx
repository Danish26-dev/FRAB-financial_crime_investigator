import { Suspense, lazy, useEffect, useState } from "react";

const InvestigationCore = lazy(() => import("./InvestigationCore"));

const METRICS = [
  { value: "10", label: "DEMO SCENARIOS" },
  { value: "9,991", label: "TRANSACTIONS" },
  { value: "300", label: "CUSTOMER PROFILES" },
  { value: "5", label: "INVESTIGATION AGENTS" },
  { value: "TEE", label: "PROTECTED INFERENCE" },
];

const FLOW = ["ALERT", "CONTEXT", "EVIDENCE", "RISK", "DECISION"];

function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="frab-grid absolute inset-0 opacity-[0.28]" />
      <div className="absolute inset-y-0 left-[8%] w-px bg-border/60" />
      <div className="absolute inset-y-0 right-[8%] w-px bg-border/40" />
      <div className="absolute inset-x-0 top-[14%] h-px bg-border/40" />
      <div className="absolute inset-x-0 bottom-[12%] h-px bg-border/30" />
      <div className="absolute left-[8%] top-[14%] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 border border-lime/50" />
      <div className="absolute right-[8%] bottom-[12%] h-1.5 w-1.5 translate-x-1/2 translate-y-1/2 border border-lime/30" />
      <span className="absolute left-[8%] bottom-[6%] ml-3 font-mono text-[9px] tracking-[0.3em] text-muted-foreground/50">
        X:0142 / Y:0887
      </span>
    </div>
  );
}

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative min-h-[92vh] w-full overflow-hidden bg-background">
      <Backdrop />

      <div className="relative mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-16 px-6 py-24 md:px-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-10 lg:py-28">
        {/* LEFT — editorial */}
        <div className="max-w-2xl">
          <div className="frab-rise border-l border-lime/60 pl-4">
            <p className="font-mono text-[10px] tracking-[0.42em] text-lime">
              FINANCIAL CRIME INVESTIGATION LAB
            </p>
            <p className="mt-1.5 font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
              SH-FIN-01 / AUTONOMOUS INVESTIGATION
            </p>
          </div>

          <h1
            className="frab-rise mt-10 text-[clamp(2.1rem,4.6vw,4rem)] font-semibold uppercase leading-[0.94] tracking-[-0.035em] text-foreground"
            style={{ animationDelay: "0.08s" }}
          >
            <span className="whitespace-nowrap">From alert</span>
            <br />
            <span className="whitespace-nowrap text-lime">to investigation.</span>
          </h1>

          <p
            className="frab-rise mt-8 max-w-xl text-[0.98rem] leading-relaxed text-muted-foreground"
            style={{ animationDelay: "0.16s" }}
          >
            FRAB turns suspicious transaction alerts into investigation-ready intelligence —
            reconstructing financial behavior, gathering evidence, assessing regulatory risk, and
            producing an audit-ready case for the analyst.
          </p>

          <div
            className="frab-rise mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "0.24s" }}
          >
            <a
              href="#investigation"
              className="group inline-flex items-center justify-center gap-3 bg-lime px-7 py-4 whitespace-nowrap font-mono text-[11px] font-medium tracking-[0.2em] text-background transition-colors duration-300 hover:bg-green"
            >
              [ ENTER THE INVESTIGATION ]
            </a>
            <a
              href="#architecture"
              className="inline-flex items-center justify-center gap-3 border border-border px-7 py-4 whitespace-nowrap font-mono text-[11px] tracking-[0.2em] text-foreground transition-colors duration-300 hover:border-lime/60 hover:text-lime"
            >
              [ VIEW THE ARCHITECTURE ]
            </a>
          </div>

          <div
            className="frab-rise mt-14 border-t border-border pt-6"
            style={{ animationDelay: "0.32s" }}
          >
            <dl className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-4">
              {METRICS.map((m) => (
                <div key={m.label} className="border-l border-border/80 pl-3">
                  <dt className="font-mono text-[15px] leading-none text-bone">{m.value}</dt>
                  <dd className="mt-2 font-mono text-[9px] leading-[1.5] tracking-[0.18em] text-muted-foreground">
                    {m.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* RIGHT — investigation core */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 -top-2 flex items-center justify-between font-mono text-[9px] tracking-[0.28em] text-muted-foreground/70">
            <span>INVESTIGATION CORE / v1.0</span>
            <span className="hidden sm:inline">RENDER: LOCAL</span>
          </div>

          <div className="relative h-[420px] w-full border border-border/70 sm:h-[520px] lg:h-[620px]">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl"
              style={{ background: "radial-gradient(circle, var(--lime) 0%, transparent 62%)" }}
            />
            <span className="absolute -left-px -top-px h-3 w-3 border-l border-t border-lime/70" />
            <span className="absolute -right-px -top-px h-3 w-3 border-r border-t border-lime/70" />
            <span className="absolute -bottom-px -left-px h-3 w-3 border-b border-l border-lime/70" />
            <span className="absolute -bottom-px -right-px h-3 w-3 border-b border-r border-lime/70" />

            {mounted ? (
              <Suspense fallback={null}>
                <InvestigationCore />
              </Suspense>
            ) : null}

            <div className="pointer-events-none absolute bottom-5 left-5 right-5 flex flex-wrap lg:right-auto lg:bottom-auto lg:top-6 lg:left-6 lg:flex-col lg:items-start lg:gap-2 items-center gap-x-4 gap-y-1 font-mono text-[9px] tracking-[0.24em] text-muted-foreground/70">
              {FLOW.map((f, i) => (
                <span key={f} className="flex items-center gap-4">
                  <span className={i === 0 ? "text-lime" : undefined}>{f}</span>
                  {i < FLOW.length - 1 && <span className="text-border lg:hidden">→</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Status panel */}
          <div className="mt-4 border border-border bg-surface/60 px-5 py-4 lg:absolute lg:-bottom-16 lg:right-0 lg:mt-0 lg:w-[300px] lg:bg-surface">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-mono text-[10px] tracking-[0.24em] text-bone">
                FRAB INVESTIGATION SYSTEM
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="frab-dot h-1.5 w-1.5 rounded-full bg-lime" />
              <span className="font-mono text-[10px] tracking-[0.24em] text-lime">SYSTEM READY</span>
            </div>
            <ul className="mt-3 space-y-1.5">
              {["CONFIDENTIAL WORKSPACE", "ATTESTED WORKLOAD", "ENCRYPTED INFERENCE"].map((s) => (
                <li
                  key={s}
                  className="flex items-center gap-2 font-mono text-[9px] tracking-[0.22em] text-muted-foreground"
                >
                  <span className="h-px w-3 bg-border" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
