import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/apiConfig';
import { toast } from 'sonner';

/**
 * Hook to delete an admin category
 */
export const useDeleteAdminCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (categoryId: number) => {
            const adminToken = localStorage.getItem('admin_token');

            const response = await axios.delete(
                `${API_BASE_URL}/v1/admin/category/${categoryId}`,
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
            // Invalidate and refetch categories
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });

            toast.success(data.message || 'تم حذف القسم بنجاح', {
                style: {
                    background: '#1B8354',
                    color: '#fff',
                    borderRadius: '10px',
                    boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.1)',
                },
            });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 'حدث خطأ أثناء حذف القسم';
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
