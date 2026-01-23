import React from 'react';
import { Rocket, Gift, Medal, Crown, Check, Circle } from 'lucide-react';
import { APP_COLORS } from '../constants';

interface TimelineProps {
  currentStageIndex: number;
  currentQuestionIndex: number;
}

const Timeline: React.FC<TimelineProps> = ({ currentStageIndex, currentQuestionIndex }) => {
  const totalPoints = 15;
  // Calculate absolute progress (0 to 14)
  const currentIndex = (currentStageIndex * 5) + currentQuestionIndex;

  return (
    <div className="w-full px-4 py-2">
      <div className="relative flex items-center justify-between w-full h-12">
        {/* Background Line */}
        <div className="absolute left-0 right-0 h-0.5 bg-gray-300 top-1/2 -translate-y-1/2 -z-10 rounded-full" />
        
        {/* Active Progress Line (RTL width grows from right) */}
        <div 
            className="absolute right-0 h-0.5 bg-app-gold top-1/2 -translate-y-1/2 -z-10 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${(currentIndex / (totalPoints - 1)) * 100}%` }}
        />

        {Array.from({ length: totalPoints }).map((_, i) => {
          const num = i + 1;
          const isCompleted = i < currentIndex;
          const isActive = i === currentIndex;
          
          let Icon = Circle;
          let isMilestone = false;

          // Milestone Config
          if (num === 1) { Icon = Rocket; isMilestone = true; }
          else if (num === 5) { Icon = Gift; isMilestone = true; }
          else if (num === 10) { Icon = Medal; isMilestone = true; }
          else if (num === 15) { Icon = Crown; isMilestone = true; }

          return (
             <div key={i} className="relative flex flex-col items-center justify-center">
                
                {/* Active Tooltip - Floats above current point */}
                {isActive && (
                    <div className="absolute -top-8 animate-bounce whitespace-nowrap z-20">
                        <div className="bg-app-goldDark text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-md relative">
                            {isMilestone ? 'محطة جائزة!' : `سؤال ${num}`}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-app-goldDark"></div>
                        </div>
                    </div>
                )}

                {/* The Node */}
                <div 
                  className={`
                    flex items-center justify-center rounded-full transition-all duration-500 z-10
                    ${isMilestone 
                        ? 'w-7 h-7 shadow-sm' 
                        : 'w-2 h-2'
                    }
                    ${isCompleted 
                        ? 'bg-app-gold text-white' 
                        : isActive 
                            ? 'bg-white border-2 border-app-gold text-app-gold scale-125 ring-4 ring-app-gold/10' 
                            : 'bg-gray-300 text-gray-400' // Locked state
                    }
                    ${isActive && isMilestone ? 'scale-125' : ''}
                  `}
                >
                  {isMilestone ? (
                      (isCompleted && num !== 1 && num !== 15) ? (
                         // Show checkmark for completed mid-milestones (except start/end for visual preference if desired, but let's check all)
                         <Check size={14} strokeWidth={3} />
                      ) : (
                         <Icon size={isActive ? 16 : 14} fill={isCompleted && num === 15 ? "currentColor" : "none"} />
                      )
                  ) : (
                      // Normal dots are just empty styled divs
                      null
                  )}
                </div>
             </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;