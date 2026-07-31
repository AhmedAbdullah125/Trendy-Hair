'use client';
import api from '@/lib/axiosInstance';
import { API_BASE_URL } from '@/lib/apiConfig';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiEnvelope, ApiProfile, UpdateProfilePayload } from '@/lib/apiTypes';
import { getApiErrorMessage } from '@/lib/apiTypes';

type UpdateProfileResponse = ApiEnvelope<ApiProfile>;

async function updateProfileRequest(
    data: UpdateProfilePayload,
    lang: string
): Promise<UpdateProfileResponse> {
    const url = `${API_BASE_URL}/v1/update-profile`;
    const formData = new FormData();

    if (data.phone) formData.append('phone', data.phone);
    if (data.name) formData.append('name', data.name);
    if (data.email) formData.append('email', data.email);
    if (data.photo) formData.append('photo', data.photo);

    const headers: Record<string, string> = { lang };
    const token = Cookies.get('token');
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await api.put<UpdateProfileResponse>(url, formData, { headers });
    return response.data;
}

export function useUpdateProfile(
    lang: string
): UseMutationResult<UpdateProfileResponse, unknown, UpdateProfilePayload> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateProfilePayload) => updateProfileRequest(data, lang),
        onSuccess: (responseData) => {
            const message = responseData?.message;
            if (responseData?.status) {
                toast(message, {
                    style: {
                        background: '#1B8354',
                        color: '#fff',
                        borderRadius: '10px',
                        boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.1)',
                    },
                });
                // Invalidate the profile query so useGetProfile refetches updated data
                queryClient.invalidateQueries({ queryKey: ['profile'] });
            } else {
                toast(message, {
                    style: {
                        background: '#dc3545',
                        color: '#fff',
                        borderRadius: '10px',
                        boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.1)',
                    },
                });
            }
        },
        onError: (error) => {
            const errorMessage = getApiErrorMessage(error);
            toast(errorMessage, {
                style: {
                    background: '#dc3545',
                    color: '#fff',
                    borderRadius: '10px',
                    boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.1)',
                },
            });
        },
    });
}
