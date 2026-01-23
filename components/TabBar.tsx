import React from 'react';
import { Home, Star, Gamepad2, Heart, User } from 'lucide-react';
import { TabId } from '../types';

interface TabBarProps {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TabBar: React.FC<TabBarProps> = ({ currentTab, onTabChange }) => {
  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'الرئيسية', icon: <Home size={22} /> },
    { id: 'reviews', label: 'المراجعات', icon: <Star size={22} /> },
    { id: 'play', label: 'إلعب', icon: <Gamepad2 size={24} /> },
    { id: 'favorites', label: 'المفضلة', icon: <Heart size={22} /> },
    { id: 'account', label: 'حسابي', icon: <User size={22} /> },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-[#F7F4EE] border-t border-[#EBE5DA] pb-safe pt-2 px-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] z-50">
      <div className="flex justify-between items-end pb-2 md:pb-4 mx-auto">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1.5 transition-all duration-300 w-1/5 group`}
            >
              <div
                className={`
                  p-2 rounded-2xl transition-all duration-300
                  ${isActive ? 'bg-app-gold text-white -translate-y-2 shadow-lg shadow-app-gold/30' : 'text-[#A88A59] hover:bg-app-card'}
                `}
              >
                {tab.icon}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors duration-300 ${isActive ? 'text-app-goldDark' : 'text-gray-400'
                  }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabBar;