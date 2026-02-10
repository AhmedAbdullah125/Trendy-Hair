import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/apiConfig';

/**
 * Hook to fetch admin brands with pagination
 */
export const useGetAdminBrands = (pageSize = 10, pageNumber = 1, lang = 'ar') => {
    return useQuery({
        queryKey: ['admin-brands', pageSize, pageNumber, lang],
        queryFn: async () => {
            const adminToken = localStorage.getItem('admin_token');

            const response = await axios.get(
                `${API_BASE_URL}/v1/admin/brand`,
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
        enabled: !!localStorage.getItem('admin_token'),
    });
};
