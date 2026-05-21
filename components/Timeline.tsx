import React from 'react';
import { Rocket, Crown, Check, Circle } from 'lucide-react';

interface TimelineProps {
  /** Total number of questions in the current stage (from API) */
  totalQuestions: number;
  /** Current question index (0-based) */
  currentQuestionIndex: number;
}

const Timeline: React.FC<TimelineProps> = ({ totalQuestions, currentQuestionIndex }) => {
  const total = Math.max(totalQuestions, 1);
  const current = currentQuestionIndex;

  return (
    <div className="w-full px-4 py-2">
      <div className="relative flex items-center justify-between w-full h-12">

        {/* Background Line */}
        <div className="absolute left-0 right-0 h-0.5 bg-gray-300 top-1/2 -translate-y-1/2 -z-10 rounded-full" />

        {/* Active Progress Line (RTL — grows from right) */}
        <div
          className="absolute right-0 h-0.5 bg-app-gold top-1/2 -translate-y-1/2 -z-10 rounded-full transition-all duration-500 ease-out"
          style={{ width: total > 1 ? `${(current / (total - 1)) * 100}%` : '0%' }}
        />

        {Array.from({ length: total }).map((_, i) => {
          const isCompleted = i < current;
          const isActive = i === current;
          const isFirst = i === 0;
          const isLast = i === total - 1;
          const isMilestone = isFirst || isLast;
          const Icon = isFirst ? Rocket : Crown;

          return (
            <div key={i} className="relative flex flex-col items-center justify-center">

              {/* Active Tooltip */}
              {isActive && (
                <div className="absolute -top-8 animate-bounce whitespace-nowrap z-20">
                  <div className="bg-app-goldDark text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-md relative">
                    {isMilestone ? (isFirst ? 'البداية!' : 'النهاية!') : `سؤال ${i + 1}`}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-app-goldDark" />
                  </div>
                </div>
              )}

              {/* Node */}
              <div
                className={`
                  flex items-center justify-center rounded-full transition-all duration-500 z-10
                  ${isMilestone ? 'w-7 h-7 shadow-sm' : 'w-2 h-2'}
                  ${isCompleted
                    ? 'bg-app-gold text-white'
                    : isActive
                      ? 'bg-white border-2 border-app-gold text-app-gold scale-125 ring-4 ring-app-gold/10'
                      : 'bg-gray-300 text-gray-400'
                  }
                  ${isActive && isMilestone ? 'scale-125' : ''}
                `}
              >
                {isMilestone ? (
                  isCompleted ? (
                    <Check size={14} strokeWidth={3} />
                  ) : (
                    <Icon size={isActive ? 16 : 14} fill={isCompleted && isLast ? 'currentColor' : 'none'} />
                  )
                ) : null}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;