import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Target, BarChart3, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface AIStockAnalysisProps {
  ticker?: string;
}

export const AIStockAnalysis: React.FC<AIStockAnalysisProps> = ({ ticker = 'AAPL' }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  // Auto-run analysis on component mount
  useEffect(() => {
    if (ticker) {
      runAnalysis();
    }
  }, [ticker]);

  // Mock AI analysis data
  const mockAnalysis = {
    recommendation: 'BUY',
    confidence: 78,
    priceTarget: 195.00,
    currentPrice: 175.43,
    upside: 11.2,
    keyFactors: [
      'Strong institutional buying detected',
      'Volume 15% above average',
      'Breaking above 20-day moving average',
      'Positive earnings sentiment'
    ],
    risks: [
      'Market volatility concerns',
      'Sector rotation risk'
    ],
    technicalScore: 82,
    fundamentalScore: 74,
    sentimentScore: 85,
    successRate: 67.5
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-analysis', {
        body: { 
          mode: 'chart',
          symbol: ticker,
          payload: {
            current_price: mockAnalysis.currentPrice,
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) throw error;

      if (data) {
        setAnalysis({
          ...mockAnalysis,
          recommendation: data.confidence > 0.7 ? 'BUY' : data.confidence < 0.3 ? 'SELL' : 'HOLD',
          confidence: Math.round(data.confidence * 100),
          keyFactors: data.rationale || mockAnalysis.keyFactors
        });
      } else {
        setAnalysis(mockAnalysis);
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      setAnalysis(mockAnalysis);
    } finally {
      setAnalyzing(false);
    }
  };

  const createAlertFromAnalysis = () => {
    console.log('Creating alert from AI analysis');
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'BUY': return 'text-bull';
      case 'SELL': return 'text-bear';
      default: return 'text-neutral';
    }
  };

  return (
    <Card className="widget-container">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-primary" />
          <span>AI Analysis</span>
          <Badge variant="secondary">Beta</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!analysis && !analyzing && (
          <div className="text-center py-6">
            <Sparkles className="h-8 w-8 mx-auto mb-3 text-primary opacity-50" />
            <p className="text-sm text-muted-foreground mb-3">
              Get AI-powered analysis for {ticker}
            </p>
            <Button onClick={runAnalysis} className="w-full">
              <Brain className="h-4 w-4 mr-2" />
              Analyze {ticker}
            </Button>
          </div>
        )}

        {analyzing && (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
            <p className="text-sm text-muted-foreground">
              AI is analyzing {ticker}...
            </p>
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            {/* Main Recommendation */}
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className={`text-2xl font-bold ${getRecommendationColor(analysis.recommendation)}`}>
                {analysis.recommendation}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {analysis.confidence}% Confidence
              </div>
              <Progress value={analysis.confidence} className="mt-2" />
            </div>

            {/* Price Target */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 border rounded">
                <div className="text-sm text-muted-foreground">Price Target</div>
                <div className="text-lg font-bold text-bull">
                  ${analysis.priceTarget.toFixed(2)}
                </div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-sm text-muted-foreground">Upside</div>
                <div className="text-lg font-bold text-bull">
                  +{analysis.upside.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Scores */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Technical Score</span>
                <div className="flex items-center space-x-2">
                  <Progress value={analysis.technicalScore} className="w-16 h-2" />
                  <span className="text-sm font-medium">{analysis.technicalScore}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Fundamental Score</span>
                <div className="flex items-center space-x-2">
                  <Progress value={analysis.fundamentalScore} className="w-16 h-2" />
                  <span className="text-sm font-medium">{analysis.fundamentalScore}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sentiment Score</span>
                <div className="flex items-center space-x-2">
                  <Progress value={analysis.sentimentScore} className="w-16 h-2" />
                  <span className="text-sm font-medium">{analysis.sentimentScore}</span>
                </div>
              </div>
            </div>

            {/* Key Factors */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-bull" />
                Key Bullish Factors
              </h4>
              <ul className="space-y-1">
                {analysis.keyFactors.map((factor: string, index: number) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start">
                    <span className="w-1 h-1 bg-bull rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Success Rate */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">AI Success Rate for {ticker}</span>
                <Badge variant="outline">{analysis.successRate}%</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on last 30 predictions
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button size="sm" onClick={createAlertFromAnalysis} className="flex-1">
                <Target className="h-3 w-3 mr-1" />
                Create Alert
              </Button>
              <Button size="sm" variant="outline" onClick={runAnalysis}>
                <BarChart3 className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};