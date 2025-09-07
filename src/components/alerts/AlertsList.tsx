import React from 'react';
import { Target, Clock, TrendingUp, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AlertsListProps {
  type: 'by-stock' | 'global' | 'history';
}

interface Alert {
  id: string;
  ticker: string;
  condition: string;
  status: 'active' | 'triggered' | 'expired' | 'canceled';
  source: 'user' | 'ai' | 'community';
  createdAt: string;
  expiresAt?: string;
  triggeredAt?: string;
  winRate?: number;
  avgReturn?: number;
}

export const AlertsList: React.FC<AlertsListProps> = ({ type }) => {
  // Mock alert data
  const alerts: Alert[] = [
    {
      id: '1',
      ticker: 'AAPL',
      condition: 'Price above $180',
      status: 'active',
      source: 'user',
      createdAt: '2024-01-15T09:00:00Z',
      expiresAt: '2024-01-16T16:00:00Z'
    },
    {
      id: '2',
      ticker: 'TSLA',
      condition: 'RSI below 30',
      status: 'triggered',
      source: 'ai',
      createdAt: '2024-01-15T08:00:00Z',
      triggeredAt: '2024-01-15T14:30:00Z',
      winRate: 75,
      avgReturn: 3.2
    },
    {
      id: '3',
      ticker: 'NVDA',
      condition: 'Volume exceeds 50M shares',
      status: 'active',
      source: 'user',
      createdAt: '2024-01-15T07:30:00Z',
      expiresAt: '2024-01-15T17:00:00Z'
    },
    {
      id: '4',
      ticker: 'SPY',
      condition: 'Market breaks above 485',
      status: 'expired',
      source: 'ai',
      createdAt: '2024-01-14T15:00:00Z',
      winRate: 60,
      avgReturn: -1.5
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'triggered': return 'destructive';
      case 'expired': return 'secondary';
      case 'canceled': return 'outline';
      default: return 'outline';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'ai': return '🤖';
      case 'community': return '👥';
      default: return '👤';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const groupedAlerts = type === 'by-stock' 
    ? alerts.reduce((acc, alert) => {
        if (!acc[alert.ticker]) acc[alert.ticker] = [];
        acc[alert.ticker].push(alert);
        return acc;
      }, {} as Record<string, Alert[]>)
    : { 'All Alerts': alerts };

  const filteredAlerts = type === 'history' 
    ? alerts.filter(alert => alert.status === 'triggered' || alert.status === 'expired')
    : type === 'global'
    ? alerts.filter(alert => alert.ticker === 'SPY' || alert.ticker === 'QQQ' || !alert.ticker)
    : alerts;

  const renderAlert = (alert: Alert) => (
    <Card key={alert.id} className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="font-medium">{alert.ticker}</span>
              <Badge variant={getStatusColor(alert.status)}>
                {alert.status}
              </Badge>
              <span className="text-xs">{getSourceIcon(alert.source)}</span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              {alert.condition}
            </p>
            
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Created {formatTime(alert.createdAt)}
              </div>
              {alert.expiresAt && alert.status === 'active' && (
                <div>
                  Expires {formatTime(alert.expiresAt)}
                </div>
              )}
              {alert.triggeredAt && (
                <div className="text-destructive">
                  Triggered {formatTime(alert.triggeredAt)}
                </div>
              )}
            </div>
            
            {type === 'history' && (alert.winRate !== undefined || alert.avgReturn !== undefined) && (
              <div className="flex items-center space-x-4 mt-2">
                {alert.winRate !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    {alert.winRate}% Win Rate
                  </Badge>
                )}
                {alert.avgReturn !== undefined && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${alert.avgReturn >= 0 ? 'text-bull' : 'text-bear'}`}
                  >
                    {alert.avgReturn >= 0 ? '+' : ''}{alert.avgReturn}% Avg Return
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Alert
              </DropdownMenuItem>
              {alert.source === 'ai' && (
                <DropdownMenuItem>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Improve with AI
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Alert
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  if (type === 'by-stock') {
    return (
      <div className="space-y-6">
        {Object.entries(groupedAlerts).map(([ticker, tickerAlerts]) => (
          <div key={ticker}>
            <h3 className="font-semibold mb-3 flex items-center">
              <span>{ticker}</span>
              <Badge variant="outline" className="ml-2">
                {tickerAlerts.length} alerts
              </Badge>
            </h3>
            <div>
              {tickerAlerts.map(renderAlert)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {(type === 'global' ? alerts.filter(alert => alert.ticker === 'SPY' || alert.ticker === 'QQQ') : filteredAlerts).map(renderAlert)}
      
      {filteredAlerts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No alerts found</p>
        </div>
      )}
    </div>
  );
};