import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/apiConfig';

/**
 * Hook to fetch admin categories with pagination
 * @param {number} pageSize - Number of items per page (default: 10)
 * @param {number} pageNumber - Current page number (default: 1)
 * @param {string} lang - Language for the request (default: 'ar')
 */
export const useGetAdminCategories = (pageSize = 10, pageNumber = 1, lang = 'ar') => {
    return useQuery({
        queryKey: ['admin-categories', pageSize, pageNumber, lang],
        queryFn: async () => {
            const adminToken = localStorage.getItem('admin_token');

            const response = await axios.get(
                `${API_BASE_URL}/v1/admin/category`,
                {
                    params: {
                        page_size: pageSize,
                        page_number: pageNumber,
                    },
                    headers: {
                        'lang': lang,
                        'Authorization': `Bearer ${adminToken}`,
                    },
                }
            );

            return response.data;
        },
        enabled: !!localStorage.getItem('admin_token'), // Only run if admin is logged in
    });
};
