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

type SubmitAttemptResponse = ApiEnvelope<ApiSubmitAttemptData>;

/**
 * Submits all answers for a stage attempt.
 * POST /v1/competition/attempts/{attemptId}/submit
 */
const submitAttempt = async ({
  attemptId,
  answers,
}: SubmitAttemptPayload): Promise<SubmitAttemptResponse> => {
  const token = Cookies.get('token');
  const headers: Record<string, string> = { lang: 'ar' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await api.post<SubmitAttemptResponse>(
    `${API_BASE_URL}/v1/competition/attempts/${attemptId}/submit`,
    { answers },
    { headers }
  );
  return response.data;
};

export const useSubmitAttempt = (): UseMutationResult<
  SubmitAttemptResponse,
  unknown,
  SubmitAttemptPayload
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitAttempt,
    onSuccess: () => {
      // Prize is credited server-side on submit — refresh wallet balance
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
