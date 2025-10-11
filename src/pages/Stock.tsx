import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, StarOff, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import LivePrice from '@/components/LivePrice';
import { fetchLivePrice } from '@/lib/fetchLivePrice';
import { StockChart } from '@/components/charts/StockChart';
import { AIStockAnalysis } from '@/components/ai/AIStockAnalysis';
import { AITraderPro } from '@/components/ai/AITraderPro';
import { StockNews } from '@/components/stock/StockNews';
import { StockAlerts } from '@/components/stock/StockAlerts';
import { InstitutionalData } from '@/components/stock/InstitutionalData';
import { DriversList } from '@/components/drivers/DriversList';
import { ChartGPT } from '@/components/ai/ChartGPT';
import { AISuggestions } from '@/components/alerts/AISuggestions';
import { SECFilings } from '@/components/stock/SECFilings';
import { InsiderTrades } from '@/components/stock/InsiderTrades';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ProductionStockData } from '@/components/production/ProductionStockData';

const Stock: React.FC = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const [stockData, setStockData] = useState<any>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [autoAiRunning, setAutoAiRunning] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (ticker) {
      fetchStockData(ticker);
      checkWatchlistStatus(ticker);
      runAutoAiAnalysis(ticker);
    }
  }, [ticker]);

  const runAutoAiAnalysis = async (symbol: string) => {
    setAutoAiRunning(true);
    try {
      // Auto-run AI analysis for the stock
      await supabase.functions.invoke('ai-analysis', {
        body: {
          mode: 'chart',
          symbol,
          payload: {
            interval: '1m',
            candles: [] // Will be filled by the AI function
          }
        }
      });
    } catch (error) {
      console.error('Auto AI analysis failed:', error);
    } finally {
      setAutoAiRunning(false);
    }
  };

  const fetchStockData = async (symbol: string) => {
    try {
      setLoading(true);
      
      // Fetch live data from polygon-data and ai-chart
      const [candleRes, overlayRes] = await Promise.all([
        supabase.functions.invoke('polygon-data', { body: { ticker: symbol } }),
        supabase.functions.invoke('ai-chart', { body: { ticker: symbol, timeframe: '1D' } })
      ]);

      if (candleRes.data) {
        const price = candleRes.data.c || 0;
        const open = candleRes.data.o || 0;
        const change = price - open;
        const changePercent = open > 0 ? (change / open) * 100 : 0;

        setLivePrice(price);
        setStockData({
          symbol: symbol,
          price: price,
          change: change,
          changePercent: changePercent,
          volume: candleRes.data.v || 0,
          marketCap: 'N/A',
          pe: 0,
          dayHigh: candleRes.data.h || 0,
          dayLow: candleRes.data.l || 0,
          yearHigh: 0,
          yearLow: 0
        });
      }
    } catch (error) {
      // Log error to error_logs
      await supabase.from('error_logs').insert({
        function_name: 'Stock-fetchStockData',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        metadata: { symbol }
      });
    } finally {
      setLoading(false);
    }
  };

  const checkWatchlistStatus = async (symbol: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .eq('ticker', symbol)
        .single();
      
      setIsInWatchlist(!!data && !error);
    } catch (error) {
      console.error('Error checking watchlist status:', error);
      setIsInWatchlist(false);
    }
  };

  const toggleWatchlist = async () => {
    if (!ticker || !user) return;
    
    try {
      const { error } = await supabase.rpc('toggle_watchlist', {
        ticker: ticker
      });
      
      if (!error) {
        setIsInWatchlist(!isInWatchlist);
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
              <LivePrice symbol={ticker!} className="text-4xl font-bold" />
              {autoAiRunning && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm">AI analyzing...</span>
                </div>
              )}
            </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart */}
          <div className="lg:col-span-2 space-y-6">
            <StockChart ticker={ticker} />
            
            <ProductionStockData ticker={ticker!} />
          </div>

          {/* Right Column - Analysis & Data */}
          <div className="space-y-6">
            <AITraderPro ticker={ticker} />
            <AIStockAnalysis ticker={ticker} />
            <ChartGPT ticker={ticker} />
            <SECFilings ticker={ticker} />
            <InsiderTrades ticker={ticker} />
            <DriversList ticker={ticker} />
            <AISuggestions ticker={ticker} />
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