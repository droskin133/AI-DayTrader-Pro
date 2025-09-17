import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, TrendingDown, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';

interface RiskMetrics {
  portfolioVaR: number;
  sharpeRatio: number;
  maxDrawdown: number;
  betaWeighted: number;
  diversificationScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

interface PositionRisk {
  ticker: string;
  exposure: number;
  var95: number;
  correlation: number;
  riskContribution: number;
}

export const RiskManager: React.FC = () => {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [positionRisks, setPositionRisks] = useState<PositionRisk[]>([]);
  const [riskTolerance, setRiskTolerance] = useState([50]);
  const [maxPositionSize, setMaxPositionSize] = useState([20]);

  useEffect(() => {
    // Mock risk data
    const mockMetrics: RiskMetrics = {
      portfolioVaR: -2.8,
      sharpeRatio: 1.42,
      maxDrawdown: -12.5,
      betaWeighted: 1.15,
      diversificationScore: 72,
      riskLevel: 'Medium'
    };

    const mockPositionRisks: PositionRisk[] = [
      {
        ticker: 'AAPL',
        exposure: 35.2,
        var95: -1.2,
        correlation: 0.85,
        riskContribution: 28.5
      },
      {
        ticker: 'MSFT',
        exposure: 20.8,
        var95: -0.8,
        correlation: 0.78,
        riskContribution: 18.2
      },
      {
        ticker: 'TSLA',
        exposure: 12.1,
        var95: -2.5,
        correlation: 0.45,
        riskContribution: 35.8
      },
      {
        ticker: 'NVDA',
        exposure: 13.1,
        var95: -1.8,
        correlation: 0.92,
        riskContribution: 17.5
      }
    ];

    setRiskMetrics(mockMetrics);
    setPositionRisks(mockPositionRisks);
  }, []);

  const getRiskLevelColor = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'low': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'high': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getCorrelationColor = (correlation: number): string => {
    if (correlation > 0.8) return 'text-red-600';
    if (correlation > 0.5) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (!riskMetrics) return <div>Loading risk metrics...</div>;

  return (
    <Card className="widget-container">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>Risk Manager</span>
            <Badge className={getRiskLevelColor(riskMetrics.riskLevel)}>
              {riskMetrics.riskLevel} Risk
            </Badge>
          </div>
          <Button size="sm" variant="outline">
            <Calculator className="h-3 w-3 mr-2" />
            Calculate
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Risk Overview */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Portfolio VaR (95%)</span>
              <span className="font-semibold text-red-600">{riskMetrics.portfolioVaR}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
              <span className="font-semibold text-bull">{riskMetrics.sharpeRatio}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Max Drawdown</span>
              <span className="font-semibold text-red-600">{riskMetrics.maxDrawdown}%</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Portfolio Beta</span>
              <span className="font-semibold">{riskMetrics.betaWeighted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Diversification</span>
              <span className="font-semibold text-bull">{riskMetrics.diversificationScore}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Risk Score</span>
              <Progress value={65} className="w-16 h-2" />
            </div>
          </div>
        </div>

        {/* Risk Controls */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold text-sm">Risk Controls</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Risk Tolerance</span>
                <span className="text-sm font-semibold">{riskTolerance[0]}%</span>
              </div>
              <Slider
                value={riskTolerance}
                onValueChange={setRiskTolerance}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Max Position Size</span>
                <span className="text-sm font-semibold">{maxPositionSize[0]}%</span>
              </div>
              <Slider
                value={maxPositionSize}
                onValueChange={setMaxPositionSize}
                max={50}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Position Risk Analysis */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          <h3 className="font-semibold text-sm">Position Risk Breakdown</h3>
          {positionRisks.map((risk, index) => (
            <div key={index} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">{risk.ticker}</span>
                <div className="flex items-center space-x-2">
                  {risk.exposure > maxPositionSize[0] && (
                    <AlertTriangle className="h-3 w-3 text-red-600" />
                  )}
                  <Badge variant="outline" className="text-xs">
                    {risk.exposure}% exposure
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">VaR 95%:</span>
                  <span className="font-semibold ml-1 text-red-600">{risk.var95}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Correlation:</span>
                  <span className={`font-semibold ml-1 ${getCorrelationColor(risk.correlation)}`}>
                    {risk.correlation.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Risk Contrib:</span>
                  <span className="font-semibold ml-1">{risk.riskContribution}%</span>
                </div>
              </div>

              <div className="mt-2">
                <Progress value={risk.riskContribution} className="h-1" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};