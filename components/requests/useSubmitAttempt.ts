'use client';
import api from '@/lib/axiosInstance';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../../lib/apiConfig';
import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type {
  ApiEnvelope,
  ApiSubmitAttemptData,
  SubmitAttemptPayload,
} from '@/lib/apiTypes';
import { REWARD_STATUS_QUERY_KEY } from './useRewardStatus';

/** What a submitted stage did to the run. */
export interface SubmitAttemptResult {
  /** All answers correct. Stages are all-or-nothing — 3 of 4 is a loss. */
  cleared: boolean;
  /** Points this stage added to the pot. */
  pointsStaked: number;
  /** The whole pot now at risk, or 0 after a loss. */
  pendingPoints: number;
  /** Points destroyed by failing. */
  pointsForfeited: number;
  /** `sort_by` of the next stage; null means that was the last one. */
  nextStage: number | null;
  /** Epoch ms until the lockout expires, present on a loss. */
  blockedUntilMs: number | null;
  /** The raw attempt, for the score display. */
  attempt: ApiSubmitAttemptData['attempt'] | undefined;
}

/**
 * Submits all answers for a stage attempt.
 * POST /v1/competition/attempts/{attemptId}/submit
 *
 * **Losing is HTTP 200.** A failed stage is a valid game outcome, not a failed
 * request, so this resolves either way and the caller branches on `cleared`.
 *
 * `wallet_balance` deliberately does not move on a win — points are staked, and
 * only reach the wallet when the player withdraws.
 */
const submitAttempt = async ({
  attemptId,
  answers,
}: SubmitAttemptPayload): Promise<SubmitAttemptResult> => {
  const token = Cookies.get('token');
  const headers: Record<string, string> = { lang: 'ar' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await api.post<ApiEnvelope<ApiSubmitAttemptData>>(
    `${API_BASE_URL}/v1/competition/attempts/${attemptId}/submit`,
    { answers },
    { headers }
  );

  const items = response.data?.items;
  const attempt = items?.attempt;

  // `cleared` is authoritative. The score is only a fallback for a server that
  // predates the ladder, where a perfect run was the win condition anyway.
  const cleared = typeof items?.cleared === 'boolean'
    ? items.cleared
    : Boolean(attempt && attempt.total_questions > 0 && attempt.correct_answers >= attempt.total_questions);

  const blocked = items?.blocked_until ? Date.parse(items.blocked_until) : NaN;

  return {
    cleared,
    pointsStaked: Number(items?.points_staked ?? 0) || 0,
    pendingPoints: Number(items?.pending_points ?? 0) || 0,
    pointsForfeited: Number(items?.points_forfeited ?? 0) || 0,
    nextStage: items?.next_stage ?? null,
    blockedUntilMs: Number.isFinite(blocked) ? blocked : null,
    attempt,
  };
};

export const useSubmitAttempt = (): UseMutationResult<
  SubmitAttemptResult,
  unknown,
  SubmitAttemptPayload
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitAttempt,
    onSuccess: () => {
      // The run state moved, and a loss clears the pot. The wallet itself only
      // changes on withdraw, but refreshing it is harmless and keeps the header
      // honest if the balance changed for any other reason.
      queryClient.invalidateQueries({ queryKey: ['competition-stages'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: [REWARD_STATUS_QUERY_KEY] });
    },
  });
};
