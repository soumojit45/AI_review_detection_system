/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageRoute } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SingleReviewPage } from './pages/SingleReviewPage';
import { MultipleReviewsPage } from './pages/MultipleReviewsPage';

export default function App() {
  // Sync page state with window location hash for browser back/forward and bookmarking
  const getInitialPage = (): PageRoute => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (hash === 'single-review' || hash === 'multiple-reviews') {
      return hash;
    }
    return 'home';
  };

  const [currentPage, setCurrentPage] = useState<PageRoute>(getInitialPage);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash === 'single-review' || hash === 'multiple-reviews') {
        setCurrentPage(hash);
      } else if (!hash || hash === 'home') {
        setCurrentPage('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (page: PageRoute) => {
    setCurrentPage(page);
    window.location.hash = page === 'home' ? '' : `/${page}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1020] text-[#F8FAFC]">
      {/* Top Navigation */}
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Content Area with Smooth Page Transition */}
      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div
              key="home-page"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex-1"
            >
              <HomePage onNavigate={handleNavigate} />
            </motion.div>
          )}

          {currentPage === 'single-review' && (
            <motion.div
              key="single-review-page"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex-1"
            >
              <SingleReviewPage onNavigate={handleNavigate} />
            </motion.div>
          )}

          {currentPage === 'multiple-reviews' && (
            <motion.div
              key="multiple-reviews-page"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex-1"
            >
              <MultipleReviewsPage onNavigate={handleNavigate} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Minimal Footer */}
      <Footer />
    </div>
  );
}

