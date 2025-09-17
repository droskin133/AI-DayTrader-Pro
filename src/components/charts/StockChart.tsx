import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TrendingUp, TrendingDown, Volume2, BarChart3 } from 'lucide-react';

interface StockChartProps {
  ticker?: string;
}

interface ChartDataPoint {
  time: string;
  timestamp: number;
  price: number;
  volume: number;
  ma20: number;
  ma50: number;
  ma200: number;
  rsi: number;
  macd: number;
  bollinger_upper: number;
  bollinger_lower: number;
  high: number;
  low: number;
  open: number;
  close: number;
}

export const StockChart: React.FC<StockChartProps> = ({ ticker = 'AAPL' }) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [timeframe, setTimeframe] = useState('1D');
  const [chartType, setChartType] = useState<'line' | 'area' | 'candlestick'>('area');
  const [overlays, setOverlays] = useState({
    ma20: true,
    ma50: true,
    ma200: false,
    bollinger: false,
    volume: true
  });
  const [indicators, setIndicators] = useState({
    rsi: false,
    macd: false
  });
  const [isRealTime, setIsRealTime] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    generateInitialData();
    
    if (isRealTime && timeframe === '1D') {
      intervalRef.current = setInterval(() => {
        updateRealTimeData();
      }, 2000); // Update every 2 seconds
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeframe, ticker, isRealTime]);

  const generateInitialData = () => {
    const dataPoints = timeframe === '1D' ? 100 : timeframe === '1W' ? 140 : 252;
    const basePrice = 150 + Math.random() * 100;
    const data: ChartDataPoint[] = [];
    
    let currentPrice = basePrice;
    const now = new Date();
    
    for (let i = dataPoints; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * (timeframe === '1D' ? 5 * 60 * 1000 : 24 * 60 * 60 * 1000));
      
      // Simulate realistic price movement
      const volatility = 0.02;
      const drift = 0.0001;
      const change = (Math.random() - 0.5) * volatility + drift;
      currentPrice = currentPrice * (1 + change);
      
      const high = currentPrice * (1 + Math.random() * 0.01);
      const low = currentPrice * (1 - Math.random() * 0.01);
      const volume = Math.floor(Math.random() * 2000000 + 500000);
      
      // Calculate moving averages
      const ma20 = currentPrice * (0.95 + Math.random() * 0.1);
      const ma50 = currentPrice * (0.93 + Math.random() * 0.14);
      const ma200 = currentPrice * (0.90 + Math.random() * 0.20);
      
      // Calculate Bollinger Bands
      const stdDev = currentPrice * 0.02;
      const bollinger_upper = ma20 + (2 * stdDev);
      const bollinger_lower = ma20 - (2 * stdDev);
      
      // Calculate RSI (simplified)
      const rsi = 30 + Math.random() * 40;
      
      // Calculate MACD (simplified)
      const macd = (Math.random() - 0.5) * 2;
      
      data.push({
        time: timeframe === '1D' 
          ? timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        timestamp: timestamp.getTime(),
        price: currentPrice,
        open: currentPrice * (0.99 + Math.random() * 0.02),
        close: currentPrice,
        high,
        low,
        volume,
        ma20,
        ma50,
        ma200,
        bollinger_upper,
        bollinger_lower,
        rsi,
        macd
      });
    }
    
    setChartData(data);
  };

  const updateRealTimeData = () => {
    setChartData(prevData => {
      if (prevData.length === 0) return prevData;
      
      const lastPoint = prevData[prevData.length - 1];
      const now = new Date();
      
      // Simulate price movement
      const change = (Math.random() - 0.5) * 0.01;
      const newPrice = lastPoint.price * (1 + change);
      
      const newDataPoint: ChartDataPoint = {
        ...lastPoint,
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: now.getTime(),
        price: newPrice,
        close: newPrice,
        high: Math.max(lastPoint.high, newPrice),
        low: Math.min(lastPoint.low, newPrice),
        volume: Math.floor(Math.random() * 500000 + 100000),
      };
      
      // Keep last 100 points for 1D view
      const newData = [...prevData.slice(-99), newDataPoint];
      return newData;
    });
  };

  const toggleOverlay = (overlay: string) => {
    setOverlays(prev => ({
      ...prev,
      [overlay]: !prev[overlay as keyof typeof prev]
    }));
  };

  const toggleIndicator = (indicator: string) => {
    setIndicators(prev => ({
      ...prev,
      [indicator]: !prev[indicator as keyof typeof prev]
    }));
  };

  const currentPrice = chartData[chartData.length - 1]?.price || 0;
  const previousPrice = chartData[chartData.length - 2]?.price || 0;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = (priceChange / previousPrice) * 100;
  const isPositive = priceChange >= 0;

  const renderChart = () => {
    if (chartType === 'line') {
      return (
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="time" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            domain={['dataMin - 2', 'dataMax + 2']}
          />
          
          <Line
            type="monotone"
            dataKey="price"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
          />
          
          {renderOverlays()}
        </LineChart>
      );
    } else if (chartType === 'area') {
      return (
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="time" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            domain={['dataMin - 2', 'dataMax + 2']}
          />
          
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <Area
            type="monotone"
            dataKey="price"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#priceGradient)"
            dot={false}
            activeDot={{ r: 4, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
          />
          
          {renderOverlays()}
        </AreaChart>
      );
    }
    
    return null;
  };

  const renderOverlays = () => (
    <>
      {overlays.ma20 && (
        <Line
          type="monotone"
          dataKey="ma20"
          stroke="#3b82f6"
          strokeWidth={1}
          dot={false}
          strokeDasharray="5 5"
        />
      )}
      
      {overlays.ma50 && (
        <Line
          type="monotone"
          dataKey="ma50"
          stroke="#f59e0b"
          strokeWidth={1}
          dot={false}
          strokeDasharray="5 5"
        />
      )}
      
      {overlays.ma200 && (
        <Line
          type="monotone"
          dataKey="ma200"
          stroke="#ef4444"
          strokeWidth={1}
          dot={false}
          strokeDasharray="10 5"
        />
      )}
      
      {overlays.bollinger && (
        <>
          <Line
            type="monotone"
            dataKey="bollinger_upper"
            stroke="#8b5cf6"
            strokeWidth={1}
            dot={false}
            strokeDasharray="2 2"
          />
          <Line
            type="monotone"
            dataKey="bollinger_lower"
            stroke="#8b5cf6"
            strokeWidth={1}
            dot={false}
            strokeDasharray="2 2"
          />
        </>
      )}
    </>
  );

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CardTitle className="flex items-center space-x-2">
                <span>{ticker} Chart</span>
                <Badge variant={isRealTime ? "default" : "secondary"}>
                  {isRealTime ? "Live" : "Static"}
                </Badge>
              </CardTitle>
              
              {/* Real-time price display */}
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold">
                  ${currentPrice.toFixed(2)}
                </span>
                <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="realtime">Real-time</Label>
              <Switch
                id="realtime"
                checked={isRealTime}
                onCheckedChange={setIsRealTime}
              />
            </div>
          </div>
          
          {/* Timeframe Controls */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <div className="flex space-x-2">
              {['1D', '1W', '1M', '3M', '1Y'].map((tf) => (
                <Button
                  key={tf}
                  variant={timeframe === tf ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeframe(tf)}
                >
                  {tf}
                </Button>
              ))}
            </div>
            
            <div className="flex space-x-2 ml-4">
              {['line', 'area'].map((type) => (
                <Button
                  key={type}
                  variant={chartType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType(type as any)}
                >
                  {type === 'line' ? <TrendingUp className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Overlay Controls */}
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(overlays).map(([key, enabled]) => (
              <Button
                key={key}
                variant={enabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleOverlay(key)}
              >
                {key.toUpperCase()}
              </Button>
            ))}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            <div className="flex space-x-4">
              {overlays.ma20 && <span className="flex items-center"><div className="w-3 h-0.5 bg-blue-500 mr-1"></div>MA20</span>}
              {overlays.ma50 && <span className="flex items-center"><div className="w-3 h-0.5 bg-yellow-500 mr-1"></div>MA50</span>}
              {overlays.ma200 && <span className="flex items-center"><div className="w-3 h-0.5 bg-red-500 mr-1"></div>MA200</span>}
              {overlays.bollinger && <span className="flex items-center"><div className="w-3 h-0.5 bg-purple-500 mr-1"></div>Bollinger</span>}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Volume Chart */}
      {overlays.volume && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2">
              <Volume2 className="h-4 w-4" />
              <span>Volume</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <Bar
                    dataKey="volume"
                    fill="hsl(var(--muted))"
                    opacity={0.6}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Technical Indicators */}
      {(indicators.rsi || indicators.macd) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Technical Indicators</CardTitle>
            <div className="flex space-x-2">
              {Object.entries(indicators).map(([key, enabled]) => (
                <Button
                  key={key}
                  variant={enabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleIndicator(key)}
                >
                  {key.toUpperCase()}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  
                  {indicators.rsi && (
                    <>
                      <Line
                        type="monotone"
                        dataKey="rsi"
                        stroke="#10b981"
                        strokeWidth={1}
                        dot={false}
                      />
                      <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="2 2" />
                      <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="2 2" />
                    </>
                  )}
                  
                  {indicators.macd && (
                    <Line
                      type="monotone"
                      dataKey="macd"
                      stroke="#3b82f6"
                      strokeWidth={1}
                      dot={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
