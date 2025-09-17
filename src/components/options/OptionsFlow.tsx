import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OptionsFlowData {
  ticker: string;
  type: 'Call' | 'Put';
  strike: number;
  expiry: string;
  premium: number;
  volume: number;
  openInterest: number;
  unusual: boolean;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  timestamp: string;
  size: 'Retail' | 'Whale' | 'Institutional';
}

export const OptionsFlow: React.FC = () => {
  const [flows, setFlows] = useState<OptionsFlowData[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock options flow data
    const mockFlows: OptionsFlowData[] = [
      {
        ticker: 'AAPL',
        type: 'Call',
        strike: 180,
        expiry: '2024-01-19',
        premium: 8.50,
        volume: 15420,
        openInterest: 45230,
        unusual: true,
        sentiment: 'Bullish',
        timestamp: '14:32:15',
        size: 'Whale'
      },
      {
        ticker: 'TSLA',
        type: 'Put',
        strike: 240,
        expiry: '2024-01-12',
        premium: 12.75,
        volume: 8950,
        openInterest: 28100,
        unusual: true,
        sentiment: 'Bearish',
        timestamp: '14:28:42',
        size: 'Institutional'
      },
      {
        ticker: 'NVDA',
        type: 'Call',
        strike: 900,
        expiry: '2024-02-16',
        premium: 45.20,
        volume: 3280,
        openInterest: 12450,
        unusual: false,
        sentiment: 'Bullish',
        timestamp: '14:25:18',
        size: 'Retail'
      },
      {
        ticker: 'MSFT',
        type: 'Call',
        strike: 420,
        expiry: '2024-01-26',
        premium: 15.30,
        volume: 6750,
        openInterest: 31200,
        unusual: true,
        sentiment: 'Bullish',
        timestamp: '14:21:33',
        size: 'Whale'
      },
      {
        ticker: 'META',
        type: 'Put',
        strike: 350,
        expiry: '2024-01-19',
        premium: 18.90,
        volume: 4520,
        openInterest: 19800,
        unusual: false,
        sentiment: 'Bearish',
        timestamp: '14:18:09',
        size: 'Institutional'
      }
    ];

    setFlows(mockFlows);
    setLoading(false);
  }, []);

  const getSentimentColor = (sentiment: string): string => {
    switch (sentiment.toLowerCase()) {
      case 'bullish': return 'text-bull';
      case 'bearish': return 'text-bear';
      default: return 'text-muted-foreground';
    }
  };

  const getSizeColor = (size: string): string => {
    switch (size.toLowerCase()) {
      case 'whale': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'institutional': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'retail': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'Call' ? 
      <TrendingUp className="h-3 w-3 text-bull" /> : 
      <TrendingDown className="h-3 w-3 text-bear" />;
  };

  const filteredFlows = flows.filter(flow => {
    if (filter === 'unusual') return flow.unusual;
    if (filter === 'whale') return flow.size === 'Whale';
    if (filter === 'calls') return flow.type === 'Call';
    if (filter === 'puts') return flow.type === 'Put';
    return true;
  });

  return (
    <Card className="widget-container">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Options Flow</span>
            <Badge variant="secondary">Live</Badge>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Flow</SelectItem>
              <SelectItem value="unusual">Unusual</SelectItem>
              <SelectItem value="whale">Whale Alerts</SelectItem>
              <SelectItem value="calls">Calls Only</SelectItem>
              <SelectItem value="puts">Puts Only</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredFlows.map((flow, index) => (
              <div 
                key={index} 
                className={`p-3 border rounded-lg hover:bg-muted/30 transition-colors ${
                  flow.unusual ? 'border-primary/40 bg-primary/5' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-lg">{flow.ticker}</span>
                    <div className="flex items-center space-x-1">
                      {getTypeIcon(flow.type)}
                      <span className="text-sm font-medium">${flow.strike}</span>
                    </div>
                    <Badge className={getSizeColor(flow.size)}>
                      {flow.size}
                    </Badge>
                    {flow.unusual && (
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        Unusual
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{flow.timestamp}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-sm mb-2">
                  <div>
                    <span className="text-muted-foreground">Premium:</span>
                    <span className="font-semibold ml-1">${flow.premium}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Volume:</span>
                    <span className="font-semibold ml-1">{flow.volume.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">OI:</span>
                    <span className="font-semibold ml-1">{flow.openInterest.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Exp:</span>
                    <span className="font-semibold ml-1">{flow.expiry}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">Sentiment:</span>
                    <span className={`text-xs font-semibold ${getSentimentColor(flow.sentiment)}`}>
                      {flow.sentiment}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-semibold">
                      ${(flow.premium * flow.volume * 100).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex space-x-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Activity className="h-3 w-3 mr-1" />
            Live Stream
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            Alerts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};