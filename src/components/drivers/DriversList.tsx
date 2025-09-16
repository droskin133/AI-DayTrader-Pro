import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { ScenarioChart } from './ScenarioChart';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('stock_ticker', symbol)
        .order('event_date', { ascending: false });

      if (error) {
        console.error('Error fetching drivers:', error);
        toast.error('Failed to load market drivers');
        setDrivers([]);
      } else {
        setDrivers(data || []);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error('Failed to load market drivers');
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