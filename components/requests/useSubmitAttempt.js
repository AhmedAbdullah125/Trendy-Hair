'use client';
import api from '@/lib/axiosInstance';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../../lib/apiConfig';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Submits all answers for a stage attempt.
 * POST /v1/competition/attempts/{attemptId}/submit
 *
 * @param {{ attemptId: number, answers: Array<{ competition_question_id, competition_answer_id, time_spent_seconds }> }} payload
 */
const submitAttempt = async ({ attemptId, answers }) => {
  const token = Cookies.get('token');
  const headers = { lang: 'ar' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await api.post(
    `${API_BASE_URL}/v1/competition/attempts/${attemptId}/submit`,
    { answers },
    { headers }
  );
  return response.data;
};

export const useSubmitAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitAttempt,
    onSuccess: () => {
      // Prize is credited server-side on submit — refresh wallet balance
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
