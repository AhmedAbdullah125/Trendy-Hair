import React, { useMemo, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Order } from '../App';
import { Product } from '../types';
import { useGetProfile } from './requests/useGetProfile';
import { POINTS_LABEL, formatDinars, readWallet } from '../lib/points';
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
  onLogout: () => void;
  onOpenCart?: () => void;
}

const AccountTab: React.FC<AccountTabProps> = ({
  orders,
  onNavigateToHome,
  initialOrderId,
  onClearInitialOrder,
  onLogout,
  onOpenCart
}) => {
  const navigate = useNavigate();

  // Fetch profile data from API
  const { data: profileData, isLoading: profileLoading, error: profileError } = useGetProfile('ar');

  // The wallet holds points, not dinars — see lib/points.ts.
  const wallet = readWallet(profileData);
  const gameBalance = Math.round(wallet.points);

  // Use profile data or fallback
  const currentUser = useMemo(() => {
    if (profileData) {
      return {
        name: profileData.name || '',
        phone: profileData.phone || '',
        email: profileData.email || '',
        photo: profileData.photo || '',
        wallet: String(profileData.wallet ?? '0')
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
              onLogout={onLogout}
              navigate={navigate}
              onOpenCart={onOpenCart}
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

        {/*
          Wallet route. The history now comes from the real ledger
          (GET /v1/wallet-transactions) instead of a hardcoded DEMO array.

          The "cashback" wallet route was removed: there is no cashback or
          loyalty-points balance on the server, so it could only ever have
          shown an invented number next to invented transactions.
        */}
        <Route
          path="wallet/rewards"
          element={
            <WalletDetailsPage
              title="محفظة النقاط"
              balance={gameBalance.toLocaleString('en-US')}
              currencyLabel={POINTS_LABEL}
              secondaryLabel={`تساوي ${formatDinars(wallet.dinars)}`}
              explanation={`تكسبين النقاط من مشترياتك ومن المسابقة، وكل ${wallet.rate} نقطة تساوي 1 د.ك عند إتمام الطلب.`}
              navigate={navigate}
            />
          }
        />
      </Routes>
    </div>
  );
};

export default AccountTab;
