import React from 'react';
import { X, Check, Bell, AlertTriangle, Newspaper, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Notification {
  id: string;
  type: 'alert' | 'news' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  // Mock notifications
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'alert',
      title: 'AAPL Alert Triggered',
      message: 'AAPL has crossed above $180.00',
      timestamp: '2024-01-15T14:30:00Z',
      read: false
    },
    {
      id: '2',
      type: 'news',
      title: 'Breaking: Fed Announcement',
      message: 'Federal Reserve signals potential rate cuts',
      timestamp: '2024-01-15T13:45:00Z',
      read: false
    },
    {
      id: '3',
      type: 'system',
      title: 'Welcome to AI DayTrader Pro',
      message: 'Your account has been set up successfully',
      timestamp: '2024-01-15T12:00:00Z',
      read: true
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="h-4 w-4 text-primary" />;
      case 'news': return <Newspaper className="h-4 w-4 text-blue-500" />;
      case 'system': return <Settings className="h-4 w-4 text-muted-foreground" />;
      default: return <Bell className="h-4 w-4" />;
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l shadow-lg">
        <Card className="h-full rounded-none border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount}</Badge>
                )}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Check className="h-4 w-4" />
                  Mark all read
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-hidden p-0">
            <Tabs defaultValue="all" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 mx-6 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="alerts">Alerts</TabsTrigger>
                <TabsTrigger value="news">News</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <TabsContent value="all" className="mt-0 px-6">
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                          !notification.read ? 'bg-muted/50 border-primary/20' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {getIcon(notification.type)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`text-sm font-medium ${
                                !notification.read ? 'font-semibold' : ''
                              }`}>
                                {notification.title}
                              </h4>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(notification.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="alerts" className="mt-0 px-6">
                  <div className="space-y-3">
                    {notifications
                      .filter(n => n.type === 'alert')
                      .map((notification) => (
                        <div 
                          key={notification.id}
                          className="p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted"
                        >
                          <div className="flex items-start space-x-3">
                            {getIcon(notification.type)}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-medium">
                                  {notification.title}
                                </h4>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(notification.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="news" className="mt-0 px-6">
                  <div className="space-y-3">
                    {notifications
                      .filter(n => n.type === 'news')
                      .map((notification) => (
                        <div 
                          key={notification.id}
                          className="p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted"
                        >
                          <div className="flex items-start space-x-3">
                            {getIcon(notification.type)}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-medium">
                                  {notification.title}
                                </h4>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(notification.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="system" className="mt-0 px-6">
                  <div className="space-y-3">
                    {notifications
                      .filter(n => n.type === 'system')
                      .map((notification) => (
                        <div 
                          key={notification.id}
                          className="p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted"
                        >
                          <div className="flex items-start space-x-3">
                            {getIcon(notification.type)}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-medium">
                                  {notification.title}
                                </h4>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(notification.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};