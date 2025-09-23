import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { AIDeepScanner } from '@/components/ai/AIDeepScanner';
import { LargestMovers } from '@/components/widgets/LargestMovers';
import { NewsWidget } from '@/components/widgets/NewsWidget';
import { WatchlistWidget } from '@/components/widgets/WatchlistWidget';
import { AlertsWidget } from '@/components/widgets/AlertsWidget';
import { TickerTape } from '@/components/stock/TickerTape';
import { SentimentRadar } from '@/components/ai/SentimentRadar';
import { AlphaScout } from '@/components/ai/AlphaScout';
import { BacktestQuickLaunch } from '@/components/backtest/BacktestQuickLaunch';
import { NotificationsPanel } from '@/components/notifications/NotificationsPanel';
import { PortfolioTracker } from '@/components/portfolio/PortfolioTracker';
import { RiskManager } from '@/components/risk/RiskManager';
import { PerformanceAnalytics } from '@/components/analytics/PerformanceAnalytics';
import { OptionsFlow } from '@/components/options/OptionsFlow';
import { InstitutionalData } from '@/components/institutional/InstitutionalData';
import { AIMarketAssistant } from '@/components/ai/AIMarketAssistant';
import { useAuth } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface Widget {
  id: string;
  component: React.ComponentType;
  title: string;
  gridArea: string;
}

// Create a safe widget registry that handles undefined components
const createSafeWidget = (id: string, component: React.ComponentType | undefined, title: string): Widget | null => {
  if (!component) {
    console.warn(`Component is undefined for widget: ${id}`);
    return null;
  }
  return { id, component, title, gridArea: id };
};

const defaultWidgets: Widget[] = [
  createSafeWidget('ai-assistant', AIMarketAssistant, 'AI Market Assistant'),
  createSafeWidget('largest-movers', LargestMovers, 'Largest Movers'),
  createSafeWidget('news', NewsWidget, 'Breaking News'),
  createSafeWidget('trader-pro', AlphaScout, 'Trader Pro'),
  createSafeWidget('portfolio', PortfolioTracker, 'Portfolio Tracker'),
  createSafeWidget('ai-scanner', AIDeepScanner, 'AI Deep Scanner'),
  createSafeWidget('sentiment', SentimentRadar, 'Sentiment Radar'),
  createSafeWidget('risk-manager', RiskManager, 'Risk Manager'),
  createSafeWidget('performance', PerformanceAnalytics, 'Performance Analytics'),
  createSafeWidget('options-flow', OptionsFlow, 'Options Flow'),
  createSafeWidget('institutional', InstitutionalData, 'Institutional Data'),
  createSafeWidget('backtest', BacktestQuickLaunch, 'Quick Backtest'),
  createSafeWidget('watchlist', WatchlistWidget, 'Watchlist'),
  createSafeWidget('alerts', AlertsWidget, 'Open Alerts'),
].filter((widget): widget is Widget => widget !== null);

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
        // Validate that parsed data contains valid widget IDs
        if (Array.isArray(parsed) && parsed.every(item => 
          item && typeof item === 'object' && 'id' in item
        )) {
          // Rebuild widgets with fresh component references
          const rebuiltWidgets = parsed.map(savedWidget => 
            defaultWidgets.find(w => w.id === savedWidget.id)
          ).filter((widget): widget is Widget => widget !== null);
          
          setWidgets(rebuiltWidgets.length > 0 ? rebuiltWidgets : defaultWidgets);
        } else {
          console.warn('Invalid widget layout data, using defaults');
          setWidgets(defaultWidgets);
        }
      } catch (error) {
        console.error('Error loading widget layout:', error);
        // Clear corrupted data and use defaults
        localStorage.removeItem(`widget-layout-${user?.id}`);
        setWidgets(defaultWidgets);
      }
    }
  }, [user?.id]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWidgets(items);
    
    // Save only widget IDs and order to prevent localStorage corruption
    if (user?.id) {
      const widgetOrder = items.map(widget => ({ id: widget.id }));
      localStorage.setItem(`widget-layout-${user.id}`, JSON.stringify(widgetOrder));
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

        {/* Live Ticker Tape */}
        <div className="mb-6">
          <TickerTape />
        </div>

        <ErrorBoundary fallback={
          <div className="p-4 text-center text-muted-foreground">
            Dashboard temporarily unavailable. Please refresh the page.
          </div>
        }>
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
                              widget.id === 'ai-assistant'
                                ? 'lg:col-span-12'
                                : widget.id === 'trader-pro' || widget.id === 'portfolio'
                                ? 'lg:col-span-8' 
                                : widget.id === 'ai-scanner' || widget.id === 'sentiment' || widget.id === 'risk-manager' || widget.id === 'performance'
                                ? 'lg:col-span-6'
                                : 'lg:col-span-4'
                            } ${snapshot.isDragging ? 'widget-dragging' : ''}`}
                          >
                            <ErrorBoundary>
                              <Component />
                            </ErrorBoundary>
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
        </ErrorBoundary>
      </div>

      <NotificationsPanel 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
};

export default Dashboard;