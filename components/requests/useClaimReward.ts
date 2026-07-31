'use client';
import api from '@/lib/axiosInstance';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../../lib/apiConfig';
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';
import type { ApiEnvelope, RewardLevel } from '@/lib/apiTypes';

/** The endpoint returns `empObj()` on success, i.e. an empty `items` object. */
type ClaimRewardResponse = ApiEnvelope<Record<string, never>>;

export type ClaimRewardOptions = Omit<
  UseMutationOptions<ClaimRewardResponse, unknown, RewardLevel>,
  'mutationFn'
>;

/**
 * Maps stage index (0-based) to the API level string.
 * 0 → level_one, 1 → level_two, 2 → level_three
 */
export const stageIndexToLevel = (stageIndex: number): RewardLevel => {
  const levels: RewardLevel[] = ['level_one', 'level_two', 'level_three'];
  return levels[stageIndex] ?? 'level_one';
};

const claimReward = async (level: RewardLevel): Promise<ClaimRewardResponse> => {
  const token = Cookies.get('token');
  const headers: Record<string, string> = { lang: 'ar' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const formData = new FormData();
  formData.append('level', level);

  const response = await api.post<ClaimRewardResponse>(
    `${API_BASE_URL}/v1/rewards-claim`,
    formData,
    { headers }
  );

  return response.data;
};

/**
 * useClaimReward
 *
 * Call `mutate(level)` or `mutateAsync(level)` with one of:
 *   'level_one' | 'level_two' | 'level_three'
 *
 * Use `stageIndexToLevel(stageIndex)` to convert a 0-based stage index.
 * On success, automatically refetches the profile so the wallet balance updates.
 */
export const useClaimReward = (
  options: ClaimRewardOptions = {}
): UseMutationResult<ClaimRewardResponse, unknown, RewardLevel> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: claimReward,
    onSuccess: (...args: Parameters<NonNullable<ClaimRewardOptions['onSuccess']>>) => {
      // Refetch profile so wallet balance reflects the new reward
      queryClient.invalidateQueries({ queryKey: ['profile', 'ar'] });
      options.onSuccess?.(...args);
    },
    ...options,
  });
};
