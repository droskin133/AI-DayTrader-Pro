import React from 'react';
import { Header } from './Header';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold trading-gradient bg-clip-text text-transparent">
              AI DayTrader Pro
            </h1>
            <p className="text-muted-foreground mt-2">
              Professional AI-powered trading assistant
            </p>
          </div>
          
          <div className="widget-container space-y-4">
            <h2 className="text-xl font-semibold">Sign In Required</h2>
            <p className="text-muted-foreground">
              Please sign in to access your trading dashboard.
            </p>
            <div className="flex space-x-2">
              <button 
                onClick={() => window.location.href = '/signin'}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-md transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => window.location.href = '/signup'}
                className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground py-2 px-4 rounded-md transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};

export default Layout;