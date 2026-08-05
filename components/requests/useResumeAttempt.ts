'use client';
import api from '@/lib/axiosInstance';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../../lib/apiConfig';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type { ApiEnvelope, ApiStartStageData } from '@/lib/apiTypes';
import { ApiResultError, unwrapEnvelope } from '@/lib/apiResult';
import type { StartStageResult } from './useStartStage';

/**
 * Reloads an attempt that is still open on the server.
 *
 * GET /v1/competition/attempts/{id}/questions
 *
 * This is the only way out of an orphaned attempt. The server refuses to start
 * another stage (`attempt_active`) and refuses to withdraw
 * (`competition_withdraw_mid_stage`) while one is `in_progress`, so without
 * this call a player whose timer expired — or who simply closed the tab
 * mid-stage — is locked out of the competition permanently.
 *
 * The payload is deliberately identical to `start`'s (`attempt`,
 * `question_time`, `total_questions`, `questions`), so the caller can treat a
 * resume and a fresh start the same way.
 *
 * Answers are only ever submitted as one batch at the end of a stage, so a
 * resumed attempt correctly restarts its question sequence from the first
 * question — nothing was recorded server-side yet.
 */
const resumeAttempt = async (attemptId: number): Promise<StartStageResult> => {
  const token = Cookies.get('token');
  const headers: Record<string, string> = { lang: 'ar' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await api.get<ApiEnvelope<ApiStartStageData>>(
    `${API_BASE_URL}/v1/competition/attempts/${attemptId}/questions`,
    { headers }
  );

  const items = unwrapEnvelope(response.data);

  if (!items?.attempt?.id) {
    throw new ApiResultError('Failed to resume attempt', response.data?.statusCode ?? 0, items);
  }

  const sortedQuestions = [...(items.questions || [])].sort((a, b) => a.sort_by - b.sort_by);

  return {
    attemptId: items.attempt.id,
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

export const useResumeAttempt = (): UseMutationResult<StartStageResult, unknown, number> =>
  useMutation({
    mutationFn: resumeAttempt,
  });
