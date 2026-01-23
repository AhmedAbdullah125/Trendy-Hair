import React, { useState, useRef, useEffect } from 'react';
import { CalendarDays, ChevronRight, CheckCircle2, ChevronLeft, Clock, Calendar, Info, Trash2 } from 'lucide-react';

type AppointmentView = 'list' | 'booking';

interface Appointment {
  reason: string;
  date: string;
  time: string;
}

const STORAGE_KEY = 'trandy_hair_appointment';

const AppointmentsTab: React.FC = () => {
  const [view, setView] = useState<AppointmentView>('list');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  
  // Form State
  const [reason, setReason] = useState<string>('علاجات شعر');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');

  // Calendar State
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const reasons = ['علاجات شعر', 'متابعة', 'استشارة'];

  // Load appointment from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setActiveAppointment(JSON.parse(saved));
    }
  }, []);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      alert('يرجى اختيار التاريخ والوقت');
      return;
    }
    
    // Fix: 'new Appointment' was a syntax error. Changed to 'newAppointment' variable.
    const newAppointment: Appointment = { reason, date, time };
    setActiveAppointment(newAppointment);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAppointment));
    setShowSuccessModal(true);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setView('list');
    setDate('');
    setTime('');
    setReason('علاجات شعر');
  };

  const cancelAppointment = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في إلغاء الموعد؟')) {
      setActiveAppointment(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Calendar Logic
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  const formatDate = (d: number, m: number, y: number) => {
    const day = d.toString().padStart(2, '0');
    const month = (m + 1).toString().padStart(2, '0');
    return `${day}/${month}/${y}`;
  };

  const selectDay = (day: number) => {
    setDate(formatDate(day, calendarMonth.getMonth(), calendarMonth.getFullYear()));
    setShowDatePicker(false);
  };

  // Time Picker Logic
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];
  
  const [selectedHour, setSelectedHour] = useState('10');
  const [selectedMin, setSelectedMin] = useState('00');

  const confirmTime = () => {
    setTime(`${selectedHour}:${selectedMin}`);
    setShowTimePicker(false);
  };

  // Wheel Selector Component (iOS style)
  const WheelSelector = ({ items, selected, onSelect }: { items: string[], selected: string, onSelect: (val: string) => void }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const itemHeight = 56; // Increased for better touch area
    const isInternalScroll = useRef(false);

    useEffect(() => {
      const index = items.indexOf(selected);
      if (scrollRef.current && !isInternalScroll.current) {
        scrollRef.current.scrollTop = index * itemHeight;
      }
    }, [items, selected]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const top = e.currentTarget.scrollTop;
      const index = Math.round(top / itemHeight);
      
      if (items[index] && items[index] !== selected) {
        isInternalScroll.current = true;
        onSelect(items[index]);
        // Short timeout to release the internal scroll flag
        setTimeout(() => {
          isInternalScroll.current = false;
        }, 50);
      }
    };

    return (
      <div className="relative h-[280px] w-full overflow-hidden flex flex-col items-center select-none">
        {/* Selection Overlay - Highlighted Area */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[56px] bg-app-gold/5 border-y border-app-gold/20 pointer-events-none z-0" />
        
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="w-full h-full overflow-y-auto no-scrollbar snap-y snap-mandatory relative z-10 py-[112px] overscroll-contain"
          style={{ 
            scrollSnapType: 'y mandatory',
            WebkitOverflowScrolling: 'touch' 
          }}
        >
          {items.map((item) => (
            <div 
              key={item} 
              className={`h-[56px] flex items-center justify-center snap-center text-xl font-alexandria transition-all duration-300 ${
                item === selected 
                  ? 'text-app-gold font-bold scale-125' 
                  : 'text-app-textSec opacity-30 font-medium'
              }`}
              style={{ scrollSnapAlign: 'center' }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (view === 'booking') {
    return (
      <div className="flex flex-col h-full bg-app-bg animate-fadeIn">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-app-card/30 bg-white">
          <h1 className="text-xl font-bold text-app-text">حجز موعد جديد</h1>
          <button 
            onClick={() => setView('list')}
            className="p-2 hover:bg-app-bg rounded-full transition-colors text-app-textSec"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <form onSubmit={handleBooking} className="flex-1 px-6 py-8 overflow-y-auto no-scrollbar space-y-8">
          {/* Reason Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-app-text">سبب الموعد</label>
            <div className="flex flex-wrap gap-3">
              {reasons.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`px-6 py-3 rounded-2xl border-2 transition-all font-medium text-sm ${
                    reason === r 
                      ? 'bg-app-gold border-app-gold text-white shadow-md' 
                      : 'bg-white border-app-card/30 text-app-textSec hover:border-app-gold/50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker Trigger */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-app-text">تاريخ الموعد</label>
            <button
              type="button"
              onClick={() => setShowDatePicker(true)}
              className="w-full p-4 rounded-2xl bg-white border-2 border-app-card/30 text-right text-app-text flex items-center justify-between group focus:border-app-gold outline-none transition-colors"
            >
              <span className={date ? 'text-app-text font-bold' : 'text-app-textSec'}>
                {date || 'اختر تاريخاً'}
              </span>
              <CalendarDays size={20} className="text-app-gold" />
            </button>
          </div>

          {/* Time Picker Trigger */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-app-text">وقت الموعد</label>
            <button
              type="button"
              onClick={() => setShowTimePicker(true)}
              className="w-full p-4 rounded-2xl bg-white border-2 border-app-card/30 text-right text-app-text flex items-center justify-between group focus:border-app-gold outline-none transition-colors"
            >
              <span className={time ? 'text-app-text font-bold' : 'text-app-textSec'}>
                {time || 'اختر وقتاً'}
              </span>
              <Clock size={20} className="text-app-gold" />
            </button>
          </div>
        </form>

        {/* Submit Button */}
        <div className="p-6 bg-white border-t border-app-card/30 pb-28">
          <button 
            onClick={handleBooking}
            className="w-full bg-app-gold active:bg-app-goldDark text-white font-bold py-4 rounded-2xl shadow-lg shadow-app-gold/30 transition-transform active:scale-95"
          >
            حجز
          </button>
        </div>

        {/* Calendar Modal */}
        {showDatePicker && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-app-text/40 backdrop-blur-sm" onClick={() => setShowDatePicker(false)} />
            <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl relative z-10 w-[92%] max-w-md animate-scaleIn mx-auto">
              <div className="flex items-center justify-between mb-6">
                <button onClick={handleNextMonth} className="p-2 hover:bg-app-bg rounded-full text-app-gold">
                  <ChevronRight size={24} />
                </button>
                <span className="text-lg font-bold text-app-text">
                  {calendarMonth.toLocaleString('ar-EG', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={handlePrevMonth} className="p-2 hover:bg-app-bg rounded-full text-app-gold">
                  <ChevronLeft size={24} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'].map(d => (
                  <div key={d} className="h-10 flex items-center justify-center text-xs font-bold text-app-textSec opacity-50">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth(calendarMonth.getFullYear(), calendarMonth.getMonth()) }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-12" />
                ))}
                {Array.from({ length: daysInMonth(calendarMonth.getFullYear(), calendarMonth.getMonth()) }).map((_, i) => {
                  const day = i + 1;
                  const currentStr = formatDate(day, calendarMonth.getMonth(), calendarMonth.getFullYear());
                  const isSelected = date === currentStr;
                  return (
                    <button
                      key={day}
                      onClick={() => selectDay(day)}
                      className={`h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                        isSelected ? 'bg-app-gold text-white shadow-md scale-110' : 'hover:bg-app-bg text-app-text'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              
              <button 
                onClick={() => setShowDatePicker(false)}
                className="w-full mt-6 py-4 text-app-gold font-bold bg-app-bg rounded-2xl active:scale-95 transition-transform"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* Time Picker Modal */}
        {showTimePicker && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-app-text/40 backdrop-blur-sm" onClick={() => setShowTimePicker(false)} />
            <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl relative z-10 w-[92%] max-w-sm animate-scaleIn mx-auto">
              <h3 className="text-center font-bold text-app-text mb-6">اختر الوقت</h3>
              
              <div className="flex items-center gap-4 dir-ltr" dir="ltr">
                <WheelSelector 
                  items={hours} 
                  selected={selectedHour} 
                  onSelect={setSelectedHour} 
                />
                <div className="text-2xl font-bold text-app-gold">:</div>
                <WheelSelector 
                  items={minutes} 
                  selected={selectedMin} 
                  onSelect={setSelectedMin} 
                />
              </div>

              <div className="flex flex-col gap-3 mt-8">
                <button 
                  onClick={confirmTime}
                  className="w-full bg-app-gold text-white font-bold py-4 rounded-2xl active:scale-95 transition-transform shadow-lg shadow-app-gold/20"
                >
                  تأكيد
                </button>
                <button 
                  onClick={() => setShowTimePicker(false)}
                  className="w-full py-4 text-app-textSec font-bold hover:bg-app-bg rounded-2xl active:scale-95 transition-transform"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-app-text/40 backdrop-blur-sm" />
            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl relative z-10 w-[92%] max-w-sm flex flex-col items-center text-center animate-scaleIn mx-auto">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-500">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-xl font-bold text-app-text mb-4 leading-relaxed">
                تم حجز موعدك بنجاح
                <br />
                <span className="text-sm font-medium text-app-textSec mt-2 block">
                  الرجاء التواجد قبل الموعد ب 10 دقائق لإتمام اجراءات الدخول
                </span>
              </h3>
              <button 
                onClick={closeSuccessModal}
                className="w-full bg-app-gold text-white font-bold py-4 rounded-2xl mt-4 active:scale-95 transition-transform"
              >
                حسناً
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-6 pt-6 pb-28 overflow-y-auto no-scrollbar animate-fadeIn">
      {/* Centered App Bar Title */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-app-text">المواعيد</h1>
      </div>

      {activeAppointment ? (
        <div className="space-y-6">
          {/* Active Appointment Card */}
          <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-app-card/30">
            <div className="bg-app-gold/5 p-6 flex items-center gap-4 border-b border-app-bg">
              <div className="p-3 bg-white rounded-2xl text-app-gold shadow-sm">
                <Calendar size={28} />
              </div>
              <div>
                <h3 className="font-bold text-app-text">موعدك القادم</h3>
                <p className="text-xs text-app-textSec">يرجى الالتزام بالموعد المحدد</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Reason Row */}
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-app-bg rounded-xl text-app-gold">
                  <Info size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-app-textSec uppercase tracking-wider">سبب الموعد</span>
                  <span className="text-sm font-bold text-app-text">{activeAppointment.reason}</span>
                </div>
              </div>

              {/* Date Row */}
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-app-bg rounded-xl text-app-gold">
                  <CalendarDays size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-app-textSec uppercase tracking-wider">تاريخ الموعد</span>
                  <span className="text-sm font-bold text-app-text" dir="ltr">{activeAppointment.date}</span>
                </div>
              </div>

              {/* Time Row */}
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-app-bg rounded-xl text-app-gold">
                  <Clock size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-app-textSec uppercase tracking-wider">وقت الموعد</span>
                  <span className="text-sm font-bold text-app-text" dir="ltr">{activeAppointment.time}</span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-6 pt-0">
               <button 
                onClick={cancelAppointment}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-red-500 font-bold bg-red-50 hover:bg-red-100 transition-colors active:scale-95"
               >
                 <Trash2 size={18} />
                 <span>إلغاء الموعد</span>
               </button>
            </div>
          </div>
          
          <div className="p-4 bg-app-card/30 rounded-2xl border border-app-gold/10 text-center">
            <p className="text-xs text-app-textSec leading-relaxed">
              لديك موعد نشط حالياً. لا يمكنك حجز موعد جديد حتى يتم إتمام أو إلغاء الموعد الحالي.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full items-center justify-center pb-12 animate-fadeIn">
          {/* Visual Icon for Empty State */}
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-app-card/30 text-app-gold/40">
            <CalendarDays size={48} strokeWidth={1.5} />
          </div>

          {/* Main Message */}
          <h2 className="text-lg font-bold text-app-text mb-8 text-center">
            لا يوجد لدي أي مواعيد مجدولة
          </h2>

          {/* Primary CTA Button */}
          <button 
            className="w-full max-w-xs bg-app-gold active:bg-app-goldDark text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-app-gold/30 transition-transform active:scale-95 flex items-center justify-center gap-2"
            onClick={() => setView('booking')}
          >
            <span>احجز موعدك الآن</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentsTab;