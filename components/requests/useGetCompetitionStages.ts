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

  return {
    settings: items.settings,
    stages: stages.map((s) => ({
      id: s.id,
      name: s.name,
      difficulty: 'easy', // API doesn't return difficulty
      rewardName: s.prize,
      questionTime: s.question_time,
      questionsCount: s.questions_count,
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
