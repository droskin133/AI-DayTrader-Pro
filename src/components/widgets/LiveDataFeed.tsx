import React, { useEffect, useState } from 'react';
import { Activity, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

export const LiveDataFeed: React.FC = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const seedSampleData = async () => {
    setIsSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke('data-seeder');
      if (error) throw error;
      
      setLastUpdate(new Date().toLocaleTimeString());
      console.log('Sample data seeded:', data);
    } catch (error) {
      console.error('Error seeding data:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Live Data Status</span>
          </div>
          {lastUpdate && (
            <Badge variant="secondary" className="text-xs">
              Updated {lastUpdate}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Seed sample market data to populate the dashboard with realistic stock prices and movements.
            </p>
            
            <Button 
              onClick={seedSampleData}
              disabled={isSeeding}
              className="flex items-center space-x-2"
            >
              {isSeeding ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              ) : (
                <Zap className="h-4 w-4" />
              )}
              <span>{isSeeding ? 'Seeding Data...' : 'Seed Sample Data'}</span>
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Creates realistic price movements for major stocks</p>
            <p>• Populates ticker tape and top movers widgets</p>
            <p>• Enables AI Trader Pro analysis features</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};