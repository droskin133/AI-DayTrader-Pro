import React, { useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface TradeSetup {
  ticker: string;
  timeframe: string;
  trade_setup: string;
  market_signals: {
    options_activity: number;
    news_items: number;
    institutional_signals: number;
    price_levels_available: boolean;
  };
  generated_at: string;
}

interface AITraderProProps {
  ticker?: string;
}

export const AITraderPro: React.FC<AITraderProProps> = ({ ticker = 'SPY' }) => {
  const [setup, setSetup] = useState<TradeSetup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSetup = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-trader-pro', {
        body: { ticker, timeframe: 'intraday' }
      });

      if (error) throw error;
      setSetup(data);
    } catch (err) {
      console.error('Error generating trade setup:', err);
      setError('Failed to generate trade setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="widget-container">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>AI Trader Pro</span>
            <Badge variant="outline">{ticker}</Badge>
          </div>
          <Button 
            onClick={generateSetup}
            disabled={loading}
            size="sm"
            className="flex items-center space-x-1"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
            <span>{loading ? 'Analyzing...' : 'Generate Setup'}</span>
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        {setup ? (
          <div className="space-y-4">
            {/* Market Signals Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-lg font-bold">{setup.market_signals.options_activity}</div>
                <div className="text-xs text-muted-foreground">Options Signals</div>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-lg font-bold">{setup.market_signals.news_items}</div>
                <div className="text-xs text-muted-foreground">News Items</div>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-lg font-bold">{setup.market_signals.institutional_signals}</div>
                <div className="text-xs text-muted-foreground">Institutional</div>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="flex items-center justify-center">
                  {setup.market_signals.price_levels_available ? (
                    <Target className="h-5 w-5 text-green-600" />
                  ) : (
                    <Target className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">Price Levels</div>
              </div>
            </div>

            {/* Trade Setup */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Trade Setup Analysis</h4>
                <Badge variant="secondary" className="text-xs">
                  {new Date(setup.generated_at).toLocaleTimeString()}
                </Badge>
              </div>
              
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {setup.trade_setup}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                This analysis is based on live market data including options flow, price levels, 
                news sentiment, and institutional activity. Always manage your risk appropriately.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground mb-4">
              Generate real-time trade setups using live market data
            </p>
            <p className="text-xs text-muted-foreground">
              AI analyzes options flow, price levels, news, and institutional activity
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};