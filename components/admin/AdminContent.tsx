
import React, { useState, useEffect } from 'react';
import { Image, LayoutTemplate, Link as LinkIcon, Save } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ContentSettings } from '../../types';

const AdminContent: React.FC = () => {
  const { contentSettings, updateContentSettings } = useData();
  const [localSettings, setLocalSettings] = useState<ContentSettings>(contentSettings);

  // Sync state with context
  useEffect(() => {
    setLocalSettings(contentSettings);
  }, [contentSettings]);

  const handleSave = () => {
    updateContentSettings(localSettings);
    alert('تم حفظ الإعدادات بنجاح');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-app-text">إدارة محتوى الصفحة الرئيسية</h2>
        <button 
          onClick={handleSave}
          className="bg-app-gold text-white px-6 py-2 rounded-xl font-bold hover:bg-app-goldDark flex items-center gap-2 transition-colors"
        >
          <Save size={18} />
          <span>حفظ التغييرات</span>
        </button>
      </div>

      {/* Main Banner Slider (Placeholder for now as per previous logic) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-app-card/30">
        <h3 className="text-lg font-bold text-app-text mb-4 flex items-center gap-2">
           <LayoutTemplate size={20} className="text-app-gold" />
           البنرات الرئيسية (Slider)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {[1, 2, 3].map(i => (
             <div key={i} className="relative aspect-[2/1] bg-app-bg rounded-xl border-2 border-dashed border-app-card flex flex-col items-center justify-center cursor-pointer hover:border-app-gold transition-colors group">
                <Image className="text-app-textSec mb-2 group-hover:text-app-gold" />
                <span className="text-xs font-bold text-app-textSec">تغيير الصورة {i}</span>
             </div>
           ))}
           <div className="aspect-[2/1] bg-app-bg rounded-xl border-2 border-dashed border-app-card flex flex-col items-center justify-center cursor-pointer hover:border-app-gold transition-colors">
              <span className="text-4xl text-app-gold mb-1">+</span>
              <span className="text-xs font-bold text-app-textSec">إضافة بنر</span>
           </div>
        </div>
      </div>
      
      {/* Main Button Links (New Section) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-app-card/30">
        <h3 className="text-lg font-bold text-app-text mb-4 flex items-center gap-2">
           <LinkIcon size={20} className="text-app-gold" />
           روابط الأزرار الرئيسية
        </h3>
        <div className="space-y-4">
           <div>
              <label className="block text-sm font-bold text-app-text mb-2">رابط زر حجز التكنك أونلاين (المرة الأولى مجانا)</label>
              <input 
                type="url" 
                placeholder="https://..." 
                className="w-full p-3 border border-app-card rounded-xl outline-none focus:border-app-gold text-left" 
                dir="ltr" 
                value={localSettings.techBookingUrl}
                onChange={(e) => setLocalSettings({...localSettings, techBookingUrl: e.target.value})}
              />
           </div>
        </div>
      </div>

      {/* Social Links (Placeholder) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-app-card/30">
        <h3 className="text-lg font-bold text-app-text mb-4">روابط التواصل الاجتماعي</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <input type="text" placeholder="Instagram URL" className="p-3 border border-app-card rounded-xl outline-none focus:border-app-gold" dir="ltr" />
           <input type="text" placeholder="TikTok URL" className="p-3 border border-app-card rounded-xl outline-none focus:border-app-gold" dir="ltr" />
           <input type="text" placeholder="Snapchat URL" className="p-3 border border-app-card rounded-xl outline-none focus:border-app-gold" dir="ltr" />
           <input type="text" placeholder="WhatsApp Number" className="p-3 border border-app-card rounded-xl outline-none focus:border-app-gold" dir="ltr" />
        </div>
      </div>

    </div>
  );
};

export default AdminContent;
