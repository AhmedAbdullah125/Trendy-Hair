

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number; // Index 0-3
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Stage {
  id: number;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rewardName: string;
  questionTime?: number;
  /** Only set for API-driven stages (`useGetCompetitionStages`). */
  questionsCount?: number;
  /**
   * Ladder position. `submit` reports the next stage by this value, not by id,
   * so it is needed to resolve where the run goes next.
   */
  sortBy?: number;
  questions: Question[];
}

// API-driven stage question types (from /v1/competition/stages/{id}/start)
export interface StageAnswer {
  id: number;
  name: string;
}

export interface StageQuestion {
  id: number;
  text: string;
  answers: StageAnswer[];
}

export interface CollectedAnswer {
  competition_question_id: number;
  competition_answer_id: number;
  time_spent_seconds: number;
}

export enum GameState {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  WON_DAILY = 'WON_DAILY',
  LOST_COOLDOWN = 'LOST_COOLDOWN',
  COMPLETED_ALL = 'COMPLETED_ALL',
  WITHDRAWN = 'WITHDRAWN'
}

/*
 * `PlayerState` used to live here: a client-side model of stage progress,
 * per-stage rewards and locally enforced win/loss cooldowns.
 *
 * The competition is now a server-driven stake-or-bank ladder — points are
 * staked into a pot and only banked on withdraw, and both the pot and the
 * lockout belong to the API. `PlayTab` keeps only its position in the run
 * (`RunPosition`), so this type described a game that no longer exists.
 */

export interface Category {
  id: string;
  name: string; // Arabic Name
  nameEn?: string; // English Name
  isActive: boolean;
  sortOrder: number;
}

export interface Brand {
  id: number;
  name: string; // Arabic Name
  nameEn?: string; // English Name
  slug?: string;
  image: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Product {
  id: number;
  name: string;
  /**
   * Either a pre-formatted display string (e.g. `"12.500 د.ك"`, used by the
   * seeded/demo data and the cart mapper) or the raw numeric price coming
   * straight from the API. Both forms are rendered as-is.
   */
  price: string | number;
  oldPrice?: string | number | null;
  image: string;
  description?: string;
  /** String when derived from an API relation id, number in the seeded data. */
  brandId?: string | number;
  categoryId?: string;
  isNew?: boolean; // For "وصلنا حديثاً"
  isActive?: boolean;

  // Fields populated when the product originates from the API
  // (see `lib/productMapper.ts`). Absent in the seeded/demo data.
  brandName?: string;
  categoryName?: string;
  isFeatured?: boolean;
  stockStatus?: string;
  inStock?: boolean;
  quantity?: number;
  isFavorite?: boolean;
}

export interface Package {
  id: string;
  name: string;
  price: string;
  productIds: number[];
  isActive: boolean;
  displayOrder?: number;
}

export interface Review {
  id: string;
  customerName: string;
  thumbnailUrl: string;
  videoUrl: string;
  isActive: boolean;
  sortOrder: number;
  /** Not returned by `ReviewResource`, so absent for API-sourced reviews. */
  date?: string;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit' | 'expiry';
  amount: number;
  description: string;
  date: string; // ISO String
  expiryDate?: string; // ISO String, only for credits
}

export type TabId = 'home' | 'reviews' | 'play' | 'favorites' | 'account';

export interface GameSettings {
  timeLimitSeconds: number;
  cooldownLossMinutes: number; // Changed from Hours
  cooldownWinMinutes: number; // New field
  gameBalanceCap: number; // Max balance allowed
  stageRewards: [number, number, number]; // Rewards for Stage 1, 2, 3
}

export interface ContentSettings {
  techBookingUrl: string;
}

// Data Store Interface for Context
export interface AppData {
  products: Product[];
  brands: Brand[];
  categories: Category[];
  packages: Package[];
  questions: Question[];
  reviews: Review[];
  gameSettings: GameSettings;
  contentSettings: ContentSettings;
}