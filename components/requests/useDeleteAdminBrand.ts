import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/apiConfig';
import { toast } from 'sonner';

/**
 * Hook to delete an admin brand
 */
export const useDeleteAdminBrand = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (brandId: number) => {
            const adminToken = localStorage.getItem('admin_token');

            const response = await axios.delete(
                `${API_BASE_URL}/v1/admin/brand/${brandId}`,
                {
                    headers: {
                        'lang': 'ar',
                        'Authorization': `Bearer ${adminToken}`,
                    },
                }
            );

            return response.data;
        },
        onSuccess: (data) => {
            // Invalidate and refetch brands
            queryClient.invalidateQueries({ queryKey: ['admin-brands'] });

            toast.success(data.message || 'تم حذف العلامة التجارية بنجاح', {
                style: {
                    background: '#1B8354',
                    color: '#fff',
                    borderRadius: '10px',
                    boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.1)',
                },
            });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 'حدث خطأ أثناء حذف العلامة التجارية';
            toast.error(errorMessage, {
                style: {
                    background: '#dc3545',
                    color: '#fff',
                    borderRadius: '10px',
                    boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.1)',
                },
            });
        },
    });
};
