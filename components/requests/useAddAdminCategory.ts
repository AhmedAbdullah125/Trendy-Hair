import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/apiConfig';
import { toast } from 'sonner';

interface AddCategoryData {
    name_ar: string;
    name_en?: string;
    position?: number;
    image?: File;
    is_active?: number;
}

/**
 * Hook to add a new admin category
 */
export const useAddAdminCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: AddCategoryData) => {
            const adminToken = localStorage.getItem('admin_token');

            const formData = new FormData();
            formData.append('translations[0][language]', "ar");
            formData.append('translations[0][name]', data.name_ar);
            if (data.name_en) formData.append('translations[1][language]', "en");
            if (data.name_en) formData.append('translations[1][name]', data.name_en);
            if (data.position !== undefined) formData.append('position', data.position.toString());
            if (data.image) formData.append('image', data.image);
            formData.append('is_active', (data.is_active ?? 1).toString());

            const response = await axios.post(
                `${API_BASE_URL}/v1/admin/category`,
                formData,
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

            toast.success(data.message || 'تم إضافة القسم بنجاح', {
                style: {
                    background: '#1B8354',
                    color: '#fff',
                    borderRadius: '10px',
                    boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.1)',
                },
            });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 'حدث خطأ أثناء إضافة القسم';
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
