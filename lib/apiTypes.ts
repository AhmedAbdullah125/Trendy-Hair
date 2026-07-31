/**
 * Shared types describing the backend HTTP contract.
 *
 * These mirror the Laravel API resources in `backend/app/Http/Resources` and the
 * response envelope produced by `response_api()` in `backend/app/Helper/system.php`.
 * Keep them in sync with the backend rather than with component-local shapes.
 *
 * Scalar conventions observed in the backend:
 *  - `decimal` columns are serialised by Eloquent as **strings** (e.g. `wallet`,
 *    `delivery_cost`, `prize`, order money fields).
 *  - `boolean` (tinyint) columns are serialised as **numbers** (`0`/`1`) unless a
 *    resource explicitly casts them with `(bool)` (products do, lookups do not).
 *  - `storageUrl()` returns `null` when the underlying column is empty.
 */

import axios from 'axios';

/* ------------------------------------------------------------------ *
 * Response envelope
 * ------------------------------------------------------------------ */

/** Standard envelope returned by `response_api()`. */
export interface ApiEnvelope<T> {
  status: boolean;
  statusCode: number;
  message: string;
  items: T;
  /** Present only on validation failures. */
  errors?: Record<string, string[]>;
}

/** Body of a failed response, as far as the client relies on it. */
export interface ApiErrorBody {
  status?: boolean;
  statusCode?: number;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Pagination block emitted by every paginated app endpoint (products index /
 * by-category / by-brand / favorites, reviews, orders). All four keys are always
 * present — the repositories build this literal inline.
 */
export interface ApiPagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  page_size: number;
}

/**
 * A relation that the backend replaces with `empObj()` (an empty object) when the
 * underlying model is missing — so every field has to be treated as optional.
 */
export type ApiMaybe<T> = Partial<T>;

/* ------------------------------------------------------------------ *
 * Lookups: categories, brands, banners, governorates, cities
 * ------------------------------------------------------------------ */

/**
 * Category as returned by `POST /v1/lookups` (`slug=categories`).
 *
 * NOTE: this is **not** `CategoryResource` — `SettingEloquent::fetchShopifyLiveCategories()`
 * builds it from Shopify custom + smart collections. `position` and `is_active` are
 * hard-coded to `1`, and `image` is Shopify's `image.src` (absent → `null`).
 */
export interface ApiCategory {
  id: number;
  name: string;
  image: string | null;
  position: number;
  is_active: number;
}

/** `BrandResource` — note `is_active` is a raw tinyint (0/1). */
export interface ApiBrand {
  id: number;
  name: string;
  image: string | null;
  position: number;
  is_active: number;
}

/** `BannerResource` */
export interface ApiBanner {
  id: number;
  title: string;
  image: string | null;
  /** Empty string when the banner has no link. */
  url: string;
  position: number;
  is_active: number;
}

/** `GovernorateResource` */
export interface ApiGovernorate {
  id: number;
  name: string;
  is_active: number;
}

/** `CityResource` — `delivery_cost` is a decimal column, so a string. */
export interface ApiCity {
  id: number;
  name: string;
  governorate_id: number;
  delivery_cost: string;
  is_active: number;
}

/** `SocialLinkResource` */
export interface ApiSocialLink {
  id: number;
  name: string;
  link: string;
  icon: string;
}

/** `POST /v1/lookups` with `slug=governorates`. */
export interface ApiGovernoratesLookup {
  governorates: ApiGovernorate[];
}

/** `POST /v1/lookups` with `slug=cities`. */
export interface ApiCitiesLookup {
  cities: ApiCity[];
}

/** `POST /v1/lookups` with `slug=categories`. */
export interface ApiCategoriesLookup {
  categories: ApiCategory[];
}

/* ------------------------------------------------------------------ *
 * Products
 * ------------------------------------------------------------------ */

export type ApiStockStatus = 'In Stock' | 'Out of Stock';

/** Entry of a product's `images` gallery. */
export interface ApiProductImage {
  id: number;
  image: string | null;
}

/**
 * The `brand` / `category` block embedded in a product row.
 *
 * Every field is optional because the backend emits three different forms:
 *  - Shopify-mapped rows (the default for all app product endpoints) send
 *    `{ id: null, name }` — `id` is *explicitly null*, derived from Shopify's
 *    `vendor` / `product_type` strings which have no local id.
 *  - `ProductListResource` (the favorites fallback for locally-stored products)
 *    sends `{ id, name }` with a real numeric id.
 *  - A missing relation becomes `empObj()`, i.e. `{}`.
 */
export interface ApiProductRelationRef {
  id?: number | null;
  name?: string;
  image?: string | null;
  position?: number;
  is_active?: number;
}

/**
 * A product row as returned by the app endpoints: `products/index`, `by-category`,
 * `by-brand`, `favorites`, `home.products_recently` and `home.packages[].products`.
 *
 * NOTE: these are built by `ProductEloquent::mapShopifyProductForAppList()` from the
 * live Shopify Admin API — **not** by `ProductListResource`. The one exception is
 * `favorites`, which falls back to `ProductListResource` for favorited products that
 * have no `shopify_product_id`; that fallback is why `sku`/`main_image` are nullable
 * (DB columns) even though the Shopify mapper always produces strings.
 */
export interface ApiProductListItem {
  id: number;
  name: string;
  sku: string | null;
  main_image: string | null;
  price: number;
  discounted_price: number | null;
  current_price: number;
  has_discount: boolean;
  quantity: number;
  in_stock: boolean;
  stock_status: ApiStockStatus;
  brand: ApiProductRelationRef;
  category: ApiProductRelationRef;
  is_favorite: boolean;
  is_active: boolean;
  is_recently: boolean;
  /** Only returned by the single-product endpoint. */
  description?: string | null;
  /** Only returned by the single-product endpoint. */
  images?: ApiProductImage[];
}

/**
 * `GET /v1/products/{id}` — `mapShopifyProductForAppShow()`, i.e. the list row plus
 * the stripped `body_html` description and the full image gallery.
 */
export interface ApiProduct extends ApiProductListItem {
  description: string;
  images: ApiProductImage[];
}

/** Payload of the paginated product listing endpoints. */
export interface ApiProductsPage {
  products: ApiProductListItem[];
  pagination: ApiPagination;
}

/** `PackageResource` */
export interface ApiPackage {
  id: number;
  name: string;
  is_active: number;
  products: ApiProductListItem[];
}

/**
 * Payload of `POST /v1/home` (`HomeEloquent::index`).
 *
 * These four keys are the complete set — the home endpoint returns no categories
 * and no social links (fetch those via `POST /v1/lookups`).
 */
export interface ApiHomeData {
  banners: ApiBanner[];
  brands: ApiBrand[];
  /** Live Shopify products, newest first, capped at 10. */
  products_recently: ApiProductListItem[];
  packages: ApiPackage[];
}

/* ------------------------------------------------------------------ *
 * Reviews
 * ------------------------------------------------------------------ */

/** `ReviewResource` */
export interface ApiReview {
  id: number;
  title: string;
  image: string | null;
  video: string | null;
}

/**
 * Payload of `POST /v1/reviews`.
 * The collection key is `products` (not `reviews`) — matching what the endpoint
 * actually returns and what `ReviewsTab` reads.
 */
export interface ApiReviewsPage {
  products: ApiReview[];
  pagination: ApiPagination;
}

/* ------------------------------------------------------------------ *
 * Profile / auth
 * ------------------------------------------------------------------ */

/**
 * `ProfileResource` — used by `GET /v1/profile` and `PUT /v1/update-profile`.
 * `wallet` is a `decimal(10,2)` column, so a string. `name`/`photo`/`email` are
 * coalesced to `""` by the resource, but `phone` is passed through raw and the
 * column is nullable.
 */
export interface ApiProfile {
  id: number;
  name: string;
  photo: string;
  email: string;
  phone: string | null;
  is_active: number;
  is_verify: number;
  lang: string;
  wallet: string;
  created_at: string;
}

/** Laravel Passport token payload. */
export interface ApiAuthToken {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
}

/**
 * The `user` object returned by login/register.
 *
 * NOTE: this is the **raw `User` model**, not `ProfileResource` — so it carries the
 * full column set minus `$hidden` (`password`, `remember_token`).
 */
export interface ApiAuthUser {
  id: number;
  name: string | null;
  email: string | null;
  photo: string | null;
  phone: string | null;
  lang: string;
  is_active: number;
  is_verify: number;
  verification_code: string | null;
  validation_at: string | null;
  last_send_validation_code: string | null;
  try_num_validation: number;
  wallet: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * `items` of `POST /v1/login` and `POST /v1/register`.
 *
 * `token` is `null` when the account exists but is not verified — the response is
 * still `status: true` / HTTP 200 in that case, so callers must check `token`.
 */
export interface ApiAuthPayload {
  token: ApiAuthToken | null;
  user: ApiAuthUser;
}

/**
 * `items` of `POST /v1/refresh-token`.
 *
 * The token fields sit at the **top level** here — unlike login/register, this
 * endpoint does not nest them under a `token` key and returns no `user`.
 */
export type ApiRefreshTokenPayload = ApiAuthToken;

/** Fields accepted by `PUT /v1/update-profile`. */
export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  email?: string;
  /** A `File` from an `<input type="file">`, or an existing URL/path. */
  photo?: File | string;
}

/* ------------------------------------------------------------------ *
 * Orders
 * ------------------------------------------------------------------ */

/** `OrderItemDashResource` */
export interface ApiOrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: string;
  total: string;
  product: ApiMaybe<ApiProduct>;
}

/**
 * `OrderDashResource`.
 *
 * `status` and `payment_status` are **localised labels**, not raw enum values —
 * the resource translates them using the `lang` header, so they are plain strings.
 * Money fields are decimal columns and therefore strings.
 */
export interface ApiOrder {
  id: number;
  order_number: string;
  subtotal: string;
  discount: string;
  delivery_cost: string;
  use_wallet: number;
  wallet_amount: string;
  payment_type: string;
  payment_status: string;
  status: string;
  notes: string | null;
  total: string;
  items_count: number;
  created_at: string;
  governorate: ApiMaybe<ApiGovernorate>;
  city: ApiMaybe<ApiCity>;
  user: ApiMaybe<ApiProfile>;
  items: ApiOrderItem[];
}

/** Query parameters accepted by `GET /v1/order`. */
export interface OrdersQueryParams {
  page_number?: number;
  page_size?: number;
  status?: string;
  from?: string;
  to?: string;
  search?: string;
}

/**
 * Payload of `POST /v1/order` (`OrderEloquent::store`).
 *
 * The endpoint returns only these three keys — not the created order.
 * `payment_url` is `null` unless the payment type routes through MyFatoorah
 * (knet / card); `payment_status` is the raw enum value (not localised, unlike
 * `ApiOrder.payment_status`), and `total` is a decimal column, so a string.
 */
export interface ApiCreateOrderResult {
  payment_url: string | null;
  payment_status: ApiOrderPaymentStatus;
  total: string;
}

/** Raw `payment_status` enum values stored on the order. */
export type ApiOrderPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

/**
 * Payment types the client sends. `OrderEloquent::normalizePaymentType()` maps
 * `visa` → `card`, while `knet` and `cash` pass through unchanged.
 */
export type PaymentMethod = 'cash' | 'visa' | 'knet';

/* ------------------------------------------------------------------ *
 * Questions (daily game)
 * ------------------------------------------------------------------ */

/** `AnswerResource` */
export interface ApiAnswer {
  id: number;
  answer: string;
  is_correct: boolean;
  order: number;
}

/** `QuestionResource` — `GET /v1/questions/random`. */
export interface ApiQuestion {
  id: number;
  question: string;
  is_active: number;
  answers: ApiAnswer[];
}

/** Reward tiers accepted by `POST /v1/rewards-claim`. */
export type RewardLevel = 'level_one' | 'level_two' | 'level_three';

/* ------------------------------------------------------------------ *
 * Competition
 * ------------------------------------------------------------------ */

/** `CompetitionStageResource` — `prize` is `decimal:3`, so a string. */
export interface ApiCompetitionStage {
  id: number;
  name: string;
  question_time: number;
  prize: string;
  sort_by: number;
  stage_number_of_questions: number;
  /** Only present when the relation was counted (`whenCounted`). */
  questions_count?: number;
}

export interface ApiCompetitionSettings {
  competition_interval_minutes: number;
  /** Seconds allowed per question. */
  competition_question_time: number;
  /** Wallet balance at which a player stops earning; null means no cap. */
  game_balance_cap: number | null;
}

/** Payload of `GET /v1/competition/stages`. */
export interface ApiCompetitionStagesData {
  settings: ApiCompetitionSettings;
  stages: ApiCompetitionStage[];
}

/** `CompetitionAnswerResource` */
export interface ApiCompetitionAnswer {
  id: number;
  name: string;
  sort_by: number;
}

/** `CompetitionQuestionResource` */
export interface ApiCompetitionQuestion {
  id: number;
  name: string;
  sort_by: number;
  answers: ApiCompetitionAnswer[];
}

/** `CompetitionAttemptResource` — `prize_earned` is `decimal:3`, so a string. */
export interface ApiCompetitionAttempt {
  id: number;
  competition_stage_id: number;
  status: string;
  correct_answers: number;
  total_questions: number;
  prize_earned: string;
  wallet_credited: boolean;
  started_at: string | null;
  completed_at: string | null;
}

/** Payload of `POST /v1/competition/stages/{id}/start`. */
export interface ApiStartStageData {
  attempt: ApiCompetitionAttempt;
  question_time: number;
  total_questions: number;
  questions: ApiCompetitionQuestion[];
}

/** One entry of the `answers` array sent to `.../attempts/{id}/submit`. */
export interface SubmitAttemptAnswer {
  competition_question_id: number;
  competition_answer_id: number;
  time_spent_seconds: number;
}

export interface SubmitAttemptPayload {
  attemptId: number;
  answers: SubmitAttemptAnswer[];
}

/**
 * `items` of `POST /v1/competition/attempts/{id}/submit`.
 * `wallet_balance` is cast to `(float)` server-side, so a number — unlike the
 * `wallet` string on `ApiProfile`.
 */
export interface ApiSubmitAttemptData {
  attempt: ApiCompetitionAttempt;
  wallet_balance: number;
}

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

/**
 * Extracts the message the UI should show for a failed request.
 *
 * Mirrors the `error?.response?.data?.message || error.message` idiom used
 * throughout the app, including the fact that it can yield `undefined`.
 */
export const getApiErrorMessage = (error: unknown): string | undefined => {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const bodyMessage = error.response?.data?.message;
    if (bodyMessage) return bodyMessage;
  }
  return error instanceof Error ? error.message : undefined;
};
