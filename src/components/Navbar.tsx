/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, FileText, Layers, Home, Menu, X, Sparkles } from 'lucide-react';
import { PageRoute } from '../types';

interface NavbarProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: PageRoute; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'single-review', label: 'Single Review', icon: FileText },
    { id: 'multiple-reviews', label: 'Multiple Reviews', icon: Layers },
  ];

  const handleNavClick = (page: PageRoute) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#263247]/80 bg-[#0B1020]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <button
          id="navbar-brand-button"
          onClick={() => handleNavClick('home')}
          className="group flex items-center gap-3 transition-opacity focus:outline-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/50 transition-colors">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-[#F8FAFC]">
                AI Review Detector
              </span>
              <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300 border border-indigo-500/20">
                NLP
              </span>
            </div>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'text-[#F8FAFC] bg-[#151D2E] border border-[#263247] shadow-sm shadow-black/20'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151D2E]/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-[#94A3B8]'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-[-1px] left-3 right-3 h-[2px] rounded-full bg-indigo-500" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Status / Fast Indicator */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[#263247] bg-[#111827] px-3 py-1 text-xs text-[#94A3B8]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>BERT / Transformer Ready</span>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#263247] bg-[#151D2E] text-[#94A3B8] hover:text-[#F8FAFC] focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#263247] bg-[#0F172A] px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#151D2E] text-indigo-400 border border-[#263247]'
                    : 'text-[#94A3B8] hover:bg-[#151D2E] hover:text-[#F8FAFC]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2">
            <div className="flex items-center gap-2 rounded-lg border border-[#263247] bg-[#111827] px-3 py-2 text-xs text-[#94A3B8]">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>AI Linguistic Detection Engine</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
