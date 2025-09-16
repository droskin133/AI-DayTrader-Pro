import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { ScenarioChart } from './ScenarioChart';

interface Driver {
  id: string;
  stock_ticker: string;
  headline: string;
  impact_summary: string;
  event_date: string;
  source_url: string;
}

interface DriversListProps {
  ticker?: string;
}

export const DriversList: React.FC<DriversListProps> = ({ ticker }) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDrivers, setExpandedDrivers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (ticker) {
      fetchDrivers(ticker);
    }
  }, [ticker]);

  const fetchDrivers = async (symbol: string) => {
    try {
      setLoading(true);
      
      // Mock data for demonstration - will be replaced with real Supabase query when tables are available
      const mockDrivers: Driver[] = [
        {
          id: '1',
          stock_ticker: symbol,
          headline: `${symbol} Q4 Earnings Beat Expectations`,
          impact_summary: 'Strong quarterly results with 15% revenue growth and improved margins',
          event_date: '2024-01-15',
          source_url: 'https://example.com/earnings-report'
        },
        {
          id: '2',
          stock_ticker: symbol,
          headline: `FDA Approval for ${symbol} New Drug`,
          impact_summary: 'Major regulatory milestone that could unlock significant market opportunity',
          event_date: '2024-01-10',
          source_url: 'https://example.com/fda-approval'
        },
        {
          id: '3',
          stock_ticker: symbol,
          headline: `${symbol} Announces Strategic Partnership`,
          impact_summary: 'Partnership with major tech company could accelerate AI development',
          event_date: '2024-01-08',
          source_url: 'https://example.com/partnership'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setDrivers(mockDrivers);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleDriver = (driverId: string) => {
    const newExpanded = new Set(expandedDrivers);
    if (newExpanded.has(driverId)) {
      newExpanded.delete(driverId);
    } else {
      newExpanded.add(driverId);
    }
    setExpandedDrivers(newExpanded);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (drivers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No market drivers available for {ticker}. Add this stock to your watchlist to see analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Drivers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {drivers.map((driver) => (
            <div key={driver.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{driver.headline}</h4>
                  <p className="text-muted-foreground text-xs mb-2">
                    {driver.impact_summary}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {new Date(driver.event_date).toLocaleDateString()}
                    </Badge>
                    {driver.source_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1"
                        onClick={() => window.open(driver.source_url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleDriver(driver.id)}
                  className="ml-2"
                >
                  {expandedDrivers.has(driver.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {expandedDrivers.has(driver.id) && (
                <div className="mt-4 pt-4 border-t">
                  <ScenarioChart driverId={driver.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};