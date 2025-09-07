import React, { useState } from 'react';
import { Building, Users, Scale, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface InstitutionalDataProps {
  ticker?: string;
}

export const InstitutionalData: React.FC<InstitutionalDataProps> = ({ ticker = 'AAPL' }) => {
  const [loading, setLoading] = useState(false);

  // Mock institutional data
  const institutionalData = {
    ownership: 62.5,
    topHolders: [
      { name: 'Berkshire Hathaway', percentage: 5.8, shares: 915000000, change: 0.2 },
      { name: 'Vanguard Group', percentage: 8.2, shares: 1295000000, change: 0.1 },
      { name: 'BlackRock', percentage: 6.4, shares: 1010000000, change: -0.1 },
      { name: 'State Street', percentage: 4.1, shares: 647000000, change: 0.3 }
    ],
    congressTrades: [
      { date: '2024-01-12', member: 'Rep. Johnson', action: 'BUY', amount: '$50K-$100K', party: 'R' },
      { date: '2024-01-10', member: 'Sen. Williams', action: 'SELL', amount: '$15K-$50K', party: 'D' },
      { date: '2024-01-08', member: 'Rep. Davis', action: 'BUY', amount: '$100K-$250K', party: 'D' }
    ],
    insiderTrades: [
      { date: '2024-01-14', insider: 'CEO Tim Cook', action: 'SELL', shares: 223000, value: 39100000 },
      { date: '2024-01-12', insider: 'CFO Luca Maestri', action: 'SELL', shares: 89000, value: 15600000 },
      { date: '2024-01-10', insider: 'SVP Katherine Adams', action: 'SELL', shares: 34000, value: 5950000 }
    ]
  };

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => setLoading(false), 1000);
  };

  const formatValue = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  const formatShares = (shares: number) => {
    if (shares >= 1000000) {
      return `${(shares / 1000000).toFixed(1)}M`;
    }
    return shares.toLocaleString();
  };

  return (
    <Card className="widget-container">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Institutional Data</span>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Institutional Ownership Overview */}
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Institutional Ownership</span>
            <Badge variant="outline">{institutionalData.ownership}%</Badge>
          </div>
          <Progress value={institutionalData.ownership} className="h-2" />
        </div>

        <Tabs defaultValue="holders" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="holders" className="text-xs">Top Holders</TabsTrigger>
            <TabsTrigger value="congress" className="text-xs">Congress</TabsTrigger>
            <TabsTrigger value="insiders" className="text-xs">Insiders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="holders" className="mt-3">
            <div className="space-y-2">
              {institutionalData.topHolders.map((holder, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{holder.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatShares(holder.shares)} shares
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{holder.percentage}%</div>
                    <div className={`text-xs ${
                      holder.change >= 0 ? 'text-bull' : 'text-bear'
                    }`}>
                      {holder.change >= 0 ? '+' : ''}{holder.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="congress" className="mt-3">
            <div className="space-y-2">
              {institutionalData.congressTrades.map((trade, index) => (
                <div key={index} className="p-2 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium">{trade.member}</div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={trade.action === 'BUY' ? 'default' : 'destructive'} 
                        className="text-xs"
                      >
                        {trade.action}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {trade.party}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{trade.date}</span>
                    <span>{trade.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="insiders" className="mt-3">
            <div className="space-y-2">
              {institutionalData.insiderTrades.map((trade, index) => (
                <div key={index} className="p-2 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium">{trade.insider}</div>
                    <Badge 
                      variant={trade.action === 'BUY' ? 'default' : 'destructive'} 
                      className="text-xs"
                    >
                      {trade.action}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{trade.date}</span>
                    <div className="text-right">
                      <div>{formatShares(trade.shares)} shares</div>
                      <div>{formatValue(trade.value)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            Data from Quiver Quantitative. Congress trades reported within 45 days as required by law.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};