

import React, { useState, useEffect } from 'react';
import { Settings, CreditCard, Clock, Save, ToggleLeft, ToggleRight, AlertTriangle, Gamepad2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { AppSettings } from '../../types';

const AdminSettings: React.FC = () => {
  const { appSettings, updateAppSettings } = useData();
  const [localSettings, setLocalSettings] = useState<AppSettings>(appSettings);

  // Sync with context
  useEffect(() => {
    setLocalSettings(appSettings);
  }, [appSettings]);

  const handleSave = () => {
    updateAppSettings(localSettings);
    alert('تم حفظ الإعدادات بنجاح');
  };

  const Toggle = ({ 
    label, 
    checked, 
    onChange 
  }: { 
    label: string, 
    checked: boolean, 
    onChange: (val: boolean) => void 
  }) => (
    <div className="flex items-center justify-between p-4 bg-app-bg rounded-xl border border-app-card/50">
      <span className="font-bold text-app-text text-sm">{label}</span>
      <button 
        onClick={() => onChange(!checked)}
        className={`transition-colors duration-300 ${checked ? 'text-app-gold' : 'text-gray-300'}`}
      >
        {checked ? <ToggleRight size={40} fill="currentColor" /> : <ToggleLeft size={40} />}
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-app-text">الإعدادات</h2>
        <button 
          onClick={handleSave}
          className="bg-app-gold text-white px-6 py-2 rounded-xl font-bold hover:bg-app-goldDark flex items-center gap-2 transition-colors"
        >
          <Save size={18} />
          <span>حفظ التغييرات</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Maintenance Mode Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-app-card/30">
          <div className="flex items-center gap-2 mb-6 text-app-goldDark">
             <AlertTriangle size={20} />
             <h3 className="font-bold text-lg">وضع الصيانة</h3>
          </div>
          
          <div className="space-y-4">
             <Toggle 
               label="تفعيل وضع الصيانة" 
               checked={localSettings.maintenanceMode}
               onChange={(val) => setLocalSettings({...localSettings, maintenanceMode: val})}
             />
             <p className="text-xs text-app-textSec leading-relaxed px-2">
               عند تفعيل هذا الخيار، سيظهر للعملاء شاشة "تحت الصيانة" ولن يتمكنوا من تصفح التطبيق أو الطلب. يمكنك كمدير للنظام الاستمرار في استخدام لوحة التحكم.
             </p>
          </div>
        </div>

        {/* Game Visibility Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-app-card/30">
          <div className="flex items-center gap-2 mb-6 text-app-goldDark">
             <Gamepad2 size={20} />
             <h3 className="font-bold text-lg">إعدادات اللعبة</h3>
          </div>
          
          <div className="space-y-4">
             <Toggle 
               label="إظهار اللعبة في التطبيق" 
               checked={localSettings.showGameInApp}
               onChange={(val) => setLocalSettings({...localSettings, showGameInApp: val})}
             />
             <p className="text-xs text-app-textSec leading-relaxed px-2">
               عند إيقاف هذا الخيار، سيتم إخفاء أيقونة اللعبة من شريط التنقل السفلي ولن يتمكن العملاء من الوصول إليها.
             </p>
          </div>
        </div>

        {/* Payment Methods Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-app-card/30">
          <div className="flex items-center gap-2 mb-6 text-app-goldDark">
             <CreditCard size={20} />
             <h3 className="font-bold text-lg">إعدادات الدفع</h3>
          </div>
          
          <div className="space-y-3">
             <Toggle 
               label="الدفع عند الاستلام (COD)" 
               checked={localSettings.enableCOD}
               onChange={(val) => setLocalSettings({...localSettings, enableCOD: val})}
             />
             <Toggle 
               label="الدفع أونلاين" 
               checked={localSettings.enableOnlinePayment}
               onChange={(val) => setLocalSettings({...localSettings, enableOnlinePayment: val})}
             />
          </div>
        </div>

        {/* Delivery Time Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-app-card/30">
          <div className="flex items-center gap-2 mb-6 text-app-goldDark">
             <Clock size={20} />
             <h3 className="font-bold text-lg">مدة التوصيل</h3>
          </div>
          
          <div className="space-y-4">
             <div>
                <label className="block text-sm font-bold text-app-text mb-2">مدة التوصيل (نص يظهر للعميلة)</label>
                <input 
                  type="text" 
                  className="w-full p-4 border border-app-card rounded-xl outline-none focus:border-app-gold text-right bg-app-bg" 
                  value={localSettings.deliveryTimeText}
                  onChange={(e) => setLocalSettings({...localSettings, deliveryTimeText: e.target.value})}
                  placeholder="مثال: التوصيل خلال يوم واحد"
                />
             </div>
             <p className="text-xs text-app-textSec">
               سيظهر هذا النص في ملخص الطلب عند إتمام الشراء.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminSettings;
