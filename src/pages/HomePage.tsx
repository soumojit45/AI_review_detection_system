/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Hero } from '../components/Hero';
import { PageRoute } from '../types';

interface HomePageProps {
  onNavigate: (page: PageRoute) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full">
      <Hero onNavigate={onNavigate} />
    </div>
  );
};
