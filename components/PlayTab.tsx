import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameState, PlayerState, StageQuestion, CollectedAnswer } from '../types';
import { GAME_STAGES, LOCK_DURATION_MS, STORAGE_KEYS } from '../constants';
import { useGetCompetitionStages } from './requests/useGetCompetitionStages';
import { useStartStage } from './requests/useStartStage';
import { useSubmitAttempt } from './requests/useSubmitAttempt';
import { Trophy, Play, Clock, Lock, CheckCircle2, Timer, AlertCircle, LogOut, Loader2, ChevronLeft } from 'lucide-react';
import { audioService } from '../services/audioService';
import GameScreen from './GameScreen';
import Timeline from './Timeline';
import { useData } from '../context/DataContext';
import { useGetProfile } from './requests/useGetProfile';

const INTERNAL_STORAGE_KEY = STORAGE_KEYS.GAME_STATE;

interface PlayTabProps {
  onCreditWallet: (amount: number) => void;
}

const PlayTab: React.FC<PlayTabProps> = ({ onCreditWallet }) => {
  const { gameSettings } = useData();

  const { data: competitionData } = useGetCompetitionStages();
  const gameStages = competitionData?.stages ?? GAME_STAGES;

  const { data: profileData } = useGetProfile('ar');
  const gameBalance = parseFloat(profileData?.wallet || '0');

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

  // Stage questions loaded from API on stage start
  const [stageQuestions, setStageQuestions] = useState<StageQuestion[]>([]);
  const [currentAttemptId, setCurrentAttemptId] = useState<number | null>(null);
  const [collectedAnswers, setCollectedAnswers] = useState<CollectedAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStartingStage, setIsStartingStage] = useState(false);

  const [timeRemaining, setTimeRemaining] = useState(gameSettings.timeLimitSeconds);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const timerRef = useRef<number | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());
  const [now, setNow] = useState(Date.now());

  const startStageMutation = useStartStage();
  const submitAttemptMutation = useSubmitAttempt();

  const isBalanceCapped = gameBalance >= gameSettings.gameBalanceCap;

  // Clock tick
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Load persisted state on mount
  useEffect(() => {
    const stored = localStorage.getItem(INTERNAL_STORAGE_KEY);
    if (!stored) return;
    const parsed = JSON.parse(stored);

    if (parsed.rewardsEarned && parsed.rewardsEarned.length !== gameStages.length) {
      const nr = new Array(gameStages.length).fill(false);
      parsed.rewardsEarned.forEach((v: boolean, i: number) => { if (i < nr.length) nr[i] = v; });
      parsed.rewardsEarned = nr;
    }

    if (parsed.lastLossTimestamp) {
      const cooldownMs = (gameSettings.cooldownLossMinutes * 60 * 1000) || LOCK_DURATION_MS;
      if (Date.now() - parsed.lastLossTimestamp < cooldownMs) setGameState(GameState.LOST_COOLDOWN);
    }

    if (parsed.lastWinTimestamp && gameSettings.cooldownWinMinutes > 0) {
      if (Date.now() - parsed.lastWinTimestamp < gameSettings.cooldownWinMinutes * 60 * 1000)
        setGameState(GameState.WON_DAILY);
    } else if (parsed.lastWinDate) {
      if (parsed.lastWinDate === new Date().toDateString() && gameSettings.cooldownWinMinutes >= 1440)
        setGameState(GameState.WON_DAILY);
    }

    setPlayerState(prev => ({
      ...prev, ...parsed,
      currentStageIndex: parsed.currentStageIndex || 0,
      currentQuestionIndex: parsed.currentQuestionIndex || 0,
      lastWinTimestamp: parsed.lastWinTimestamp || null,
    }));
  }, [gameSettings.cooldownLossMinutes, gameSettings.cooldownWinMinutes]);

  // Auto-unlock cooldowns
  useEffect(() => {
    const cooldownMs = (gameSettings.cooldownLossMinutes * 60 * 1000) || LOCK_DURATION_MS;
    if (gameState === GameState.LOST_COOLDOWN && playerState.lastLossTimestamp) {
      if (now - playerState.lastLossTimestamp >= cooldownMs) setGameState(GameState.IDLE);
    }
    if (gameState === GameState.WON_DAILY) {
      if (gameSettings.cooldownWinMinutes <= 0) { setGameState(GameState.IDLE); return; }
      const winMs = gameSettings.cooldownWinMinutes * 60 * 1000;
      if (playerState.lastWinTimestamp && now - playerState.lastWinTimestamp >= winMs) setGameState(GameState.IDLE);
      else if (playerState.lastWinDate && playerState.lastWinDate !== new Date().toDateString()) setGameState(GameState.IDLE);
    }
  }, [now, gameState, playerState.lastLossTimestamp, playerState.lastWinTimestamp, playerState.lastWinDate, gameSettings.cooldownLossMinutes, gameSettings.cooldownWinMinutes]);

  // Timer while playing
  useEffect(() => {
    if (gameState === GameState.PLAYING && !showMilestoneModal && !isSubmitting && !isStartingStage) {
      timerRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) { handleGameOver(); return 0; }
          audioService.playTick();
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState, showMilestoneModal, isSubmitting, isStartingStage]);

  const saveState = (s: PlayerState) => { setPlayerState(s); localStorage.setItem(INTERNAL_STORAGE_KEY, JSON.stringify(s)); };

  const handleGameOver = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    audioService.playFailure();
    saveState({ ...playerState, rewardsEarned: new Array(gameStages.length).fill(false), lastLossTimestamp: Date.now() });
    setGameState(GameState.LOST_COOLDOWN);
  };

  const handleGameWin = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    audioService.playSuccess();
    const lastIdx = gameStages.length - 1;
    const prize = parseFloat((gameStages[lastIdx].rewardName || '0').replace(/[^\d.]/g, ''));
    onCreditWallet(prize);
    saveState({ ...playerState, lastWinDate: new Date().toDateString(), lastWinTimestamp: Date.now(), rewardsEarned: new Array(gameStages.length).fill(true), lastWonStageIndex: lastIdx });
    setGameState(GameState.WON_DAILY);
  };

  // Launch a stage via API
  const launchStage = (stageIndex: number, onDone?: () => void) => {
    const stageId = gameStages[stageIndex]?.id;
    if (!stageId) return;
    setIsStartingStage(true);
    startStageMutation.mutate(stageId, {
      onSuccess: (data) => {
        setStageQuestions(data.questions);
        setCurrentAttemptId(data.attemptId);
        setCollectedAnswers([]);
        setTimeRemaining(data.questionTime ?? gameSettings.timeLimitSeconds);
        questionStartTimeRef.current = Date.now();
        setIsStartingStage(false);
        onDone?.();
      },
      onError: () => { setIsStartingStage(false); },
    });
  };

  const startGame = () => {
    if (isBalanceCapped) return;
    const cooldownMs = (gameSettings.cooldownLossMinutes * 60 * 1000) || LOCK_DURATION_MS;
    if (playerState.lastLossTimestamp && Date.now() - playerState.lastLossTimestamp < cooldownMs) return;
    const firstUnearned = playerState.rewardsEarned.findIndex(r => !r);
    if (firstUnearned === -1) { setGameState(GameState.WON_DAILY); return; }

    launchStage(firstUnearned, () => {
      saveState({ ...playerState, currentStageIndex: firstUnearned, currentQuestionIndex: 0, lastWonStageIndex: null });
      setGameState(GameState.PLAYING);
      audioService.playSuccess();
    });
  };

  const handleAnswer = (answerId: number) => {
    const timeSpent = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
    const currentQ = stageQuestions[playerState.currentQuestionIndex];
    if (!currentQ) return;

    const answer: CollectedAnswer = {
      competition_question_id: currentQ.id,
      competition_answer_id: answerId,
      time_spent_seconds: timeSpent,
    };
    const newCollected = [...collectedAnswers, answer];
    setCollectedAnswers(newCollected);

    const nextIdx = playerState.currentQuestionIndex + 1;

    if (nextIdx < stageQuestions.length) {
      // More questions in this stage
      const qt = gameStages[playerState.currentStageIndex]?.questionTime ?? gameSettings.timeLimitSeconds;
      setTimeRemaining(qt);
      questionStartTimeRef.current = Date.now();
      saveState({ ...playerState, currentQuestionIndex: nextIdx });
    } else {
      // All questions answered — submit
      if (timerRef.current) clearInterval(timerRef.current);
      setIsSubmitting(true);
      const attemptId = currentAttemptId;

      submitAttemptMutation.mutate({ attemptId, answers: newCollected }, {
        onSuccess: () => {
          setIsSubmitting(false);
          const isLastStage = playerState.currentStageIndex >= gameStages.length - 1;
          if (isLastStage) {
            handleGameWin();
          } else {
            const newRewards = [...playerState.rewardsEarned];
            newRewards[playerState.currentStageIndex] = true;
            saveState({ ...playerState, rewardsEarned: newRewards });
            setShowMilestoneModal(true);
          }
        },
        onError: () => { setIsSubmitting(false); handleGameOver(); },
      });
    }
  };

  const onContinue = () => {
    const nextStageIndex = playerState.currentStageIndex + 1;
    launchStage(nextStageIndex, () => {
      saveState({ ...playerState, currentStageIndex: nextStageIndex, currentQuestionIndex: 0 });
      setShowMilestoneModal(false);
    });
  };

  const handleWithdraw = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    audioService.playSuccess();
    const prize = parseFloat((gameStages[playerState.currentStageIndex]?.rewardName || '0').replace(/[^\d.]/g, ''));
    onCreditWallet(prize);
    saveState({ ...playerState, lastWinDate: new Date().toDateString(), lastWinTimestamp: Date.now(), lastWonStageIndex: playerState.currentStageIndex });
    setGameState(GameState.WON_DAILY);
    setShowMilestoneModal(false);
  };

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return '00:00:00';
    const s = Math.floor(ms / 1000);
    return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };

  const cooldownTimeText = useMemo(() => {
    const lossMs = (gameSettings.cooldownLossMinutes * 60 * 1000) || LOCK_DURATION_MS;
    if (gameState === GameState.LOST_COOLDOWN && playerState.lastLossTimestamp)
      return formatCountdown((playerState.lastLossTimestamp + lossMs) - now);
    if (gameState === GameState.WON_DAILY) {
      const winMs = gameSettings.cooldownWinMinutes * 60 * 1000;
      if (playerState.lastWinTimestamp) return formatCountdown((playerState.lastWinTimestamp + winMs) - now);
      return '00:00:00';
    }
    return null;
  }, [now, gameState, playerState.lastLossTimestamp, playerState.lastWinTimestamp, gameSettings.cooldownLossMinutes, gameSettings.cooldownWinMinutes]);

  const getTotalWon = () => {
    if (playerState.lastWonStageIndex !== null) {
      const r = gameStages[playerState.lastWonStageIndex]?.rewardName ?? '0';
      return parseInt(r.replace(/\D/g, '')) || 0;
    }
    return 0;
  };

  const renderRewards = () => (
    <div className="grid grid-cols-3 gap-3 w-full mb-6">
      {gameStages.map((stage, idx) => {
        const isEarned = playerState.rewardsEarned[idx];
        const isTheFinalWin = gameState === GameState.WON_DAILY && playerState.lastWonStageIndex === idx;
        return (
          <div key={idx} className={`relative flex flex-col items-center justify-center p-2 rounded-2xl border transition-all aspect-square ${isEarned ? 'bg-white border-app-gold shadow-md' : 'bg-[#EBE5DA]/50 border-transparent'}`}>
            {isTheFinalWin && <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-md z-20 border-2 border-white animate-bounce"><CheckCircle2 size={12} strokeWidth={4} /></div>}
            <div className={`p-1.5 rounded-full mb-1 ${isEarned ? 'bg-app-gold text-white' : 'bg-gray-200 text-gray-400'}`}>
              {isEarned ? <CheckCircle2 size={14} /> : <Lock size={14} />}
            </div>
            <span className={`text-[10px] font-bold ${isEarned ? 'text-app-text' : 'text-gray-400'}`}>{stage.rewardName}</span>
            <span className="text-[8px] text-gray-400 mt-0.5">{stage.name}</span>
          </div>
        );
      })}
    </div>
  );

  // --- RENDER ---

  if (gameState === GameState.IDLE) {
    return (
      <div className="flex flex-col h-full px-6 pt-8 pb-24 overflow-y-auto no-scrollbar font-alexandria">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-app-goldDark mb-1">مسابقة تريندي</h1>
          <p className="text-app-textSec text-sm">أجيبي على الأسئلة واربحي جوائز قيمة</p>
        </header>
        <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-[#EBE5DA] mb-6 text-center animate-fadeIn flex flex-col items-center justify-center">
          <span className="text-sm font-medium text-app-textSec mb-1">رصيد الجوائز الحالي</span>
          <div className="text-3xl font-bold text-app-gold mb-1 font-alexandria">{gameBalance} دك</div>
          <span className="text-[10px] text-gray-400">يمكنكِ استخدام 5 دنانير كخصم على كل طلب من رصيد الجوائز.</span>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EBE5DA] flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 bg-app-bg rounded-full flex items-center justify-center mb-4 text-app-gold shadow-inner"><Trophy size={40} /></div>
          <h2 className="text-xl font-bold text-app-text mb-2">هل أنتِ مستعدة؟</h2>
          <p className="text-sm text-app-textSec mb-6 leading-relaxed">
            لديكِ {gameStages.length} مراحل.<br />لديكِ {gameSettings.timeLimitSeconds} ثانية لكل سؤال.
          </p>
          {renderRewards()}
        </div>
        <button
          onClick={startGame}
          disabled={isBalanceCapped || isStartingStage}
          className={`font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform ${isBalanceCapped ? 'bg-gray-300 text-white cursor-not-allowed shadow-none' : 'bg-app-gold active:bg-app-goldDark text-white shadow-app-gold/30 active:scale-95'}`}
        >
          {isStartingStage ? <Loader2 size={20} className="animate-spin" /> : isBalanceCapped ? <Lock size={20} /> : <Play fill="currentColor" size={20} />}
          <span>{isStartingStage ? 'جاري التحميل...' : 'ابدئي اللعب الآن'}</span>
        </button>
        {isBalanceCapped && <p className="text-red-500 text-xs font-bold mt-3 text-center animate-fadeIn">يجب انفاق رصيد الجوائز لتتمكني من اللعب</p>}
      </div>
    );
  }

  if (gameState === GameState.LOST_COOLDOWN) {
    return (
      <div className="flex flex-col h-full px-6 pt-12 items-center justify-center pb-24 text-center animate-fadeIn font-alexandria">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-400"><Clock size={48} /></div>
        <h2 className="text-2xl font-bold text-app-text mb-2">حظ أوفر المرة القادمة</h2>
        <p className="text-app-textSec mb-8 px-4">للأسف إجابتك كانت خاطئة أو انتهى الوقت.</p>
        <div className="bg-app-card w-full p-6 rounded-2xl border border-app-gold/20 mb-8">
          <p className="text-sm font-bold text-app-textSec mb-2">يمكنكِ اللعب مجدداً بعد</p>
          <p className="text-3xl font-bold text-app-goldDark tabular-nums" dir="ltr">{cooldownTimeText}</p>
        </div>
        <button disabled className="bg-gray-300 text-white font-bold py-4 px-8 rounded-2xl w-full cursor-not-allowed flex items-center justify-center gap-2">
          <Lock size={18} /><span>اللعبة مقفلة مؤقتاً</span>
        </button>
      </div>
    );
  }

  if (gameState === GameState.WON_DAILY) {
    return (
      <div className="flex flex-col h-full px-6 pt-12 items-center justify-center pb-24 text-center animate-fadeIn font-alexandria">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-500 animate-bounce"><Trophy size={48} /></div>
        <h2 className="text-2xl font-bold text-app-text mb-2">تهانينا!</h2>
        <p className="text-app-textSec mb-8">
          لقد أتممتِ التحدي لهذا اليوم وحصلتِ على {getTotalWon()} دينار.<br />
          <span className="text-xs text-app-gold font-bold mt-2 block">تمت إضافة المبلغ إلى رصيد الألعاب الخاص بك</span>
        </p>
        <div className="bg-app-card w-full p-6 rounded-2xl border border-app-gold/20 mb-8">
          <p className="text-sm font-bold text-app-textSec mb-2">يمكنكِ اللعب مجدداً بعد</p>
          <p className="text-3xl font-bold text-app-goldDark tabular-nums" dir="ltr">{cooldownTimeText}</p>
        </div>
        {renderRewards()}
        <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-[#EBE5DA] mt-6 flex flex-col items-center justify-center animate-scaleIn">
          <span className="text-sm font-bold text-app-textSec mb-1">رصيد الجوائز الحالي</span>
          <div className="text-3xl font-bold text-app-gold font-alexandria">{gameBalance} دك</div>
        </div>
      </div>
    );
  }

  // Loading: starting stage or submitting
  if (isStartingStage || isSubmitting) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-6 font-alexandria">
        <Loader2 size={40} className="text-app-gold animate-spin mb-4" />
        <p className="text-app-textSec font-medium">{isSubmitting ? 'جاري إرسال إجاباتك...' : 'جاري تحميل المرحلة...'}</p>
      </div>
    );
  }

  // Error: no questions
  const currentQuestion = stageQuestions[playerState.currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-6 font-alexandria">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">عذراً، حدث خطأ</h2>
        <p className="text-app-textSec mb-4">تعذّر تحميل أسئلة المرحلة. يرجى المحاولة مجدداً.</p>
        <button onClick={() => setGameState(GameState.IDLE)} className="text-app-gold font-bold border border-app-gold px-6 py-2 rounded-xl active:scale-95 transition-transform">
          العودة
        </button>
      </div>
    );
  }

  const currentStage = gameStages[playerState.currentStageIndex];
  const currentReward = currentStage?.rewardName ?? '';
  const nextReward = gameStages[playerState.currentStageIndex + 1]?.rewardName ?? '';
  const isLastQuestion = playerState.currentQuestionIndex === stageQuestions.length - 1;

  return (
    <div className="flex flex-col h-full pt-4 px-4 pb-24 overflow-hidden relative font-alexandria">

      {/* Milestone Modal */}
      {showMilestoneModal && (
        <div className="absolute inset-0 z-[100] bg-app-bg/95 flex items-center justify-center p-6 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[32px] p-8 shadow-2xl border border-app-gold/30 flex flex-col items-center text-center max-w-sm w-full animate-scaleIn">
            <div className="w-20 h-20 bg-app-gold/10 rounded-full flex items-center justify-center mb-6 text-app-gold"><Trophy size={40} /></div>
            <h3 className="text-xl font-bold text-app-goldDark mb-4 leading-tight">مبروك ربحتي {currentReward}</h3>
            <p className="text-app-text text-sm mb-6 leading-relaxed font-medium">
              هل تريدين الانسحاب والحصول على {currentReward}، أم تريدين الإكمال والمغامرة للحصول على الجائزة التالية {nextReward}؟
            </p>
            <p className="text-red-500 font-bold text-xs mb-8">ملاحظة: إذا خسرتي تخسرين كل شيء</p>
            <div className="w-full flex flex-col gap-3">
              <button onClick={handleWithdraw} className="w-full flex items-center justify-center gap-2 bg-white text-app-gold border-2 border-app-gold font-bold py-3.5 rounded-2xl active:bg-gray-50 transition-colors">
                <span>انسحاب</span><LogOut size={18} className='rotate-180' />
              </button>
              <button onClick={onContinue} disabled={isStartingStage} className="w-full flex items-center justify-center gap-2 bg-app-gold text-white font-bold py-4 rounded-2xl shadow-lg shadow-app-gold/30 active:bg-app-goldDark transition-transform active:scale-95 disabled:opacity-60">
                {isStartingStage ? <Loader2 size={18} className="animate-spin" /> : <><span>أكملي التحدي</span><ChevronLeft size={20} /></>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-app-goldDark">{currentStage?.name}</h2>
          <span className="text-xs text-app-textSec">الجائزة الحالية: {currentReward}</span>
        </div>
        <div className="bg-app-card px-3 py-1 rounded-lg">
          <span className="text-xs font-bold text-app-text">{playerState.currentQuestionIndex + 1} / {stageQuestions.length}</span>
        </div>
      </div>

      <div className="flex-1 mt-0 flex flex-col min-h-0">
        <div className="flex justify-center mb-2">
          <div className={`flex items-center gap-2 px-6 py-2 rounded-2xl border-2 transition-colors duration-300 ${timeRemaining === 0 ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-app-gold/20 text-app-goldDark'}`}>
            <Timer size={20} className={timeRemaining > 0 && timeRemaining <= 10 ? 'animate-pulse' : ''} />
            <span className="text-xl font-bold tabular-nums">00:{timeRemaining.toString().padStart(2, '0')}</span>
          </div>
        </div>

        <div className="mb-4">
          <Timeline
            totalQuestions={stageQuestions.length}
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