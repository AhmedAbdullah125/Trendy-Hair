import { Product } from '../types';

interface ApiProduct {
    id: number;
    name: string;
    sku: string;
    description: string;
    main_image: string;
    price: number;
    discounted_price: number | null;
    current_price: number;
    has_discount: boolean;
    quantity: number;
    in_stock: boolean;
    stock_status: string;
    brand: {
        id: number;
        name: string;
        image: string;
        position: number;
        is_active: number;
    };
    category: {
        id: number;
        name: string;
        image: string;
        position: number;
        is_active: number;
    };
    is_favorite: boolean;
    is_active: boolean;
    is_recently: boolean;
}

/**
 * Transforms an API product to match the component Product type
 */
export const mapApiProductToComponent = (apiProduct: ApiProduct): Product => {
    return {
        id: apiProduct.id,
        name: apiProduct.name,
        description: apiProduct.description,
        price: `${apiProduct.current_price.toFixed(3)} د.ك`,
        oldPrice: apiProduct.has_discount && apiProduct.price
            ? `${apiProduct.price.toFixed(3)} د.ك`
            : undefined,
        image: apiProduct.main_image,
        categoryId: apiProduct.category.id.toString(),
        categoryName: apiProduct.category.name,
        brandId: apiProduct.brand.id.toString(),
        brandName: apiProduct.brand.name,
        isNew: apiProduct.is_recently,
        isFeatured: false, // Not provided by API
        isActive: apiProduct.is_active,
        stockStatus: apiProduct.stock_status,
        inStock: apiProduct.in_stock,
        quantity: apiProduct.quantity,
        isFavorite: apiProduct.is_favorite,
    };
};

/**
 * Transforms an array of API products
 */
export const mapApiProductsToComponent = (apiProducts: ApiProduct[]): Product[] => {
    return apiProducts.map(mapApiProductToComponent);
};
