import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  ticker: string;
  condition: string;
  created_at: string;
}

export default function AlertsWidget() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [newSymbol, setNewSymbol] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel('alerts_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts'
        },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchAlerts() {
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setAlerts(data);
    }
    setLoading(false);
  }

  async function addAlert() {
    if (!newSymbol.trim() || !newCondition.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both symbol and condition",
        variant: "destructive"
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create alerts",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase.from('alerts').insert([{
      owner: user.id,
      user_id: user.id,
      ticker: newSymbol.toUpperCase(),
      condition: newCondition
    }]);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setNewSymbol('');
      setNewCondition('');
      toast({
        title: "Success",
        description: `Alert created for ${newSymbol.toUpperCase()}`
      });
    }
  }

  async function removeAlert(id: string) {
    const { error } = await supabase.from('alerts').delete().eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-3">Price Alerts</h3>
      
      <div className="space-y-2 mb-4">
        <Input
          placeholder="Symbol (e.g., AAPL)"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
        />
        <Input
          placeholder="Condition (e.g., price > 150)"
          value={newCondition}
          onChange={(e) => setNewCondition(e.target.value)}
        />
        <Button onClick={addAlert} className="w-full">
          Create Alert
        </Button>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
          </div>
        ) : alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No alerts configured
          </p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-3 bg-muted rounded"
            >
            <div>
                <div className="font-medium">{alert.ticker}</div>
                <div className="text-sm text-muted-foreground">{alert.condition}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAlert(alert.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
