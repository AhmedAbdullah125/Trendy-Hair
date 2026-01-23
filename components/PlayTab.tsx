

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameState, PlayerState, Stage, Question } from '../types';
import { GAME_STAGES, LOCK_DURATION_MS, STORAGE_KEYS } from '../constants';
import { Trophy, Play, Clock, Lock, CheckCircle2, Timer, AlertCircle, ChevronRight, LogOut, Crown } from 'lucide-react';
import { audioService } from '../services/audioService';
import GameScreen from './GameScreen';
import Timeline from './Timeline';
import { useData } from '../context/DataContext';

const INTERNAL_STORAGE_KEY = STORAGE_KEYS.GAME_STATE;

interface PlayTabProps {
  onCreditWallet: (amount: number) => void;
  gameBalance: number;
}

const PlayTab: React.FC<PlayTabProps> = ({ onCreditWallet, gameBalance }) => {
  const { questions, gameSettings } = useData();
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentStageIndex: 0,
    currentQuestionIndex: 0,
    rewardsEarned: new Array(GAME_STAGES.length).fill(false),
    lastLossTimestamp: null,
    lastWinDate: null,
    lastWinTimestamp: null,
    lastWonStageIndex: null,
  });
  
  // Initialize timer with configured time limit
  const [timeRemaining, setTimeRemaining] = useState(gameSettings.timeLimitSeconds);
  const [showMilestoneModal, setShowMilestoneModal] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);
  const [now, setNow] = useState(Date.now());

  // Dynamically map questions to stages based on difficulty
  const dynamicStages: Stage[] = useMemo(() => {
    return GAME_STAGES.map(stage => {
      // Filter questions by difficulty
      const stageQuestions = questions.filter(q => q.difficulty === stage.difficulty);
      // Ensure we have exactly 5 questions (repeat or slice if needed)
      // For demo robustness, we fill with first available if not enough, or slice first 5
      const finalQuestions = stageQuestions.length >= 5 
        ? stageQuestions.slice(0, 5) 
        : [...stageQuestions, ...stageQuestions, ...stageQuestions].slice(0, 5); // Fallback repeat

      return {
        ...stage,
        questions: finalQuestions.length > 0 ? finalQuestions : stage.questions // Fallback to hardcoded if empty
      };
    });
  }, [questions]);

  // Check if balance has reached the cap to disable new games
  const isBalanceCapped = gameBalance >= gameSettings.gameBalanceCap;

  // Clock tick effect
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Load state on mount
  useEffect(() => {
    const stored = localStorage.getItem(INTERNAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // Safety check: ensure rewardsEarned length matches current stages
      if (parsed.rewardsEarned && parsed.rewardsEarned.length !== GAME_STAGES.length) {
         const newRewards = new Array(GAME_STAGES.length).fill(false);
         // Copy existing progress
         parsed.rewardsEarned.forEach((val: boolean, i: number) => {
            if (i < newRewards.length) newRewards[i] = val;
         });
         parsed.rewardsEarned = newRewards;
      }

      // Check if user is in loss cooldown
      if (parsed.lastLossTimestamp) {
        const diff = Date.now() - parsed.lastLossTimestamp;
        // Use configured cooldown (converted to ms)
        const cooldownMs = (gameSettings.cooldownLossMinutes * 60 * 1000) || LOCK_DURATION_MS;
        if (diff < cooldownMs) {
          setGameState(GameState.LOST_COOLDOWN);
        }
      }
      
      // Check if user is in win cooldown
      if (parsed.lastWinTimestamp && gameSettings.cooldownWinMinutes > 0) {
         const diff = Date.now() - parsed.lastWinTimestamp;
         const winCooldownMs = gameSettings.cooldownWinMinutes * 60 * 1000;
         if (diff < winCooldownMs) {
            setGameState(GameState.WON_DAILY);
         }
      } else if (parsed.lastWinDate) {
         // Fallback for old data without timestamp: check daily logic
         const today = new Date().toDateString();
         if (parsed.lastWinDate === today && gameSettings.cooldownWinMinutes >= 1440) {
             // If cooldown is approx a day or more, respect the date string for migration
             setGameState(GameState.WON_DAILY);
         }
      }
      
      setPlayerState((prev) => ({
        ...prev,
        ...parsed,
        currentStageIndex: parsed.currentStageIndex || 0,
        currentQuestionIndex: parsed.currentQuestionIndex || 0,
        lastWinTimestamp: parsed.lastWinTimestamp || null
      }));
    }
  }, [gameSettings.cooldownLossMinutes, gameSettings.cooldownWinMinutes]);

  // Sync current state based on time (Auto-unlock)
  useEffect(() => {
    const cooldownMs = (gameSettings.cooldownLossMinutes * 60 * 1000) || LOCK_DURATION_MS;
    
    // Check Loss Lock
    if (gameState === GameState.LOST_COOLDOWN && playerState.lastLossTimestamp) {
      if (now - playerState.lastLossTimestamp >= cooldownMs) {
        setGameState(GameState.IDLE);
      }
    }
    
    // Check Win Lock
    if (gameState === GameState.WON_DAILY) {
       // If configured minutes is 0, unlock immediately
       if (gameSettings.cooldownWinMinutes <= 0) {
           setGameState(GameState.IDLE);
           return;
       }

       const winCooldownMs = gameSettings.cooldownWinMinutes * 60 * 1000;
       
       if (playerState.lastWinTimestamp) {
           if (now - playerState.lastWinTimestamp >= winCooldownMs) {
               setGameState(GameState.IDLE);
           }
       } else if (playerState.lastWinDate) {
           // Legacy Check (only if they haven't won since the update)
           const today = new Date().toDateString();
           if (playerState.lastWinDate !== today) {
               setGameState(GameState.IDLE);
           }
       }
    }
  }, [now, gameState, playerState.lastLossTimestamp, playerState.lastWinTimestamp, playerState.lastWinDate, gameSettings.cooldownLossMinutes, gameSettings.cooldownWinMinutes]);

  const saveState = (newState: PlayerState) => {
    setPlayerState(newState);
    localStorage.setItem(INTERNAL_STORAGE_KEY, JSON.stringify(newState));
  };

  useEffect(() => {
    if (gameState === GameState.PLAYING && !showMilestoneModal) {
      timerRef.current = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 0) {
            handleGameOver();
            return 0;
          }
          audioService.playTick();
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, showMilestoneModal]);

  const handleGameOver = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    audioService.playFailure();
    
    // IMPORTANT: Reset rewardsEarned. User loses everything they won in previous stages if they fail.
    const newState = {
      ...playerState,
      rewardsEarned: new Array(GAME_STAGES.length).fill(false),
      lastLossTimestamp: Date.now(),
    };
    saveState(newState);
    setGameState(GameState.LOST_COOLDOWN);
  };

  const handleGameWin = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    audioService.playSuccess();

    const lastStageIndex = GAME_STAGES.length - 1;
    // Use dynamic reward if needed, for now stick to stage name from constant/mapped
    // Ideally we map gameSettings.stageRewards to GAME_STAGES in useMemo
    const prizeString = GAME_STAGES[lastStageIndex].rewardName;
    const prizeAmount = parseFloat(prizeString.replace(/[^\d.]/g, ''));

    // Credit Wallet
    onCreditWallet(prizeAmount);

    const newState = {
      ...playerState,
      lastWinDate: new Date().toDateString(),
      lastWinTimestamp: Date.now(),
      rewardsEarned: new Array(GAME_STAGES.length).fill(true),
      lastWonStageIndex: lastStageIndex,
    };
    saveState(newState);
    setGameState(GameState.WON_DAILY);
  };

  const startGame = () => {
    // If balance is capped, prevent start (though button should be disabled)
    if (isBalanceCapped) return;

    const cooldownMs = (gameSettings.cooldownLossMinutes * 60 * 1000) || LOCK_DURATION_MS;

    if (playerState.lastLossTimestamp && (Date.now() - playerState.lastLossTimestamp < cooldownMs)) return;

    // Find the first unearned stage
    const firstUnearned = playerState.rewardsEarned.findIndex(r => !r);

    if (firstUnearned === -1) {
       // All stages done, effectively won
       setGameState(GameState.WON_DAILY);
       return;
    }

    setGameState(GameState.PLAYING);
    setTimeRemaining(gameSettings.timeLimitSeconds);
    
    saveState({
      ...playerState,
      currentStageIndex: firstUnearned,
      currentQuestionIndex: 0,
      lastWonStageIndex: null,
    });
    audioService.playSuccess();
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (!isCorrect) {
      handleGameOver();
      return;
    }
    
    const currentStage = dynamicStages[playerState.currentStageIndex];
    
    if (playerState.currentQuestionIndex < currentStage.questions.length - 1) {
      setTimeRemaining(gameSettings.timeLimitSeconds);
      saveState({
        ...playerState,
        currentQuestionIndex: playerState.currentQuestionIndex + 1
      });
    } else {
      // Stage Completed
      if (playerState.currentStageIndex < GAME_STAGES.length - 1) {
        if (timerRef.current) clearInterval(timerRef.current);
        
        // Mark current stage as passed for UI, but user can still lose it if they continue and fail
        const newRewards = [...playerState.rewardsEarned];
        newRewards[playerState.currentStageIndex] = true;
        
        saveState({
           ...playerState,
           rewardsEarned: newRewards
        });
        
        setShowMilestoneModal(true);
      } else {
        handleGameWin();
      }
    }
  };

  const onContinue = () => {
    setTimeRemaining(gameSettings.timeLimitSeconds);
    saveState({
      ...playerState,
      currentStageIndex: playerState.currentStageIndex + 1,
      currentQuestionIndex: 0
    });
    setShowMilestoneModal(false);
  };

  const handleWithdraw = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    audioService.playSuccess();

    // Calculate current prize
    const currentPrizeString = GAME_STAGES[playerState.currentStageIndex].rewardName;
    const currentPrizeAmount = parseFloat(currentPrizeString.replace(/[^\d.]/g, ''));
    
    // Credit Wallet
    onCreditWallet(currentPrizeAmount);

    const newState = {
      ...playerState,
      lastWinDate: new Date().toDateString(),
      lastWinTimestamp: Date.now(),
      lastWonStageIndex: playerState.currentStageIndex,
    };
    saveState(newState);
    setGameState(GameState.WON_DAILY);
    setShowMilestoneModal(false);
  };

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const cooldownTimeText = useMemo(() => {
    const cooldownMs = (gameSettings.cooldownLossMinutes * 60 * 1000) || LOCK_DURATION_MS;
    
    if (gameState === GameState.LOST_COOLDOWN && playerState.lastLossTimestamp) {
      const remaining = (playerState.lastLossTimestamp + cooldownMs) - now;
      return formatCountdown(remaining);
    }
    if (gameState === GameState.WON_DAILY) {
      const winCooldownMs = gameSettings.cooldownWinMinutes * 60 * 1000;
      if (playerState.lastWinTimestamp) {
          const remaining = (playerState.lastWinTimestamp + winCooldownMs) - now;
          return formatCountdown(remaining);
      } else {
          // Fallback logic for legacy users w/o timestamp (daily reset)
          // Just show placeholder or 00:00:00 until they refresh date
          return "00:00:00";
      }
    }
    return null;
  }, [now, gameState, playerState.lastLossTimestamp, playerState.lastWinTimestamp, gameSettings.cooldownLossMinutes, gameSettings.cooldownWinMinutes]);

  const getTotalWon = () => {
     if (playerState.lastWonStageIndex !== null) {
         const reward = GAME_STAGES[playerState.lastWonStageIndex].rewardName;
         return parseInt(reward.replace(/\D/g, '')) || 0;
     }
     return 0;
  };

  const renderRewards = () => (
    <div className="grid grid-cols-3 gap-3 w-full mb-6">
      {GAME_STAGES.map((stage, idx) => {
        const isEarned = playerState.rewardsEarned[idx];
        const isTheFinalWin = gameState === GameState.WON_DAILY && playerState.lastWonStageIndex === idx;

        return (
          <div key={idx} className={`
             relative flex flex-col items-center justify-center p-2 rounded-2xl border transition-all aspect-square
             ${isEarned 
                ? 'bg-white border-app-gold shadow-md' 
                : 'bg-[#EBE5DA]/50 border-transparent'
             }
          `}>
             {isTheFinalWin && (
               <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-md z-20 border-2 border-white animate-bounce">
                  <CheckCircle2 size={12} strokeWidth={4} />
               </div>
             )}

             <div className={`p-1.5 rounded-full mb-1 ${
               isEarned 
                ? 'bg-app-gold text-white' 
                : 'bg-gray-200 text-gray-400'
             }`}>
                {isEarned ? <CheckCircle2 size={14} /> : <Lock size={14} />}
             </div>

             <span className={`text-[10px] font-bold ${isEarned ? 'text-app-text' : 'text-gray-400'}`}>
                {stage.rewardName}
             </span>
             <span className="text-[8px] text-gray-400 mt-0.5">
                {stage.name}
             </span>
          </div>
        )
      })}
    </div>
  );

  // --- RENDERING ---

  if (gameState === GameState.IDLE) {
    return (
      <div className="flex flex-col h-full px-6 pt-8 pb-24 overflow-y-auto no-scrollbar font-alexandria">
        <header className="mb-8">
            <h1 className="text-2xl font-bold text-app-goldDark mb-1">مسابقة تريندي</h1>
            <p className="text-app-textSec text-sm">أجيبي على الأسئلة واربحي جوائز قيمة</p>
        </header>

        {/* Rewards Balance Banner */}
        <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-[#EBE5DA] mb-6 text-center animate-fadeIn flex flex-col items-center justify-center">
            <span className="text-sm font-medium text-app-textSec mb-1">رصيد الجوائز الحالي</span>
            <div className="text-3xl font-bold text-app-gold mb-1 font-alexandria">
               {gameBalance} دك
            </div>
            <span className="text-[10px] text-gray-400">يمكنكِ استخدام 5 دنانير كخصم على كل طلب من رصيد الجوائز.</span>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EBE5DA] flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 bg-app-bg rounded-full flex items-center justify-center mb-4 text-app-gold shadow-inner">
                <Trophy size={40} />
            </div>
            <h2 className="text-xl font-bold text-app-text mb-2">هل أنتِ مستعدة؟</h2>
            <p className="text-sm text-app-textSec mb-6 leading-relaxed">
              لديكِ 3 مراحل، كل مرحلة تحتوي على 5 أسئلة.
              <br/>
              بإجمالي 15 سؤال.
              <br/>
              لديكِ {gameSettings.timeLimitSeconds} ثانية لكل سؤال.
            </p>
            {renderRewards()}
        </div>

        <button 
          onClick={startGame}
          disabled={isBalanceCapped}
          className={`
            font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform
            ${isBalanceCapped
               ? 'bg-gray-300 text-white cursor-not-allowed shadow-none'
               : 'bg-app-gold active:bg-app-goldDark text-white shadow-app-gold/30 active:scale-95'
            }
          `}
        >
          {isBalanceCapped ? <Lock size={20} /> : <Play fill="currentColor" size={20} />}
          <span>ابدئي اللعب الآن</span>
        </button>

        {isBalanceCapped && (
            <p className="text-red-500 text-xs font-bold mt-3 text-center animate-fadeIn">
                يجب انفاق رصيد الجوائز لتتمكني من اللعب
            </p>
        )}
      </div>
    );
  }

  if (gameState === GameState.LOST_COOLDOWN) {
    return (
      <div className="flex flex-col h-full px-6 pt-12 items-center justify-center pb-24 text-center animate-fadeIn font-alexandria">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-400">
           <Clock size={48} />
        </div>
        <h2 className="text-2xl font-bold text-app-text mb-2">حظ أوفر المرة القادمة</h2>
        <p className="text-app-textSec mb-8 px-4">
          للأسف إجابتك كانت خاطئة أو انتهى الوقت.
        </p>
        
        <div className="bg-app-card w-full p-6 rounded-2xl border border-app-gold/20 mb-8">
          <p className="text-sm font-bold text-app-textSec mb-2">يمكنكِ اللعب مجدداً بعد</p>
          <p className="text-3xl font-bold text-app-goldDark tabular-nums" dir="ltr">
            {cooldownTimeText}
          </p>
        </div>

        <button disabled className="bg-gray-300 text-white font-bold py-4 px-8 rounded-2xl w-full cursor-not-allowed flex items-center justify-center gap-2">
           <Lock size={18} />
           <span>اللعبة مقفلة مؤقتاً</span>
        </button>
      </div>
    );
  }

  if (gameState === GameState.WON_DAILY) {
    return (
      <div className="flex flex-col h-full px-6 pt-12 items-center justify-center pb-24 text-center animate-fadeIn font-alexandria">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-500 animate-bounce">
           <Trophy size={48} />
        </div>
        <h2 className="text-2xl font-bold text-app-text mb-2">تهانينا!</h2>
        <p className="text-app-textSec mb-8">
          لقد أتممتِ التحدي لهذا اليوم وحصلتِ على {getTotalWon()} دينار.
          <br/>
          <span className="text-xs text-app-gold font-bold mt-2 block">تمت إضافة المبلغ إلى رصيد الألعاب الخاص بك</span>
        </p>
        
        <div className="bg-app-card w-full p-6 rounded-2xl border border-app-gold/20 mb-8">
          <p className="text-sm font-bold text-app-textSec mb-2">يمكنكِ اللعب مجدداً بعد</p>
          <p className="text-3xl font-bold text-app-goldDark tabular-nums" dir="ltr">
            {cooldownTimeText}
          </p>
        </div>
         
         {renderRewards()}

         {/* Rewards Wallet Balance Card - Cooldown Screen */}
         <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-[#EBE5DA] mt-6 flex flex-col items-center justify-center animate-scaleIn">
             <span className="text-sm font-bold text-app-textSec mb-1">رصيد الجوائز الحالي</span>
             <div className="text-3xl font-bold text-app-gold font-alexandria">
                {gameBalance} دك
             </div>
         </div>
      </div>
    );
  }

  const currentStage = dynamicStages[playerState.currentStageIndex];
  const currentQuestion = currentStage.questions[playerState.currentQuestionIndex];
  
  // Guard against missing questions if DB is empty
  if (!currentQuestion) {
      return (
          <div className="flex flex-col h-full items-center justify-center text-center p-6">
              <AlertCircle size={48} className="text-red-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">عذراً، حدث خطأ</h2>
              <p className="text-app-textSec">لا توجد أسئلة كافية في بنك الأسئلة لهذه المرحلة.</p>
              <button onClick={() => setGameState(GameState.IDLE)} className="mt-4 text-app-gold font-bold">العودة</button>
          </div>
      );
  }

  const isLastQuestion = playerState.currentQuestionIndex === currentStage.questions.length - 1;
  const currentReward = GAME_STAGES[playerState.currentStageIndex].rewardName;
  const nextReward = GAME_STAGES[playerState.currentStageIndex + 1]?.rewardName || '';

  return (
    <div className="flex flex-col h-full pt-4 px-4 pb-24 overflow-hidden relative font-alexandria">
      {/* Withdraw / Risk Modal */}
      {showMilestoneModal && (
        <div className="absolute inset-0 z-[100] bg-app-bg/95 flex items-center justify-center p-6 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[32px] p-8 shadow-2xl border border-app-gold/30 flex flex-col items-center text-center max-w-sm w-full animate-scaleIn">
            <div className="w-20 h-20 bg-app-gold/10 rounded-full flex items-center justify-center mb-6 text-app-gold">
               <Trophy size={40} />
            </div>
            
            <h3 className="text-xl font-bold text-app-goldDark mb-4 leading-tight">
              مبروك ربحتي {currentReward}
            </h3>
            
            <p className="text-app-text text-sm mb-6 leading-relaxed font-medium">
               هل تريدين الانسحاب والحصول على {currentReward}، أم تريدين الإكمال والمغامرة للحصول على الجائزة التالية {nextReward}؟
            </p>

            <p className="text-red-500 font-bold text-xs mb-8">
               ملاحظة: إذا خسرتي تخسرين كل شيء
            </p>

            <div className="w-full flex flex-col gap-3">
              <button 
                onClick={handleWithdraw}
                className="w-full flex items-center justify-center gap-2 bg-white text-app-gold border-2 border-app-gold font-bold py-3.5 rounded-2xl active:bg-gray-50 transition-colors"
              >
                <span>انسحاب</span>
                <LogOut size={18} />
              </button>

              <button 
                onClick={onContinue}
                className="w-full flex items-center justify-center gap-2 bg-app-gold text-white font-bold py-4 rounded-2xl shadow-lg shadow-app-gold/30 active:bg-app-goldDark transition-transform active:scale-95"
              >
                <span>أكملي التحدي</span>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
         <div className="flex flex-col">
            <h2 className="text-xl font-bold text-app-goldDark">{currentStage.name}</h2>
            <span className="text-xs text-app-textSec">الجائزة الحالية: {currentStage.rewardName}</span>
         </div>
         <div className="bg-app-card px-3 py-1 rounded-lg">
            <span className="text-xs font-bold text-app-text">{currentStage.difficulty === 'easy' ? 'سهل' : currentStage.difficulty === 'medium' ? 'متوسط' : 'صعب'}</span>
         </div>
      </div>
      
      <div className="flex-1 mt-0 flex flex-col min-h-0">
         
         <div className="flex justify-center mb-2">
            <div className={`
              flex items-center gap-2 px-6 py-2 rounded-2xl border-2 transition-colors duration-300
              ${timeRemaining === 0 ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-app-gold/20 text-app-goldDark'}
            `}>
              <Timer size={20} className={timeRemaining > 0 && timeRemaining <= 10 ? 'animate-pulse' : ''} />
              <span className="text-xl font-bold tabular-nums">
                00:{timeRemaining.toString().padStart(2, '0')}
              </span>
            </div>
         </div>

         <div className="mb-4">
            <Timeline 
                currentStageIndex={playerState.currentStageIndex} 
                currentQuestionIndex={playerState.currentQuestionIndex} 
            />
         </div>
         
         <div className="flex-1 overflow-y-auto no-scrollbar">
            <GameScreen 
                question={currentQuestion} 
                onAnswer={handleAnswer} 
                isLastQuestion={isLastQuestion}
            />
         </div>
      </div>
    </div>
  );
};

export default PlayTab;