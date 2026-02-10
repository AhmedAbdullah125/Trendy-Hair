import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/apiConfig';

// Response types based on actual API structure
interface ProductBrand {
    id: number;
    name_en: string;
    name_ar: string;
    image: string;
    position: number;
    is_active: number;
}

interface ProductCategory {
    id: number;
    name_en: string;
    name_ar: string;
    image: string;
    position: number;
    is_active: number;
}

interface AdminProduct {
    id: number;
    name_en: string;
    name_ar: string;
    sku: string;
    description_en: string;
    description_ar: string;
    main_image: string;
    price: number;
    discounted_price: number | null;
    has_discount: boolean;
    quantity: number;
    in_stock: boolean;
    stock_status: string;
    brand: ProductBrand;
    category: ProductCategory;
    is_active: boolean;
    is_recently: boolean;
}

interface AdminProductsResponse {
    status: boolean;
    statusCode: number;
    message: string;
    items: {
        data: AdminProduct[];
        pagination: {
            current_page: number;
            total_pages: number;
            total_items: number;
            page_size: number;
        };
    };
}

/**
 * Hook to fetch admin products with pagination
 * Returns detailed product information including brand, category, pricing, and stock details
 */
export const useGetAdminProducts = (pageSize = 10, pageNumber = 1, lang = 'ar') => {
    return useQuery<AdminProductsResponse>({
        queryKey: ['admin-products', pageSize, pageNumber, lang],
        queryFn: async () => {
            const adminToken = localStorage.getItem('admin_token');

            const response = await axios.get<AdminProductsResponse>(
                `${API_BASE_URL}/v1/admin/products`,
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
