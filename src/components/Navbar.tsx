import React, { useState } from 'react';
import {
  Menu, X, Bell, User as UserIcon, Shield,
  BookOpen, Compass, Award, Calendar, Phone, Heart, ExternalLink, LogOut, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAuthModal: () => void;
  openProfileModal: () => void;
  openNoticeCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openAuthModal,
  openProfileModal,
  openNoticeCount = 0
}) => {
  const { user, profile, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdown, setToolsDropdown] = useState(false);

  const navItems = [
    { id: 'home', label: 'হোম' },
    { id: 'results', label: 'ফলাফল', badge: 'অনলাইন' },
    { id: 'notices', label: 'নোটিশ বোর্ড' },
    { id: 'prayer', label: 'নামাজ ও রোজা' },
    { id: 'teachers', label: 'শিক্ষকবৃন্দ' },
    { id: 'gallery', label: 'গ্যালারি' },
    { id: 'about', label: 'মাদরাসা পরিচিতি' },
  ];

  const islamicTools = [
    { id: 'quran', label: 'আল-কুরআন', icon: BookOpen },
    { id: 'hadith', label: 'হাদিস শরিফ', icon: Award },
    { id: 'dua', label: 'দৈনন্দিন দোয়া', icon: Heart },
    { id: 'tasbih', label: 'ডিজিটাল তসবীহ', icon: Compass },
    { id: 'zakat', label: 'যাকাত ক্যালকুলেটর', icon: Calendar },
    { id: 'allah-names', label: 'আল্লাহর ৯৯ নাম', icon: Heart },
    { id: 'qibla', label: 'কিবলা কম্পাস', icon: Compass },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    setToolsDropdown(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Banner Notice Ticker & Hijri Date */}
      <div className="bg-[#033624] text-emerald-100 text-xs py-1.5 px-4 border-b border-emerald-900/50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[11px] font-bold border border-amber-500/30">
              কুষ্টিয়া
            </span>
            <span className="truncate max-w-[280px] sm:max-w-md">
              জামিয়া আরাবিয়া আশরাফুল উলূম কুষ্টিয়া — দ্বীনি শিক্ষার এক অনন্য প্রতিষ্ঠান
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-emerald-200/90 text-[11px]">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-amber-400" /> ০১৭১৬-৬৫২৬৪৬
            </span>
            <span>•</span>
            <span>কুষ্টিয়া, বাংলাদেশ</span>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#055136]/95 backdrop-blur-md text-white border-b border-emerald-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <img
                src="https://i.ibb.co.com/qFRmPqgK/20260310-005555.png"
                alt="Madrasa Logo"
                className="w-10 h-10 sm:w-13 sm:h-13 rounded-full object-contain border-2 border-amber-400/80 shadow-md group-hover:scale-105 transition-transform"
                crossOrigin="anonymous"
              />
              <div className="absolute -inset-1 rounded-full bg-amber-400/20 blur-sm -z-10 group-hover:bg-amber-400/30 transition-colors" />
            </div>
            <div>
              <h1 className="text-sm sm:text-lg font-bold tracking-tight text-white leading-tight font-bn">
                জামিয়া আরাবিয়া আশরাফুল উলূম
              </h1>
              <p className="text-[10px] sm:text-xs text-amber-300 font-medium tracking-wide">
                মজমপুর, কুষ্টিয়া • স্থাপিত: ১৯৮৬ খ্রি.
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 font-medium text-sm">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                  activeTab === item.id
                    ? 'text-white bg-emerald-800/80 shadow-inner font-semibold border-b-2 border-amber-400'
                    : 'text-emerald-100 hover:text-white hover:bg-emerald-800/40'
                }`}
              >
                {item.label}
                {item.badge && (
                  <span className="bg-amber-500 text-slate-900 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full uppercase animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}

            {/* Islamic Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => setToolsDropdown(!toolsDropdown)}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1 ${
                  ['quran', 'hadith', 'dua', 'tasbih', 'zakat', 'allah-names', 'qibla'].includes(activeTab)
                    ? 'text-amber-300 bg-emerald-800/90 font-semibold'
                    : 'text-emerald-100 hover:text-white hover:bg-emerald-800/40'
                }`}
              >
                <span>ইসলামিক টুলস</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${toolsDropdown ? 'rotate-180' : ''}`} />
              </button>

              {toolsDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-52 bg-[#04442d] rounded-xl shadow-2xl border border-emerald-700/80 py-2 z-50 text-slate-100 divide-y divide-emerald-800/60"
                  onMouseLeave={() => setToolsDropdown(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                    দৈনন্দিন দ্বীনি ফিচার
                  </div>
                  <div className="py-1">
                    {islamicTools.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <button
                          key={tool.id}
                          onClick={() => handleNavClick(tool.id)}
                          className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                            activeTab === tool.id ? 'bg-emerald-700 text-amber-300 font-bold' : 'hover:bg-emerald-800/60'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-amber-400" />
                          <span>{tool.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Dashboard Tab (Visible if Admin) */}
            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all font-semibold ${
                  activeTab === 'admin'
                    ? 'bg-amber-500 text-slate-900 shadow-md font-bold'
                    : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-400/40'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>এডমিন প্যানেল</span>
              </button>
            )}
          </nav>

          {/* Right Action Icons (Notice Bell, Profile, Mobile Menu) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notice Quick Bell */}
            <button
              onClick={() => handleNavClick('notices')}
              className="relative p-2 rounded-xl bg-emerald-800/40 hover:bg-emerald-700/50 text-emerald-100 hover:text-white transition-colors"
              title="নোটিশ দেখুন"
            >
              <Bell className="w-5 h-5" />
              {openNoticeCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {openNoticeCount}
                </span>
              )}
            </button>

            {/* User Profile / Login Button */}
            {user || profile ? (
              <div 
                onClick={openProfileModal}
                className="flex items-center gap-2 bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700/60 rounded-full py-1 pl-1 pr-3 cursor-pointer transition-colors"
              >
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.displayName}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-amber-400"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500 text-slate-900 font-bold flex items-center justify-center text-xs">
                    {(profile?.displayName || 'উ')[0]}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-white leading-tight truncate max-w-[90px]">
                    {profile?.displayName?.split(' ')[0] || 'ইউজার'}
                  </div>
                  <div className="text-[10px] text-amber-300">
                    {isAdmin ? 'এডমিন' : (profile?.role === 'student' ? 'শিক্ষার্থী' : 'প্রোফাইল')}
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-xl shadow-md transition-all active:scale-95"
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">লগইন / সাইনআপ</span>
                <span className="sm:hidden">লগইন</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-emerald-800/60 hover:bg-emerald-700 text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu Content */}
          <div className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[#033b27] text-white flex flex-col shadow-2xl z-10 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-5 border-b border-emerald-800 bg-[#022b1c] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="https://i.ibb.co.com/qFRmPqgK/20260310-005555.png"
                  alt="Madrasa Logo"
                  className="w-10 h-10 rounded-full border border-amber-400"
                />
                <div>
                  <h3 className="font-bold text-sm text-white leading-tight">জামিয়া আরাবিয়া</h3>
                  <p className="text-xs text-amber-300">আশরাফুল উলূম কুষ্টিয়া</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-emerald-800/60 text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Quick Card in Drawer */}
            <div className="p-4 bg-emerald-900/40 border-b border-emerald-800/60">
              {user || profile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {profile?.avatar ? (
                      <img src={profile.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-amber-400" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-900 font-bold flex items-center justify-center text-sm">
                        {(profile?.displayName || 'উ')[0]}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-sm text-white">{profile?.displayName}</div>
                      <div className="text-xs text-amber-300">{isAdmin ? 'অফিসিয়াল এডমিন' : (profile?.phone || 'ব্যবহারকারী')}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setMobileMenuOpen(false); openProfileModal(); }}
                    className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-md border border-amber-400/30"
                  >
                    এডিট
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setMobileMenuOpen(false); openAuthModal(); }}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>লগইন অথবা একাউন্ট খুলুন</span>
                </button>
              )}
            </div>

            {/* Drawer Navigation Links */}
            <div className="p-4 space-y-1 flex-1">
              <div className="text-[11px] font-semibold text-emerald-300/80 px-2 uppercase tracking-wider mb-2">
                মূল মেন্যু
              </div>

              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl font-medium text-sm flex items-center justify-between transition-colors ${
                    activeTab === item.id
                      ? 'bg-emerald-700 text-white font-bold border-l-4 border-amber-400'
                      : 'text-emerald-100 hover:bg-emerald-800/60'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="bg-amber-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}

              {isAdmin && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2.5 mt-2 transition-colors ${
                    activeTab === 'admin'
                      ? 'bg-amber-500 text-slate-900'
                      : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-400/40'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>এডমিন কন্ট্রোল ড্যাশবোর্ড</span>
                </button>
              )}

              <div className="pt-4 mt-3 border-t border-emerald-800">
                <div className="text-[11px] font-semibold text-amber-400 px-2 uppercase tracking-wider mb-2">
                  ইসলামিক টুলস ও ইবাদত
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {islamicTools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => handleNavClick(tool.id)}
                        className={`text-left p-2.5 rounded-lg text-xs flex items-center gap-2 transition-colors ${
                          activeTab === tool.id
                            ? 'bg-emerald-700 text-amber-300 font-bold'
                            : 'bg-emerald-900/40 text-emerald-200 hover:bg-emerald-800/60'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{tool.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-emerald-800 bg-[#02281a] text-center text-xs text-emerald-300/80">
              {user && (
                <button
                  onClick={() => { setMobileMenuOpen(false); logout(); }}
                  className="w-full mb-3 py-2 text-rose-300 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/40 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>লগআউট করুন</span>
                </button>
              )}
              <p>জামিয়া আরাবিয়া আশরাফুল উলূম কুষ্টিয়া</p>
              <p className="text-[10px] text-emerald-400/60 mt-1">ভার্সন ২.০ (আধুনিক ডিজিটাল পোর্টাল)</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
