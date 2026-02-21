'use client';

import { useState } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

// Demo user - in real app this comes from auth context
const defaultUser = {
  name: 'Test User',
  email: 'test@dronacharya.app',
  avatarUrl: undefined,
};

export function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={defaultUser}
        onMenuClick={handleMenuToggle}
      />
      <div className="flex">
        {/* Desktop Sidebar */}
        <Sidebar variant="desktop" />

        {/* Mobile Sidebar Sheet */}
        <Sidebar
          variant="mobile"
          isOpen={isMobileMenuOpen}
          onClose={handleCloseMobileMenu}
        />

        {/* Main Content */}
        <main id="main-content" className="flex-1 p-3 sm:p-4 md:p-6 max-w-full overflow-x-hidden bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
