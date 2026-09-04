/**
 * FRAB Voice Escalation client.
 *
 * Talks to the isolated Voice microservice (Vapi adapter). The frontend never
 * touches Vapi directly — all secrets live server-side in the voice service.
 *
 * Contract (confirmed with the voice service owner):
 *   POST /api/cases/{case_id}/voice-escalation
 *        body: { alert_id, frab_recommendation, risk_tier, customer_phone? }
 *        -> { case_id, call_id, status }
 *   GET  /api/cases/{case_id}/voice
 *        -> VoiceState (status, verification, outcome, summary, statements,
 *           unresolved_questions, analyst_attention, recommended_actions,
 *           timeline[])
 *
 * The service resolves customer phone + verification Q/A itself (backend is the
 * source of truth) — the frontend only sends alert_id + recommendation + risk.
 *
 * Everything is gated on VITE_FRAB_VOICE_URL: until it is set, IS_VOICE_LIVE is
 * false and the Case Book keeps its existing "not connected" behaviour.
 */

export const VOICE_BASE_URL: string | undefined =
  (import.meta.env["VITE_FRAB_VOICE_URL"] as string | undefined) || undefined;

export const IS_VOICE_LIVE = Boolean(VOICE_BASE_URL);

/**
 * Optional demo phone override. The voice service normally resolves the
 * customer phone itself, but the synthetic customers have no numbers in its
 * directory yet — so for the demo we can supply a test number here and the
 * call will progress instead of failing with "no customer phone".
 */
export const VOICE_TEST_PHONE: string | undefined =
  (import.meta.env["VITE_FRAB_VOICE_TEST_PHONE"] as string | undefined) || undefined;

/* --------------------------------------------------------- contract types */

export type VoiceStatus =
  | "QUEUED"
  | "CALLING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "UNREACHABLE"
  | "VOICE_ASSESSMENT_PENDING";

/** Statuses at which polling should stop. */
export const TERMINAL_VOICE_STATUSES: ReadonlySet<VoiceStatus> = new Set<VoiceStatus>([
  "COMPLETED",
  "FAILED",
  "UNREACHABLE",
  "VOICE_ASSESSMENT_PENDING",
]);

export interface VoiceTimelineItem {
  event: string; // VOICE_ESCALATION_REQUESTED | VOICE_CALL_STARTED | ...
  timestamp: string; // ISO 8601
  call_id?: string;
}

export interface VoiceState {
  case_id: string;
  call_id: string | null;
  status: VoiceStatus;
  verification_status?: string | null; // VERIFIED | FAILED | ...
  call_outcome?: string | null; // INFORMATION_OBTAINED | ...
  summary?: string | null;
  customer_statements?: string[];
  unresolved_questions?: string[];
  analyst_attention?: string[];
  recommended_actions?: string[];
  customer_requested_human?: boolean;
  timeline?: VoiceTimelineItem[];
}

export interface VoiceStartRequest {
  alert_id: string;
  frab_recommendation: string;
  risk_tier: string;
  /** Optional demo override; normally the service resolves the phone itself. */
  customer_phone?: string;
}

export interface VoiceStartResponse {
  case_id: string;
  call_id: string;
  status: VoiceStatus;
}

/* --------------------------------------------------------------- transport */

/** Start a voice escalation for a case. */
export async function startVoiceEscalation(
  caseId: string,
  req: VoiceStartRequest,
): Promise<VoiceStartResponse> {
  if (!VOICE_BASE_URL) throw new Error("No voice service configured (VITE_FRAB_VOICE_URL unset)");
  const res = await fetch(
    `${VOICE_BASE_URL}/api/cases/${encodeURIComponent(caseId)}/voice-escalation`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(req),
    },
  );
  if (!res.ok) throw new Error(`voice escalation failed (${res.status})`);
  return (await res.json()) as VoiceStartResponse;
}

/** Fetch the current voice state for a case (poll target). */
export async function fetchVoiceState(caseId: string): Promise<VoiceState> {
  if (!VOICE_BASE_URL) throw new Error("No voice service configured (VITE_FRAB_VOICE_URL unset)");
  const res = await fetch(`${VOICE_BASE_URL}/api/cases/${encodeURIComponent(caseId)}/voice`);
  if (!res.ok) throw new Error(`voice state failed (${res.status})`);
  return (await res.json()) as VoiceState;
}

/* ---------------------------------------------------------------- helpers */

/** ISO 8601 -> HH:MM:SS for the audit timeline. */
export function voiceClock(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toTimeString().slice(0, 8);
}

export function isTerminal(status: VoiceStatus): boolean {
  return TERMINAL_VOICE_STATUSES.has(status);
}
