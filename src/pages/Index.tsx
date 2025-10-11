import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState<any>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('polygon-data', {
          body: { ticker: 'SPY' }
        });
        
        if (error) throw error;
        setMarketData(data);
      } catch (error) {
        // Log error
        await supabase.from('error_logs').insert({
          function_name: 'Index',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          metadata: { component: 'Index' }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <p className="text-sm text-muted-foreground">Loading live market overview...</p>
        </div>
      </div>
    );
  }

  // Redirect to Dashboard as the main landing page
  return <Navigate to="/dashboard" replace />;
};

export default Index;
