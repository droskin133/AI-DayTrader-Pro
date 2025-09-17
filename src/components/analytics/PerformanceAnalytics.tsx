import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceData {
  date: string;
  portfolioReturn: number;
  spyReturn: number;
  alpha: number;
}

interface PerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  alpha: number;
  beta: number;
  winRate: number;
  maxDrawdown: number;
  calmarRatio: number;
}

export const PerformanceAnalytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState('1Y');
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);

  useEffect(() => {
    // Mock performance data
    const mockMetrics: PerformanceMetrics = {
      totalReturn: 24.8,
      annualizedReturn: 18.6,
      volatility: 16.2,
      sharpeRatio: 1.42,
      alpha: 6.8,
      beta: 1.15,
      winRate: 68.5,
      maxDrawdown: -8.9,
      calmarRatio: 2.09
    };

    const mockData: PerformanceData[] = [
      { date: '2024-01', portfolioReturn: 2.5, spyReturn: 1.8, alpha: 0.7 },
      { date: '2024-02', portfolioReturn: 5.2, spyReturn: 3.1, alpha: 2.1 },
      { date: '2024-03', portfolioReturn: 8.9, spyReturn: 6.2, alpha: 2.7 },
      { date: '2024-04', portfolioReturn: 12.1, spyReturn: 8.8, alpha: 3.3 },
      { date: '2024-05', portfolioReturn: 15.6, spyReturn: 11.4, alpha: 4.2 },
      { date: '2024-06', portfolioReturn: 18.3, spyReturn: 13.9, alpha: 4.4 },
      { date: '2024-07', portfolioReturn: 21.7, spyReturn: 16.2, alpha: 5.5 },
      { date: '2024-08', portfolioReturn: 19.8, spyReturn: 15.1, alpha: 4.7 },
      { date: '2024-09', portfolioReturn: 24.8, spyReturn: 18.0, alpha: 6.8 },
    ];

    setMetrics(mockMetrics);
    setPerformanceData(mockData);
  }, [timeframe]);

  const getMetricColor = (value: number, isPositive: boolean = true): string => {
    if (isPositive) {
      return value > 0 ? 'text-bull' : 'text-bear';
    }
    return value < 0 ? 'text-bull' : 'text-bear';
  };

  if (!metrics) return <div>Loading performance analytics...</div>;

  return (
    <Card className="widget-container">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Performance Analytics</span>
            {metrics.alpha > 5 && (
              <Badge className="bg-bull/10 text-bull border-bull/20">
                <Award className="h-3 w-3 mr-1" />
                Alpha+
              </Badge>
            )}
          </div>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1M">1M</SelectItem>
              <SelectItem value="3M">3M</SelectItem>
              <SelectItem value="6M">6M</SelectItem>
              <SelectItem value="1Y">1Y</SelectItem>
              <SelectItem value="ALL">ALL</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Performance Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="portfolioReturn" 
                stroke="hsl(var(--bull))" 
                strokeWidth={2}
                name="Portfolio"
              />
              <Line 
                type="monotone" 
                dataKey="spyReturn" 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth={1}
                strokeDasharray="5 5"
                name="S&P 500"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className={`text-xl font-bold ${getMetricColor(metrics.totalReturn)}`}>
              {metrics.totalReturn > 0 ? '+' : ''}{metrics.totalReturn}%
            </div>
            <div className="text-xs text-muted-foreground">Total Return</div>
          </div>
          <div className="text-center">
            <div className={`text-xl font-bold ${getMetricColor(metrics.alpha)}`}>
              {metrics.alpha > 0 ? '+' : ''}{metrics.alpha}%
            </div>
            <div className="text-xs text-muted-foreground">Alpha</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-bull">
              {metrics.winRate}%
            </div>
            <div className="text-xs text-muted-foreground">Win Rate</div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Annualized Return</span>
              <span className={`font-semibold ${getMetricColor(metrics.annualizedReturn)}`}>
                {metrics.annualizedReturn}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Volatility</span>
              <span className="font-semibold">{metrics.volatility}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sharpe Ratio</span>
              <span className="font-semibold text-bull">{metrics.sharpeRatio}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Beta</span>
              <span className="font-semibold">{metrics.beta}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Drawdown</span>
              <span className={`font-semibold ${getMetricColor(metrics.maxDrawdown, false)}`}>
                {metrics.maxDrawdown}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Calmar Ratio</span>
              <span className="font-semibold text-bull">{metrics.calmarRatio}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Benchmark</span>
              <span className="font-semibold">S&P 500</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Outperformance</span>
              <span className="font-semibold text-bull">+{metrics.alpha}%</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button size="sm" variant="outline">
            <Calendar className="h-3 w-3 mr-1" />
            Report
          </Button>
          <Button size="sm" variant="outline">
            <TrendingUp className="h-3 w-3 mr-1" />
            Compare
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};