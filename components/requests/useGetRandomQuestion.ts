'use client';
import api from '@/lib/axiosInstance';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../../lib/apiConfig';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ApiEnvelope, ApiQuestion } from '@/lib/apiTypes';
import type { Question } from '../../types';

/**
 * Fetches a random question from the API and maps it to the internal Question shape:
 * { id, text, options: string[], correctAnswer: number (index), difficulty: 'easy' }
 */
const fetchRandomQuestion = async (): Promise<Question> => {
  const token = Cookies.get('token');
  const headers: Record<string, string> = { lang: 'ar' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await api.get<ApiEnvelope<ApiQuestion>>(
    `${API_BASE_URL}/v1/questions/random`,
    { headers }
  );
  const item = response.data?.items;

  if (!item) throw new Error('No question returned');

  // Sort answers by order, then map to options array
  const sortedAnswers = [...(item.answers || [])].sort((a, b) => a.order - b.order);
  const options = sortedAnswers.map((a) => a.answer);
  const correctAnswer = sortedAnswers.findIndex((a) => a.is_correct === true);

  return {
    id: item.id,
    text: item.question,
    options,
    correctAnswer: correctAnswer >= 0 ? correctAnswer : 0,
    difficulty: 'easy', // API doesn't return difficulty; default to easy
  };
};

/**
 * useGetRandomQuestion
 *
 * Each call with a unique `questionKey` triggers a fresh fetch from the API.
 * Pass a changing key (e.g. an incrementing counter) to force a new question.
 *
 * @param questionKey - Changes to trigger a new fetch
 * @param enabled - Whether to fetch at all (only during PLAYING state)
 */
export const useGetRandomQuestion = (
  questionKey: number | string,
  enabled: boolean = true
): UseQueryResult<Question> => {
  return useQuery({
    queryKey: ['random-question', questionKey],
    queryFn: fetchRandomQuestion,
    enabled,
    staleTime: Infinity,   // Don't re-fetch in background
    gcTime: 0,             // Don't cache between questions
    retry: 2,
  });
};
