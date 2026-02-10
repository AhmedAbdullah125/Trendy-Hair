import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/apiConfig';
import { toast } from 'sonner';

interface UpdateProductData {
    id: number;
    name_ar: string;
    name_en?: string;
    position?: number;
    is_active?: number;
    image?: File;
    description_ar?: string;
    description_en?: string;
    price: number;
    discounted_price?: number;
    quantity?: number;
    brand_id?: number;
    category_id?: number;
    is_recently?: number;
}

/**
 * Hook to update an existing admin product
 */
export const useUpdateAdminProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateProductData) => {
            const adminToken = localStorage.getItem('admin_token');

            const formData = new FormData();
            formData.append('translations[0][language]', "ar");
            formData.append('translations[0][name]', data.name_ar);
            formData.append('translations[0][description]', data.description_ar);
            if (data.name_en) formData.append('translations[1][language]', "en");
            if (data.name_en) formData.append('translations[1][name]', data.name_en);
            if (data.description_en) formData.append('translations[1][description]', data.description_en);
            if (data.image) formData.append('main_image', data.image);
            formData.append('price', data.price.toString());
            formData.append('discounted_price', data.discounted_price?.toString() || '0');
            formData.append('quantity', data.quantity?.toString() || '0');
            formData.append('brand_id', data.brand_id?.toString() || '0');
            formData.append('category_id', data.category_id?.toString() || '0');
            if (data.position !== undefined) formData.append('position', data.position.toString());

            formData.append('is_active', (data.is_active ?? 1).toString());
            formData.append('is_recently', (data.is_recently ?? 1).toString());

            const response = await axios.put(
                `${API_BASE_URL}/v1/admin/products/${data.id}`,
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
            // Invalidate and refetch products
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });

            toast.success(data.message || 'تم تحديث المنتج بنجاح', {
                style: {
                    background: '#1B8354',
                    color: '#fff',
                    borderRadius: '10px',
                    boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.1)',
                },
            });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 'حدث خطأ أثناء تحديث المنتج';
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
