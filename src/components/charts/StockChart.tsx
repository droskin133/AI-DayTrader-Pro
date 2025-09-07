import React, { useState } from 'react';
import { BarChart3, TrendingUp, Maximize2, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StockChartProps {
  ticker?: string;
}

export const StockChart: React.FC<StockChartProps> = ({ ticker = 'AAPL' }) => {
  const [timeframe, setTimeframe] = useState('1D');
  const [overlays, setOverlays] = useState<string[]>(['volume']);

  // Mock chart data - in real implementation this would connect to chart library
  const chartData = {
    price: 175.43,
    change: 2.34,
    changePercent: 1.35,
    volume: 45234567,
    high: 176.89,
    low: 173.21
  };

  const timeframes = ['1m', '5m', '15m', '1h', '1D', '1W', '1M'];
  const availableOverlays = [
    { id: 'volume', label: 'Volume' },
    { id: 'sma20', label: 'SMA 20' },
    { id: 'sma50', label: 'SMA 50' },
    { id: 'rsi', label: 'RSI' },
    { id: 'support', label: 'Support/Resistance' },
    { id: 'news', label: 'News Events' }
  ];

  const toggleOverlay = (overlayId: string) => {
    setOverlays(prev => 
      prev.includes(overlayId) 
        ? prev.filter(id => id !== overlayId)
        : [...prev, overlayId]
    );
  };

  const isPositive = chartData.change >= 0;

  return (
    <Card className="chart-container">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>{ticker} Chart</span>
            <Badge variant={isPositive ? "default" : "destructive"}>
              {isPositive ? '+' : ''}{chartData.changePercent.toFixed(2)}%
            </Badge>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Chart Controls */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {timeframes.map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeframe(tf)}
                className="text-xs"
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>

        {/* Mock Chart Area */}
        <div className="h-80 bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
          {/* Gradient background to simulate chart */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent" />
          
          {/* Mock price line */}
          <div className="absolute inset-4">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              <path
                d="M 0 150 Q 50 100 100 120 T 200 80 T 300 60 T 400 40"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                className="drop-shadow-sm"
              />
              <circle cx="400" cy="40" r="4" fill="hsl(var(--primary))" />
            </svg>
          </div>
          
          <div className="text-center z-10">
            <div className="text-2xl font-bold mb-1">
              ${chartData.price.toFixed(2)}
            </div>
            <div className={`flex items-center justify-center space-x-1 ${
              isPositive ? 'text-bull' : 'text-bear'
            }`}>
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">
                {isPositive ? '+' : ''}{chartData.change.toFixed(2)} ({isPositive ? '+' : ''}{chartData.changePercent.toFixed(2)}%)
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Vol: {(chartData.volume / 1000000).toFixed(1)}M | H: ${chartData.high} | L: ${chartData.low}
            </div>
          </div>
        </div>

        {/* Chart Overlays */}
        <Tabs defaultValue="indicators" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="indicators">Indicators</TabsTrigger>
            <TabsTrigger value="overlays">Overlays</TabsTrigger>
            <TabsTrigger value="studies">Studies</TabsTrigger>
          </TabsList>
          
          <TabsContent value="indicators" className="mt-3">
            <div className="flex flex-wrap gap-2">
              {availableOverlays.map((overlay) => (
                <Button
                  key={overlay.id}
                  variant={overlays.includes(overlay.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleOverlay(overlay.id)}
                  className="text-xs"
                >
                  {overlay.label}
                </Button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="overlays" className="mt-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                AI-generated support and resistance levels, news events, and institutional activity overlays.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Support: $173.50</Badge>
                <Badge variant="outline">Resistance: $178.00</Badge>
                <Badge variant="outline">News: Earnings Call</Badge>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="studies" className="mt-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Advanced technical analysis studies and custom indicators.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">MACD</Button>
                <Button variant="outline" size="sm">Bollinger Bands</Button>
                <Button variant="outline" size="sm">Fibonacci</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};