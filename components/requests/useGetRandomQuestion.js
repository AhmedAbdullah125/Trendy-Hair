'use client';
import api from '@/lib/axiosInstance';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../../lib/apiConfig';
import { useQuery } from '@tanstack/react-query';

/**
 * Fetches a random question from the API and maps it to the internal Question shape:
 * { id, text, options: string[], correctAnswer: number (index), difficulty: 'easy' }
 */
const fetchRandomQuestion = async () => {
  const token = Cookies.get('token');
  const headers = { lang: 'ar' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await api.get(`${API_BASE_URL}/v1/questions/random`, { headers });
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
 * @param {number|string} questionKey - Changes to trigger a new fetch
 * @param {boolean} enabled - Whether to fetch at all (only during PLAYING state)
 */
export const useGetRandomQuestion = (questionKey, enabled = true) => {
  return useQuery({
    queryKey: ['random-question', questionKey],
    queryFn: fetchRandomQuestion,
    enabled,
    staleTime: Infinity,   // Don't re-fetch in background
    gcTime: 0,             // Don't cache between questions
    retry: 2,
  });
};
