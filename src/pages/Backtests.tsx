import React from 'react';
import Layout from '@/components/layout/Layout';
import { BacktestList } from '@/components/backtest/BacktestList';

const Backtests: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Backtest Results</h1>
            <p className="text-muted-foreground mt-2">
              Review your historical strategy performance and analysis results.
            </p>
          </div>
          
          <BacktestList />
        </div>
      </div>
    </Layout>
  );
};

export default Backtests;