import React, { useState, useEffect } from 'react';
import { Check, Star } from 'lucide-react';
import { StageQuestion } from '../types';
import { audioService } from '../services/audioService';
import confetti from 'canvas-confetti';

interface GameScreenProps {
  question: StageQuestion;
  /** Called with the selected answer's ID (server determines correctness on submit) */
  onAnswer: (answerId: number) => void;
  isLastQuestion: boolean;
}

const GameScreen: React.FC<GameScreenProps> = ({ question, onAnswer, isLastQuestion }) => {
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showSelected, setShowSelected] = useState(false);

  const fireConfetti = () => {
    confetti({ particleCount: 100, spread: 70, origin: { x: 0, y: 0.6 }, angle: 60, colors: ['#B1996C', '#A88A59', '#FFFFFF', '#F7F4EE'] });
    confetti({ particleCount: 100, spread: 70, origin: { x: 1, y: 0.6 }, angle: 120, colors: ['#B1996C', '#A88A59', '#FFFFFF', '#F7F4EE'] });
  };

  const handleSelect = (answerId: number) => {
    if (processing) return;
    setProcessing(true);
    setSelectedAnswerId(answerId);
    setShowSelected(true);
    audioService.playSuccess();

    if (isLastQuestion) {
      setTimeout(() => fireConfetti(), 100);
    }

    setTimeout(() => {
      onAnswer(answerId);
    }, 1500);
  };

  useEffect(() => {
    setSelectedAnswerId(null);
    setProcessing(false);
    setShowSelected(false);
  }, [question.id]);

  const getOptionStyles = (answerId: number) => {
    const isSelected = selectedAnswerId === answerId;
    const base = 'w-full p-4 rounded-xl text-right font-medium text-sm transition-all duration-200 border-2 relative overflow-hidden ';
    if (processing) {
      return isSelected
        ? base + 'bg-app-gold border-app-gold text-white shadow-lg scale-[1.02] z-10'
        : base + 'bg-gray-50 border-transparent text-gray-300 opacity-60';
    }
    return base + 'bg-white border-transparent hover:border-app-card text-app-textSec shadow-sm active:scale-[0.98]';
  };

  return (
    <div className="flex flex-col h-full animate-fadeIn relative">

      {/* Selection overlay */}
      {showSelected && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md rounded-[24px] animate-scaleIn">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-app-gold/20 rounded-full blur-xl animate-pulse" />
            <div className="w-24 h-24 bg-gradient-to-br from-app-gold to-app-goldDark rounded-full flex items-center justify-center shadow-xl border-4 border-white relative z-10">
              <Check size={48} className="text-white drop-shadow-md" strokeWidth={4} />
            </div>
            <Star className="absolute -top-2 -right-2 text-app-goldDark animate-bounce" size={24} fill="currentColor" />
            <Star className="absolute bottom-0 -left-4 text-app-gold animate-bounce delay-100" size={16} fill="currentColor" />
          </div>
          <h2 className="text-3xl font-bold text-app-goldDark mb-2 drop-shadow-sm">تم الاختيار!</h2>
          <p className="text-app-textSec font-medium">
            {isLastQuestion ? 'جاري تقييم إجاباتك...' : 'استمري...'}
          </p>
        </div>
      )}

      {/* Question Card */}
      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#EBE5DA] mb-6 relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-app-gold/5 rounded-full blur-2xl" />
        <h3 className="text-lg md:text-xl font-bold text-center leading-relaxed text-app-text relative z-10">
          {question.text}
        </h3>
      </div>

      {/* Answer options */}
      <div className="flex flex-col gap-3 mb-8">
        {question.answers.map((answer) => (
          <button
            key={answer.id}
            onClick={() => handleSelect(answer.id)}
            disabled={processing}
            className={getOptionStyles(answer.id)}
          >
            <div className="flex items-center justify-between w-full">
              <span>{answer.name}</span>
              {processing && selectedAnswerId === answer.id && (
                <Check size={18} className="animate-pulse" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameScreen;