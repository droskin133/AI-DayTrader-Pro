import React, { useState } from 'react';
import { Play, BarChart3, Clock, TrendingUp, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BacktestResult {
  winRate: number;
  avgReturn: number;
  maxDrawdown: number;
  totalTrades: number;
  profitFactor: number;
}

export const BacktestQuickLaunch: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [ticker, setTicker] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('6m');
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<BacktestResult | null>(null);

  const strategies = [
    { 
      id: 'rsi_oversold', 
      name: 'RSI Oversold Bounce', 
      description: 'Buy when RSI < 30, sell when RSI > 70' 
    },
    { 
      id: 'ma_crossover', 
      name: 'Moving Average Crossover', 
      description: '20 MA crosses above 50 MA' 
    },
    { 
      id: 'breakout', 
      name: 'Resistance Breakout', 
      description: 'Buy on volume breakout above 20-day high' 
    },
    { 
      id: 'support_bounce', 
      name: 'Support Level Bounce', 
      description: 'Buy at support with volume confirmation' 
    },
    { 
      id: 'volume_spike', 
      name: 'Volume Spike Pattern', 
      description: 'Volume > 2x average with price momentum' 
    }
  ];

  const runBacktest = async () => {
    if (!selectedStrategy || !ticker) return;
    
    setRunning(true);
    try {
      // Simulate backtest execution
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock results - will be replaced with real backtest API
      const mockResults: BacktestResult = {
        winRate: 68.5,
        avgReturn: 4.2,
        maxDrawdown: -12.3,
        totalTrades: 24,
        profitFactor: 1.8
      };
      
      setResults(mockResults);
    } catch (error) {
      console.error('Error running backtest:', error);
    } finally {
      setRunning(false);
    }
  };

  const openFullBacktest = () => {
    window.open('/backtest', '_blank');
  };

  const selectedStrategyInfo = strategies.find(s => s.id === selectedStrategy);

  return (
    <Card className="widget-container">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span>Backtest Quick Launch</span>
          <Badge variant="outline">Fast Test</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Strategy Selection */}
        <div className="space-y-2">
          <Label>Trading Strategy</Label>
          <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
            <SelectTrigger>
              <SelectValue placeholder="Select a strategy to test" />
            </SelectTrigger>
            <SelectContent>
              {strategies.map((strategy) => (
                <SelectItem key={strategy.id} value={strategy.id}>
                  {strategy.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedStrategyInfo && (
            <p className="text-sm text-muted-foreground">
              {selectedStrategyInfo.description}
            </p>
          )}
        </div>

        {/* Parameters */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Ticker</Label>
            <Input
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="AAPL"
              maxLength={5}
            />
          </div>
          <div className="space-y-2">
            <Label>Timeframe</Label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
                <SelectItem value="2y">2 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Run Button */}
        <Button
          onClick={runBacktest}
          disabled={running || !selectedStrategy || !ticker}
          className="w-full"
        >
          {running ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Running Backtest...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Quick Backtest
            </>
          )}
        </Button>

        {/* Results */}
        {results && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Backtest Results</h4>
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                {timeframe}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Win Rate</span>
                  <TrendingUp className="h-3 w-3 text-bull" />
                </div>
                <div className="text-lg font-bold text-bull">
                  {results.winRate.toFixed(1)}%
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Return</span>
                  <Target className="h-3 w-3 text-primary" />
                </div>
                <div className="text-lg font-bold">
                  {results.avgReturn > 0 ? '+' : ''}{results.avgReturn.toFixed(1)}%
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Max Drawdown</span>
                <div className="text-lg font-bold text-bear">
                  {results.maxDrawdown.toFixed(1)}%
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Total Trades</span>
                <div className="text-lg font-bold">
                  {results.totalTrades}
                </div>
              </div>
            </div>

            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profit Factor</span>
                <span className="text-lg font-bold text-primary">
                  {results.profitFactor.toFixed(2)}x
                </span>
              </div>
            </div>

            <Button variant="outline" onClick={openFullBacktest} className="w-full">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Full Backtest Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};