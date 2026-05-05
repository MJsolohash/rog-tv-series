import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TVShows from './pages/TVShows';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import SeriesDetails from './pages/SeriesDetails';
import Watch from './pages/Watch';
import Profile from './pages/Profile';
import AdminDashboard from './pages/Admin/Dashboard';
import NotFound from './pages/NotFound';
import AllTrending from './pages/AllTrending';
import AllRecent from './pages/AllRecent';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import ScrollToTop from './components/Common/ScrollToTop';

const MainApp = ({ onLogout }) => {
  // Safe way to get user from localStorage
  const getUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr && userStr !== 'undefined' && userStr !== 'null') {
        return JSON.parse(userStr);
      }
      return null;
    } catch (error) {
      console.error('Error parsing user:', error);
      return null;
    }
  };

  const user = getUser();

  return (
    <Router>
      <ScrollToTop />
      <div className="bg-black min-h-screen">
        <Navbar onLogout={onLogout} user={user} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tv-shows" element={<TVShows />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />   
            <Route path="/trending" element={<AllTrending />} />
            <Route path="/recent" element={<AllRecent />} />
            <Route path="/series/:id" element={<SeriesDetails />} />
            <Route path="/watch/:episodeId" element={<Watch />} />
            <Route path="/profile" element={<Profile />} />
            {user?.isAdmin && (
              <Route path="/admin/*" element={<AdminDashboard />} />
            )}
            {/* 404 Route - Must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default MainApp;