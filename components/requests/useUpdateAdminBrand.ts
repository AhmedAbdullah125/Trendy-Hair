import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/apiConfig';
import { toast } from 'sonner';

interface UpdateBrandData {
    id: number;
    name_ar: string;
    name_en?: string;
    position?: number;
    is_active?: number;
    image?: File;
}

/**
 * Hook to update an existing admin brand
 */
export const useUpdateAdminBrand = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateBrandData) => {
            const adminToken = localStorage.getItem('admin_token');

            const formData = new FormData();
            formData.append('translations[0][language]', "ar");
            formData.append('translations[0][name]', data.name_ar);
            if (data.name_en) formData.append('translations[1][language]', "en");
            if (data.name_en) formData.append('translations[1][name]', data.name_en);
            if (data.position !== undefined) formData.append('position', data.position.toString());
            if (data.image) formData.append('image', data.image);
            formData.append('is_active', (data.is_active ?? 1).toString());

            const response = await axios.put(
                `${API_BASE_URL}/v1/admin/brand/${data.id}`,
                formData,
                {
                    headers: {
                        'lang': 'ar',
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            return response.data;
        },
        onSuccess: (data) => {
            // Invalidate and refetch brands
            queryClient.invalidateQueries({ queryKey: ['admin-brands'] });

            toast.success(data.message || 'تم تحديث العلامة التجارية بنجاح', {
                style: {
                    background: '#1B8354',
                    color: '#fff',
                    borderRadius: '10px',
                    boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.1)',
                },
            });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 'حدث خطأ أثناء تحديث العلامة التجارية';
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
