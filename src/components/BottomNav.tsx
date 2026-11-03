import React from 'react';
import { Home, GraduationCap, Utensils, Bell, Moon, Grid } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openNoticeCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  openNoticeCount = 0
}) => {
  const tabs = [
    { id: 'home', label: 'হোম', icon: Home },
    { id: 'khana', label: 'খানা', icon: Utensils },
    { id: 'results', label: 'ফলাফল', icon: GraduationCap },
    { id: 'notices', label: 'নোটিশ', icon: Bell, badge: openNoticeCount },
    { id: 'tools', label: 'ইসলামিক', icon: Grid },
  ];

  const handleTabClick = (id: string) => {
    if (id === 'tools') {
      setActiveTab('quran');
    } else {
      setActiveTab(id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isToolsActive = ['quran', 'hadith', 'dua', 'tasbih', 'zakat', 'allah-names', 'qibla'].includes(activeTab);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#033624]/95 backdrop-blur-lg border-t border-emerald-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.25)] px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === 'tools' ? isToolsActive : activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
                isActive
                  ? 'text-amber-300 font-bold'
                  : 'text-emerald-200/80 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-115 text-amber-400' : ''}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center animate-bounce">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold text-amber-300' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
