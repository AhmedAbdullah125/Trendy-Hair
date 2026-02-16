import React, { useMemo, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Order } from '../App';
import { Product } from '../types';
import { DEMO_REWARDS_TRANSACTIONS, DEMO_CASHBACK_TRANSACTIONS } from '../constants';
import { useGetProfile } from './requests/useGetProfile';
import AccountMenu from './account/AccountMenu';
import EditAccountForm from './account/EditAccountForm';
import WalletDetailsPage from './account/WalletDetailsPage';
import OrdersHistory from './account/OrdersHistory';
import OrderDetails from './account/OrderDetails';

interface AccountTabProps {
  orders: Order[];
  onNavigateToHome: () => void;
  initialOrderId?: string | null;
  onClearInitialOrder?: () => void;
  favourites: number[];
  onToggleFavourite: (productId: number) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  gameBalance: number;
  loyaltyPoints: number;
  onLogout: () => void;
}

const AccountTab: React.FC<AccountTabProps> = ({
  orders,
  onNavigateToHome,
  initialOrderId,
  onClearInitialOrder,
  gameBalance,
  loyaltyPoints,
  onLogout
}) => {
  const navigate = useNavigate();

  // Fetch profile data from API
  const { data: profileData, isLoading: profileLoading, error: profileError } = useGetProfile('ar');

  // Use profile data or fallback
  const currentUser = useMemo(() => {
    if (profileData) {
      return {
        name: profileData.name || '',
        phone: profileData.phone || '',
        email: profileData.email || '',
        photo: profileData.photo || '',
        wallet: profileData.wallet || '0.00'
      };
    }
    return { name: '', phone: '', email: '', photo: '', wallet: '0.00' };
  }, [profileData]);

  useEffect(() => {
    if (initialOrderId) {
      const order = orders.find(o => o.id === initialOrderId);
      if (order) {
        navigate(`/account/order/${order.id}`);
        onClearInitialOrder?.();
      }
    }
  }, [initialOrderId, orders, onClearInitialOrder, navigate]);

  return (
    <div className="flex flex-col h-full px-6 pt-6 pb-28 overflow-y-auto no-scrollbar font-alexandria">
      <Routes>
        <Route
          index
          element={
            <AccountMenu
              currentUser={currentUser}
              gameBalance={gameBalance}
              loyaltyPoints={loyaltyPoints}
              onLogout={onLogout}
              navigate={navigate}
            />
          }
        />

        <Route
          path="edit"
          element={
            <EditAccountForm
              currentUser={currentUser}
              navigate={navigate}
            />
          }
        />

        <Route
          path="history"
          element={
            <OrdersHistory
              onNavigateToHome={onNavigateToHome}
              navigate={navigate}
            />
          }
        />

        <Route
          path="order/:orderId"
          element={
            <OrderDetails
              navigate={navigate}
            />
          }
        />

        {/* Wallet Routes */}
        <Route
          path="wallet/rewards"
          element={
            <WalletDetailsPage
              title="محفظة الجوائز"
              balance={gameBalance}
              currencyLabel="د.ك"
              explanation="رصيد الجوائز يأتي من الجوائز التي تربحينها من اللعب. صلاحية كل مبلغ 30 يوماً."
              transactions={DEMO_REWARDS_TRANSACTIONS}
              navigate={navigate}
            />
          }
        />
        <Route
          path="wallet/cashback"
          element={
            <WalletDetailsPage
              title="محفظة الكاش باك"
              balance={loyaltyPoints}
              currencyLabel="نقطة"
              explanation="رصيد الكاش باك يأتي من عمليات الشراء. صلاحية كل مبلغ 30 يوماً."
              transactions={DEMO_CASHBACK_TRANSACTIONS}
              navigate={navigate}
            />
          }
        />
      </Routes>
    </div>
  );
};

export default AccountTab;
