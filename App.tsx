
import React, { useState, useMemo, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { DataProvider } from './context/DataContext';
import TabBar from './components/TabBar';
import PlayTab from './components/PlayTab';
import AccountTab from './components/AccountTab';
import FavoritesTab from './components/FavoritesTab';
import ReviewsTab from './components/ReviewsTab';
import HomeTab from './components/home/HomeTab';
import AllProductsPage from './components/AllProductsPage';
import BrandPage from './components/BrandPage';
import CartFlow from './components/CartFlow';
import AuthScreen from './components/AuthScreen';
import { TabId, Product } from './types';
import { Check } from 'lucide-react';
import { STORAGE_KEYS, POINTS_EARNED_PER_KD } from './constants';
import Cookies from 'js-cookie';

// Admin Imports
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminOrders from './components/admin/AdminOrders';
import AdminProducts from './components/admin/AdminProducts';
import AdminBrands from './components/admin/AdminBrands';
import AdminWallets from './components/admin/AdminWallets';
import AdminGame from './components/admin/AdminGame';
import AdminContent from './components/admin/AdminContent';
import AdminWidgets from './components/admin/AdminWidgets';
import AdminCategories from './components/admin/AdminCategories';
import AdminReviews from './components/admin/AdminReviews';

// Placeholder imports
const AdminPlaceholder = ({ title }: { title: string }) => (
  <div className="p-10 text-center text-app-textSec font-bold text-xl">صفحة {title} قيد التطوير</div>
);

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  status: string;
  total: string;
  items: CartItem[];
}

const AppContent: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favourites, setFavourites] = useState<number[]>([]);
  const [pendingOrderDetailsId, setPendingOrderDetailsId] = useState<string | null>(null);

  // --- WALLET STATE ---
  const [gameBalance, setGameBalance] = useState<number>(30);
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(0);

  // Toast state
  const [showToast, setShowToast] = useState(false);

  // Derive current tab from URL
  const currentTab = useMemo((): TabId => {
    const path = location.pathname;
    if (path.startsWith('/reviews')) return 'reviews';
    if (path.startsWith('/play')) return 'play';
    if (path.startsWith('/favorites')) return 'favorites';
    if (path.startsWith('/account')) return 'account';
    return 'home';
  }, [location.pathname]);

  // Check if we are in admin mode to hide customer UI elements
  const isAdmin = location.pathname.startsWith('/admin');

  // Load state from storage
  useEffect(() => {
    const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (savedOrders) setOrders(JSON.parse(savedOrders));

    const savedFavs = localStorage.getItem(STORAGE_KEYS.FAVOURITES);
    if (savedFavs) setFavourites(JSON.parse(savedFavs));

    const savedGameBalance = localStorage.getItem(STORAGE_KEYS.WALLET_GAME);
    if (savedGameBalance) {
      setGameBalance(parseFloat(savedGameBalance));
    } else {
      localStorage.setItem(STORAGE_KEYS.WALLET_GAME, '30');
    }

    const savedLoyalty = localStorage.getItem(STORAGE_KEYS.WALLET_LOYALTY);
    if (savedLoyalty) setLoyaltyPoints(parseInt(savedLoyalty));
  }, []);

  // Handle toast auto-hide
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const cartCount = useMemo(() =>
    cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  // --- WALLET HANDLERS ---
  const creditGameBalance = (amount: number) => {
    const newBalance = gameBalance + amount;
    setGameBalance(newBalance);
    localStorage.setItem(STORAGE_KEYS.WALLET_GAME, newBalance.toString());
  };

  const creditLoyaltyPoints = (points: number) => {
    const newPoints = loyaltyPoints + points;
    setLoyaltyPoints(newPoints);
    localStorage.setItem(STORAGE_KEYS.WALLET_LOYALTY, newPoints.toString());
  };

  const deductWallets = (gameAmount: number, pointsAmount: number) => {
    if (gameAmount > 0) {
      const newGame = Math.max(0, gameBalance - gameAmount);
      setGameBalance(newGame);
      localStorage.setItem(STORAGE_KEYS.WALLET_GAME, newGame.toString());
    }
    if (pointsAmount > 0) {
      const newPoints = Math.max(0, loyaltyPoints - pointsAmount);
      setLoyaltyPoints(newPoints);
      localStorage.setItem(STORAGE_KEYS.WALLET_LOYALTY, newPoints.toString());
    }
  };

  // --- CART HANDLERS ---
  const handleAddToCart = (product: Product, quantity: number) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    // Trigger notification
    setShowToast(false); // Reset if already showing
    setTimeout(() => setShowToast(true), 10);
  };

  const handleUpdateQuantity = (productId: number, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveItem = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleAddOrder = (order: Order, paidAmountKD: number) => {
    const updatedOrders = [order, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));

    // Calculate Loyalty Points (e.g. 1 Point per KD)
    if (paidAmountKD > 0) {
      const pointsEarned = Math.floor(paidAmountKD * POINTS_EARNED_PER_KD);
      creditLoyaltyPoints(pointsEarned);
    }
  };

  const handleToggleFavourite = (productId: number) => {
    setFavourites(prev => {
      const isFav = prev.includes(productId);
      const updated = isFav
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      localStorage.setItem(STORAGE_KEYS.FAVOURITES, JSON.stringify(updated));
      return updated;
    });
  };

  const handleViewOrderDetails = (orderId: string) => {
    setPendingOrderDetailsId(orderId);
    navigate('/account');
    setIsCartOpen(false);
  };

  if (isCartOpen && !isAdmin) {
    return (
      <div className="w-full bg-[#F7F4EE] min-h-screen relative shadow-2xl flex flex-col overflow-hidden">
        <CartFlow
          cartItems={cartItems}
          onClose={() => setIsCartOpen(false)}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onAddOrder={handleAddOrder}
          onViewOrderDetails={handleViewOrderDetails}
          gameBalance={gameBalance}
          loyaltyPoints={loyaltyPoints}
          onDeductWallets={deductWallets}
        />
      </div>
    );
  }

  return (
    <div className={isAdmin ? "w-full min-h-screen" : "min-h-screen bg-gray-100 flex justify-center font-sans"}>
      <div className={isAdmin ? "w-full h-full" : "w-full bg-[#F7F4EE] min-h-screen relative shadow-2xl flex flex-col overflow-hidden"}>
        <main className="flex-1 w-full relative h-full">
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<HomeTab cartCount={cartCount} onAddToCart={handleAddToCart} onOpenCart={() => setIsCartOpen(true)} favourites={favourites} onToggleFavourite={handleToggleFavourite} />} />
            <Route path="/category/:categoryName" element={<HomeTab cartCount={cartCount} onAddToCart={handleAddToCart} onOpenCart={() => setIsCartOpen(true)} favourites={favourites} onToggleFavourite={handleToggleFavourite} />} />
            <Route path="/product/:productId" element={<HomeTab cartCount={cartCount} onAddToCart={handleAddToCart} onOpenCart={() => setIsCartOpen(true)} favourites={favourites} onToggleFavourite={handleToggleFavourite} />} />
            <Route path="/products" element={<AllProductsPage onAddToCart={handleAddToCart} favourites={favourites} onToggleFavourite={handleToggleFavourite} />} />
            <Route path="/brand/:brandId" element={<BrandPage onAddToCart={handleAddToCart} favourites={favourites} onToggleFavourite={handleToggleFavourite} />} />

            <Route path="/reviews" element={<ReviewsTab />} />
            <Route path="/play" element={<PlayTab onCreditWallet={creditGameBalance} gameBalance={gameBalance} />} />
            <Route path="/favorites" element={
              <FavoritesTab
                favourites={favourites}
                onToggleFavourite={handleToggleFavourite}
                onAddToCart={handleAddToCart}
              />
            } />

            <Route path="/account/*" element={
              <AccountTab
                orders={orders}
                onNavigateToHome={() => navigate('/')}
                initialOrderId={pendingOrderDetailsId}
                onClearInitialOrder={() => setPendingOrderDetailsId(null)}
                favourites={favourites}
                onToggleFavourite={handleToggleFavourite}
                onAddToCart={handleAddToCart}
                gameBalance={gameBalance}
                loyaltyPoints={loyaltyPoints}
                onLogout={onLogout}
              />
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="widgets" element={<AdminWidgets />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="brands" element={<AdminBrands />} />
              <Route path="wallets" element={<AdminWallets />} />
              <Route path="game" element={<AdminGame />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="customers" element={<AdminPlaceholder title="العملاء" />} />
              <Route path="reports" element={<AdminPlaceholder title="التقارير" />} />
              <Route path="users" element={<AdminPlaceholder title="الصلاحيات" />} />
              <Route path="settings" element={<AdminPlaceholder title="الإعدادات" />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {!isAdmin && (
          <>
            {showToast && (
              <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] bg-app-gold text-white py-3 px-5 rounded-2xl shadow-xl flex items-center justify-between z-[100] animate-slideUp transition-all font-alexandria">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <span className="font-bold text-sm">تم الإضافة للسلة</span>
                </div>
              </div>
            )}

            <TabBar currentTab={currentTab} onTabChange={(tab) => navigate(`/${tab === 'home' ? '' : tab}`)} />
          </>
        )}
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    // Check for existing session
    const session = Cookies.get('token');
    if (session) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    Cookies.remove('token');
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
  };

  return (
    <DataProvider>
      <Router>
        <Toaster position="top-center" expand={false} richColors />
        {isAuthenticated ? (
          <AppContent onLogout={handleLogout} />
        ) : (
          <AuthScreen onLoginSuccess={handleLoginSuccess} />
        )}
      </Router>
    </DataProvider>
  );
};

export default App;
