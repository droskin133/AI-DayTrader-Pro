import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtime<T>(
  table: string,
  query?: string,
  onUpdate?: (payload: any) => void
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    let channel: RealtimeChannel;

    const setupRealtime = async () => {
      try {
        setLoading(false);

        // Setup realtime subscription
        channel = supabase
          .channel(`${table}_changes`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: table
            },
            (payload) => {
              setIsConnected(true);
              
              if (payload.eventType === 'INSERT') {
                setData(prev => [payload.new as T, ...prev]);
              } else if (payload.eventType === 'UPDATE') {
                setData(prev => prev.map(item =>
                  (item as any).id === (payload.new as any).id ? payload.new as T : item
                ));
              } else if (payload.eventType === 'DELETE') {
                setData(prev => prev.filter(item =>
                  (item as any).id !== (payload.old as any).id
                ));
              }

              onUpdate?.(payload);
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setIsConnected(true);
            } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
              setIsConnected(false);
            }
          });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
        setIsConnected(false);
      }
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, query, onUpdate]);

  return { data, loading, error, isConnected };
}
