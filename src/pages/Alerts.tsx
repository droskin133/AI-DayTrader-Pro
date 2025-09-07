import React, { useState } from 'react';
import { Plus, Filter, TrendingUp, Target, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CreateAlertDialog } from '@/components/alerts/CreateAlertDialog';
import { AlertsList } from '@/components/alerts/AlertsList';

const Alerts: React.FC = () => {
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [selectedTab, setSelectedTab] = useState('by-stock');

  // Mock data - will be replaced with real data
  const alertStats = {
    totalAlerts: 12,
    activeAlerts: 8,
    triggeredToday: 3,
    winRate: 67.5,
    avgReturn: 2.3
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