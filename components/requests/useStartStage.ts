'use client';
import api from '@/lib/axiosInstance';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../../lib/apiConfig';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type { ApiEnvelope, ApiStartStageData } from '@/lib/apiTypes';
import { ApiResultError, isApiResultError, unwrapEnvelope } from '@/lib/apiResult';
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
  /** Replay interval has not elapsed yet. */
  | { kind: 'cooldown'; message: string; canPlayAt: string | null; remainingMinutes: number }
  /** An earlier stage has not been completed with a perfect score. */
  | { kind: 'locked'; message: string }
  /** The stage exists but has no active questions. */
  | { kind: 'empty'; message: string }
  | { kind: 'unknown'; message: string };

/** Payload the API attaches to a cooldown refusal. */
interface CooldownItems {
  can_play_at?: string;
  remaining_minutes?: number;
}

/**
 * Classifies a failed start into something the UI can act on.
 *
 * The API does not send machine-readable error codes — only a localised string
 * and, for the cooldown, a `can_play_at` payload. So the cooldown is detected by
 * its payload (reliable, language-independent) and the remaining cases fall back
 * to the status code.
 */
export const classifyStartFailure = (error: unknown): StartStageFailure => {
  if (!isApiResultError(error)) {
    return { kind: 'unknown', message: (error as Error)?.message ?? '' };
  }

  const items = (error.items ?? {}) as CooldownItems;
  const message = error.message;

  if (items.can_play_at || typeof items.remaining_minutes === 'number') {
    return {
      kind: 'cooldown',
      message,
      canPlayAt: items.can_play_at ?? null,
      remainingMinutes: items.remaining_minutes ?? 0,
    };
  }

  if (error.statusCode === 422) {
    // Both "finish the previous stage" and "this stage has no questions" are
    // 422s. They are told apart by message because nothing else distinguishes
    // them — see BACKEND_ISSUES.md, which asks for error codes.
    return { kind: 'locked', message };
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
