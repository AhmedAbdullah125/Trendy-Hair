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
import { unwrapEnvelope } from '@/lib/apiResult';
import { REWARD_STATUS_QUERY_KEY } from './useRewardStatus';

/**
 * Submits all answers for a stage attempt.
 * POST /v1/competition/attempts/{attemptId}/submit
 *
 * Resolves with the attempt itself — the caller needs `correct_answers` /
 * `total_questions` to decide whether the run was actually a win.
 */
const submitAttempt = async ({
  attemptId,
  answers,
}: SubmitAttemptPayload): Promise<ApiSubmitAttemptData> => {
  const token = Cookies.get('token');
  const headers: Record<string, string> = { lang: 'ar' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await api.post<ApiEnvelope<ApiSubmitAttemptData>>(
    `${API_BASE_URL}/v1/competition/attempts/${attemptId}/submit`,
    { answers },
    { headers }
  );

  // Failures arrive as HTTP 200 with `status: false` — see lib/apiResult.ts.
  return unwrapEnvelope(response.data);
};

export const useSubmitAttempt = (): UseMutationResult<
  ApiSubmitAttemptData,
  unknown,
  SubmitAttemptPayload
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitAttempt,
    onSuccess: () => {
      // Prize is credited server-side on submit — refresh wallet balance
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      // …and the per-level earned/claimed flags the stage list is seeded from.
      queryClient.invalidateQueries({ queryKey: [REWARD_STATUS_QUERY_KEY] });
    },
  });
};
