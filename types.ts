

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
  questions: Question[];
}

export enum GameState {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  WON_DAILY = 'WON_DAILY',
  LOST_COOLDOWN = 'LOST_COOLDOWN',
  COMPLETED_ALL = 'COMPLETED_ALL',
  WITHDRAWN = 'WITHDRAWN'
}

export interface PlayerState {
  currentStageIndex: number;
  currentQuestionIndex: number;
  rewardsEarned: boolean[];
  lastLossTimestamp: number | null;
  lastWinDate: string | null; // Format: YYYY-MM-DD
  lastWinTimestamp?: number | null; // New: For minute-based win cooldowns
  lastWonStageIndex: number | null; // Index of the stage reward achieved
}

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
  price: string;
  oldPrice?: string;
  image: string;
  description?: string;
  brandId?: number;
  categoryId?: string;
  isNew?: boolean; // For "وصلنا حديثاً"
  isActive?: boolean;
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
  date: string;
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