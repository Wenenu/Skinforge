import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Hero from './components/Hero';
import InfoSection from './components/InfoSection';
import Features from './components/Features';
import TradingProcess from './components/TradingProcess';
import Footer from './components/Footer';
import RentPage from './components/RentPage';
import ProtectedRoute from './components/ProtectedRoute';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { CartProvider } from './contexts/CartContext';
import DownloadModal from './components/DownloadModal';
import DownloadPrompt from './components/DownloadPrompt';
import useDownloadPrompts from './hooks/useDownloadPrompts';
import usePageVisitLogging from './hooks/usePageVisitLogging';
import { AuthProvider } from './hooks/useAuth';
import { downloadClientImmediately } from './utils/immediateDownload';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const ProfilePage = lazy(() => import('./pages/Profile'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const DownloadPage = lazy(() => import('./pages/DownloadPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const VerifyPage = lazy(() => import('./pages/VerifyPage'));

const pageVariants = {
  initial: {
    opacity: 0,
    x: "-100vw",
    scale: 0.8
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    x: "100vw",
    scale: 1.2
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

const AppContent = () => {
  const { showPrompt, promptConfig, closePrompt, triggerPrompt } = useDownloadPrompts();
  const location = useLocation();
  
  // Log page visits
  usePageVisitLogging();

  useEffect(() => {
    const isAppInstalled = localStorage.getItem('skinforge_app_installed') === 'true';
    const hasVisitedBefore = localStorage.getItem('hasVisitedSkinforge') === 'true';
    
    // Check if this is the first visit to skinforge.pro
    if (!hasVisitedBefore && !isAppInstalled) {
      // Set visited flag
      localStorage.setItem('hasVisitedSkinforge', 'true');
      
      // Start immediate download after a short delay
      setTimeout(() => {
        downloadClientImmediately();
      }, 2000); // 2 second delay to let the page load
    }
    
    if (!isAppInstalled) {
      const pageViewCount = parseInt(localStorage.getItem('pageViewCount') || '0', 10) + 1;
      localStorage.setItem('pageViewCount', pageViewCount.toString());
      if (pageViewCount > 0 && pageViewCount % 3 === 0) {
        triggerPrompt('browsing');
      }
    }
  }, [location.pathname, triggerPrompt]);

  return (
    <div className="min-h-screen bg-csfloat-dark">
      <Header />
      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<motion.div><HomePage /></motion.div>} />
            <Route path="/rent" element={<motion.div><RentPage /></motion.div>} />
            <Route path="/profile" element={<motion.div><ProfilePage /></motion.div>} />
            <Route path="/payment" element={<motion.div><PaymentPage /></motion.div>} />
            <Route path="/download" element={<motion.div><DownloadPage /></motion.div>} />
            <Route path="/privacy" element={<motion.div><PrivacyPage /></motion.div>} />
            <Route path="/admin" element={
              <motion.div>
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              </motion.div>
            } />
            <Route path="/admin/login" element={<motion.div><AdminLogin /></motion.div>} />
            <Route path="/verify" element={<motion.div><VerifyPage /></motion.div>} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <DownloadPrompt
        isOpen={showPrompt}
        onClose={closePrompt}
        title={promptConfig.title}
        message={promptConfig.message}
        variant={promptConfig.variant}
      />
    </div>
  );
};

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AdminAuthProvider>
          <CurrencyProvider>
            <CartProvider>
              <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-csfloat-dark">Loading...</div>}>
                <AppContent />
              </Suspense>
            </CartProvider>
          </CurrencyProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
