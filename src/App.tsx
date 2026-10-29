import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { NoticeModal } from './components/NoticeModal';

import { HomePage } from './pages/HomePage';
import { ResultsPage } from './pages/ResultsPage';
import { NoticePage } from './pages/NoticePage';
import { TeachersPage } from './pages/TeachersPage';
import { GalleryPage } from './pages/GalleryPage';
import { PrayerPage } from './pages/PrayerPage';
import { AboutPage } from './pages/AboutPage';
import { IslamicTools } from './pages/IslamicTools';
import { AdminDashboard } from './pages/AdminDashboard';
import { Notice } from './types';

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [activeNoticeModal, setActiveNoticeModal] = useState<Notice | null>(null);
  const [targetRoll, setTargetRoll] = useState<string>('');
  const [unreadNoticesCount, setUnreadNoticesCount] = useState<number>(0);

  // Fetch notices count for notification bell badge
  useEffect(() => {
    fetch('/api/notices')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.notices) {
          setUnreadNoticesCount(data.notices.length);
        }
      })
      .catch(() => {});
  }, []);

  const handleQuickResultSearch = (roll: string) => {
    setTargetRoll(roll);
    setActiveTab('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewNotice = (notice: Notice) => {
    setActiveNoticeModal(notice);
  };

  const isIslamicSubtool = ['quran', 'hadith', 'dua', 'tasbih', 'zakat', 'allah-names', 'qibla'].includes(activeTab);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-slate-800 font-bn">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAuthModal={() => setAuthModalOpen(true)}
        openProfileModal={() => setProfileModalOpen(true)}
        openNoticeCount={unreadNoticesCount}
      />

      {/* Main Page Routing */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage
            setActiveTab={setActiveTab}
            onViewNotice={handleViewNotice}
            onQuickResultSearch={handleQuickResultSearch}
          />
        )}

        {activeTab === 'results' && (
          <ResultsPage initialRoll={targetRoll} />
        )}

        {activeTab === 'notices' && (
          <NoticePage />
        )}

        {activeTab === 'teachers' && (
          <TeachersPage />
        )}

        {activeTab === 'gallery' && (
          <GalleryPage />
        )}

        {activeTab === 'prayer' && (
          <PrayerPage />
        )}

        {activeTab === 'about' && (
          <AboutPage />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard openAuthModal={() => setAuthModalOpen(true)} />
        )}

        {isIslamicSubtool && (
          <IslamicTools
            activeSubtool={activeTab as any}
            setActiveSubtool={setActiveTab}
          />
        )}
      </main>

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />

      {/* Mobile Sticky Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openNoticeCount={unreadNoticesCount}
      />

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onNavigateToResults={(roll) => {
          setTargetRoll(roll);
          setActiveTab('results');
        }}
      />

      <NoticeModal
        notice={activeNoticeModal}
        onClose={() => setActiveNoticeModal(null)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
