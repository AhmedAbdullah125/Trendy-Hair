import React from 'react';
import { ArrowRight, Wallet, History, ArrowDownLeft, ArrowUpRight, Loader2, AlertCircle, Inbox } from 'lucide-react';
import { useGetWalletTransactions, ApiWalletTransaction } from '../requests/useGetWalletTransactions';

interface WalletDetailsPageProps {
    title: string;
    /** Rendered as-is; the ledger is denominated in whole points. */
    balance: string | number;
    currencyLabel: string;
    /** Shown under the balance, e.g. the dinar equivalent. */
    secondaryLabel?: string;
    explanation: string;
    navigate: (path: string) => void;
}

/**
 * The ledger is in points, which are whole numbers — the old `toFixed(3)`
 * rendered a 15-point movement as "15.000", reading as dinars.
 */
const formatAmount = (value: number): string =>
    Math.round(Number(value) || 0).toLocaleString('en-US');

/** Raw ledger keys -> Arabic descriptions. */
const describeAction = (action: string): string => {
    const stage = action.match(/^competition_prize_stage_(\d+)$/);
    if (stage) return `جائزة الفوز بالمرحلة ${stage[1]}`;

    const refund = action.match(/^refund_order_(\d+)$/);
    if (refund) return `استرجاع مبلغ الطلب #${refund[1]}`;

    if (action.startsWith('rewards_claimed_')) return 'مكافأة تم استلامها';
    if (action === 'payment_order') return 'استخدام الرصيد في طلب';

    return action;
};

const WalletDetailsPage: React.FC<WalletDetailsPageProps> = ({
    title,
    balance,
    currencyLabel,
    secondaryLabel,
    explanation,
    navigate
}) => {
    const { data, isLoading, isError, error } = useGetWalletTransactions('ar');
    const transactions: ApiWalletTransaction[] = data?.transactions ?? [];

    const formatDate = (value: string) => {
        const d = new Date(value.replace(' ', 'T'));
        return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('en-GB');
    };

    return (
        <div className="animate-fadeIn h-full flex flex-col">
            <header className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/account')}
                    className="p-2 bg-white rounded-full shadow-sm text-app-text active:scale-90 transition-transform"
                >
                    <ArrowRight size={24} />
                </button>
                <h1 className="text-xl font-bold text-app-text">{title}</h1>
            </header>

            {/* Header Summary */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-app-card/30 mb-6 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-app-text">
                    <Wallet size={120} />
                </div>
                <h2 className="text-sm font-bold text-app-textSec mb-2">الرصيد الحالي</h2>
                <div className="text-4xl font-bold text-app-gold mb-4 font-alexandria flex items-end gap-1">
                    <span>{balance}</span>
                    <span className="text-base mb-1.5 opacity-80">{currencyLabel}</span>
                </div>
                {secondaryLabel && (
                    <p className="text-xs font-bold text-app-textSec -mt-2 mb-3">{secondaryLabel}</p>
                )}
                <p className="text-xs text-app-textSec leading-relaxed max-w-[80%] mx-auto">
                    {explanation}
                </p>
            </div>

            {/* Transactions List */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                <div className="flex items-center gap-2 mb-4 px-2">
                    <History size={16} className="text-app-textSec" />
                    <h3 className="text-sm font-bold text-app-text">سجل العمليات</h3>
                </div>

                {isLoading && (
                    <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-3 text-app-textSec">
                        <Loader2 size={24} className="animate-spin" />
                        <span className="text-xs">جارٍ تحميل السجل…</span>
                    </div>
                )}

                {isError && !isLoading && (
                    <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-3 text-red-500">
                        <AlertCircle size={24} />
                        <span className="text-xs font-bold">تعذّر تحميل سجل العمليات</span>
                        <span className="text-[10px] text-app-textSec">
                            {error instanceof Error ? error.message : 'حدث خطأ غير متوقع'}
                        </span>
                    </div>
                )}

                {!isLoading && !isError && transactions.length === 0 && (
                    <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-3 text-app-textSec">
                        <Inbox size={24} />
                        <span className="text-xs">لا توجد عمليات بعد</span>
                    </div>
                )}

                <div className="space-y-3">
                    {transactions.map((tx) => {
                        const isCredit = tx.direction === 'credit';

                        return (
                            <div key={tx.id} className="bg-white rounded-3xl p-5 shadow-sm border border-app-card/20 flex gap-4 items-start">
                                {/* Icon Box */}
                                <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center shrink-0
                    ${isCredit ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}
                 `}>
                                    {isCredit ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-lg font-bold font-alexandria ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
                                            {isCredit ? '+' : '−'}{formatAmount(Math.abs(tx.amount))} {currencyLabel}
                                        </span>
                                        <span className="text-[10px] font-bold text-app-textSec bg-app-bg px-2 py-1 rounded-lg">
                                            {formatDate(tx.created_at)}
                                        </span>
                                    </div>

                                    <p className="text-sm font-medium text-app-text mb-2 leading-snug">
                                        {describeAction(tx.action)}
                                    </p>

                                    <span className="text-[10px] text-app-textSec">
                                        الرصيد بعد العملية: {formatAmount(tx.balance)} {currencyLabel}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WalletDetailsPage;
