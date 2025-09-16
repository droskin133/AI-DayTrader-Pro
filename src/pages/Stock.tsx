import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, StarOff, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StockChart } from '@/components/charts/StockChart';
import { AIStockAnalysis } from '@/components/ai/AIStockAnalysis';
import { StockNews } from '@/components/stock/StockNews';
import { StockAlerts } from '@/components/stock/StockAlerts';
import { InstitutionalData } from '@/components/stock/InstitutionalData';
import { DriversList } from '@/components/drivers/DriversList';
import { useAuth } from '@/contexts/AuthContext';

const Stock: React.FC = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const [stockData, setStockData] = useState<any>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (ticker) {
      fetchStockData(ticker);
      checkWatchlistStatus(ticker);
    }
  }, [ticker]);

  const fetchStockData = async (symbol: string) => {
    try {
      setLoading(true);
      // Mock data for now - will be replaced with real API calls
      setStockData({
        symbol: symbol,
        price: 175.43,
        change: 2.34,
        changePercent: 1.35,
        volume: 45234567,
        marketCap: '2.8T',
        pe: 28.5,
        dayHigh: 176.89,
        dayLow: 173.21,
        yearHigh: 198.23,
        yearLow: 142.56
      });
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWatchlistStatus = async (symbol: string) => {
    // Check if stock is in user's watchlist
    setIsInWatchlist(false);
  };

  const toggleWatchlist = async () => {
    if (!ticker || !user) return;
    
    try {
      if (isInWatchlist) {
        // Remove from watchlist
        setIsInWatchlist(false);
      } else {
        // Add to watchlist
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Stock Not Found</h1>
          <p className="text-muted-foreground">
            Unable to load data for {ticker}. Please check the symbol and try again.
          </p>
        </div>
      </div>
    );
  }

  const isPositive = stockData.change >= 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Stock Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold">{ticker}</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleWatchlist}
                className="text-muted-foreground hover:text-foreground"
              >
                {isInWatchlist ? (
                  <Star className="h-5 w-5 fill-current text-yellow-500" />
                ) : (
                  <StarOff className="h-5 w-5" />
                )}
              </Button>
            </div>
            <Badge variant={isPositive ? "default" : "destructive"}>
              Live
            </Badge>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-4xl font-bold">
                ${stockData.price.toFixed(2)}
              </span>
              <div className={`flex items-center space-x-1 ${isPositive ? 'text-bull' : 'text-bear'}`}>
                {isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="font-semibold">
                  {isPositive ? '+' : ''}{stockData.change.toFixed(2)} ({isPositive ? '+' : ''}{stockData.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart */}
          <div className="lg:col-span-2 space-y-6">
            <StockChart ticker={ticker} />
            
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Market Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Volume</p>
                    <p className="font-semibold">{stockData.volume.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Market Cap</p>
                    <p className="font-semibold">{stockData.marketCap}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">P/E Ratio</p>
                    <p className="font-semibold">{stockData.pe}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">52W Range</p>
                    <p className="font-semibold">${stockData.yearLow} - ${stockData.yearHigh}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Analysis & Data */}
          <div className="space-y-6">
            <AIStockAnalysis ticker={ticker} />
            <DriversList ticker={ticker} />
            <StockNews ticker={ticker} />
            <InstitutionalData ticker={ticker} />
            <StockAlerts ticker={ticker} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stock;