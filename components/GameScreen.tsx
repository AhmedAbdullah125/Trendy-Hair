import React, { useState, useEffect } from 'react';
import { Check, Star, X } from 'lucide-react';
import { Question } from '../types';
import { audioService } from '../services/audioService';
import confetti from 'canvas-confetti';

interface GameScreenProps {
  question: Question;
  onAnswer: (isCorrect: boolean) => void;
  isLastQuestion: boolean;
}

const GameScreen: React.FC<GameScreenProps> = ({ question, onAnswer, isLastQuestion }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const fireConfetti = () => {
    // Spray from left
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0, y: 0.6 },
      angle: 60,
      colors: ['#B1996C', '#A88A59', '#FFFFFF', '#F7F4EE']
    });
    // Spray from right
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 1, y: 0.6 },
      angle: 120,
      colors: ['#B1996C', '#A88A59', '#FFFFFF', '#F7F4EE']
    });
  };

  const handleSelect = (index: number) => {
    if (processing) return; // Lock selection
    setProcessing(true);
    setSelectedOption(index);

    const isCorrect = index === question.correctAnswer;

    if (isCorrect) {
      // Correct Answer Logic
      audioService.playSuccess();
      setShowSuccess(true); // Show Premium Success Overlay

      // Trigger Celebration if last question of stage
      if (isLastQuestion) {
        setTimeout(() => fireConfetti(), 100);
      }

      // Smooth delay before advancing
      setTimeout(() => {
        onAnswer(true);
      }, 2000);
    } else {
      // Incorrect Answer Logic
      // We show the red error state on the button for a brief moment before failing
      setTimeout(() => {
        onAnswer(false);
      }, 1000);
    }
  };

  useEffect(() => {
     // Reset state when question changes
     setSelectedOption(null);
     setShowSuccess(false);
     setProcessing(false);
  }, [question.id]);

  const getOptionStyles = (index: number) => {
    const isSelected = selectedOption === index;
    const isCorrect = index === question.correctAnswer;

    // Base style
    let styles = "w-full p-4 rounded-xl text-right font-medium text-sm transition-all duration-200 border-2 relative overflow-hidden ";

    if (processing) {
      if (isSelected) {
        if (isCorrect) {
          return styles + "bg-app-gold border-app-gold text-white shadow-lg scale-[1.02] z-10";
        } else {
          return styles + "bg-red-500 border-red-500 text-white shadow-lg scale-[1.02] z-10";
        }
      } else {
        return styles + "bg-gray-50 border-transparent text-gray-300 opacity-60";
      }
    } else {
      return styles + "bg-white border-transparent hover:border-app-card text-app-textSec shadow-sm active:scale-[0.98]";
    }
  };

  return (
    <div className="flex flex-col h-full animate-fadeIn relative">
      
      {/* Premium Success Overlay */}
      {showSuccess && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md rounded-[24px] animate-scaleIn">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-app-gold/20 rounded-full blur-xl animate-pulse"></div>
            <div className="w-24 h-24 bg-gradient-to-br from-app-gold to-app-goldDark rounded-full flex items-center justify-center shadow-xl border-4 border-white relative z-10">
              <Check size={48} className="text-white drop-shadow-md" strokeWidth={4} />
            </div>
            {/* Decorative Stars */}
            <Star className="absolute -top-2 -right-2 text-app-goldDark animate-bounce" size={24} fill="currentColor" />
            <Star className="absolute bottom-0 -left-4 text-app-gold animate-bounce delay-100" size={16} fill="currentColor" />
          </div>
          
          <h2 className="text-3xl font-bold text-app-goldDark mb-2 drop-shadow-sm">إجابة صحيحة!</h2>
          <p className="text-app-textSec font-medium">أحسنت، استمر هكذا</p>
        </div>
      )}

      {/* Question Card */}
      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#EBE5DA] mb-6 relative overflow-hidden">
        {/* Subtle decorative background element */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-app-gold/5 rounded-full blur-2xl"></div>
        <h3 className="text-lg md:text-xl font-bold text-center leading-relaxed text-app-text relative z-10">
          {question.text}
        </h3>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3 mb-8">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isWrong = processing && isSelected && index !== question.correctAnswer;
          
          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={processing}
              className={getOptionStyles(index)}
            >
              <div className="flex items-center justify-between w-full">
                <span>{option}</span>
                {/* Visual feedback icon inside button */}
                {processing && isSelected && (
                   isWrong ? <X size={18} className="animate-pulse" /> : <Check size={18} className="animate-pulse" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GameScreen;