import React, { useState } from 'react';
import { Sparkles, Search, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export const AIDeepScanner: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleScan = async () => {
    if (!prompt.trim()) return;
    
    setScanning(true);
    try {
      // Mock AI scan - will be replaced with real API call
      setTimeout(() => {
        setResults({
          overlays: [
            { type: 'support', ticker: 'AAPL', level: 175.50, confidence: 0.85 },
            { type: 'resistance', ticker: 'TSLA', level: 245.00, confidence: 0.78 }
          ],
          suggestions: [
            'AAPL approaching strong support at $175.50 - potential bounce opportunity',
            'Unusual volume spike detected in NVDA - monitor for breakout',
            'SPY showing bearish divergence on RSI - consider protective positions'
          ]
        });
        setScanning(false);
      }, 2000);
    } catch (error) {
      console.error('Error running AI scan:', error);
      setScanning(false);
    }
  };

  const createAlertFromSuggestion = (suggestion: string) => {
    // Extract ticker and create alert
    console.log('Creating alert from:', suggestion);
  };

  const pinToChart = (overlay: any) => {
    console.log('Pinning to chart:', overlay);
  };

  return (
    <Card className="widget-container">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>AI Deep Scanner</span>
          <Badge variant="secondary">Beta</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Ask AI to scan the market... 
Examples:
• Find stocks with RSI under 30
• Show me unusual volume patterns today
• Identify support and resistance levels for AAPL
• Scan for breakout opportunities"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
          <Button 
            onClick={handleScan} 
            disabled={scanning || !prompt.trim()}
            className="w-full"
          >
            {scanning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Scanning Market...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Run AI Scan
              </>
            )}
          </Button>
        </div>

        {results && (
          <div className="space-y-4">
            {/* AI Suggestions */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-bull" />
                AI Insights
              </h4>
              <div className="space-y-2">
                {results.suggestions.map((suggestion: string, index: number) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <p className="text-sm mb-2">{suggestion}</p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => createAlertFromSuggestion(suggestion)}>
                        <Target className="h-3 w-3 mr-1" />
                        Create Alert
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Overlays */}
            {results.overlays.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Technical Levels</h4>
                <div className="space-y-2">
                  {results.overlays.map((overlay: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <span className="font-medium">{overlay.ticker}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {overlay.type} at ${overlay.level}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {Math.round(overlay.confidence * 100)}% confidence
                        </Badge>
                        <Button size="sm" variant="ghost" onClick={() => pinToChart(overlay)}>
                          Pin to Chart
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};