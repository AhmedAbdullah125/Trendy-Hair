'use client';
import api from '@/lib/axiosInstance';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../../lib/apiConfig';
import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiEnvelope, ApiWithdrawData } from '@/lib/apiTypes';
import { unwrapEnvelope } from '@/lib/apiResult';

/**
 * Banks the staked pot — the "leave the game" move.
 * POST /v1/competition/withdraw, no request body.
 *
 * Only offer this **between** stages. The API rejects it with `attempt_active`
 * while a stage is open, deliberately: withdrawing mid-stage would let a player
 * read the questions and bail without risk.
 */
const withdrawCompetition = async (): Promise<ApiWithdrawData> => {
  const token = Cookies.get('token');
  const headers: Record<string, string> = { lang: 'ar' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await api.post<ApiEnvelope<ApiWithdrawData>>(
    `${API_BASE_URL}/v1/competition/withdraw`,
    {},
    { headers }
  );

  return unwrapEnvelope(response.data);
};

export const useWithdrawCompetition = (): UseMutationResult<ApiWithdrawData, unknown, void> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: withdrawCompetition,
    onSuccess: () => {
      // The pot has moved into the wallet, so both the balance and the run
      // state on the stages endpoint are stale.
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['competition-stages'] });
    },
  });
};
