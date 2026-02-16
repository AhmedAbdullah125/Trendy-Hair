import React from 'react';
import { ArrowRight, Wallet, History, ArrowDownLeft, ArrowUpRight, Calendar } from 'lucide-react';
import { WalletTransaction } from '../../types';

interface WalletDetailsPageProps {
    title: string;
    balance: number;
    currencyLabel: string;
    explanation: string;
    transactions: WalletTransaction[];
    navigate: (path: string) => void;
}

const WalletDetailsPage: React.FC<WalletDetailsPageProps> = ({
    title,
    balance,
    currencyLabel,
    explanation,
    transactions,
    navigate
}) => {
    // Format date helper
    const formatDate = (isoString: string) => {
        const d = new Date(isoString);
        return d.toLocaleDateString('en-GB'); // dd/mm/yyyy
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

                <div className="space-y-3">
                    {transactions.map((tx) => {
                        const isCredit = tx.type === 'credit';
                        const isDebit = tx.type === 'debit';
                        const isExpiry = tx.type === 'expiry';

                        const isNegative = isDebit || isExpiry;

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
                                            {isCredit ? '+' : '−'}{tx.amount} {currencyLabel}
                                        </span>
                                        <span className="text-[10px] font-bold text-app-textSec bg-app-bg px-2 py-1 rounded-lg">
                                            {formatDate(tx.date)}
                                        </span>
                                    </div>

                                    <p className="text-sm font-medium text-app-text mb-2 leading-snug">
                                        {tx.description}
                                    </p>

                                    {isCredit && tx.expiryDate && (
                                        <div className="flex items-center gap-1 text-[10px] text-app-textSec">
                                            <Calendar size={10} />
                                            <span>صالح حتى {formatDate(tx.expiryDate)}</span>
                                        </div>
                                    )}

                                    {isExpiry && (
                                        <span className="text-[10px] text-red-400 font-bold bg-red-50 px-2 py-0.5 rounded">
                                            منتهي الصلاحية
                                        </span>
                                    )}
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
