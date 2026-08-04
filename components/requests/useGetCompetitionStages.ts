'use client';
import api from '@/lib/axiosInstance';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../../lib/apiConfig';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type {
  ApiCompetitionSettings,
  ApiCompetitionStagesData,
  ApiEnvelope,
} from '@/lib/apiTypes';
import type { Stage } from '../../types';

/** Result of {@link useGetCompetitionStages} — API stages mapped to the internal shape. */
export interface CompetitionStagesResult {
  settings: ApiCompetitionSettings;
  stages: Stage[];
  /** Points staked on a run in progress and still at risk. */
  pendingPoints: number;
  /** Whether there is a pot to bank right now. */
  canWithdraw: boolean;
  /** Epoch ms until the post-loss lockout expires, or null when free to play. */
  blockedUntil: number | null;
}

/**
 * Fetches competition stages from the API and maps them to the internal Stage shape.
 * API response shape:
 * {
 *   items: {
 *     settings: { competition_interval_minutes: number },
 *     stages: [{ id, name, question_time, prize, sort_by, questions_count }]
 *   }
 * }
 */
const fetchCompetitionStages = async (): Promise<CompetitionStagesResult> => {
  const token = Cookies.get('token');
  const headers: Record<string, string> = { lang: 'ar' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await api.get<ApiEnvelope<ApiCompetitionStagesData>>(
    `${API_BASE_URL}/v1/competition/stages`,
    { headers }
  );
  const items = response.data?.items;

  if (!items) throw new Error('No competition stages returned');

  const stages = [...(items.stages || [])].sort((a, b) => a.sort_by - b.sort_by);
  const blocked = items.blocked_until ? Date.parse(items.blocked_until) : NaN;

  return {
    settings: items.settings,
    pendingPoints: Number(items.pending_points ?? 0) || 0,
    canWithdraw: Boolean(items.can_withdraw),
    blockedUntil: Number.isFinite(blocked) ? blocked : null,
    stages: stages.map((s) => ({
      id: s.id,
      name: s.name,
      difficulty: 'easy', // API doesn't return difficulty
      rewardName: s.prize,
      questionTime: s.question_time,
      questionsCount: s.questions_count,
      // `submit` reports `next_stage` as a sort_by, so keep it to resolve it.
      sortBy: s.sort_by,
      questions: [], // Questions fetched separately via useGetRandomQuestion
    })),
  };
};

/**
 * useGetCompetitionStages
 *
 * Returns { data: { settings, stages }, isLoading, isError }
 * Cached for 5 minutes since stages rarely change mid-session.
 */
export const useGetCompetitionStages = (): UseQueryResult<CompetitionStagesResult> =>
  useQuery({
    queryKey: ['competition-stages'],
    queryFn: fetchCompetitionStages,
    staleTime: 1000 * 60 * 5,  // 5 minutes
    gcTime: 1000 * 60 * 60,    // 1 hour
    retry: 2,
  });
