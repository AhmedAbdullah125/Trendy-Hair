'use client';
import api from '@/lib/axiosInstance';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../../lib/apiConfig';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type { ApiEnvelope, ApiStartStageData } from '@/lib/apiTypes';
import type { StageQuestion } from '../../types';

/** Normalised result of starting a stage. */
export interface StartStageResult {
  attemptId: number;
  questionTime: number;
  totalQuestions: number;
  questions: StageQuestion[];
}

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
  const items = response.data?.items;
  if (!items) throw new Error('Failed to start stage');

  const sortedQuestions = [...(items.questions || [])].sort((a, b) => a.sort_by - b.sort_by);

  return {
    attemptId: items.attempt?.id,
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
