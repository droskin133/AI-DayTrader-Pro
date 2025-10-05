import React from 'react';
import Layout from '@/components/layout/Layout';
import { TickerTape } from '@/components/layout/TickerTape';
import { AIMarketAssistant } from '@/components/ai/AIMarketAssistant';
import { TopMovers } from '@/components/widgets/TopMovers';
import { NewsWidget } from '@/components/widgets/NewsWidget';
import { WatchlistWidget } from '@/components/widgets/WatchlistWidget';
import { FeedbackButton } from '@/components/layout/FeedbackButton';
import { useAuth } from '@/contexts/AuthContext';


const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Ticker Tape */}
        <TickerTape />
        
        <div className="container mx-auto p-6 space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">AI DayTrader Pro</h1>
            <p className="text-muted-foreground text-lg">
              Advanced AI-powered trading intelligence and market analysis
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <AIMarketAssistant />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <WatchlistWidget />
              <TopMovers />
            </div>
            <div className="lg:col-span-1">
              <NewsWidget />
            </div>
          </div>
        </div>
        
        <FeedbackButton />
      </div>
    </Layout>
  );
};

export default Dashboard;