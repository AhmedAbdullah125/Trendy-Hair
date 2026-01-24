
import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, ArrowRight, Trash2, Minus, Plus, CheckCircle2, Package, CreditCard, Banknote, ChevronDown, Wallet, Award } from 'lucide-react';
import { CartItem, Order } from '../App';
import { LOYALTY_POINT_VALUE_KD, GAME_REDEMPTION_CAP_KD } from '../constants';

interface CartFlowProps {
  cartItems: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: number, delta: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
  onAddOrder: (order: Order, paidAmountKD: number) => void;
  onViewOrderDetails: (orderId: string) => void;
  gameBalance: number;
  loyaltyPoints: number;
  onDeductWallets: (gameAmount: number, pointsAmount: number) => void;
}

type CheckoutStep = 'cart' | 'details' | 'success';

const KUWAIT_REGIONS: Record<string, string[]> = {
  "العاصمة": ["مدينة الكويت", "دسمان", "الشرق", "بنيد القار", "الدسمة", "الدعية", "المنصورية", "ضاحية عبد الله السالم", "النزهة", "الفيحاء", "الشامية", "الروضة", "العديلية", "الخالدية", "كيفان", "غرناطة", "الصليبيخات", "الدوحة", "النهضة", "جابر الأحمد", "القيروان"],
  "الأحمدي": ["الفنطاس", "العقيلة", "الظهر", "المقوع", "المهبولة", "الرقة", "هدية", "أبو حليفة", "الصباحية", "المنقف", "الفحيحيل", "الأحمدي", "الخيران", "الوفرة", "فهد الأحمد", "جابر العلي", "صباح الأحمد"],
  "الفروانية": ["أبرق خيطان", "الأندلس", "اشبيلية", "جليب الشيوخ", "خيطان", "العمرية", "العارضية", "الفردوس", "الحساوي", "الشدادية", "الرابية", "الرحاب", "صباح الناصر", "عبد الله المبارك"],
  "الجهراء": ["الصليبية", "أمغرة", "النعيم", "القصر", "الواحة", "تيماء", "النسيم", "العيون", "كاظمة", "سعد العبد الله", "الجهراء الجديدة"],
  "حولي": ["حولي", "الشعب", "السالمية", "الرميثية", "الجابرية", "مشرف", "بيان", "البدع", "النقرة", "ميدان حولي", "ضاحية مبارك العبد الله", "سلوى", "جنوب السرة"],
  "مبارك الكبير": ["العدان", "القصور", "القرين", "مبارك الكبير", "المسيلة", "المسايل", "أبو فطيرة", "أبو الحصانية", "صباح السالم", "الفنيطيس"]
};

const CartFlow: React.FC<CartFlowProps> = ({
  cartItems,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onAddOrder,
  onViewOrderDetails,
  gameBalance,
  loyaltyPoints,
  onDeductWallets
}) => {
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');

  // Wallet Usage State
  const [useGameBalance, setUseGameBalance] = useState(false);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [gameAmountToUse, setGameAmountToUse] = useState<number>(0);

  const [addressForm, setAddressForm] = useState({
    name: 'nader',
    governorate: '',
    area: '',
    details: ''
  });

  const [lastOrderId, setLastOrderId] = useState('');

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = parseFloat(item.product.price.replace(/[^\d.]/g, ''));
      return sum + (price * item.quantity);
    }, 0);
  }, [cartItems]);

  const deliveryFee = 2.000;

  // Max redeemable game balance = 5 KWD flat cap per order (or balance if less)
  const maxGameRedemption = useMemo(() => {
    return Math.min(gameBalance, GAME_REDEMPTION_CAP_KD);
  }, [gameBalance]);

  // Max redeemable loyalty points value
  const maxLoyaltyRedemptionValue = useMemo(() => {
    const pointsValue = loyaltyPoints * LOYALTY_POINT_VALUE_KD;
    // Can cover whole order including delivery? Usually rewards cover subtotal, but let's assume total for loyalty simplicity
    return Math.min(pointsValue, subtotal + deliveryFee);
  }, [loyaltyPoints, subtotal, deliveryFee]);

  // Calculate Finals
  const { finalGameDeduction, finalLoyaltyDeduction, finalTotal } = useMemo(() => {
    let toPay = subtotal + deliveryFee;
    let gameDeduction = 0;
    let loyaltyDeduction = 0;

    // 1. Apply Game Balance (capped)
    if (useGameBalance) {
      gameDeduction = Math.min(gameAmountToUse, maxGameRedemption, toPay);
      toPay -= gameDeduction;
    }

    // 2. Apply Loyalty Points (uncapped)
    if (useLoyaltyPoints) {
      // Amount needed or amount available
      const needed = toPay;
      const available = loyaltyPoints * LOYALTY_POINT_VALUE_KD;
      loyaltyDeduction = Math.min(needed, available);
      toPay -= loyaltyDeduction;
    }

    return {
      finalGameDeduction: parseFloat(gameDeduction.toFixed(3)),
      finalLoyaltyDeduction: parseFloat(loyaltyDeduction.toFixed(3)),
      finalTotal: parseFloat(toPay.toFixed(3))
    };
  }, [subtotal, deliveryFee, useGameBalance, gameAmountToUse, maxGameRedemption, useLoyaltyPoints, loyaltyPoints]);

  // Reset redemption when step changes
  useEffect(() => {
    if (step === 'details') {
      setUseGameBalance(false);
      setUseLoyaltyPoints(false);
      setGameAmountToUse(maxGameRedemption);
    }
  }, [step, maxGameRedemption]);

  const handlePay = () => {
    if (!addressForm.governorate || !addressForm.area || !addressForm.details) {
      alert('يرجى إكمال جميع بيانات العنوان');
      return;
    }
    setIsProcessing(true);

    // Simulate payment
    setTimeout(() => {
      const orderId = `TH-${Math.floor(100000 + Math.random() * 900000)}`;
      const newOrder: Order = {
        id: orderId,
        date: new Date().toLocaleDateString('en-GB'),
        status: 'قيد المعالجة',
        total: `${finalTotal.toFixed(3)} د.ك`,
        items: [...cartItems]
      };

      // Calculate points to deduct
      const pointsToDeduct = useLoyaltyPoints ? Math.ceil(finalLoyaltyDeduction / LOYALTY_POINT_VALUE_KD) : 0;

      // Execute deductions
      onDeductWallets(finalGameDeduction, pointsToDeduct);

      setLastOrderId(orderId);
      // Pass the paid amount to calculate NEW points earned
      onAddOrder(newOrder, finalTotal);
      setIsProcessing(false);
      onClearCart();
      setStep('success');
    }, 2000);
  };

  const handleGovernorateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAddressForm({
      ...addressForm,
      governorate: e.target.value,
      area: '' // Reset area when governorate changes
    });
  };

  const renderCart = () => (
    <div className="flex flex-col h-full animate-fadeIn">
      <header className="px-6 pt-6 pb-4 bg-white border-b border-app-card/30 flex items-center justify-between">
        <h1 className="text-xl font-bold text-app-text">سلة التسوق</h1>
        <button onClick={onClose} className="p-2 hover:bg-app-bg rounded-full text-app-text">
          <ArrowRight size={24} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-app-bg rounded-full flex items-center justify-center mb-4 text-app-gold/40">
              <ShoppingBag size={40} />
            </div>
            <p className="text-app-textSec font-medium">السلة فارغة حالياً</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div key={item.product.id} className="bg-white rounded-3xl p-4 shadow-sm border border-app-card/30 flex gap-4">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-app-bg border border-app-card/10 flex-shrink-0">
                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-app-text leading-tight mb-1">{item.product.name}</h3>
                  <p className="text-xs font-bold text-app-gold">{item.product.price}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 bg-app-bg px-2 py-1 rounded-xl">
                    <button onClick={() => onUpdateQuantity(item.product.id, 1)} className="p-1 text-app-gold"><Plus size={14} /></button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.product.id, -1)} className="p-1 text-app-gold"><Minus size={14} /></button>
                  </div>
                  <button onClick={() => onRemoveItem(item.product.id)} className="text-red-400 p-2"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="p-6 bg-white border-t border-app-card/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-app-textSec font-bold">إجمالي السلة:</span>
            <span className="text-xl font-bold text-app-gold">{subtotal.toFixed(3)} د.ك</span>
          </div>
          <button
            onClick={() => setStep('details')}
            className="w-full bg-app-gold text-white font-bold py-4 rounded-2xl shadow-lg shadow-app-gold/30 active:scale-95 transition-transform"
          >
            إتمام الشراء
          </button>
        </div>
      )}
    </div>
  );

  const renderDetails = () => (
    <div className="flex flex-col h-full animate-fadeIn bg-app-bg">
      <header className="px-6 pt-6 pb-4 bg-white border-b border-app-card/30 flex items-center justify-between">
        <h1 className="text-xl font-bold text-app-text">بيانات الشحن والدفع</h1>
        <button onClick={() => setStep('cart')} className="p-2 hover:bg-app-bg rounded-full text-app-text">
          <ArrowRight size={24} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
        {/* Address Section */}
        <section className="bg-white p-5 rounded-[2rem] shadow-sm border border-app-card/30">
          <h2 className="text-sm font-bold text-app-text mb-4 flex items-center gap-2">
            <Package size={18} className="text-app-gold" />
            تفاصيل العنوان
          </h2>
          <div className="space-y-4">
            {/* Full Name - Non-editable display */}
            <div className="w-full p-4 rounded-2xl border border-app-card bg-app-card/20 text-sm flex flex-col gap-1">
              <span className="text-[10px] text-app-textSec font-bold">الاسم الكامل</span>
              <span className="text-app-text font-bold">{addressForm.name}</span>
            </div>

            {/* Governorate Dropdown */}
            <div className="relative">
              <select
                className="w-full p-4 pr-10 rounded-2xl border border-app-card/50 bg-white outline-none focus:border-app-gold text-sm appearance-none"
                value={addressForm.governorate}
                onChange={handleGovernorateChange}
              >
                <option value="" disabled>المحافظة</option>
                {Object.keys(KUWAIT_REGIONS).map(gov => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
              <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-app-textSec pointer-events-none" size={18} />
            </div>

            {/* Area Dropdown */}
            <div className="relative">
              <select
                className={`w-full p-4 pr-10 rounded-2xl border border-app-card/50 bg-white outline-none focus:border-app-gold text-sm appearance-none ${!addressForm.governorate ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={addressForm.area}
                onChange={e => setAddressForm({ ...addressForm, area: e.target.value })}
                disabled={!addressForm.governorate}
              >
                <option value="" disabled>المنطقة</option>
                {addressForm.governorate && KUWAIT_REGIONS[addressForm.governorate].map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
              <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-app-textSec pointer-events-none" size={18} />
            </div>

            <textarea
              placeholder="العنوان التفصيلي"
              className="w-full p-4 rounded-2xl border border-app-card/50 bg-white outline-none focus:border-app-gold text-sm h-24 resize-none"
              value={addressForm.details} onChange={e => setAddressForm({ ...addressForm, details: e.target.value })}
            />
          </div>
        </section>

        {/* Wallets Redemption Section */}
        <section className="bg-white p-5 rounded-[2rem] shadow-sm border border-app-card/30">
          <h2 className="text-sm font-bold text-app-text mb-4 flex items-center gap-2">
            <Wallet size={18} className="text-app-gold" />
            المحفظة والخصومات
          </h2>

          {/* Game Wallet */}
          <div className="mb-4 pb-4 border-b border-app-card/20">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className={useGameBalance ? 'text-green-500' : 'text-gray-300'} />
                <span className="text-sm font-bold text-app-text">رصيد الجوائز</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-app-text block">{gameBalance.toFixed(3)} د.ك</span>
                <span className="text-[10px] text-app-textSec">متاح</span>
              </div>
            </div>

            {gameBalance > 0 ? (
              <div className="bg-app-bg rounded-xl p-3">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-app-textSec flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={useGameBalance}
                      onChange={(e) => setUseGameBalance(e.target.checked)}
                      className="rounded text-app-gold focus:ring-app-gold"
                    />
                    استخدام الرصيد
                  </label>
                  <span className="text-xs font-bold text-app-gold">
                    الحد الأقصى: {maxGameRedemption.toFixed(3)} د.ك
                  </span>
                </div>
                {useGameBalance && (
                  <div>
                    <input
                      type="range"
                      min="0"
                      max={maxGameRedemption}
                      step="0.100"
                      value={gameAmountToUse}
                      onChange={(e) => setGameAmountToUse(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-app-gold"
                    />
                    <div className="text-center mt-1 text-xs font-bold text-app-text">
                      خصم: {gameAmountToUse.toFixed(3)} د.ك
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-app-textSec mt-1">يمكن استخدام رصيد الجوائز لخصم حتى 5 د.ك على كل طلب، مهما كانت قيمة الطلب.</p>
              </div>
            ) : (
              <p className="text-xs text-app-textSec italic">لا يوجد رصيد متاح</p>
            )}
          </div>

          {/* Loyalty Points */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className={useLoyaltyPoints ? 'text-green-500' : 'text-gray-300'} />
                <span className="text-sm font-bold text-app-text">نقاط الولاء</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-app-text block">{loyaltyPoints} نقطة</span>
                <span className="text-[10px] text-app-textSec">≈ {(loyaltyPoints * LOYALTY_POINT_VALUE_KD).toFixed(3)} د.ك</span>
              </div>
            </div>

            {loyaltyPoints > 0 ? (
              <div className="bg-app-bg rounded-xl p-3 flex items-center justify-between">
                <div>
                  <label className="text-xs text-app-textSec flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useLoyaltyPoints}
                      onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                      className="rounded text-app-gold focus:ring-app-gold"
                    />
                    استبدال الكل
                  </label>
                  <p className="text-[10px] text-app-textSec mt-1">يمكن استخدام النقاط بالكامل.</p>
                </div>
                {useLoyaltyPoints && (
                  <span className="text-xs font-bold text-green-600">
                    -{Math.min(finalLoyaltyDeduction).toFixed(3)} د.ك
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-app-textSec italic">لا توجد نقاط متاحة</p>
            )}
          </div>
        </section>

        {/* Payment Section */}
        <section className="bg-white p-5 rounded-[2rem] shadow-sm border border-app-card/30">
          <h2 className="text-sm font-bold text-app-text mb-4 flex items-center gap-2">
            <CreditCard size={18} className="text-app-gold" />
            طريقة الدفع
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod('online')}
              className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${paymentMethod === 'online' ? 'border-app-gold bg-app-gold/5' : 'border-white bg-app-bg'}`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className={paymentMethod === 'online' ? 'text-app-gold' : 'text-app-textSec'} />
                <span className={`text-sm font-bold ${paymentMethod === 'online' ? 'text-app-text' : 'text-app-textSec'}`}>دفع إلكتروني</span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 ${paymentMethod === 'online' ? 'border-app-gold bg-app-gold' : 'border-app-card'}`} />
            </button>
            <button
              onClick={() => setPaymentMethod('cod')}
              className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${paymentMethod === 'cod' ? 'border-app-gold bg-app-gold/5' : 'border-white bg-app-bg'}`}
            >
              <div className="flex items-center gap-3">
                <Banknote className={paymentMethod === 'cod' ? 'text-app-gold' : 'text-app-textSec'} />
                <span className={`text-sm font-bold ${paymentMethod === 'cod' ? 'text-app-text' : 'text-app-textSec'}`}>دفع عند الاستلام</span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 ${paymentMethod === 'cod' ? 'border-app-gold bg-app-gold' : 'border-app-card'}`} />
            </button>
          </div>
        </section>
      </div>

      <div className="p-6 bg-white border-t border-app-card/30">
        <div className="space-y-2 mb-4 text-xs font-medium text-app-textSec">
          <div className="flex justify-between">
            <span>قيمة الطلب:</span>
            <span>{subtotal.toFixed(3)} د.ك</span>
          </div>
          <div className="flex justify-between">
            <span>التوصيل:</span>
            <span>{deliveryFee.toFixed(3)} د.ك</span>
          </div>
          {finalGameDeduction > 0 && (
            <div className="flex justify-between text-app-gold">
              <span>خصم رصيد الألعاب:</span>
              <span>-{finalGameDeduction.toFixed(3)} د.ك</span>
            </div>
          )}
          {finalLoyaltyDeduction > 0 && (
            <div className="flex justify-between text-app-gold">
              <span>خصم النقاط:</span>
              <span>-{finalLoyaltyDeduction.toFixed(3)} د.ك</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-dashed border-app-card/50 text-base font-bold text-app-text">
            <span>الإجمالي النهائي:</span>
            <span>{finalTotal.toFixed(3)} د.ك</span>
          </div>
        </div>

        <button
          onClick={handlePay}
          disabled={isProcessing}
          className="w-full bg-app-gold text-white font-bold py-4 rounded-2xl shadow-lg shadow-app-gold/30 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isProcessing ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'ادفع الآن'
          )}
        </button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex flex-col h-full items-center justify-center p-8 text-center animate-fadeIn bg-white">
      <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-500 animate-bounce">
        <CheckCircle2 size={56} />
      </div>
      <h1 className="text-2xl font-bold text-app-text mb-2">شكراً لطلبك!</h1>
      <p className="text-app-textSec mb-6 leading-relaxed">
        تم استلام طلبك بنجاح، وسيتم التواصل معك لتأكيد التفاصيل.
      </p>

      <div className="bg-app-bg px-6 py-3 rounded-2xl mb-10">
        <span className="text-app-textSec text-xs font-bold block mb-1">رقم الطلب</span>
        <span className="text-app-gold font-bold text-lg">#{lastOrderId}</span>
      </div>

      <div className="w-full space-y-3">
        <button
          onClick={onClose}
          className="w-full bg-app-gold text-white font-bold py-4 rounded-2xl shadow-lg shadow-app-gold/30 active:scale-95 transition-transform"
        >
          الرجوع للرئيسية
        </button>
        <button
          onClick={() => onViewOrderDetails(lastOrderId)}
          className="w-full text-app-gold font-bold py-4 rounded-2xl active:bg-app-bg transition-colors"
        >
          عرض تفاصيل الطلب
        </button>
      </div>
    </div>
  );

  switch (step) {
    case 'details': return renderDetails();
    case 'success': return renderSuccess();
    default: return renderCart();
  }
};

export default CartFlow;
