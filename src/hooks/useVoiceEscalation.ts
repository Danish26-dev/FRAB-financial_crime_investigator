import { useCallback, useEffect, useRef, useState } from "react";
import {
  IS_VOICE_LIVE,
  VOICE_TEST_PHONE,
  fetchVoiceState,
  isTerminal,
  startVoiceEscalation,
  type VoiceState,
  type VoiceStartRequest,
} from "../lib/frab-voice";

export interface VoiceRun {
  /** null until an escalation has been started this session. */
  state: VoiceState | null;
  starting: boolean;
  polling: boolean;
  error: string | null;
  /** True only when the voice service is configured. */
  available: boolean;
  start: (req: VoiceStartRequest) => void;
}

const POLL_MS = 3000;

/**
 * Drives a voice escalation for a case: starts the call, then polls
 * GET /voice while the call is active and stops on a terminal status.
 * Inert when the voice service is not configured.
 */
export function useVoiceEscalation(caseId: string): VoiceRun {
  const [state, setState] = useState<VoiceState | null>(null);
  const [starting, setStarting] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelled = useRef(false);

  const stopPolling = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    setPolling(false);
  }, []);

  const poll = useCallback(() => {
    void fetchVoiceState(caseId)
      .then((s) => {
        if (cancelled.current) return;
        setState(s);
        if (isTerminal(s.status)) stopPolling();
      })
      .catch(() => {
        /* transient — keep the last known state, keep polling */
      });
  }, [caseId, stopPolling]);

  const start = useCallback(
    (req: VoiceStartRequest) => {
      if (!IS_VOICE_LIVE) return;
      setStarting(true);
      setError(null);
      // Supply the demo phone override when configured (the service directory
      // has no number for the synthetic customers yet). Caller-provided phone
      // still wins if one was passed explicitly.
      const withPhone: VoiceStartRequest =
        req.customer_phone || !VOICE_TEST_PHONE
          ? req
          : { ...req, customer_phone: VOICE_TEST_PHONE };
      void startVoiceEscalation(caseId, withPhone)
        .then((res) => {
          if (cancelled.current) return;
          setState((prev) => ({
            case_id: res.case_id,
            call_id: res.call_id,
            status: res.status,
            timeline: prev?.timeline ?? [],
          }));
          // Begin polling unless the call somehow started terminal.
          if (!isTerminal(res.status)) {
            setPolling(true);
            poll();
            timer.current = setInterval(poll, POLL_MS);
          }
        })
        .catch((e) => {
          if (cancelled.current) return;
          setError(e instanceof Error ? e.message : "VOICE ESCALATION COULD NOT BE STARTED");
        })
        .finally(() => {
          if (!cancelled.current) setStarting(false);
        });
    },
    [caseId, poll],
  );

  // Reset when the case changes; clean up on unmount.
  useEffect(() => {
    cancelled.current = false;
    setState(null);
    setError(null);
    stopPolling();
    return () => {
      cancelled.current = true;
      stopPolling();
    };
  }, [caseId, stopPolling]);

  return { state, starting, polling, error, available: IS_VOICE_LIVE, start };
}
