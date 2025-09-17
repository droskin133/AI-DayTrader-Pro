import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { AIDeepScanner } from '@/components/ai/AIDeepScanner';
import { LargestMovers } from '@/components/widgets/LargestMovers';
import { NewsWidget } from '@/components/widgets/NewsWidget';
import { WatchlistWidget } from '@/components/widgets/WatchlistWidget';
import { AlertsWidget } from '@/components/widgets/AlertsWidget';
import { SentimentRadar } from '@/components/ai/SentimentRadar';
import { AlphaScout } from '@/components/ai/AlphaScout';
import { BacktestQuickLaunch } from '@/components/backtest/BacktestQuickLaunch';
import { NotificationsPanel } from '@/components/notifications/NotificationsPanel';
import { PortfolioTracker } from '@/components/portfolio/PortfolioTracker';
import { RiskManager } from '@/components/risk/RiskManager';
import { PerformanceAnalytics } from '@/components/analytics/PerformanceAnalytics';
import { OptionsFlow } from '@/components/options/OptionsFlow';
import { InstitutionalData } from '@/components/institutional/InstitutionalData';
import { useAuth } from '@/contexts/AuthContext';

interface Widget {
  id: string;
  component: React.ComponentType;
  title: string;
  gridArea: string;
}

const defaultWidgets: Widget[] = [
  { id: 'trader-pro', component: AlphaScout, title: 'Trader Pro', gridArea: 'a' },
  { id: 'portfolio', component: PortfolioTracker, title: 'Portfolio Tracker', gridArea: 'b' },
  { id: 'ai-scanner', component: AIDeepScanner, title: 'AI Deep Scanner', gridArea: 'c' },
  { id: 'sentiment', component: SentimentRadar, title: 'Sentiment Radar', gridArea: 'd' },
  { id: 'risk-manager', component: RiskManager, title: 'Risk Manager', gridArea: 'e' },
  { id: 'performance', component: PerformanceAnalytics, title: 'Performance Analytics', gridArea: 'f' },
  { id: 'options-flow', component: OptionsFlow, title: 'Options Flow', gridArea: 'g' },
  { id: 'institutional', component: InstitutionalData, title: 'Institutional Data', gridArea: 'h' },
  { id: 'backtest', component: BacktestQuickLaunch, title: 'Quick Backtest', gridArea: 'i' },
  { id: 'watchlist', component: WatchlistWidget, title: 'Watchlist', gridArea: 'j' },
  { id: 'largest-movers', component: LargestMovers, title: 'Largest Movers', gridArea: 'k' },
  { id: 'news', component: NewsWidget, title: 'In the News', gridArea: 'l' },
  { id: 'alerts', component: AlertsWidget, title: 'Open Alerts', gridArea: 'm' },
];

const Dashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<Widget[]>(defaultWidgets);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Load saved widget layout
    const savedLayout = localStorage.getItem(`widget-layout-${user?.id}`);
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout);
        setWidgets(parsed);
      } catch (error) {
        console.error('Error loading widget layout:', error);
      }
    }
  }, [user?.id]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWidgets(items);
    
    // Save layout
    if (user?.id) {
      localStorage.setItem(`widget-layout-${user.id}`, JSON.stringify(items));
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Trading Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email?.split('@')[0] || 'Trader'}. Monitor markets and AI insights in real-time.
          </p>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="dashboard" direction="vertical">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {widgets.map((widget, index) => {
                  const Component = widget.component;
                  return (
                    <Draggable key={widget.id} draggableId={widget.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`${
                            widget.id === 'trader-pro' || widget.id === 'portfolio'
                              ? 'lg:col-span-8' 
                              : widget.id === 'ai-scanner' || widget.id === 'sentiment' || widget.id === 'risk-manager' || widget.id === 'performance'
                              ? 'lg:col-span-6'
                              : 'lg:col-span-4'
                          } ${snapshot.isDragging ? 'widget-dragging' : ''}`}
                        >
                          <Component />
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <NotificationsPanel 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
};

export default Dashboard;