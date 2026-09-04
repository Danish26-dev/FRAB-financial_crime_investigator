import type {
  AnalystDecisionRecord,
  CallingAgentState,
  InvestigationResult,
} from "../../../../lib/frab-result";
import { voiceClock, type VoiceState, type VoiceStatus } from "../../../../lib/frab-voice";
import { Mono } from "../../ui";

const NA = "NOT AVAILABLE";

function statusTone(status: VoiceStatus): string {
  if (status === "COMPLETED") return "text-lime";
  if (status === "CALLING" || status === "IN_PROGRESS" || status === "QUEUED")
    return "text-warning";
  return "text-critical"; // FAILED | UNREACHABLE | VOICE_ASSESSMENT_PENDING
}

function isActive(status: VoiceStatus): boolean {
  return status === "QUEUED" || status === "CALLING" || status === "IN_PROGRESS";
}

/** Investigation timeline + voice escalation, rendered from recorded events only. */
export default function AuditTimeline({
  result,
  decision,
  call,
  voice,
  voiceStarting,
  voiceError,
  voiceAvailable,
  onRequestCall,
}: {
  result: InvestigationResult;
  decision: AnalystDecisionRecord | null;
  call: CallingAgentState | null;
  /** Live voice state from the voice service (null until escalated / not live). */
  voice?: VoiceState | null;
  voiceStarting?: boolean;
  voiceError?: string | null;
  voiceAvailable?: boolean;
  onRequestCall: () => void;
}) {
  const events = result.timeline;
  // Fold real voice timeline events into the audit trail when present.
  const voiceEvents = voice?.timeline ?? [];

  return (
    <div className="grid grid-cols-1 gap-px border border-border bg-border lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="relative bg-background px-5 py-6">
        <div className="frab-grid pointer-events-none absolute inset-0 opacity-[0.10]" />
        <div className="relative">
          <Mono className="block text-[10px] text-lime">INVESTIGATION TIMELINE</Mono>
          {events.length === 0 ? (
            <Mono className="mt-6 block text-[9px] text-warning">AUDIT EVENTS {NA}</Mono>
          ) : (
            <ol className="mt-5 border-l border-border">
              {events.map((t, i) => (
                <li key={`${t.ts}-${i}`} className="relative py-3 pl-6">
                  <span className="absolute left-[-3.5px] top-[18px] h-1.5 w-1.5 bg-lime" />
                  <span className="flex flex-wrap items-center gap-3">
                    <Mono className="text-[9px] text-technical">{t.ts}</Mono>
                    <Mono className="text-[9px] text-lime">{t.agent}</Mono>
                    <Mono className="text-[9px] text-foreground">
                      {t.action.replace(/_/g, " ")}
                    </Mono>
                  </span>
                  <p className="mt-1 text-[12px] leading-relaxed text-secondary-foreground">
                    {t.result}
                    {t.evidenceIds.length ? ` · ${t.evidenceIds.join(" · ")}` : ""}
                  </p>
                </li>
              ))}
              <li className="relative py-3 pl-6">
                <span
                  className={`absolute left-[-3.5px] top-[18px] h-1.5 w-1.5 ${decision ? "bg-lime" : "bg-border"}`}
                />
                <Mono className="text-[9px] text-muted-foreground">
                  ANALYST DECISION ·{" "}
                  {decision ? `${decision.action.replace(/_/g, " ")} · ${decision.ts}` : "PENDING"}
                </Mono>
              </li>

              {/* Real voice events, when the escalation has produced any. */}
              {voiceEvents.length > 0 ? (
                voiceEvents.map((v, i) => (
                  <li key={`voice-${i}`} className="relative py-3 pl-6">
                    <span className="absolute left-[-3.5px] top-[18px] h-1.5 w-1.5 bg-lime" />
                    <span className="flex flex-wrap items-center gap-3">
                      <Mono className="text-[9px] text-technical">{voiceClock(v.timestamp)}</Mono>
                      <Mono className="text-[9px] text-lime">VOICE</Mono>
                      <Mono className="text-[9px] text-foreground">
                        {v.event.replace(/_/g, " ")}
                      </Mono>
                    </span>
                  </li>
                ))
              ) : (
                <li className="relative py-3 pl-6">
                  <span
                    className={`absolute left-[-3.5px] top-[18px] h-1.5 w-1.5 ${
                      voice || (call && call.state !== "NOT_CONNECTED") ? "bg-lime" : "bg-border"
                    }`}
                  />
                  <Mono className="text-[9px] text-muted-foreground">
                    VOICE ESCALATION ·{" "}
                    {voice
                      ? voice.status.replace(/_/g, " ")
                      : call
                        ? call.state.replace(/_/g, " ")
                        : NA}
                  </Mono>
                </li>
              )}
            </ol>
          )}
        </div>
      </div>

      <div className="bg-surface px-5 py-6">
        <Mono className="block text-[10px] text-lime">VOICE ESCALATION</Mono>
        <Mono className="mt-1 block text-[8px] text-muted-foreground">FRAB VOICE INVESTIGATOR</Mono>

        {/* When the voice service isn't configured, keep the existing note. */}
        {!voiceAvailable && !voice ? (
          <>
            <p className="mt-3 text-[12px] leading-relaxed text-secondary-foreground">
              Calls are never placed automatically. The analyst confirms every escalation call.
            </p>
          </>
        ) : null}

        <button
          onClick={onRequestCall}
          disabled={Boolean(voiceStarting) || (voice ? isActive(voice.status) : false)}
          className="mt-4 border border-border px-3 py-1.5 font-mono text-[9px] tracking-[0.2em] text-foreground transition-colors hover:border-lime/60 hover:text-lime disabled:opacity-40"
        >
          {voiceStarting
            ? "[ STARTING… ]"
            : voice && isActive(voice.status)
              ? "[ CALL IN PROGRESS ]"
              : "[ CALL ESCALATION AGENT ]"}
        </button>

        {voiceError ? (
          <Mono className="mt-3 block border border-critical/60 px-2 py-1 text-[9px] text-critical">
            {voiceError.toUpperCase()}
          </Mono>
        ) : null}

        {/* Status + contact strip */}
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
          <div>
            <Mono className="block text-[8px] text-muted-foreground">CALL STATUS</Mono>
            <Mono
              className={`mt-1 block text-[10px] ${
                voice
                  ? statusTone(voice.status)
                  : call && call.state !== "NOT_CONNECTED"
                    ? "text-lime"
                    : "text-warning"
              }`}
            >
              {voice ? voice.status.replace(/_/g, " ") : call ? call.state.replace(/_/g, " ") : NA}
            </Mono>
          </div>
          <div>
            <Mono className="block text-[8px] text-muted-foreground">VERIFICATION</Mono>
            <Mono
              className={`mt-1 block text-[10px] ${
                voice?.verification_status === "VERIFIED" ? "text-lime" : "text-warning"
              }`}
            >
              {voice?.verification_status ? voice.verification_status.replace(/_/g, " ") : NA}
            </Mono>
          </div>
        </div>

        {/* Full assessment — only rendered when the call completed with data. */}
        {voice && voice.status === "COMPLETED" ? (
          <div className="mt-5 space-y-4 border-t border-border pt-4">
            <div>
              <Mono className="block text-[8px] text-muted-foreground">OUTCOME</Mono>
              <Mono className="mt-1 block text-[10px] text-foreground">
                {(voice.call_outcome ?? "—").replace(/_/g, " ")}
              </Mono>
            </div>

            {voice.summary ? (
              <div>
                <Mono className="block text-[8px] text-muted-foreground">SUMMARY</Mono>
                <p className="mt-1 text-[12px] leading-relaxed text-secondary-foreground">
                  {voice.summary}
                </p>
              </div>
            ) : null}

            {voice.customer_statements && voice.customer_statements.length > 0 ? (
              <div>
                <Mono className="block text-[8px] text-muted-foreground">CUSTOMER STATEMENTS</Mono>
                <ul className="mt-1 space-y-1">
                  {voice.customer_statements.map((s, i) => (
                    <li key={i} className="text-[12px] leading-relaxed text-secondary-foreground">
                      · {s}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {voice.unresolved_questions && voice.unresolved_questions.length > 0 ? (
              <div>
                <Mono className="block text-[8px] text-muted-foreground">UNRESOLVED QUESTIONS</Mono>
                <ul className="mt-1 space-y-1">
                  {voice.unresolved_questions.map((s, i) => (
                    <li key={i} className="text-[12px] leading-relaxed text-warning">
                      · {s}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {voice.analyst_attention && voice.analyst_attention.length > 0 ? (
              <div>
                <Mono className="block text-[8px] text-muted-foreground">ANALYST ATTENTION</Mono>
                <ul className="mt-1 space-y-1">
                  {voice.analyst_attention.map((s, i) => (
                    <li key={i} className="text-[12px] leading-relaxed text-critical">
                      · {s}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {voice.customer_requested_human ? (
              <Mono className="block border-l-2 border-warning bg-warning/10 px-2 py-1 text-[9px] text-warning">
                CUSTOMER REQUESTED A HUMAN
              </Mono>
            ) : null}

            {voice.recommended_actions && voice.recommended_actions.length > 0 ? (
              <div>
                <Mono className="block text-[8px] text-muted-foreground">
                  RECOMMENDED ACTIONS · ANALYST DECIDES
                </Mono>
                <div className="mt-2 flex flex-col gap-1.5">
                  {voice.recommended_actions.map((a, i) => (
                    <span
                      key={i}
                      className="border border-border px-2 py-1 font-mono text-[9px] tracking-[0.18em] text-technical"
                    >
                      {a.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : voice && voice.status !== "COMPLETED" && !isActive(voice.status) ? (
          // Honest terminal-but-not-completed states — never fabricate a summary.
          <p className="mt-4 text-[12px] leading-relaxed text-warning">
            {voice.status === "VOICE_ASSESSMENT_PENDING"
              ? "The call ended without a valid structured assessment. No summary is available."
              : voice.status === "UNREACHABLE"
                ? "The customer could not be reached. No conversation took place."
                : "The voice call did not complete. No assessment was recorded."}
          </p>
        ) : (
          <Mono className="mt-6 block text-[8px] leading-relaxed text-muted-foreground">
            CALL SUMMARY IS SHOWN ONLY WHEN THE VOICE SERVICE RETURNS A COMPLETED ASSESSMENT.
          </Mono>
        )}
      </div>
    </div>
  );
}
