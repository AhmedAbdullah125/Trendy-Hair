import React from 'react';
import { Check, Lock, Gift } from 'lucide-react';
import { GAME_STAGES } from '../constants';

interface ProgressMapProps {
  currentStageIndex: number;
  currentQuestionIndex: number;
}

const ProgressMap: React.FC<ProgressMapProps> = ({ currentStageIndex, currentQuestionIndex }) => {
  return (
    <div className="w-full px-2 py-6">
      <div className="relative flex justify-between items-center max-w-xs mx-auto">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10 rounded-full" />
        <div 
            className="absolute top-1/2 right-0 h-1 bg-app-gold -z-10 rounded-full transition-all duration-500" 
            style={{ width: `${(currentStageIndex / (GAME_STAGES.length - 1)) * 100}%` }}
        />

        {GAME_STAGES.map((stage, index) => {
          const isCompleted = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          
          return (
            <div key={stage.id} className="flex flex-col items-center gap-2">
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm transition-all duration-300 z-10
                  ${isCompleted 
                    ? 'bg-app-gold border-app-gold text-white' 
                    : isCurrent 
                      ? 'bg-white border-app-gold text-app-gold scale-110' 
                      : 'bg-[#F7F4EE] border-gray-300 text-gray-300'}
                `}
              >
                {isCompleted ? (
                  <Check size={18} strokeWidth={3} />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>
              
              <div className="flex flex-col items-center">
                 {/* Reward Icon */}
                 <div className={`
                   flex items-center justify-center p-1 rounded-full mb-1
                   ${isCompleted ? 'text-app-gold' : 'text-gray-300'}
                 `}>
                    <Gift size={14} />
                 </div>
                 <span className={`text-[10px] font-bold ${isCurrent ? 'text-app-text' : 'text-gray-400'}`}>
                    {stage.rewardName}
                 </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Question Counter for Current Stage */}
      <div className="mt-4 text-center">
        <span className="inline-block px-4 py-1 bg-app-card rounded-full text-xs font-semibold text-app-goldDark border border-white/50 shadow-sm">
           السؤال {currentQuestionIndex + 1} من 5
        </span>
      </div>
    </div>
  );
};

export default ProgressMap;