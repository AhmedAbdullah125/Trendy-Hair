import { Product } from '../types';
import type { ApiProductListItem } from './apiTypes';
import { resolveImageUrl } from './imageUrl';

/**
 * Accepts either the lightweight listing row (`ProductListResource`) or the full
 * single-product payload (`ProductResource`) — every listing endpoint returns the
 * former, so `description`/`images` and the extra brand/category fields are optional.
 */
export type MappableApiProduct = ApiProductListItem;

/**
 * Transforms an API product to match the component Product type
 */
export const mapApiProductToComponent = (apiProduct: MappableApiProduct): Product => {
    return {
        id: apiProduct.id,
        name: apiProduct.name,
        description: apiProduct.description,
        price: `${apiProduct.current_price.toFixed(3)} د.ك`,
        oldPrice: apiProduct.has_discount && apiProduct.price
            ? `${apiProduct.price.toFixed(3)} د.ك`
            : undefined,
        image: resolveImageUrl(apiProduct.main_image),
        categoryId: apiProduct.category?.id?.toString(),
        categoryName: apiProduct.category?.name,
        brandId: apiProduct.brand?.id?.toString(),
        brandName: apiProduct.brand?.name,
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
export const mapApiProductsToComponent = (apiProducts: MappableApiProduct[]): Product[] => {
    return apiProducts.map(mapApiProductToComponent);
};
