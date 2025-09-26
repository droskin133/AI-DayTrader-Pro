import React from 'react';
import Layout from '@/components/layout/Layout';
import { TickerTape } from '@/components/layout/TickerTape';
import { AIMarketAssistant } from '@/components/ai/AIMarketAssistant';
import { TopMovers } from '@/components/widgets/TopMovers';
import { NewsWidget } from '@/components/widgets/NewsWidget';
import { LiveDataFeed } from '@/components/widgets/LiveDataFeed';
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

          {/* AI Market Assistant - Centerpiece */}
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-2xl">
              <AIMarketAssistant />
            </div>
          </div>

          {/* Widgets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TopMovers />
            <NewsWidget />
            <LiveDataFeed />
          </div>
        </div>
        
        <FeedbackButton />
      </div>
    </Layout>
  );
};

export default Dashboard;