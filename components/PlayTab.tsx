import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GameState, StageQuestion, CollectedAnswer } from '../types';
import { STORAGE_KEYS } from '../constants';
import { useGetCompetitionStages } from './requests/useGetCompetitionStages';
import { useStartStage, classifyStartFailure } from './requests/useStartStage';
import { useSubmitAttempt } from './requests/useSubmitAttempt';
import { useWithdrawCompetition } from './requests/useWithdrawCompetition';
import { useResumeAttempt } from './requests/useResumeAttempt';
import { toast } from 'sonner';
import { Trophy, Play, Clock, Lock, CheckCircle2, Timer, AlertCircle, LogOut, Loader2, ChevronLeft, Coins } from 'lucide-react';
import { audioService } from '../services/audioService';
import GameScreen from './GameScreen';
import Timeline from './Timeline';
import { useData } from '../context/DataContext';
import { useGetProfile } from './requests/useGetProfile';
import { formatDinars, formatPoints, pointsToDinars, readWallet } from '../lib/points';
import { getApiErrorMessage } from '../lib/apiTypes';

const INTERNAL_STORAGE_KEY = STORAGE_KEYS.GAME_STATE;

/**
 * Where the player is in the current run.
 *
 * Only the position is kept locally — the pot itself is the server's number.
 * Losing this (cleared cache, second device) costs nothing: the run resumes
 * from stage 1 and the API says `stage_locked` if that is wrong.
 */
interface RunPosition {
  stageIndex: number;
  questionIndex: number;
  clearedStageIndexes: number[];
}

const EMPTY_RUN: RunPosition = { stageIndex: 0, questionIndex: 0, clearedStageIndexes: [] };

interface PlayTabProps {
  onCreditWallet: (amount: number) => void;
}

const PlayTab: React.FC<PlayTabProps> = ({ onCreditWallet }) => {
  const { gameSettings: localGameSettings } = useData();

  const {
    data: competitionData,
    isLoading: stagesLoading,
    isError: stagesError,
  } = useGetCompetitionStages();

  // No static fallback. The old `?? GAME_STAGES` showed three invented stages
  // whenever the API was slow or failed — stages that do not exist server-side,
  // so tapping one could only fail.
  const gameStages = competitionData?.stages ?? [];

  // Competition rules belong to the server; the local context only fills in
  // values the API does not send.
  const serverSettings = competitionData?.settings;
  const gameSettings = useMemo(() => ({
    ...localGameSettings,
    timeLimitSeconds: serverSettings?.competition_question_time ?? localGameSettings.timeLimitSeconds,
    // null from the server means "no cap"; Infinity disables the gate without
    // special-casing every comparison below.
    gameBalanceCap: serverSettings?.game_balance_cap ?? Infinity,
  }), [serverSettings, localGameSettings]);

  const { data: profileData } = useGetProfile('ar');
  const wallet = readWallet(profileData);

  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [run, setRun] = useState<RunPosition>(EMPTY_RUN);

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

  /**
   * The pot. Server-owned, but updated locally the moment a stage settles so
   * the number does not lag a refetch.
   */
  const [pendingPoints, setPendingPoints] = useState(0);
  /** `sort_by` of the stage to play next, from the last cleared submit. */
  const [nextStage, setNextStage] = useState<number | null>(null);
  /** Epoch ms until a timed refusal expires — a loss lockout or a replay wait. */
  const [waitUntil, setWaitUntil] = useState<number | null>(null);
  /** What just happened, for the end-of-run screens. */
  const [lastResult, setLastResult] = useState<
    | { kind: 'forfeited'; points: number; correct: number; total: number }
    | { kind: 'banked'; points: number; stages: number }
    | null
  >(null);
  const [notice, setNotice] = useState<string | null>(null);

  const startStageMutation = useStartStage();
  const submitAttemptMutation = useSubmitAttempt();
  const withdrawMutation = useWithdrawCompetition();
  const resumeAttemptMutation = useResumeAttempt();

  /**
   * An attempt the server still holds open.
   *
   * Set whenever we learn of one — either the local timer expired with nothing
   * submittable, or `start` refused with `attempt_active`. While this is set,
   * the server rejects both starting a stage and withdrawing, so the only way
   * forward is to reload it via `attempts/{id}/questions`.
   */
  const [activeAttempt, setActiveAttempt] = useState<{ attemptId: number; stageId: number | null } | null>(null);

  const isBalanceCapped = wallet.points >= gameSettings.gameBalanceCap;

  // Clock tick
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Restore the run position. The pot and the lockout come from the server.
  useEffect(() => {
    const stored = localStorage.getItem(INTERNAL_STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed.stageIndex === 'number') {
        setRun({
          stageIndex: parsed.stageIndex ?? 0,
          questionIndex: parsed.questionIndex ?? 0,
          clearedStageIndexes: Array.isArray(parsed.clearedStageIndexes) ? parsed.clearedStageIndexes : [],
        });
      }
    } catch {
      localStorage.removeItem(INTERNAL_STORAGE_KEY);
    }
  }, []);

  const saveRun = useCallback((next: RunPosition) => {
    setRun(next);
    localStorage.setItem(INTERNAL_STORAGE_KEY, JSON.stringify(next));
  }, []);

  const resetRun = useCallback(() => {
    setRun(EMPTY_RUN);
    localStorage.removeItem(INTERNAL_STORAGE_KEY);
  }, []);

  // Adopt the server's run state whenever the stages endpoint answers. This is
  // what restores a run in progress after a reload or on another device.
  useEffect(() => {
    if (!competitionData) return;

    setPendingPoints(competitionData.pendingPoints);

    if (competitionData.blockedUntil && competitionData.blockedUntil > Date.now()) {
      setWaitUntil(competitionData.blockedUntil);
      setGameState((s) => (s === GameState.PLAYING ? s : GameState.LOST_COOLDOWN));
    }
  }, [competitionData]);

  // Clear a wait once it expires.
  useEffect(() => {
    if (waitUntil === null || now < waitUntil) return;
    setWaitUntil(null);
    setGameState((s) => (s === GameState.PLAYING ? s : GameState.IDLE));
  }, [now, waitUntil]);

  const isTimerRunning =
    gameState === GameState.PLAYING && !showMilestoneModal && !isSubmitting && !isStartingStage;

  /**
   * Always the current render's `handleTimeout`.
   *
   * The interval used to call it from inside a `setTimeRemaining` updater,
   * which both ran side effects during a state update and captured
   * `collectedAnswers`/`pendingPoints` as they were when the effect last ran —
   * so the forfeit screen reported stale counts. A ref keeps the callback
   * fresh without resubscribing the interval every second.
   */
  const handleTimeoutRef = useRef<() => void>(() => { });

  // The interval now only decrements. No side effects inside the updater.
  useEffect(() => {
    if (!isTimerRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = window.setInterval(() => {
      setTimeRemaining((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerRunning]);

  // Ticking and expiry are consequences of the value, not of the update.
  useEffect(() => {
    if (!isTimerRunning) return;
    if (timeRemaining > 0) {
      audioService.playTick();
      return;
    }
    handleTimeoutRef.current();
  }, [timeRemaining, isTimerRunning]);

  const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

  /** The stage the ladder expects next, as an index into `gameStages`. */
  const nextStageIndex = useMemo(() => {
    if (nextStage === null) return null;
    const idx = gameStages.findIndex((s: any) => s.sortBy === nextStage);
    return idx >= 0 ? idx : null;
  }, [nextStage, gameStages]);

  /**
   * Sends an attempt's answers and applies whatever the server decides.
   *
   * Shared by the normal end-of-stage path and by the timeout path so a
   * timeout is settled server-side exactly like any other finish — the client
   * never decides the outcome on its own.
   */
  const submitAnswers = (attemptId: number, answers: CollectedAnswer[]) => {
    setIsSubmitting(true);

    submitAttemptMutation.mutate({ attemptId, answers }, {
      onSuccess: (result) => {
        setIsSubmitting(false);
        setPendingPoints(result.pendingPoints);
        // Settled server-side, so nothing is left open.
        setActiveAttempt(null);

        // A loss arrives as HTTP 200 — it is a game outcome, not a failure.
        if (!result.cleared) {
          audioService.playFailure();
          setLastResult({
            kind: 'forfeited',
            points: result.pointsForfeited,
            correct: result.attempt?.correct_answers ?? 0,
            total: result.attempt?.total_questions ?? stageQuestions.length,
          });
          if (result.blockedUntilMs) setWaitUntil(result.blockedUntilMs);
          resetRun();
          setGameState(GameState.LOST_COOLDOWN);
          return;
        }

        audioService.playSuccess();
        setNextStage(result.nextStage);
        saveRun({
          ...run,
          clearedStageIndexes: [...new Set([...run.clearedStageIndexes, run.stageIndex])],
        });
        // Stage cleared: the points are staked, not banked. The player now
        // chooses to leave with the pot or risk it on the next stage.
        setShowMilestoneModal(true);
      },
      onError: () => {
        setIsSubmitting(false);
        toast.error('تعذّر إرسال إجاباتك. يرجى المحاولة مجدداً.');
        // The attempt is still open server-side, so keep a way back to it
        // rather than dropping the player onto a screen that cannot act.
        if (attemptId) {
          setActiveAttempt({ attemptId, stageId: gameStages[run.stageIndex]?.id ?? null });
        }
        setGameState(GameState.IDLE);
      },
    });
  };

  /**
   * The local timer reached zero.
   *
   * A local clock expiring proves nothing about the server: the attempt is
   * still `in_progress` there, and while it is, the API refuses both `start`
   * (`attempt_active`) and `withdraw` (`competition_withdraw_mid_stage`).
   * Treating the timeout as final — as this used to — stranded the player with
   * no way to start, withdraw or resume.
   */
  const handleTimeout = () => {
    stopTimer();

    // `answers` is validated `required|array|min:1`, so an attempt where
    // nothing was answered cannot be submitted at all.
    if (currentAttemptId && collectedAnswers.length > 0) {
      submitAnswers(currentAttemptId, collectedAnswers);
      return;
    }

    audioService.playFailure();

    if (currentAttemptId) {
      // Nothing submittable — leave it open and offer to resume it.
      setActiveAttempt({ attemptId: currentAttemptId, stageId: gameStages[run.stageIndex]?.id ?? null });
      setNotice('انتهى وقت السؤال قبل تسجيل أي إجابة. يمكنكِ متابعة المحاولة المفتوحة.');
      setGameState(GameState.IDLE);
      return;
    }

    setLastResult({ kind: 'forfeited', points: pendingPoints, correct: collectedAnswers.length, total: stageQuestions.length });
    setPendingPoints(0);
    resetRun();
    setGameState(GameState.LOST_COOLDOWN);
  };

  // Assigned after the definition above: `handleTimeout` is a `const`, so
  // touching it earlier in the render would hit the temporal dead zone.
  handleTimeoutRef.current = handleTimeout;

  /** Reload an attempt the server still has open and drop the player back into it. */
  const handleResumeAttempt = () => {
    if (!activeAttempt || resumeAttemptMutation.isPending) return;

    resumeAttemptMutation.mutate(activeAttempt.attemptId, {
      onSuccess: (data) => {
        setStageQuestions(data.questions);
        setCurrentAttemptId(data.attemptId);
        setCollectedAnswers([]);
        setTimeRemaining(data.questionTime ?? gameSettings.timeLimitSeconds);
        questionStartTimeRef.current = Date.now();
        setNotice(null);
        setActiveAttempt(null);

        // Point the local run at the stage the attempt actually belongs to, so
        // the header and stage cards do not describe a different stage.
        const idx = activeAttempt.stageId !== null
          ? gameStages.findIndex((s: any) => s.id === activeAttempt.stageId)
          : -1;
        saveRun({ ...run, stageIndex: idx >= 0 ? idx : run.stageIndex, questionIndex: 0 });

        setGameState(GameState.PLAYING);
      },
      onError: (error) => {
        // 422 here means it finished elsewhere; 404 that it is gone. Either way
        // the block is lifted, so clear it and let the player start again.
        setActiveAttempt(null);
        setNotice(null);
        setGameState(GameState.IDLE);
        toast.error(getApiErrorMessage(error) || 'تعذّر استئناف المحاولة. يمكنكِ بدء جولة جديدة.');
      },
    });
  };

  const handleStartFailure = (error: unknown) => {
    const failure = classifyStartFailure(error);
    setShowMilestoneModal(false);

    switch (failure.kind) {
      case 'blocked':
      case 'cooldown': {
        // The server owns this clock; drive the countdown from its deadline.
        setWaitUntil(failure.untilMs ?? Date.now() + failure.remainingMinutes * 60_000);
        setGameState(GameState.LOST_COOLDOWN);
        break;
      }
      case 'restart': {
        // Not an error: a finished run relocks the ladder, so the next run has
        // to begin at stage 1.
        resetRun();
        setPendingPoints(0);
        setGameState(GameState.IDLE);
        setNotice('انتهت الجولة السابقة، والجولة الجديدة تبدأ من المرحلة الأولى.');
        break;
      }
      case 'attemptActive': {
        // Recoverable, not a dead end: the payload names the open attempt, so
        // surface a resume action instead of telling the player to finish
        // something they have no way to reach.
        setGameState(GameState.IDLE);
        if (failure.attemptId) {
          setActiveAttempt({ attemptId: failure.attemptId, stageId: failure.stageId });
          setNotice('لديكِ محاولة مفتوحة. تابعيها للمتابعة أو لإنهائها.');
        } else {
          setNotice(failure.message || 'لديكِ محاولة مفتوحة بالفعل، أكمليها أولاً.');
        }
        break;
      }
      default: {
        setGameState(GameState.IDLE);
        toast.error(failure.message || 'تعذّر بدء المرحلة. يرجى المحاولة مجدداً.');
      }
    }
  };

  const launchStage = (stageIndex: number, onDone?: () => void) => {
    const stageId = gameStages[stageIndex]?.id;
    if (!stageId) return;
    setIsStartingStage(true);
    setNotice(null);
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
      onError: (error) => {
        setIsStartingStage(false);
        handleStartFailure(error);
      },
    });
  };

  const startGame = () => {
    if (isBalanceCapped) return;
    // Starting anything new is refused while an attempt is open; resume it
    // instead of firing a request that can only come back as `attempt_active`.
    if (activeAttempt) { handleResumeAttempt(); return; }
    if (waitUntil && now < waitUntil) { setGameState(GameState.LOST_COOLDOWN); return; }

    setLastResult(null);
    // A pot in flight means a run is still open — resume where it left off.
    const resumeAt = pendingPoints > 0 ? run.stageIndex : 0;

    launchStage(resumeAt, () => {
      saveRun({ ...run, stageIndex: resumeAt, questionIndex: 0 });
      setGameState(GameState.PLAYING);
      audioService.playSuccess();
    });
  };

  const handleAnswer = (answerId: number) => {
    const timeSpent = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
    const currentQ = stageQuestions[run.questionIndex];
    if (!currentQ) return;

    const newCollected = [...collectedAnswers, {
      competition_question_id: currentQ.id,
      competition_answer_id: answerId,
      time_spent_seconds: timeSpent,
    } as CollectedAnswer];
    setCollectedAnswers(newCollected);

    const nextIdx = run.questionIndex + 1;

    if (nextIdx < stageQuestions.length) {
      setTimeRemaining(gameStages[run.stageIndex]?.questionTime ?? gameSettings.timeLimitSeconds);
      questionStartTimeRef.current = Date.now();
      saveRun({ ...run, questionIndex: nextIdx });
      return;
    }

    stopTimer();
    submitAnswers(currentAttemptId as number, newCollected);
  };

  /** Continue the ladder — stake the pot on the next stage. */
  const onContinue = () => {
    if (nextStageIndex === null) return;
    launchStage(nextStageIndex, () => {
      saveRun({ ...run, stageIndex: nextStageIndex, questionIndex: 0 });
      setShowMilestoneModal(false);
      setGameState(GameState.PLAYING);
    });
  };

  /** Leave — bank the pot into the wallet. */
  const handleWithdraw = () => {
    stopTimer();
    withdrawMutation.mutate(undefined, {
      onSuccess: (data) => {
        audioService.playSuccess();
        setLastResult({ kind: 'banked', points: data.points_withdrawn, stages: data.stages_banked });
        setPendingPoints(data.pending_points ?? 0);
        setShowMilestoneModal(false);
        resetRun();
        setGameState(GameState.WON_DAILY);
        onCreditWallet(data.points_withdrawn);
      },
      onError: (error) => {
        const failure = classifyStartFailure(error);
        // Withdrawing is refused outright while a stage is open, so say that
        // plainly rather than repeating a generic failure.
        if (failure.kind === 'attemptActive') {
          toast.error('لا يمكن الانسحاب أثناء مرحلة مفتوحة. أنهي المحاولة الحالية أولاً.');
          return;
        }
        toast.error(failure.message || 'تعذّر تحويل النقاط. يرجى المحاولة مجدداً.');
      },
    });
  };

  /** `mm:ss` for the per-question timer; stage `question_time` may exceed 59s. */
  const formatClock = (totalSeconds: number) => {
    const s = Math.max(0, Math.floor(totalSeconds));
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return '00:00:00';
    const s = Math.floor(ms / 1000);
    return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };

  const waitText = waitUntil ? formatCountdown(waitUntil - now) : null;

  const renderStageCards = () => (
    <div className="grid grid-cols-3 gap-3 w-full mb-6">
      {gameStages.map((stage: any, idx: number) => {
        const isCleared = run.clearedStageIndexes.includes(idx);
        return (
          <div key={stage.id ?? idx} className={`relative flex flex-col items-center justify-center p-2 rounded-2xl border transition-all aspect-square ${isCleared ? 'bg-white border-app-gold shadow-md' : 'bg-[#EBE5DA]/50 border-transparent'}`}>
            <div className={`p-1.5 rounded-full mb-1 ${isCleared ? 'bg-app-gold text-white' : 'bg-gray-200 text-gray-400'}`}>
              {isCleared ? <CheckCircle2 size={14} /> : <Lock size={14} />}
            </div>
            <span className={`text-[10px] font-bold ${isCleared ? 'text-app-text' : 'text-gray-400'}`}>{stage.rewardName}</span>
            <span className="text-[8px] text-gray-400 mt-0.5">{stage.name}</span>
          </div>
        );
      })}
    </div>
  );

  /** The pot, shown wherever a run is live. */
  const renderPot = () => (
    <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-app-gold/30 mb-6 text-center animate-fadeIn">
      <span className="text-sm font-medium text-app-textSec mb-1 flex items-center justify-center gap-1">
        <Coins size={14} className="text-app-gold" /> النقاط المعرّضة للخطر
      </span>
      <div className="text-3xl font-bold text-app-gold mb-1 font-alexandria">{formatPoints(pendingPoints)}</div>
      <span className="text-[10px] text-gray-400">
        تساوي {formatDinars(pointsToDinars(pendingPoints, wallet.rate))} — لن تُضاف إلى رصيدك حتى تنسحبي
      </span>
    </div>
  );

  // --- RENDER ---

  if (stagesLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-6 font-alexandria">
        <Loader2 size={40} className="text-app-gold animate-spin mb-4" />
        <p className="text-app-textSec font-medium">جاري تحميل المسابقة...</p>
      </div>
    );
  }

  if (stagesError || gameStages.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-6 font-alexandria">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">المسابقة غير متاحة حالياً</h2>
        <p className="text-app-textSec">يرجى المحاولة لاحقاً.</p>
      </div>
    );
  }

  if (gameState === GameState.IDLE) {
    return (
      <div className="flex flex-col h-full px-6 pt-8 pb-24 overflow-y-auto no-scrollbar font-alexandria">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-app-goldDark mb-1">مسابقة تريندي</h1>
          <p className="text-app-textSec text-sm">أجيبي على الأسئلة واجمعي النقاط</p>
        </header>

        <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-[#EBE5DA] mb-6 text-center animate-fadeIn flex flex-col items-center justify-center">
          <span className="text-sm font-medium text-app-textSec mb-1">رصيدك من النقاط</span>
          <div className="text-3xl font-bold text-app-gold mb-1 font-alexandria">{formatPoints(wallet.points)}</div>
          <span className="text-[10px] text-gray-400">تساوي {formatDinars(wallet.dinars)}</span>
        </div>

        {pendingPoints > 0 && renderPot()}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EBE5DA] flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 bg-app-bg rounded-full flex items-center justify-center mb-4 text-app-gold shadow-inner"><Trophy size={40} /></div>
          <h2 className="text-xl font-bold text-app-text mb-2">هل أنتِ مستعدة؟</h2>
          <p className="text-sm text-app-textSec mb-2 leading-relaxed">
            لديكِ {gameStages.length} مراحل، و{gameSettings.timeLimitSeconds} ثانية لكل سؤال.
          </p>
          <p className="text-xs text-app-textSec mb-6 leading-relaxed">
            كل مرحلة تجتازينها تضيف نقاطاً إلى رصيد الجولة، ويمكنكِ الانسحاب في أي وقت لتحويلها إلى رصيدك.
            <span className="block text-red-500 font-bold mt-1">إجابة خاطئة واحدة تُفقدكِ نقاط الجولة كاملة.</span>
          </p>
          {renderStageCards()}
        </div>

        {/* An attempt is open server-side: resuming is the only way forward,
            since both starting and withdrawing are refused until it settles. */}
        {activeAttempt && (
          <div className="mb-3 bg-white border-2 border-app-gold rounded-2xl p-4 animate-fadeIn">
            <p className="text-sm font-bold text-app-goldDark mb-1">لديكِ محاولة غير مكتملة</p>
            <p className="text-xs text-app-textSec mb-3 leading-relaxed">
              لا يمكن بدء مرحلة جديدة أو الانسحاب قبل إنهائها.
            </p>
            <button
              onClick={handleResumeAttempt}
              disabled={resumeAttemptMutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-app-gold text-white font-bold py-3.5 rounded-2xl active:scale-95 transition-transform disabled:opacity-60"
            >
              {resumeAttemptMutation.isPending
                ? <Loader2 size={18} className="animate-spin" />
                : <><Play fill="currentColor" size={16} /><span>متابعة المحاولة</span></>}
            </button>
          </div>
        )}

        {pendingPoints > 0 && !activeAttempt && (
          <button
            onClick={handleWithdraw}
            disabled={withdrawMutation.isPending}
            className="mb-3 w-full flex items-center justify-center gap-2 bg-white text-app-gold border-2 border-app-gold font-bold py-3.5 rounded-2xl active:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {withdrawMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} className="rotate-180" />}
            <span>الانسحاب وتحويل {formatPoints(pendingPoints)}</span>
          </button>
        )}

        <button
          onClick={startGame}
          hidden={!!activeAttempt}
          disabled={isBalanceCapped || isStartingStage || !!activeAttempt}
          className={`font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform ${isBalanceCapped ? 'bg-gray-300 text-white cursor-not-allowed shadow-none' : 'bg-app-gold active:bg-app-goldDark text-white shadow-app-gold/30 active:scale-95'}`}
        >
          {isStartingStage ? <Loader2 size={20} className="animate-spin" /> : isBalanceCapped ? <Lock size={20} /> : <Play fill="currentColor" size={20} />}
          <span>{isStartingStage ? 'جاري التحميل...' : pendingPoints > 0 ? 'متابعة الجولة' : 'ابدئي اللعب الآن'}</span>
        </button>

        {isBalanceCapped && <p className="text-red-500 text-xs font-bold mt-3 text-center animate-fadeIn">يجب انفاق رصيد النقاط لتتمكني من اللعب</p>}
        {notice && <p className="text-app-goldDark text-xs font-bold mt-3 text-center animate-fadeIn">{notice}</p>}
      </div>
    );
  }

  if (gameState === GameState.LOST_COOLDOWN) {
    const forfeited = lastResult?.kind === 'forfeited' ? lastResult : null;
    return (
      <div className="flex flex-col h-full px-6 pt-12 items-center justify-center pb-24 text-center animate-fadeIn font-alexandria">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-400"><Clock size={48} /></div>
        <h2 className="text-2xl font-bold text-app-text mb-2">انتهت الجولة</h2>
        <p className="text-app-textSec mb-2 px-4">
          {forfeited && forfeited.total > 0
            ? 'يجب الإجابة على جميع الأسئلة بشكل صحيح لاجتياز المرحلة.'
            : 'للأسف إجابتك كانت خاطئة أو انتهى الوقت.'}
        </p>
        {forfeited && forfeited.total > 0 && (
          <p className="text-app-goldDark font-bold mb-2 tabular-nums" dir="ltr">
            {forfeited.correct} / {forfeited.total}
          </p>
        )}
        {forfeited && forfeited.points > 0 && (
          <p className="text-red-500 font-bold text-sm mb-6">خسرتِ {formatPoints(forfeited.points)} من هذه الجولة</p>
        )}

        {waitText && (
          <div className="bg-app-card w-full p-6 rounded-2xl border border-app-gold/20 mb-8">
            <p className="text-sm font-bold text-app-textSec mb-2">يمكنكِ اللعب مجدداً بعد</p>
            <p className="text-3xl font-bold text-app-goldDark tabular-nums" dir="ltr">{waitText}</p>
          </div>
        )}

        <button disabled className="bg-gray-300 text-white font-bold py-4 px-8 rounded-2xl w-full cursor-not-allowed flex items-center justify-center gap-2">
          <Lock size={18} /><span>اللعبة مقفلة مؤقتاً</span>
        </button>
        <p className="text-[11px] text-app-textSec mt-4">النقاط المحوّلة إلى رصيدك سابقاً في أمان ولا تتأثر.</p>
      </div>
    );
  }

  if (gameState === GameState.WON_DAILY) {
    const banked = lastResult?.kind === 'banked' ? lastResult : null;
    return (
      <div className="flex flex-col h-full px-6 pt-12 items-center justify-center pb-24 text-center animate-fadeIn font-alexandria">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-500 animate-bounce"><Trophy size={48} /></div>
        <h2 className="text-2xl font-bold text-app-text mb-2">تهانينا!</h2>
        <p className="text-app-textSec mb-8">
          {banked
            ? <>تم تحويل {formatPoints(banked.points)} إلى رصيدك بعد اجتياز {banked.stages} مرحلة.</>
            : <>تم تحويل نقاط الجولة إلى رصيدك.</>}
          <span className="text-xs text-app-gold font-bold mt-2 block">النقاط الآن في رصيدك ويمكن استخدامها في الطلبات</span>
        </p>

        {waitText && (
          <div className="bg-app-card w-full p-6 rounded-2xl border border-app-gold/20 mb-8">
            <p className="text-sm font-bold text-app-textSec mb-2">يمكنكِ اللعب مجدداً بعد</p>
            <p className="text-3xl font-bold text-app-goldDark tabular-nums" dir="ltr">{waitText}</p>
          </div>
        )}

        <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-[#EBE5DA] mt-2 flex flex-col items-center justify-center animate-scaleIn">
          <span className="text-sm font-bold text-app-textSec mb-1">رصيدك من النقاط</span>
          <div className="text-3xl font-bold text-app-gold font-alexandria">{formatPoints(wallet.points)}</div>
          <span className="text-[10px] text-gray-400">تساوي {formatDinars(wallet.dinars)}</span>
        </div>

        <button
          onClick={() => { setLastResult(null); setGameState(GameState.IDLE); }}
          className="mt-6 text-app-gold font-bold border border-app-gold px-6 py-3 rounded-2xl active:scale-95 transition-transform w-full"
        >
          العودة للمسابقة
        </button>
      </div>
    );
  }

  if (isStartingStage || isSubmitting) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-6 font-alexandria">
        <Loader2 size={40} className="text-app-gold animate-spin mb-4" />
        <p className="text-app-textSec font-medium">{isSubmitting ? 'جاري إرسال إجاباتك...' : 'جاري تحميل المرحلة...'}</p>
      </div>
    );
  }

  const currentQuestion = stageQuestions[run.questionIndex];
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

  const currentStage = gameStages[run.stageIndex];
  const nextStageName = nextStageIndex !== null ? gameStages[nextStageIndex]?.rewardName ?? '' : '';
  const isLastQuestion = run.questionIndex === stageQuestions.length - 1;

  return (
    <div className="flex flex-col h-full pt-4 px-4 pb-24 overflow-hidden relative font-alexandria">

      {/* Cleared a stage: bank the pot, or stake it on the next one */}
      {showMilestoneModal && (
        <div className="absolute inset-0 z-[100] bg-app-bg/95 flex items-center justify-center p-6 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[32px] p-8 shadow-2xl border border-app-gold/30 flex flex-col items-center text-center max-w-sm w-full animate-scaleIn">
            <div className="w-20 h-20 bg-app-gold/10 rounded-full flex items-center justify-center mb-6 text-app-gold"><Trophy size={40} /></div>
            <h3 className="text-xl font-bold text-app-goldDark mb-2 leading-tight">أحسنتِ! اجتزتِ المرحلة</h3>
            <p className="text-2xl font-bold text-app-gold mb-4">{formatPoints(pendingPoints)}</p>

            <p className="text-app-text text-sm mb-6 leading-relaxed font-medium">
              {nextStageIndex !== null
                ? <>هل تريدين الانسحاب وتحويل النقاط إلى رصيدك، أم المخاطرة بها في المرحلة التالية {nextStageName}؟</>
                : <>هذه آخر مرحلة — يمكنكِ الآن تحويل النقاط إلى رصيدك.</>}
            </p>
            {nextStageIndex !== null && (
              <p className="text-red-500 font-bold text-xs mb-8">ملاحظة: إذا خسرتي تخسرين نقاط الجولة كاملة</p>
            )}

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={handleWithdraw}
                disabled={withdrawMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-white text-app-gold border-2 border-app-gold font-bold py-3.5 rounded-2xl active:bg-gray-50 transition-colors disabled:opacity-60"
              >
                {withdrawMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <><span>انسحاب</span><LogOut size={18} className="rotate-180" /></>}
              </button>
              {nextStageIndex !== null && (
                <button
                  onClick={onContinue}
                  disabled={isStartingStage}
                  className="w-full flex items-center justify-center gap-2 bg-app-gold text-white font-bold py-4 rounded-2xl shadow-lg shadow-app-gold/30 active:bg-app-goldDark transition-transform active:scale-95 disabled:opacity-60"
                >
                  {isStartingStage ? <Loader2 size={18} className="animate-spin" /> : <><span>أكملي التحدي</span><ChevronLeft size={20} /></>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-app-goldDark">{currentStage?.name}</h2>
          <span className="text-xs text-app-textSec flex items-center gap-1">
            <Coins size={12} className="text-app-gold" /> رصيد الجولة: {formatPoints(pendingPoints)}
          </span>
        </div>
        <div className="bg-app-card px-3 py-1 rounded-lg">
          <span className="text-xs font-bold text-app-text">{run.questionIndex + 1} / {stageQuestions.length}</span>
        </div>
      </div>

      <div className="flex-1 mt-0 flex flex-col min-h-0">
        <div className="flex justify-center mb-2">
          <div className={`flex items-center gap-2 px-6 py-2 rounded-2xl border-2 transition-colors duration-300 ${timeRemaining === 0 ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-app-gold/20 text-app-goldDark'}`}>
            <Timer size={20} className={timeRemaining > 0 && timeRemaining <= 10 ? 'animate-pulse' : ''} />
            <span className="text-xl font-bold tabular-nums">{formatClock(timeRemaining)}</span>
          </div>
        </div>

        <div className="mb-4">
          <Timeline totalQuestions={stageQuestions.length} currentQuestionIndex={run.questionIndex} />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <GameScreen question={currentQuestion} onAnswer={handleAnswer} isLastQuestion={isLastQuestion} />
        </div>
      </div>
    </div>
  );
};

export default PlayTab;
