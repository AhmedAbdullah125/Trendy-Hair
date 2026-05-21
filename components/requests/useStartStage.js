'use client';
import api from '@/lib/axiosInstance';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../../lib/apiConfig';
import { useMutation } from '@tanstack/react-query';

/**
 * Starts a competition stage and returns the attempt + all questions.
 * POST /v1/competition/stages/{stageId}/start
 */
const startStage = async (stageId) => {
  const token = Cookies.get('token');
  const headers = { lang: 'ar' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await api.post(
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

export const useStartStage = () =>
  useMutation({
    mutationFn: startStage,
  });
