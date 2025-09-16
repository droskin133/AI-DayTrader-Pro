import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { AIDeepScanner } from '@/components/ai/AIDeepScanner';
import { LargestMovers } from '@/components/widgets/LargestMovers';
import { NewsWidget } from '@/components/widgets/NewsWidget';
import { WatchlistWidget } from '@/components/widgets/WatchlistWidget';
import { AlertsWidget } from '@/components/widgets/AlertsWidget';
import { NotificationsPanel } from '@/components/notifications/NotificationsPanel';
import { useAuth } from '@/contexts/AuthContext';

interface Widget {
  id: string;
  component: React.ComponentType;
  title: string;
  gridArea: string;
}

const defaultWidgets: Widget[] = [
  { id: 'ai-scanner', component: AIDeepScanner, title: 'AI Deep Scanner', gridArea: 'a' },
  { id: 'largest-movers', component: LargestMovers, title: 'Largest Movers', gridArea: 'b' },
  { id: 'news', component: NewsWidget, title: 'In the News', gridArea: 'c' },
  { id: 'watchlist', component: WatchlistWidget, title: 'Watchlist', gridArea: 'd' },
  { id: 'alerts', component: AlertsWidget, title: 'Open Alerts', gridArea: 'e' },
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

  const handleDragEnd = (result: any) => {
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
                            widget.id === 'ai-scanner' 
                              ? 'lg:col-span-12' 
                              : widget.id === 'largest-movers' || widget.id === 'news'
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