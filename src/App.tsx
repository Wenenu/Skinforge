import React, { useState, useEffect } from 'react';
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
import { useMobile } from './hooks/useMobile';

// Page Imports
import ProfilePage from './pages/Profile';
import PaymentPage from './pages/PaymentPage';
import DownloadPage from './pages/DownloadPage';
import VerifyPage from './pages/VerifyPage';
import PrivacyPage from './pages/PrivacyPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import CryptoInstructionsPage from './pages/CryptoInstructionsPage';
import CashappInstructionsPage from './pages/CashappInstructionsPage';
import GiveawayPage from './pages/GiveawayPage';

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

// Mobile meta tags component
const MobileMetaTags = () => {
  const mobileInfo = useMobile();
  
  useEffect(() => {
    // Set viewport meta tag for mobile
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      document.head.appendChild(meta);
    }

    // Add mobile-specific meta tags
    const mobileMeta = document.createElement('meta');
    mobileMeta.name = 'mobile-web-app-capable';
    mobileMeta.content = 'yes';
    document.head.appendChild(mobileMeta);

    const appleMeta = document.createElement('meta');
    appleMeta.name = 'apple-mobile-web-app-capable';
    appleMeta.content = 'yes';
    document.head.appendChild(appleMeta);

    const statusBar = document.createElement('meta');
    statusBar.name = 'apple-mobile-web-app-status-bar-style';
    statusBar.content = 'black-translucent';
    document.head.appendChild(statusBar);

    // Add touch icon for mobile
    const touchIcon = document.createElement('link');
    touchIcon.rel = 'apple-touch-icon';
    touchIcon.href = '/favicon.ico';
    document.head.appendChild(touchIcon);

    // Prevent zoom on input focus for iOS
    if (mobileInfo.isIOS) {
      const preventZoom = () => {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
      };
      
      document.addEventListener('focusin', preventZoom);
      return () => document.removeEventListener('focusin', preventZoom);
    }
  }, [mobileInfo.isIOS]);

  return null;
};

const HomePage = () => {
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const location = useLocation();
  const { showPrompt, promptConfig, closePrompt, triggerPrompt } = useDownloadPrompts();
  const mobileInfo = useMobile();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('showDownload') === 'true') {
      setShowDownloadModal(true);
      // Remove the showDownload parameter from the URL
      params.delete('showDownload');
      const newSearch = params.toString();
      const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location]);

  const handleCloseModal = () => {
    setShowDownloadModal(false);
  };

  return (
    <>
      <Hero />
      <InfoSection />
      <Features />
      <TradingProcess />
      <DownloadModal isOpen={showDownloadModal} onClose={handleCloseModal} />
      <DownloadPrompt
        isOpen={showPrompt}
        onClose={closePrompt}
        title={promptConfig.title}
        message={promptConfig.message}
        variant={promptConfig.variant}
      />
    </>
  );
};

const AppContent = () => {
  const { showPrompt, promptConfig, closePrompt, triggerPrompt } = useDownloadPrompts();
  const location = useLocation();
  const mobileInfo = useMobile();
  
  // Log page visits
  usePageVisitLogging();

  useEffect(() => {
    const isAppInstalled = localStorage.getItem('skinforge_app_installed') === 'true';
    if (!isAppInstalled) {
      const pageViewCount = parseInt(localStorage.getItem('pageViewCount') || '0', 10) + 1;
      localStorage.setItem('pageViewCount', pageViewCount.toString());
      if (pageViewCount > 0 && pageViewCount % 3 === 0) {
        triggerPrompt('browsing');
      }
    }
  }, [location.pathname, triggerPrompt]);

  // Mobile-specific body classes
  useEffect(() => {
    const body = document.body;
    
    // Add mobile-specific classes
    if (mobileInfo.isMobile) {
      body.classList.add('mobile-device');
      if (mobileInfo.isIOS) {
        body.classList.add('ios-device');
      }
      if (mobileInfo.isAndroid) {
        body.classList.add('android-device');
      }
    } else {
      body.classList.remove('mobile-device', 'ios-device', 'android-device');
    }

    // Add orientation classes
    body.classList.remove('portrait', 'landscape');
    body.classList.add(mobileInfo.orientation);

    return () => {
      body.classList.remove('mobile-device', 'ios-device', 'android-device', 'portrait', 'landscape');
    };
  }, [mobileInfo]);

  return (
    <div className={`min-h-screen bg-csfloat-dark ${mobileInfo.isMobile ? 'mobile-layout' : 'desktop-layout'}`}>
      <Header />
      <main className={mobileInfo.isMobile ? 'mobile-main' : 'desktop-main'}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><HomePage /></motion.div>} />
            <Route path="/rent" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><RentPage /></motion.div>} />
            <Route path="/profile" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><ProfilePage /></motion.div>} />
            <Route path="/payment" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><PaymentPage /></motion.div>} />
            <Route path="/download" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><DownloadPage /></motion.div>} />
            <Route path="/privacy" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><PrivacyPage /></motion.div>} />
            <Route path="/admin" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><ProtectedRoute><AdminDashboard /></ProtectedRoute></motion.div>} />
            <Route path="/admin/login" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><AdminLogin /></motion.div>} />
            <Route path="/verify" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><VerifyPage /></motion.div>} />
            <Route path="/crypto-instructions" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><CryptoInstructionsPage /></motion.div>} />
            <Route path="/cashapp-instructions" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><CashappInstructionsPage /></motion.div>} />
            <Route path="/giveaway" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><GiveawayPage /></motion.div>} />
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

function App() {
  return (
    <AdminAuthProvider>
      <CurrencyProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <MobileMetaTags />
              <ScrollToTop />
              <AppContent />
            </Router>
          </CartProvider>
        </AuthProvider>
      </CurrencyProvider>
    </AdminAuthProvider>
  );
}

export default App;
