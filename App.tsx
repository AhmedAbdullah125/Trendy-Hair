import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
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
import AuthScreen from './components/AuthScreen';
import SuccessStep from './components/cart/SuccessStep';
import { TabId, Product } from './types';
import { STORAGE_KEYS } from './constants';
import Cookies from 'js-cookie';
import CartFlow from './components/cart/CartFlow';
import PaymentResultScreen from './components/cart/PaymentResultScreen';
import { clearPaymentParams, parsePaymentReturn, type PaymentReturn } from './lib/paymentReturn';

// ✅ API hooks
import { useGetCart } from './components/requests/useGetCart';
import { useAddToCart } from './components/requests/useAddToCart';

export interface CartItem {
  id: number; // ✅ cart item id from API (it.id)
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
  const queryClient = useQueryClient();

  /**
   * The cart is a location, not a flag.
   *
   * It used to be `useState`, rendered in place of `<Routes>`. That gave it no
   * history entry of its own, with two consequences reported as bugs: pressing
   * the browser's Back button while in the cart appeared to do nothing — the
   * URL changed underneath but `isCartOpen` was still true, so the cart kept
   * rendering over whatever it had gone back to — and opening the cart as the
   * first thing on a fresh visit meant Back left the site altogether, because
   * there was no in-app entry to return to.
   *
   * Deriving it from the URL makes Back close the cart natively, and costs
   * nothing elsewhere: the early return below happens before `<Routes>`, so
   * `/cart` needs no route of its own and never reaches the catch-all.
   */
  const isCartOpen = location.pathname === '/cart';

  const openCart = useCallback(() => navigate('/cart'), [navigate]);

  const closeCart = useCallback(() => {
    // `key === 'default'` means this is the first entry in the session — a
    // direct load or a refresh on /cart. Going back from there would leave the
    // site, so land on home instead, replacing rather than stacking.
    if (location.key === 'default') {
      navigate('/', { replace: true });
    } else {
      navigate(-1);
    }
  }, [navigate, location.key]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [favourites, setFavourites] = useState<number[]>([]);
  const [pendingOrderDetailsId, setPendingOrderDetailsId] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentReturn | null>(null);

  // ✅ language (adjust if you have global lang)
  const lang = "ar";

  // ✅ Cart from API
  const { data: cartData, isLoading: cartLoading } = useGetCart(lang);

  // --- WALLET ---
  // No wallet state lives here any more. The balance is owned by the server
  // (users.wallet) and each screen reads it from the profile query directly
  // (CartFlow, PlayTab). This used to hold a localStorage copy seeded to a
  // hardcoded 30, which no screen actually spent against but which a fresh
  // install would still surface as credit the user had never earned.

  // ✅ Add to cart mutation
  const addToCartMut = useAddToCart();

  // Derive current tab from URL
  const currentTab = useMemo((): TabId => {
    const path = location.pathname;
    if (path.startsWith('/reviews')) return 'reviews';
    if (path.startsWith('/play')) return 'play';
    if (path.startsWith('/favorites')) return 'favorites';
    if (path.startsWith('/account')) return 'account';
    return 'home';
  }, [location.pathname]);

  // Load state from storage
  useEffect(() => {
    const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (savedOrders) setOrders(JSON.parse(savedOrders));

    const savedFavs = localStorage.getItem(STORAGE_KEYS.FAVOURITES);
    if (savedFavs) setFavourites(JSON.parse(savedFavs));

    // The wallet is no longer mirrored in localStorage — the server is the
    // only source of truth. Clear any balance left by an older build so it
    // cannot be mistaken for real credit.
    localStorage.removeItem(STORAGE_KEYS.WALLET_GAME);
    localStorage.removeItem(STORAGE_KEYS.WALLET_LOYALTY);

    // Outcome of a payment the gateway just sent us back from.
    //
    // Only the paid case used to be read, so a failed or unconfirmed payment
    // landed on the home screen saying nothing at all — the customer had no way
    // to tell whether they had been charged.
    setPaymentResult(parsePaymentReturn(window.location.search));
  }, []);

  // ✅ cartCount from API
  const cartCount = useMemo(() => {
    return cartData?.items?.item_counts?.total
      ?? cartData?.items?.total_items
      ?? 0;
  }, [cartData]);

  // ✅ Convert API cart items to CartFlow shape (CartItem[])
  const cartItems: CartItem[] = useMemo(() => {
    const apiItems = cartData?.items?.items || [];

    return apiItems.map((it) => {
      const p = it.products;

      const current =
        p.current_price ??
        p.discounted_price ??
        p.price;

      const oldPrice =
        p.has_discount && p.price && current && p.price > current
          ? `${Number(p.price).toFixed(3)} د.ك`
          : undefined;

      const product: Product = {
        id: p.id,
        name: p.name,
        description: p.description,
        image: p.main_image,
        price: `${Number(current).toFixed(3)} د.ك`,
        oldPrice,
      } as any;
      return {
        id: it.id,
        product,
        quantity: it.quantity,
      };
    });
  }, [cartData]);

  // --- WALLET HANDLERS ---
  // Crediting and debiting happen server-side: the competition endpoint credits
  // on a win and the order endpoint debits at checkout. The client only needs
  // to re-read the balance afterwards, so these just invalidate the profile
  // query rather than doing their own arithmetic on a local copy.
  const refreshWallet = () => {
    queryClient.invalidateQueries({ queryKey: ['profile'] });
  };

  // --- CART HANDLERS (API) ---
  const handleAddToCart = (product: Product, quantity: number) => {
    // ✅ POST /cart/add-items
    // `useAddToCart` displays the exact message returned by the backend.
    // A second custom success banner here used to show two confirmations for
    // one tap, and its hard-coded Arabic could disagree with the API result.
    addToCartMut.mutate({ product_id: product.id, quantity, lang });
  };

  // ⚠️ These need endpoints. Keep UI working; do nothing for now.
  const handleUpdateQuantity = (_productId: number, _delta: number) => {
    // TODO: call API (update quantity) then invalidateQueries(["cart"])
  };

  const handleRemoveItem = (_productId: number) => {
    // TODO: call API (remove item) then invalidateQueries(["cart"])
  };

  const handleClearCart = () => {
    // TODO: call API (clear cart) then invalidateQueries(["cart"])
  };

  const handleAddOrder = (order: Order, _paidAmountKD: number) => {
    const updatedOrders = [order, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));

    // The order endpoint already debited any wallet used, so pull the new
    // balance rather than guessing at it locally.
    refreshWallet();
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
    setPendingOrderDetailsId(null);
    // Navigating away *is* closing the cart now that it is a location, so the
    // separate close call this used to need would only have been a no-op.
    navigate(`/account/order/${orderId}`);
  };

  if (paymentResult) {
    // Drop the payment parameters so a refresh — or the Back button — cannot
    // replay this screen against a payment that has since been resolved.
    const dismissPaymentResult = () => {
      setPaymentResult(null);
      const search = clearPaymentParams(window.location.search);
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + search + window.location.hash
      );
    };

    return (
      <div className="w-full bg-[#F7F4EE] min-h-screen relative shadow-2xl flex flex-col overflow-hidden">
        {paymentResult.outcome === 'paid' ? (
          // The order number is what a customer can quote; the id is internal.
          <SuccessStep
            lastOrderId={paymentResult.orderNumber ?? paymentResult.orderId}
            onClose={() => {
              dismissPaymentResult();
              navigate('/');
            }}
            onViewOrderDetails={(id) => {
              dismissPaymentResult();
              handleViewOrderDetails(id);
            }}
          />
        ) : (
          <PaymentResultScreen
            orderId={paymentResult.orderId}
            outcome={paymentResult.outcome}
            orderNumber={paymentResult.orderNumber}
            message={paymentResult.message}
            onClose={() => {
              dismissPaymentResult();
              navigate('/');
            }}
            onViewOrderDetails={(id) => {
              dismissPaymentResult();
              handleViewOrderDetails(id);
            }}
          />
        )}
      </div>
    );
  }

  if (isCartOpen) {
    return (
      <div className="w-full bg-[#F7F4EE] min-h-screen relative shadow-2xl flex flex-col overflow-hidden">
        {cartLoading ? (
          <div className="h-full flex items-center justify-center bg-white">
            <div className="w-8 h-8 border-2 border-app-gold/30 border-t-app-gold rounded-full animate-spin" />
          </div>
        ) : (
          <CartFlow
            cartItems={cartItems}
            onClose={closeCart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onAddOrder={handleAddOrder}
            onViewOrderDetails={handleViewOrderDetails}
            lang={lang}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center font-sans">
      <div className="w-full bg-[#F7F4EE] min-h-screen relative shadow-2xl flex flex-col overflow-hidden">
        <main className="flex-1 w-full relative h-full">
          <Routes>
            {/* Customer Routes */}
            <Route
              path="/"
              element={
                <HomeTab
                  cartCount={cartCount}
                  onAddToCart={handleAddToCart}
                  onOpenCart={openCart}
                  favourites={favourites}
                  onToggleFavourite={handleToggleFavourite}
                />
              }
            />
            <Route
              path="/category/:categoryName"
              element={
                <HomeTab
                  cartCount={cartCount}
                  onAddToCart={handleAddToCart}
                  onOpenCart={openCart}
                  favourites={favourites}
                  onToggleFavourite={handleToggleFavourite}
                />
              }
            />
            <Route
              path="/product/:productId"
              element={
                <HomeTab
                  cartCount={cartCount}
                  onAddToCart={handleAddToCart}
                  onOpenCart={openCart}
                  favourites={favourites}
                  onToggleFavourite={handleToggleFavourite}
                />
              }
            />
            <Route
              path="/products"
              element={<AllProductsPage onAddToCart={handleAddToCart} favourites={favourites} onToggleFavourite={handleToggleFavourite} />}
            />
            <Route
              path="/brand/:brandId"
              element={<BrandPage onAddToCart={handleAddToCart} favourites={favourites} onToggleFavourite={handleToggleFavourite} />}
            />

            <Route path="/reviews" element={<ReviewsTab />} />
            <Route path="/play" element={<PlayTab onCreditWallet={refreshWallet} />} />
            <Route
              path="/favorites"
              element={
                <FavoritesTab
                  favourites={favourites}
                  onToggleFavourite={handleToggleFavourite}
                  onAddToCart={handleAddToCart}
                />
              }
            />

            <Route
              path="/account/*"
              element={
                <AccountTab
                  orders={orders}
                  onNavigateToHome={() => navigate('/')}
                  initialOrderId={pendingOrderDetailsId}
                  onClearInitialOrder={() => setPendingOrderDetailsId(null)}
                  favourites={favourites}
                  onToggleFavourite={handleToggleFavourite}
                  onAddToCart={handleAddToCart}
                  onLogout={onLogout}
                  onOpenCart={openCart}
                />
              }
            />



            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <TabBar currentTab={currentTab} onTabChange={(tab) => navigate(`/${tab === 'home' ? '' : tab}`)} />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // Mounted inside QueryClientProvider (see index.tsx), so the cache can be
  // cleared on sign-out.
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check customer authentication
    const session = Cookies.get('token');
    if (session) setIsAuthenticated(true);
    setIsInitializing(false);
  }, []);

  /**
   * Wipes everything scoped to whoever was signed in.
   *
   * Run on **both** sign-in and sign-out. Clearing only on sign-out is not
   * enough — that path only runs when the user presses the button, so a
   * session ended any other way (expired token, 401 redirect, cleared cookie,
   * closed tab) left the previous account's data behind. The next person to
   * sign in then saw it: cached `profile`, `cart`, `orders`, `favourites` and
   * competition state, plus the localStorage copies AppContent reads on mount.
   */
  const clearAccountScopedState = () => {
    queryClient.clear();
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.FAVOURITES);
    localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
  };

  const handleLoginSuccess = () => {
    clearAccountScopedState();
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    Cookies.remove('token', { path: '/' });
    Cookies.remove('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');

    // Same wipe as on sign-in: order history, favourites, competition
    // position and every cached response belong to the account leaving.
    clearAccountScopedState();
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-app-gold/30 border-t-app-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <DataProvider>
      <Router>
        <Toaster position="bottom-center" expand={false} richColors />
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
