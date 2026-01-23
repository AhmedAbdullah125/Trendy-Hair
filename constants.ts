

import { Stage, Product, WalletTransaction, Brand, Category, Package, AppData, Question, GameSettings, Review, ContentSettings } from './types';

export const APP_COLORS = {
  bg: '#F7F4EE',
  card: '#EBE5DA',
  gold: '#B1996C',
  goldDark: '#A88A59',
  text: '#1F1F1F',
  textSec: '#7A7A7A',
};

export const LOCK_DURATION_MS = 60 * 60 * 1000; // 1 Hour

// --- Wallet & Loyalty Config ---
export const LOYALTY_POINT_VALUE_KD = 0.050; // 1 Point = 0.050 KD
export const POINTS_EARNED_PER_KD = 1; // Earn 1 point for every 1 KD spent
export const GAME_REDEMPTION_CAP_KD = 5.000; // Max redemption 5 KWD per order

export const STORAGE_KEYS = {
  GAME_STATE: 'trandy_hair_game_state_v1',
  ORDERS: 'trandy_hair_orders_v1',
  FAVOURITES: 'trandy_hair_favourites_v1',
  WALLET_GAME: 'trandy_game_balance_v1',
  WALLET_LOYALTY: 'trandy_loyalty_points_v1',
  DATA_STORE: 'mezo_demo_data_v1'
};

// --- INITIAL SEED DATA ---

const INITIAL_CATEGORIES: Category[] = [
  { id: 'shampoo', name: 'شامبو وبلسم', nameEn: 'Shampoo & Conditioner', isActive: true, sortOrder: 1 },
  { id: 'spray', name: 'بخاخ الشعر', nameEn: 'Hair Spray', isActive: true, sortOrder: 2 },
  { id: 'noor_set', name: 'مجموعة نور للترميم وانبات الشعر', nameEn: 'Noor Repair Set', isActive: true, sortOrder: 3 },
  { id: 'ampoules', name: 'امبولات الشعر', nameEn: 'Hair Ampoules', isActive: true, sortOrder: 4 },
  { id: 'perfume', name: 'عطر الشعر', nameEn: 'Hair Perfume', isActive: true, sortOrder: 5 },
  { id: 'offers', name: 'عروض', nameEn: 'Offers', isActive: true, sortOrder: 6 }
];

const INITIAL_BRANDS: Brand[] = [
  { 
    id: 1, 
    name: '24KERATS', 
    nameEn: '24KERATS',
    slug: '24kerats',
    image: 'https://trandyhair.com/cdn/shop/collections/images.png?v=1754656196',
    isActive: true,
    sortOrder: 1
  },
  { 
    id: 2, 
    name: 'LAlga', 
    nameEn: 'LAlga',
    slug: 'lalga',
    image: 'https://trandyhair.com/cdn/shop/collections/lalga.webp?v=1754656187',
    isActive: true,
    sortOrder: 2
  },
  { 
    id: 3, 
    name: 'INNOVATIS', 
    nameEn: 'INNOVATIS',
    slug: 'innovatis',
    image: 'https://trandyhair.com/cdn/shop/collections/images.jpg?v=1754656179',
    isActive: true,
    sortOrder: 3
  },
  { 
    id: 4, 
    name: 'TRENDYHAIR', 
    nameEn: 'TRENDYHAIR',
    slug: 'trendyhair',
    image: 'https://trandyhair.com/cdn/shop/collections/Trendy_Hair.webp?v=1754656204',
    isActive: true,
    sortOrder: 4
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "شامبو الكيراتين المرمم",
    price: "12.500 د.ك",
    oldPrice: "15.000 د.ك",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    description: "يعمل هذا الشامبو على ترميم ألياف الشعر التالفة بفضل تركيبته الغنية بالكيراتين والبروتينات الطبيعية.",
    brandId: 1,
    categoryId: 'shampoo',
    isActive: true,
    isNew: true
  },
  {
    id: 2,
    name: "بخاخ حماية الحرارة",
    price: "8.000 د.ك",
    image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80",
    description: "درع واقي لشعرك ضد درجات الحرارة العالية الناتجة عن أجهزة التصفيف.",
    brandId: 1,
    categoryId: 'spray',
    isActive: true,
    isNew: true
  },
  {
    id: 3,
    name: "زيت الأرغان النقي",
    price: "9.750 د.ك",
    oldPrice: "11.000 د.ك",
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=80",
    description: "زيت أرغان طبيعي 100% مستخلص بضغط بارد. مثالي لترطيب الأطراف الجافة.",
    brandId: 2,
    categoryId: 'shampoo', // Approximating category for demo
    isActive: true,
    isNew: true
  },
  {
    id: 4,
    name: "مجموعة الترطيب العميق",
    price: "24.000 د.ك",
    image: "https://images.unsplash.com/photo-1552046122-03184de85e08?auto=format&fit=crop&w=800&q=80",
    description: "مجموعة متكاملة للعناية المكثفة بالشعر الجاف جداً.",
    brandId: 2,
    categoryId: 'noor_set',
    isActive: true,
    isNew: true
  },
  {
    id: 5,
    name: "امبولات تقوية الجذور",
    price: "18.500 د.ك",
    oldPrice: "22.000 د.ك",
    image: "https://images.unsplash.com/photo-1594465919760-441fe5908ab0?auto=format&fit=crop&w=800&q=80",
    description: "تركيبة مركزة تستهدف بصيلات الشعر لتقويتها ومنع التساقط.",
    brandId: 1,
    categoryId: 'ampoules',
    isActive: true,
    isNew: true
  }
];

const INITIAL_PACKAGES: Package[] = [
  {
    id: 'widget_1',
    name: 'بكج ترميم نور الفوري من 5 - 15 دقيقة',
    price: '0', // Not used for widget display, but required by type
    productIds: [1, 2, 3, 5], 
    isActive: true,
    displayOrder: 1
  },
  {
    id: 'widget_2',
    name: 'بكج ترميم نور الفوري للشعر المطاطي وزيادة سمك الشعر',
    price: '0',
    productIds: [4, 5, 1, 2],
    isActive: true,
    displayOrder: 2
  }
];

// --- REVIEWS SEED DATA ---
const INITIAL_REVIEWS: Review[] = [
  { 
    id: '1', 
    thumbnailUrl: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=400&q=80',
    videoUrl: 'https://raiyansoft.com/wp-content/uploads/2025/12/trandyhair-1.mp4',
    customerName: 'أمل العتيبي',
    isActive: true,
    sortOrder: 1,
    date: new Date().toISOString()
  },
  { 
    id: '2', 
    thumbnailUrl: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=400&q=80',
    videoUrl: 'https://raiyansoft.com/wp-content/uploads/2025/12/trandyhair-1.mp4',
    customerName: 'نورة المطيري',
    isActive: true,
    sortOrder: 2,
    date: new Date().toISOString()
  },
  { 
    id: '3', 
    thumbnailUrl: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=400&q=80',
    videoUrl: 'https://raiyansoft.com/wp-content/uploads/2025/12/trandyhair-1.mp4',
    customerName: 'سارة الكندري',
    isActive: true,
    sortOrder: 3,
    date: new Date().toISOString()
  },
  { 
    id: '4', 
    thumbnailUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=400&q=80',
    videoUrl: 'https://raiyansoft.com/wp-content/uploads/2025/12/trandyhair-1.mp4',
    customerName: 'ليلى الدوسري',
    isActive: true,
    sortOrder: 4,
    date: new Date().toISOString()
  },
  { 
    id: '5', 
    thumbnailUrl: 'https://images.unsplash.com/photo-1492158244976-29b84ba93025?auto=format&fit=crop&w=400&q=80',
    videoUrl: 'https://raiyansoft.com/wp-content/uploads/2025/12/trandyhair-1.mp4',
    customerName: 'ريم العنزي',
    isActive: true,
    sortOrder: 5,
    date: new Date().toISOString()
  },
  { 
    id: '6', 
    thumbnailUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=400&q=80',
    videoUrl: 'https://raiyansoft.com/wp-content/uploads/2025/12/trandyhair-1.mp4',
    customerName: 'منى القحطاني',
    isActive: true,
    sortOrder: 6,
    date: new Date().toISOString()
  },
];

// --- QUESTIONS SEED DATA ---
const INITIAL_QUESTIONS: Question[] = [
  // Easy
  { id: 101, text: 'ما هو الفيتامين الأهم لصحة الشعر؟', options: ['فيتامين C', 'البيوتين (B7)', 'فيتامين A', 'الكالسيوم'], correctAnswer: 1, difficulty: 'easy' },
  { id: 102, text: 'كم مرة ينصح بقص أطراف الشعر؟', options: ['كل يوم', 'كل 6-8 أسابيع', 'مرة في السنة', 'كل أسبوعين'], correctAnswer: 1, difficulty: 'easy' },
  { id: 103, text: 'ما هو المكون الأساسي للشعر؟', options: ['الماء', 'الكيراتين', 'الدهون', 'الكولاجين'], correctAnswer: 1, difficulty: 'easy' },
  { id: 104, text: 'ما هو أفضل وقت لتمشيط الشعر المجعد؟', options: ['عندما يكون جافاً', 'عندما يكون مبللاً', 'بعد الاستشوار', 'قبل النوم'], correctAnswer: 1, difficulty: 'easy' },
  { id: 105, text: 'أي زيت يعتبر الأفضل لترطيب الشعر الجاف؟', options: ['زيت الذرة', 'زيت الأرغان', 'زيت السيارات', 'الخل'], correctAnswer: 1, difficulty: 'easy' },
  
  // Medium
  { id: 201, text: 'ما هو الهدف الرئيسي من استخدام بلسم الشعر؟', options: ['تنظيف الفروة', 'ترطيب وإغلاق المسام', 'تغيير اللون', 'زيادة الطول'], correctAnswer: 1, difficulty: 'medium' },
  { id: 202, text: 'ما السبب الأكثر شيوعاً لقشرة الشعر؟', options: ['الفطريات وجفاف الفروة', 'كثرة غسل الشعر', 'نقص فيتامين C', 'استخدام العطور'], correctAnswer: 0, difficulty: 'medium' },
  { id: 203, text: 'أي مرحلة من مراحل نمو الشعر تعتبر الأطول؟', options: ['أناجين (النمو)', 'كاتاجين (التراجع)', 'تيلوجين (الراحة)', 'إكسوجين (التساقط)'], correctAnswer: 0, difficulty: 'medium' },
  { id: 204, text: 'ما هو تأثير الماء الساخن جداً على الشعر؟', options: ['يزيد اللمعان', 'يجرده من الزيوت الطبيعية', 'يساعد على النمو', 'يقتل القمل'], correctAnswer: 1, difficulty: 'medium' },
  { id: 205, text: 'لماذا يجب تجنب المنتجات التي تحتوي على السلفات؟', options: ['لأنها باهظة الثمن', 'لأنها تسبب تساقط الشعر', 'لأنها تجفف الشعر وتزيل الزيوت', 'لأنها تغير لون الصبغة'], correctAnswer: 2, difficulty: 'medium' },

  // Hard
  { id: 301, text: 'ما هو الرقم الهيدروجيني (pH) المثالي للشعر الصحي؟', options: ['7.0 (محايد)', '8.0 - 9.0 (قلوي)', '4.5 - 5.5 (حامضي قليلاً)', '1.0 - 2.0 (حامضي جداً)'], correctAnswer: 2, difficulty: 'hard' },
  { id: 302, text: 'كيف يتم اختبار مرونة الشعر (Elasticity)؟', options: ['شده وهو مبلل', 'شده وهو جاف', 'حرق طرف الشعرة', 'وضعه في الماء'], correctAnswer: 0, difficulty: 'hard' },
  { id: 303, text: 'ما هي وظيفة طبقة "الكيوتيكل" (Cuticle) في الشعرة؟', options: ['إعطاء اللون', 'حماية الطبقات الداخلية', 'نقل الغذاء', 'ربط الشعر بالفروة'], correctAnswer: 1, difficulty: 'hard' },
  { id: 304, text: 'ماذا يعني مصطلح "مسامية الشعر" (Porosity)؟', options: ['عدد الشعرات في الرأس', 'قدرة الشعر على امتصاص الرطوبة', 'سرعة نمو الشعر', 'سمك الشعرة'], correctAnswer: 1, difficulty: 'hard' },
  { id: 305, text: 'أي من المكونات التالية يعمل كـ "باني روابط" (Bond Builder)؟', options: ['السيليكون', 'الزيوت المعدنية', 'الأحماض الأمينية والبروتينات', 'الكحول'], correctAnswer: 2, difficulty: 'hard' },
];

export const INITIAL_GAME_SETTINGS: GameSettings = {
  timeLimitSeconds: 20, // Default 20 seconds as requested
  cooldownLossMinutes: 60, // 1 hour
  cooldownWinMinutes: 1440, // 24 hours
  gameBalanceCap: 40,
  stageRewards: [10, 20, 40]
};

export const INITIAL_CONTENT_SETTINGS: ContentSettings = {
  techBookingUrl: 'https://wa.me/96599007898'
};

export const INITIAL_DATA: AppData = {
  products: INITIAL_PRODUCTS,
  categories: INITIAL_CATEGORIES,
  brands: INITIAL_BRANDS,
  packages: INITIAL_PACKAGES,
  questions: INITIAL_QUESTIONS,
  reviews: INITIAL_REVIEWS,
  gameSettings: INITIAL_GAME_SETTINGS,
  contentSettings: INITIAL_CONTENT_SETTINGS
};

// --- REMAINING CONSTANTS ---

// Helper to duplicate questions for stages (kept for fallback types, but actual game uses context)
const BASE_QUESTIONS: Question[] = [
  { id: 101, text: 'ما هو الفيتامين الأهم لصحة الشعر؟', options: ['فيتامين C', 'البيوتين (B7)', 'فيتامين A', 'الكالسيوم'], correctAnswer: 1, difficulty: 'easy' },
  { id: 102, text: 'كم مرة ينصح بقص أطراف الشعر؟', options: ['كل يوم', 'كل 6-8 أسابيع', 'مرة في السنة', 'كل أسبوعين'], correctAnswer: 1, difficulty: 'easy' },
  { id: 103, text: 'ما هو المكون الأساسي للشعر؟', options: ['الماء', 'الكيراتين', 'الدهون', 'الكولاجين'], correctAnswer: 1, difficulty: 'easy' },
  { id: 104, text: 'ما هو أفضل وقت لتمشيط الشعر المجعد؟', options: ['عندما يكون جافاً', 'عندما يكون مبللاً', 'بعد الاستشوار', 'قبل النوم'], correctAnswer: 1, difficulty: 'easy' },
  { id: 105, text: 'أي زيت يعتبر الأفضل لترطيب الشعر الجاف؟', options: ['زيت الذرة', 'زيت الأرغان', 'زيت السيارات', 'الخل'], correctAnswer: 1, difficulty: 'easy' },
];

export const GAME_STAGES: Stage[] = [
  {
    id: 1,
    name: 'المرحلة 1',
    difficulty: 'easy',
    rewardName: '10 د.ك',
    questions: BASE_QUESTIONS
  },
  {
    id: 2,
    name: 'المرحلة 2',
    difficulty: 'medium',
    rewardName: '20 د.ك',
    questions: BASE_QUESTIONS
  },
  {
    id: 3,
    name: 'المرحلة 3',
    difficulty: 'hard',
    rewardName: '40 د.ك',
    questions: BASE_QUESTIONS
  }
];

// --- DEMO TRANSACTIONS GENERATOR ---
const today = new Date();
const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
const tenDaysAgo = new Date(today); tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
const fortyDaysAgo = new Date(today); fortyDaysAgo.setDate(fortyDaysAgo.getDate() - 40);

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Rewards: Net +30 (10 + 20 + 5 - 5 + 10 - 10)
export const DEMO_REWARDS_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'TX-R1',
    type: 'credit',
    amount: 10,
    description: 'جائزة مسابقة تريندي (المرحلة 1)',
    date: today.toISOString(),
    expiryDate: addDays(today, 30).toISOString()
  },
  {
    id: 'TX-R2',
    type: 'credit',
    amount: 5,
    description: 'جائزة إضافية خاصة',
    date: today.toISOString(),
    expiryDate: addDays(today, 30).toISOString()
  },
  {
    id: 'TX-R3',
    type: 'debit',
    amount: 5,
    description: 'استخدام رصيد الجوائز في الطلب #1234',
    date: yesterday.toISOString(),
  },
  {
    id: 'TX-R4',
    type: 'credit',
    amount: 20,
    description: 'جائزة مسابقة تريندي (المرحلة 2)',
    date: tenDaysAgo.toISOString(),
    expiryDate: addDays(tenDaysAgo, 30).toISOString()
  },
  // Expired transaction pair
  {
    id: 'TX-R5-EXP',
    type: 'expiry',
    amount: 10,
    description: 'انتهاء صلاحية رصيد الجوائز',
    date: addDays(fortyDaysAgo, 30).toISOString(), // Expired 10 days ago
  },
  {
    id: 'TX-R5',
    type: 'credit',
    amount: 10,
    description: 'جائزة مسابقة تريندي (المرحلة 1)',
    date: fortyDaysAgo.toISOString(),
    expiryDate: addDays(fortyDaysAgo, 30).toISOString()
  }
];

// Cashback: Net 2450 (2000 + 450 + 300 - 300)
export const DEMO_CASHBACK_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'TX-C1',
    type: 'credit',
    amount: 2000,
    description: 'كاش باك عن الطلب #1001 (بقيمة 200 دك)',
    date: today.toISOString(),
    expiryDate: addDays(today, 30).toISOString()
  },
  {
    id: 'TX-C2',
    type: 'credit',
    amount: 450,
    description: 'كاش باك عن الطلب #1000 (بقيمة 45 دك)',
    date: tenDaysAgo.toISOString(),
    expiryDate: addDays(tenDaysAgo, 30).toISOString()
  },
  // Expired transaction pair
  {
    id: 'TX-C3-EXP',
    type: 'expiry',
    amount: 300,
    description: 'انتهاء صلاحية الكاش باك',
    date: addDays(fortyDaysAgo, 30).toISOString(),
  },
  {
    id: 'TX-C3',
    type: 'credit',
    amount: 300,
    description: 'كاش باك عن الطلب #900 (بقيمة 30 دك)',
    date: fortyDaysAgo.toISOString(),
    expiryDate: addDays(fortyDaysAgo, 30).toISOString()
  }
];
