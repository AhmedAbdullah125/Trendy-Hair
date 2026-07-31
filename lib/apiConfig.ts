const API_BASE_URL = 'https://trandyhairapp.com/api';

const API_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  USER_PROFILE: '/user/profile',
  // Add more endpoints as needed
} as const;

export type ApiEndpointName = keyof typeof API_ENDPOINTS;

export { API_BASE_URL, API_ENDPOINTS };
