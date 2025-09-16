import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Play, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface BacktestResult {
  id: string;
  ticker: string;
  strategy_name: string;
  started_at: string;
  completed_at: string | null;
  result: {
    win_rate?: number;
    avg_return?: number;
    total_trades?: number;
    max_drawdown?: number;
  } | null;
  status: 'running' | 'completed' | 'failed';
}

export const BacktestList: React.FC = () => {
  const [backtests, setBacktests] = useState<BacktestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchBacktests();
    }
  }, [user]);

  const fetchBacktests = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration - will be replaced with real Supabase query when tables are available
      const mockBacktests: BacktestResult[] = [
        {
          id: '1',
          ticker: 'AAPL',
          strategy_name: 'RSI Oversold Bounce',
          started_at: '2024-01-15T10:30:00Z',
          completed_at: '2024-01-15T10:35:00Z',
          status: 'completed',
          result: {
            win_rate: 0.67,
            avg_return: 0.034,
            total_trades: 45,
            max_drawdown: -0.089
          }
        },
        {
          id: '2',
          ticker: 'TSLA',
          strategy_name: 'Breakout + Volume',
          started_at: '2024-01-14T09:15:00Z',
          completed_at: '2024-01-14T09:22:00Z',
          status: 'completed',
          result: {
            win_rate: 0.58,
            avg_return: 0.019,
            total_trades: 38,
            max_drawdown: -0.125
          }
        },
        {
          id: '3',
          ticker: 'NVDA',
          strategy_name: 'AI Signal Combo',
          started_at: '2024-01-13T14:20:00Z',
          completed_at: null,
          status: 'running',
          result: null
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setBacktests(mockBacktests);
    } catch (error) {
      console.error('Error fetching backtests:', error);
      setBacktests([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'running':
        return <Badge variant="secondary">Running</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatPercentage = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Backtest Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (backtests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Backtest Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No backtests found. Run your first backtest to see results here.
            </p>
            <Button onClick={() => navigate('/backtest')}>
              <Play className="mr-2 h-4 w-4" />
              Run Backtest
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backtest Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {backtests.map((backtest) => (
            <div key={backtest.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{backtest.ticker}</h4>
                    {getStatusBadge(backtest.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {backtest.strategy_name || 'Custom Strategy'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Started: {new Date(backtest.started_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/backtest/${backtest.id}`)}
                  disabled={backtest.status !== 'completed'}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>

              {backtest.status === 'completed' && backtest.result && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Win Rate:</span>
                    <div className="font-medium">
                      {formatPercentage(backtest.result.win_rate)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Return:</span>
                    <div className="font-medium">
                      {formatPercentage(backtest.result.avg_return)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Trades:</span>
                    <div className="font-medium">
                      {backtest.result.total_trades || 0}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max Drawdown:</span>
                    <div className="font-medium text-destructive">
                      {formatPercentage(backtest.result.max_drawdown)}
                    </div>
                  </div>
                </div>
              )}

              {backtest.status === 'running' && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Backtest in progress...
                </div>
              )}

              {backtest.status === 'failed' && (
                <div className="text-sm text-destructive">
                  Backtest failed to complete. Please try again.
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};