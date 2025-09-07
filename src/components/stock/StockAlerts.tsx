import React, { useState } from 'react';
import { Bell, Plus, Target, Clock, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StockAlertsProps {
  ticker?: string;
}

interface Alert {
  id: string;
  condition: string;
  status: 'active' | 'triggered' | 'expired';
  source: 'user' | 'ai';
  createdAt: string;
  expiresAt?: string;
}

export const StockAlerts: React.FC<StockAlertsProps> = ({ ticker = 'AAPL' }) => {
  const [showCreateAlert, setShowCreateAlert] = useState(false);

  // Mock alerts specific to this ticker
  const alerts: Alert[] = [
    {
      id: '1',
      condition: 'Price above $180',
      status: 'active',
      source: 'user',
      createdAt: '2024-01-15T09:00:00Z',
      expiresAt: '2024-01-16T16:00:00Z'
    },
    {
      id: '2',
      condition: 'RSI drops below 30',
      status: 'active',
      source: 'ai',
      createdAt: '2024-01-15T08:00:00Z'
    },
    {
      id: '3',
      condition: 'Volume exceeds 50M shares',
      status: 'triggered',
      source: 'user',
      createdAt: '2024-01-15T07:30:00Z'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'triggered': return 'destructive';
      case 'expired': return 'secondary';
      default: return 'outline';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const activeAlerts = alerts.filter(alert => alert.status === 'active');

  return (
    <Card className="widget-container">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>{ticker} Alerts</span>
            <Badge variant="outline">{activeAlerts.length}</Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowCreateAlert(true)}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className="p-3 border rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-primary" />
                  <Badge variant={getStatusColor(alert.status)} className="text-xs">
                    {alert.status}
                  </Badge>
                  {alert.source === 'ai' && (
                    <Brain className="h-3 w-3 text-primary" />
                  )}
                </div>
                
                {alert.expiresAt && alert.status === 'active' && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    Expires {formatTime(alert.expiresAt)}
                  </div>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                {alert.condition}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Created {formatTime(alert.createdAt)}
                </div>
                
                {alert.source === 'ai' && (
                  <Button variant="ghost" size="sm" className="text-xs h-auto py-1">
                    <Brain className="h-3 w-3 mr-1" />
                    Improve with AI
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {alerts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No alerts for {ticker}</p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShowCreateAlert(true)}>
              Create your first alert
            </Button>
          </div>
        )}

        <div className="mt-3 pt-3 border-t space-y-2">
          <Button size="sm" className="w-full" onClick={() => setShowCreateAlert(true)}>
            <Plus className="h-3 w-3 mr-2" />
            New Alert for {ticker}
          </Button>
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href="/alerts">View All Alerts</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};