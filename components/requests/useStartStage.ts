'use client';
import api from '@/lib/axiosInstance';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../../lib/apiConfig';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type { ApiEnvelope, ApiStartStageData } from '@/lib/apiTypes';
import { getApiErrorMessage } from '@/lib/apiTypes';
import { ApiResultError, getApiCode, getApiItems, unwrapEnvelope } from '@/lib/apiResult';
import type { StageQuestion } from '../../types';

/** Normalised result of starting a stage. */
export interface StartStageResult {
  attemptId: number;
  questionTime: number;
  totalQuestions: number;
  questions: StageQuestion[];
}

/** Why a stage could not be started. */
export type StartStageFailure =
  /** Replay interval after banking has not elapsed yet. */
  | { kind: 'cooldown'; message: string; untilMs: number | null; remainingMinutes: number }
  /**
   * Locked out after losing a run. A different timer from `cooldown` —
   * `competition_block_minutes` rather than `competition_interval_minutes`.
   */
  | { kind: 'blocked'; message: string; untilMs: number | null; remainingMinutes: number }
  /**
   * The ladder relocked, so the next run has to start at stage 1. Normal after
   * banking a run — not an error state.
   */
  | { kind: 'restart'; message: string }
  /**
   * An attempt is already open on another stage.
   *
   * Both identifiers are carried so the UI can recover rather than dead-end:
   * `attemptId` reloads it via `attempts/{id}/questions`, and
   * `stageId` names the stage it belongs to.
   */
  | { kind: 'attemptActive'; message: string; attemptId: number | null; stageId: number | null }
  /** The stage is misconfigured — no questions, or fewer than it needs. */
  | { kind: 'empty'; message: string }
  | { kind: 'unknown'; message: string };

/** Payload attached to a timed refusal. */
interface TimedItems {
  can_play_at?: string;
  blocked_until?: string;
  remaining_minutes?: number;
  attempt_id?: number;
  /** Sent alongside `attempt_id` on `attempt_active` (CompetitionEloquent::start). */
  competition_stage_id?: number;
}

const toMs = (iso?: string): number | null => {
  if (!iso) return null;
  const parsed = Date.parse(iso);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Classifies a failed start into something the UI can act on.
 *
 * Driven by the API's `code` field, which is stable and language-independent —
 * never by the message, which is localised. Falls back to the timed payloads for
 * a server that has not been updated yet.
 */
export const classifyStartFailure = (error: unknown): StartStageFailure => {
  const message = getApiErrorMessage(error) ?? '';
  const code = getApiCode(error);
  const items = getApiItems<TimedItems>(error);
  const remaining = Number(items.remaining_minutes ?? 0) || 0;

  switch (code) {
    case 'cooldown_active':
      return { kind: 'cooldown', message, untilMs: toMs(items.can_play_at), remainingMinutes: remaining };
    case 'competition_blocked':
      return { kind: 'blocked', message, untilMs: toMs(items.blocked_until), remainingMinutes: remaining };
    case 'stage_locked':
      return { kind: 'restart', message };
    case 'attempt_active':
      return {
        kind: 'attemptActive',
        message,
        attemptId: items.attempt_id ?? null,
        stageId: items.competition_stage_id ?? null,
      };
    case 'stage_empty':
    case 'stage_insufficient_questions':
    case 'stage_not_found':
      return { kind: 'empty', message };
    default:
      break;
  }

  // No `code` — infer from the payload the older API attached.
  if (items.blocked_until) {
    return { kind: 'blocked', message, untilMs: toMs(items.blocked_until), remainingMinutes: remaining };
  }
  if (items.can_play_at || items.remaining_minutes !== undefined) {
    return { kind: 'cooldown', message, untilMs: toMs(items.can_play_at), remainingMinutes: remaining };
  }

  return { kind: 'unknown', message };
};

/**
 * Starts a competition stage and returns the attempt + all questions.
 * POST /v1/competition/stages/{stageId}/start
 */
const startStage = async (stageId: number): Promise<StartStageResult> => {
  const token = Cookies.get('token');
  const headers: Record<string, string> = { lang: 'ar' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await api.post<ApiEnvelope<ApiStartStageData>>(
    `${API_BASE_URL}/v1/competition/stages/${stageId}/start`,
    {},
    { headers }
  );

  // Throws on `status: false`, which arrives as HTTP 200 — see lib/apiResult.ts.
  const items = unwrapEnvelope(response.data);

  // A success envelope without an attempt is not something the UI can play.
  if (!items?.attempt?.id) {
    throw new ApiResultError('Failed to start stage', response.data?.statusCode ?? 0, items);
  }

  const sortedQuestions = [...(items.questions || [])].sort((a, b) => a.sort_by - b.sort_by);

  return {
    attemptId: items.attempt.id,
    questionTime: items.question_time,
    totalQuestions: items.total_questions,
    questions: sortedQuestions.map((q) => ({
      id: q.id,
      text: q.name,
      answers: [...(q.answers || [])]
        .sort((a, b) => a.sort_by - b.sort_by)
        .map((a) => ({ id: a.id, name: a.name })),
    })),
  };
};

export const useStartStage = (): UseMutationResult<StartStageResult, unknown, number> =>
  useMutation({
    mutationFn: startStage,
  });
