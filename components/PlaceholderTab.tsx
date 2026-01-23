import React from 'react';
import { Construction } from 'lucide-react';

interface PlaceholderTabProps {
  title: string;
}

const PlaceholderTab: React.FC<PlaceholderTabProps> = ({ title }) => {
  return (
    <div className="flex flex-col h-full items-center justify-center p-6 text-center text-app-textSec pb-24">
      <div className="w-20 h-20 bg-app-card rounded-full flex items-center justify-center mb-6">
        <Construction size={40} className="text-app-gold" />
      </div>
      <h2 className="text-2xl font-bold text-app-text mb-2">{title}</h2>
      <p className="max-w-xs">هذه الصفحة قيد التطوير حالياً. يرجى التحقق من تبويب "إلعب".</p>
    </div>
  );
};

export default PlaceholderTab;