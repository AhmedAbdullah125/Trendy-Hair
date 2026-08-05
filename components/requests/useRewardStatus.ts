'use client';
import api from '@/lib/axiosInstance';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../../lib/apiConfig';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ApiEnvelope } from '@/lib/apiTypes';
import { unwrapEnvelope } from '@/lib/apiResult';

export const REWARD_STATUS_QUERY_KEY = 'reward-status';

/** One configured reward tier, as reported by `GET /v1/rewards-claim`. */
export interface RewardLevelStatus {
  level: string;
  amount: number;
  earned: boolean;
  claimed: boolean;
}

interface RewardStatusItems {
  levels?: RewardLevelStatus[];
}

const getAuthToken = () => Cookies.get("token") || localStorage.getItem("token") || "";

const fetchRewardStatus = async (): Promise<RewardLevelStatus[]> => {
  const token = getAuthToken();
  const headers: Record<string, string> = { lang: 'ar' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await api.get<ApiEnvelope<RewardStatusItems>>(
    `${API_BASE_URL}/v1/rewards-claim`,
    { headers }
  );

  return unwrapEnvelope(response.data)?.levels ?? [];
};

/**
 * Server-side truth for which stages the player has already cleared.
 *
 * The levels come back in configuration order and the Nth level maps to the Nth
 * competition stage, so `levels[i].earned` answers "has stage i been cleared".
 *
 * ⚠️ The API exposes only as many levels as `config/rewards.php` defines (three
 * today). If an admin adds a fourth stage this list will be shorter than the
 * stage list, so callers must treat a missing entry as "not earned" rather than
 * assuming the two line up.
 */
export const useRewardStatus = (): UseQueryResult<RewardLevelStatus[], unknown> => {
  const token = getAuthToken();
  return useQuery({
    queryKey: [REWARD_STATUS_QUERY_KEY, token],
    queryFn: fetchRewardStatus,
    enabled: !!token,
    staleTime: 30_000,
  });
};
