import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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

const HomePage = () => {
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const location = useLocation();
  const { showPrompt, promptConfig, closePrompt, triggerPrompt } = useDownloadPrompts();

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

  return (
    <div className="min-h-screen bg-csfloat-dark">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/rent" element={<RentPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/crypto-instructions" element={<CryptoInstructionsPage />} />
          <Route path="/cashapp-instructions" element={<CashappInstructionsPage />} />
        </Routes>
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

function App() {
  return (
    <AdminAuthProvider>
      <CurrencyProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <AppContent />
            </Router>
          </CartProvider>
        </AuthProvider>
      </CurrencyProvider>
    </AdminAuthProvider>
  );
}

export default App;
