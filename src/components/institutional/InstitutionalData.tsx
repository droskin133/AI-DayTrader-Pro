import React, { useState, useEffect } from 'react';
import { Building2, TrendingUp, TrendingDown, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InstitutionalHolding {
  institution: string;
  shares: number;
  value: number;
  percentage: number;
  change: number;
  changePercent: number;
  reportDate: string;
  type: 'Hedge Fund' | 'Mutual Fund' | 'Pension Fund' | 'ETF' | 'Other';
}

interface InstitutionalSummary {
  totalShares: number;
  totalValue: number;
  institutionalOwnership: number;
  quarterlyChange: number;
  topHolders: number;
}

export const InstitutionalData: React.FC = () => {
  const [ticker, setTicker] = useState('AAPL');
  const [holdings, setHoldings] = useState<InstitutionalHolding[]>([]);
  const [summary, setSummary] = useState<InstitutionalSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock institutional data
    const mockSummary: InstitutionalSummary = {
      totalShares: 15832000000,
      totalValue: 2785600000000,
      institutionalOwnership: 62.8,
      quarterlyChange: 2.4,
      topHolders: 892
    };

    const mockHoldings: InstitutionalHolding[] = [
      {
        institution: 'Vanguard Group Inc',
        shares: 1284500000,
        value: 225990000000,
        percentage: 8.12,
        change: 15200000,
        changePercent: 1.2,
        reportDate: '2023-12-31',
        type: 'Mutual Fund'
      },
      {
        institution: 'BlackRock Inc',
        shares: 1058200000,
        value: 186191500000,
        percentage: 6.68,
        change: -8950000,
        changePercent: -0.8,
        reportDate: '2023-12-31',
        type: 'ETF'
      },
      {
        institution: 'Berkshire Hathaway Inc',
        shares: 915200000,
        value: 161052000000,
        percentage: 5.78,
        change: 0,
        changePercent: 0,
        reportDate: '2023-12-31',
        type: 'Other'
      },
      {
        institution: 'State Street Corp',
        shares: 642800000,
        value: 113093000000,
        percentage: 4.06,
        change: 12800000,
        changePercent: 2.0,
        reportDate: '2023-12-31',
        type: 'ETF'
      },
      {
        institution: 'FMR LLC (Fidelity)',
        shares: 384600000,
        value: 67659000000,
        percentage: 2.43,
        change: -5200000,
        changePercent: -1.3,
        reportDate: '2023-12-31',
        type: 'Mutual Fund'
      }
    ];

    setSummary(mockSummary);
    setHoldings(mockHoldings);
    setLoading(false);
  }, [ticker]);

  const getTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'hedge fund': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'mutual fund': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'pension fund': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'etf': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-bull" />;
    if (change < 0) return <TrendingDown className="h-3 w-3 text-bear" />;
    return <div className="h-3 w-3" />;
  };

  if (!summary) return <div>Loading institutional data...</div>;

  return (
    <Card className="widget-container">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span>Institutional Ownership</span>
          </div>
          <Select value={ticker} onValueChange={setTicker}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AAPL">AAPL</SelectItem>
              <SelectItem value="MSFT">MSFT</SelectItem>
              <SelectItem value="GOOGL">GOOGL</SelectItem>
              <SelectItem value="TSLA">TSLA</SelectItem>
              <SelectItem value="NVDA">NVDA</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Metrics */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Institutional Ownership</span>
              <span className="font-semibold text-primary">{summary.institutionalOwnership}%</span>
            </div>
            <Progress value={summary.institutionalOwnership} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Quarterly Change</span>
              <span className={`font-semibold ${summary.quarterlyChange >= 0 ? 'text-bull' : 'text-bear'}`}>
                {summary.quarterlyChange >= 0 ? '+' : ''}{summary.quarterlyChange}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Holders</span>
              <span className="font-semibold">{summary.topHolders}</span>
            </div>
          </div>
        </div>

        {/* Top Holdings */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Top Institutional Holders</h3>
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              Q4 2023
            </Badge>
          </div>
          
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
          ) : (
            holdings.map((holding, index) => (
              <div key={index} className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm">{holding.institution}</span>
                    <Badge className={getTypeColor(holding.type)}>
                      {holding.type}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{holding.percentage}%</div>
                    <div className="text-xs text-muted-foreground">of float</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                  <div>
                    <span className="text-muted-foreground">Shares:</span>
                    <span className="font-semibold ml-1">
                      {(holding.shares / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Value:</span>
                    <span className="font-semibold ml-1">
                      ${(holding.value / 1000000000).toFixed(1)}B
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-muted-foreground">Change:</span>
                    <div className="flex items-center ml-1">
                      {getChangeIcon(holding.change)}
                      <span className={`font-semibold ml-1 ${
                        holding.changePercent >= 0 ? 'text-bull' : 'text-bear'
                      }`}>
                        {holding.changePercent >= 0 ? '+' : ''}{holding.changePercent}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Progress value={holding.percentage} className="flex-1 mr-2 h-1" />
                  <span className="text-xs text-muted-foreground">
                    {(holding.change / 1000000).toFixed(1)}M shares
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Users className="h-3 w-3 mr-1" />
            All Holders
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            Flow Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};