import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, PieChart, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface Position {
  ticker: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  sector: string;
  weight: number;
}

export const PortfolioTracker: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [totalGainLoss, setTotalGainLoss] = useState(0);
  const [dailyChange, setDailyChange] = useState(0);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        // Fetch user's watchlist as proxy for portfolio
        const { data: watchlistData } = await supabase.rpc('get_watchlist_with_prices');
        
        if (!watchlistData || watchlistData.length === 0) {
          setPositions([]);
          return;
        }

        // Fetch current prices for watchlist tickers
        const { data: priceData } = await supabase
          .from('stock_prices')
          .select('ticker, price')
          .in('ticker', watchlistData.map(w => w.ticker))
          .order('ts', { ascending: false });

        if (priceData) {
          const positionsMap = new Map(
            priceData.map(p => [p.ticker, p.price])
          );

          // Note: This is a simplified portfolio view using watchlist
          // Real implementation would need a separate portfolio_positions table
          const portfolioPositions: Position[] = [];
          
          setPositions(portfolioPositions);
          setPortfolioValue(0);
          setTotalGainLoss(0);
          setDailyChange(0);
        }
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
      }
    };

    fetchPortfolioData();
    const interval = setInterval(fetchPortfolioData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getPositionPnL = (position: Position) => {
    return (position.currentPrice - position.avgCost) * position.shares;
  };

  const getPositionPnLPercent = (position: Position) => {
    return ((position.currentPrice - position.avgCost) / position.avgCost) * 100;
  };

  return (
    <Card className="widget-container">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PieChart className="h-5 w-5 text-primary" />
            <span>Portfolio Tracker</span>
          </div>
          <Button size="sm" variant="outline">
            <BarChart3 className="h-3 w-3 mr-2" />
            Analytics
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold">${portfolioValue.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Value</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-bull' : 'text-bear'}`}>
              {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total P&L</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${dailyChange >= 0 ? 'text-bull' : 'text-bear'}`}>
              {dailyChange >= 0 ? '+' : ''}${dailyChange.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Today</div>
          </div>
        </div>

        {/* Positions */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {positions.map((position, index) => {
            const pnl = getPositionPnL(position);
            const pnlPercent = getPositionPnLPercent(position);
            const positionValue = position.shares * position.currentPrice;

            return (
              <div key={index} className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">{position.ticker}</span>
                    <Badge variant="outline" className="text-xs">
                      {position.shares} shares
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${position.currentPrice}</div>
                    <div className="text-xs text-muted-foreground">
                      Avg: ${position.avgCost}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                  <div>
                    <span className="text-muted-foreground">Value:</span>
                    <span className="font-semibold ml-1">${positionValue.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">P&L:</span>
                    <span className={`font-semibold ml-1 ${pnl >= 0 ? 'text-bull' : 'text-bear'}`}>
                      {pnl >= 0 ? '+' : ''}${pnl.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">%:</span>
                    <span className={`font-semibold ml-1 ${pnlPercent >= 0 ? 'text-bull' : 'text-bear'}`}>
                      {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{position.sector}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">Weight:</span>
                    <span className="font-medium">{position.weight}%</span>
                    <Progress value={position.weight} className="w-16 h-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};