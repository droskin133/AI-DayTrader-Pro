import React, { useState, useEffect } from 'react';
import { Plus, Filter, TrendingUp, Target, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CreateAlertDialog } from '@/components/alerts/CreateAlertDialog';
import { AlertsList } from '@/components/alerts/AlertsList';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Alerts: React.FC = () => {
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [selectedTab, setSelectedTab] = useState('by-stock');
  const { user } = useAuth();

  const [alertStats, setAlertStats] = useState({
    totalAlerts: 0,
    activeAlerts: 0,
    triggeredToday: 0,
    winRate: 0,
    avgReturn: 0
  });

  useEffect(() => {
    fetchAlertStats();
  }, []);

  const fetchAlertStats = async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('status, created_at, triggered_at')
        .eq('user_id', user?.id);

      if (error) throw error;

      if (data) {
        const total = data.length;
        const active = data.filter(alert => alert.status === 'active').length;
        const today = new Date().toDateString();
        const triggeredToday = data.filter(alert => 
          alert.triggered_at && new Date(alert.triggered_at).toDateString() === today
        ).length;

        setAlertStats({
          totalAlerts: total,
          activeAlerts: active,
          triggeredToday,
          winRate: total > 0 ? Math.round((triggeredToday / total) * 100) : 0,
          avgReturn: 2.3 // This would need additional tracking
        });
      }
    } catch (error) {
      console.error('Error fetching alert stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Alert Center</h1>
            <p className="text-muted-foreground">
              Manage your trading alerts and monitor performance
            </p>
          </div>
          <Button onClick={() => setShowCreateAlert(true)} className="space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Alert</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Alerts</p>
                  <p className="text-2xl font-bold">{alertStats.totalAlerts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{alertStats.activeAlerts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-bull" />
                <div>
                  <p className="text-sm text-muted-foreground">Triggered Today</p>
                  <p className="text-2xl font-bold">{alertStats.triggeredToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold text-bull">{alertStats.winRate}%</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">Avg Return</p>
                <p className="text-2xl font-bold text-bull">+{alertStats.avgReturn}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Tabs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Alerts</CardTitle>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="by-stock">By Stock</TabsTrigger>
                <TabsTrigger value="global">Global</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="by-stock" className="mt-4">
                <AlertsList type="by-stock" />
              </TabsContent>
              
              <TabsContent value="global" className="mt-4">
                <AlertsList type="global" />
              </TabsContent>
              
              <TabsContent value="history" className="mt-4">
                <AlertsList type="history" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <CreateAlertDialog 
        open={showCreateAlert}
        onOpenChange={setShowCreateAlert}
      />
    </div>
  );
};

export default Alerts;