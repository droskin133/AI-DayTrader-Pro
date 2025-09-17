import React, { useState, useEffect } from 'react';
import { Zap, Target, Filter, RefreshCw, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

interface AlphaSignal {
  ticker: string;
  setup: string;
  confidence: number;
  timeframe: string;
  sector: string;
  entry: number;
  target: number;
  risk: number;
  reasoning: string;
  technicals: {
    rsi: number;
    volume: string;
    macd: string;
    trend: string;
  };
}

export const AlphaScout: React.FC = () => {
  const [signals, setSignals] = useState<AlphaSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [filters, setFilters] = useState({
    timeframe: 'all',
    sector: 'all',
    setup: 'all',
    confidence: 70
  });

  useEffect(() => {
    fetchAlphaSignals();
  }, []);

  const fetchAlphaSignals = async () => {
    try {
      setLoading(true);
      // Mock AI-generated signals - will be replaced with real edge function
      const mockSignals: AlphaSignal[] = [
        {
          ticker: 'NVDA',
          setup: 'Breakout',
          confidence: 94,
          timeframe: '1-3 days',
          sector: 'Technology',
          entry: 875.50,
          target: 925.00,
          risk: 850.00,
          reasoning: 'Strong momentum breakout above resistance with institutional buying. Volume confirming move.',
          technicals: {
            rsi: 68,
            volume: '+145%',
            macd: 'Bullish Cross',
            trend: 'Strong Up'
          }
        },
        {
          ticker: 'TSLA',
          setup: 'Bounce',
          confidence: 87,
          timeframe: '2-5 days',
          sector: 'Automotive',
          entry: 242.30,
          target: 265.00,
          risk: 235.00,
          reasoning: 'Oversold bounce from key support level. RSI showing divergence with price.',
          technicals: {
            rsi: 28,
            volume: '+78%',
            macd: 'Bullish Divergence',
            trend: 'Reversal'
          }
        },
        {
          ticker: 'AMD',
          setup: 'Flag Pattern',
          confidence: 82,
          timeframe: '3-7 days',
          sector: 'Technology',
          entry: 138.75,
          target: 148.00,
          risk: 132.50,
          reasoning: 'Bull flag consolidation after strong move. Tight range with decreasing volume.',
          technicals: {
            rsi: 55,
            volume: '-23%',
            macd: 'Consolidating',
            trend: 'Up'
          }
        },
        {
          ticker: 'MSFT',
          setup: 'Trendline Break',
          confidence: 79,
          timeframe: '1-2 weeks',
          sector: 'Technology',
          entry: 415.20,
          target: 435.00,
          risk: 408.00,
          reasoning: 'Breaking above 3-week downtrend line with volume. Fundamentals remain strong.',
          technicals: {
            rsi: 52,
            volume: '+45%',
            macd: 'Turning Positive',
            trend: 'Neutral to Up'
          }
        }
      ];
      
      setSignals(mockSignals);
    } catch (error) {
      console.error('Error fetching alpha signals:', error);
    } finally {
      setLoading(false);
    }
  };

  const runNewScan = async () => {
    setScanning(true);
    try {
      // Simulate AI scanning
      await new Promise(resolve => setTimeout(resolve, 3000));
      await fetchAlphaSignals();
    } catch (error) {
      console.error('Error running new scan:', error);
    } finally {
      setScanning(false);
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 90) return 'text-bull';
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-muted-foreground';
  };

  const getSetupColor = (setup: string): string => {
    switch (setup.toLowerCase()) {
      case 'breakout': return 'bg-bull/10 text-bull border-bull/20';
      case 'bounce': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'flag pattern': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'trendline break': return 'bg-green-500/10 text-green-600 border-green-500/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const createAlert = (signal: AlphaSignal) => {
    console.log('Creating alert for:', signal);
    // Navigate to alerts creation with pre-filled data
  };

  const viewChart = (ticker: string) => {
    window.open(`/ticker/${ticker}`, '_blank');
  };

  const filteredSignals = signals.filter(signal => {
    if (filters.timeframe !== 'all' && !signal.timeframe.includes(filters.timeframe)) return false;
    if (filters.sector !== 'all' && signal.sector !== filters.sector) return false;
    if (filters.setup !== 'all' && signal.setup !== filters.setup) return false;
    if (signal.confidence < filters.confidence) return false;
    return true;
  });

  return (
    <Card className="widget-container">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary" />
            <span>Alpha Scout</span>
            <Badge variant="secondary">AI Powered</Badge>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={runNewScan}
            disabled={scanning}
          >
            {scanning ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
                Scanning...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-2" />
                New Scan
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-2 gap-2">
          <Select value={filters.timeframe} onValueChange={(value) => setFilters(prev => ({ ...prev, timeframe: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Timeframes</SelectItem>
              <SelectItem value="1-3 days">1-3 Days</SelectItem>
              <SelectItem value="1-2 weeks">1-2 Weeks</SelectItem>
              <SelectItem value="2-5 days">2-5 Days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.sector} onValueChange={(value) => setFilters(prev => ({ ...prev, sector: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Automotive">Automotive</SelectItem>
              <SelectItem value="Healthcare">Healthcare</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Signal List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
          ) : filteredSignals.length > 0 ? (
            filteredSignals.map((signal, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-lg">{signal.ticker}</span>
                    <Badge className={getSetupColor(signal.setup)}>
                      {signal.setup}
                    </Badge>
                    <Badge variant="outline" className={getConfidenceColor(signal.confidence)}>
                      {signal.confidence}% confidence
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{signal.timeframe}</span>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{signal.reasoning}</p>

                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div>
                    <span className="text-muted-foreground">Entry:</span>
                    <span className="font-semibold ml-1">${signal.entry}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Target:</span>
                    <span className="font-semibold ml-1 text-bull">${signal.target}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Risk:</span>
                    <span className="font-semibold ml-1 text-bear">${signal.risk}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                  <div>RSI: {signal.technicals.rsi}</div>
                  <div>Volume: {signal.technicals.volume}</div>
                  <div>MACD: {signal.technicals.macd}</div>
                  <div>Trend: {signal.technicals.trend}</div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => createAlert(signal)}>
                    <Target className="h-3 w-3 mr-1" />
                    Create Alert
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => viewChart(signal.ticker)}>
                    <TrendingUp className="h-3 w-3 mr-1" />
                    View Chart
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No signals match current filters</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};