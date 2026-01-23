
import React, { useState, useMemo, useEffect } from 'react';
import { Gamepad2, Clock, Trophy, Lock, Plus, Edit3, Trash2, X, Check, Save } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Question, GameSettings } from '../../types';

const AdminGame: React.FC = () => {
  const { questions, gameSettings, addQuestion, updateQuestion, deleteQuestion, updateGameSettings } = useData();
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);
  
  // Local state for settings form
  const [localSettings, setLocalSettings] = useState<GameSettings>(gameSettings);

  // Sync local state when context changes
  useEffect(() => {
    setLocalSettings(gameSettings);
  }, [gameSettings]);

  const filteredQuestions = useMemo(() => {
    if (filterDifficulty === 'all') return questions;
    return questions.filter(q => q.difficulty === filterDifficulty);
  }, [questions, filterDifficulty]);

  const openAddModal = () => {
    setEditingQuestion({
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      difficulty: 'easy'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion({ ...q });
    setIsModalOpen(true);
  };

  const handleSaveQuestion = () => {
    if (!editingQuestion || !editingQuestion.text || !editingQuestion.options) return;
    
    // Validate options
    if (editingQuestion.options.some(o => !o.trim())) {
      alert("يرجى ملء جميع الخيارات");
      return;
    }

    if (editingQuestion.id) {
      updateQuestion(editingQuestion as Question);
    } else {
      addQuestion(editingQuestion as Question);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا السؤال؟")) {
      deleteQuestion(id);
    }
  };

  const updateOption = (index: number, value: string) => {
    if (!editingQuestion || !editingQuestion.options) return;
    const newOptions = [...editingQuestion.options];
    newOptions[index] = value;
    setEditingQuestion({ ...editingQuestion, options: newOptions });
  };

  const handleSaveSettings = () => {
    updateGameSettings(localSettings);
    alert('تم حفظ الإعدادات بنجاح');
  };

  const updateReward = (index: number, val: string) => {
    const num = parseInt(val) || 0;
    const newRewards = [...localSettings.stageRewards] as [number, number, number];
    newRewards[index] = num;
    setLocalSettings({ ...localSettings, stageRewards: newRewards });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-app-text">إعدادات مسابقة تريندي</h2>
        <div className="flex items-center gap-2">
           <button 
             onClick={handleSaveSettings}
             className="bg-app-gold text-white px-6 py-2 rounded-xl font-bold hover:bg-app-goldDark flex items-center gap-2 transition-colors"
           >
             <Save size={18} />
             <span>حفظ الإعدادات</span>
           </button>
        </div>
      </div>

      {/* Main Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Stage Rewards */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-app-card/30">
          <div className="flex items-center gap-2 mb-4 text-app-goldDark">
             <Trophy size={20} />
             <h3 className="font-bold">جوائز المراحل</h3>
          </div>
          <div className="space-y-3">
             {[0, 1, 2].map((idx) => (
               <div key={idx} className="flex items-center justify-between bg-app-bg p-3 rounded-xl">
                  <span className="font-bold text-sm">المرحلة {idx + 1}</span>
                  <div className="flex items-center gap-2">
                     <input 
                       type="number" 
                       value={localSettings.stageRewards[idx]} 
                       onChange={(e) => updateReward(idx, e.target.value)}
                       className="w-20 text-center font-bold text-app-text border border-app-card rounded-lg py-1 outline-none focus:border-app-gold" 
                     />
                     <span className="text-xs font-bold text-app-textSec">د.ك</span>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Cooldown Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-app-card/30">
          <div className="flex items-center gap-2 mb-4 text-app-goldDark">
             <Clock size={20} />
             <h3 className="font-bold">التوقيت والانتظار</h3>
          </div>
          <div className="space-y-4">
            <div>
               <label className="block text-xs font-bold text-app-textSec mb-1">وقت الإجابة (ثانية)</label>
               <input 
                 type="number"
                 value={localSettings.timeLimitSeconds}
                 onChange={(e) => setLocalSettings({ ...localSettings, timeLimitSeconds: parseInt(e.target.value) || 20 })}
                 className="w-full p-2 border border-app-card rounded-lg font-bold outline-none focus:border-app-gold"
               />
               <p className="text-[10px] text-app-textSec mt-1">المدة المتاحة للإجابة على كل سؤال</p>
            </div>
            <div>
               <label className="block text-xs font-bold text-app-textSec mb-1">عند الخسارة (دقائق)</label>
               <input 
                 type="number"
                 value={localSettings.cooldownLossMinutes}
                 onChange={(e) => setLocalSettings({ ...localSettings, cooldownLossMinutes: parseInt(e.target.value) || 0 })}
                 className="w-full p-2 border border-app-card rounded-lg font-bold outline-none focus:border-app-gold"
               />
            </div>
            <div>
               <label className="block text-xs font-bold text-app-textSec mb-1">عند الفوز (دقائق)</label>
               <input 
                 type="number"
                 value={localSettings.cooldownWinMinutes}
                 onChange={(e) => setLocalSettings({ ...localSettings, cooldownWinMinutes: parseInt(e.target.value) || 0 })}
                 className="w-full p-2 border border-app-card rounded-lg font-bold outline-none focus:border-app-gold"
               />
            </div>
          </div>
        </div>

        {/* Restrictions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-app-card/30">
          <div className="flex items-center gap-2 mb-4 text-app-goldDark">
             <Lock size={20} />
             <h3 className="font-bold">شروط اللعب</h3>
          </div>
          <div className="space-y-4">
            <div>
               <label className="block text-xs font-bold text-app-textSec mb-1">إيقاف اللعب عند وصول الرصيد إلى</label>
               <input 
                 type="number" 
                 value={localSettings.gameBalanceCap}
                 onChange={(e) => setLocalSettings({ ...localSettings, gameBalanceCap: parseInt(e.target.value) || 40 })}
                 className="w-full p-2 border border-app-card rounded-lg font-bold outline-none focus:border-app-gold" 
               />
            </div>
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl">
               يظهر للعميل: "يجب إنفاق رصيد الجوائز لتتمكني من اللعب"
            </div>
          </div>
        </div>
      </div>

      {/* Questions Manager */}
      <div className="bg-white rounded-2xl shadow-sm border border-app-card/30 overflow-hidden">
        <div className="p-6 border-b border-app-card/30 flex flex-col md:flex-row justify-between items-center gap-4">
           <h3 className="text-lg font-bold text-app-text">بنك الأسئلة</h3>
           <div className="flex items-center gap-4">
              {/* Filter Tabs */}
              <div className="flex bg-app-bg p-1 rounded-xl">
                 {(['all', 'easy', 'medium', 'hard'] as const).map(tab => (
                   <button
                     key={tab}
                     onClick={() => setFilterDifficulty(tab)}
                     className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterDifficulty === tab ? 'bg-white shadow-sm text-app-gold' : 'text-app-textSec hover:text-app-text'}`}
                   >
                     {tab === 'all' ? 'الكل' : tab === 'easy' ? 'سهل' : tab === 'medium' ? 'متوسط' : 'صعب'}
                   </button>
                 ))}
              </div>
              <button onClick={openAddModal} className="bg-app-gold text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-app-goldDark">
                <Plus size={16} />
                <span>إضافة سؤال</span>
              </button>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-app-bg text-app-textSec text-xs font-bold uppercase">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4 w-1/3">نص السؤال</th>
                <th className="px-6 py-4">الصعوبة</th>
                <th className="px-6 py-4">الإجابة الصحيحة</th>
                <th className="px-6 py-4">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-card/30 text-sm">
              {filteredQuestions.map((q) => (
                <tr key={q.id} className="hover:bg-app-bg/50">
                  <td className="px-6 py-4 text-app-textSec">{q.id}</td>
                  <td className="px-6 py-4 font-bold text-app-text">{q.text}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded-lg text-xs font-bold
                       ${q.difficulty === 'easy' ? 'bg-green-100 text-green-600' : 
                         q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}
                     `}>
                        {q.difficulty === 'easy' ? 'سهل' : q.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-green-600 font-medium">
                    {q.options[q.correctAnswer]}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button onClick={() => openEditModal(q)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 size={18} /></button>
                    <button onClick={() => handleDelete(q.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
              {filteredQuestions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-app-textSec">لا توجد أسئلة في هذا التصنيف</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-app-card/30">
              <h3 className="text-xl font-bold text-app-text">
                {editingQuestion.id ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-app-textSec hover:text-red-500">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
               <div>
                  <label className="block text-sm font-bold text-app-text mb-2">نص السؤال</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold"
                    value={editingQuestion.text}
                    onChange={(e) => setEditingQuestion({...editingQuestion, text: e.target.value})}
                  />
               </div>

               <div>
                 <label className="block text-sm font-bold text-app-text mb-2">الصعوبة</label>
                 <select 
                   className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold bg-white"
                   value={editingQuestion.difficulty}
                   onChange={(e) => setEditingQuestion({...editingQuestion, difficulty: e.target.value as any})}
                 >
                   <option value="easy">سهل (المرحلة 1)</option>
                   <option value="medium">متوسط (المرحلة 2)</option>
                   <option value="hard">صعب (المرحلة 3)</option>
                 </select>
               </div>

               <div>
                 <label className="block text-sm font-bold text-app-text mb-2">الخيارات (يجب تعبئة 4 خيارات)</label>
                 <div className="space-y-2">
                   {editingQuestion.options?.map((opt, idx) => (
                     <div key={idx} className="flex items-center gap-2">
                        <div 
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer flex-shrink-0
                             ${editingQuestion.correctAnswer === idx ? 'border-green-500 bg-green-500 text-white' : 'border-app-textSec text-transparent'}
                          `}
                          onClick={() => setEditingQuestion({...editingQuestion, correctAnswer: idx})}
                        >
                          <Check size={14} />
                        </div>
                        <input 
                          type="text"
                          className="flex-1 p-2 border border-app-card rounded-lg outline-none focus:border-app-gold text-sm"
                          placeholder={`الخيار ${idx + 1}`}
                          value={opt}
                          onChange={(e) => updateOption(idx, e.target.value)}
                        />
                     </div>
                   ))}
                 </div>
                 <p className="text-xs text-app-textSec mt-2">* انقر على الدائرة لتحديد الإجابة الصحيحة</p>
               </div>
            </div>

            <div className="p-6 border-t border-app-card/30 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-6 py-3 font-bold text-app-textSec hover:bg-gray-200 rounded-xl"
              >
                إلغاء
              </button>
              <button 
                onClick={handleSaveQuestion} 
                className="px-8 py-3 bg-app-gold text-white font-bold rounded-xl hover:bg-app-goldDark"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGame;