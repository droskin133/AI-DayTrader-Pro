import React, { useState } from 'react';
import { Target, Calendar, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface CreateAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateAlertDialog: React.FC<CreateAlertDialogProps> = ({ open, onOpenChange }) => {
  const [alertData, setAlertData] = useState({
    ticker: '',
    condition: '',
    description: '',
    expiry: 'end-of-day',
    aiSuggestions: true
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Mock alert creation - will be replaced with real API call
      console.log('Creating alert:', alertData);
      setTimeout(() => {
        setLoading(false);
        onOpenChange(false);
        setAlertData({
          ticker: '',
          condition: '',
          description: '',
          expiry: 'end-of-day',
          aiSuggestions: true
        });
      }, 1000);
    } catch (error) {
      console.error('Error creating alert:', error);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Create New Alert</span>
          </DialogTitle>
          <DialogDescription>
            Set up a custom alert to monitor market conditions and get notified when your criteria are met.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ticker">Stock Symbol</Label>
              <Input
                id="ticker"
                placeholder="e.g. AAPL, TSLA, NVDA"
                value={alertData.ticker}
                onChange={(e) => setAlertData(prev => ({ ...prev, ticker: e.target.value.toUpperCase() }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Alert Condition</Label>
              <Textarea
                id="condition"
                placeholder="Describe your alert condition in natural language:
• Price above $180
• RSI drops below 30
• Volume exceeds 50 million
• Price breaks resistance at $200"
                value={alertData.condition}
                onChange={(e) => setAlertData(prev => ({ ...prev, condition: e.target.value }))}
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Add a note about this alert"
                value={alertData.description}
                onChange={(e) => setAlertData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Alert Expiry</Label>
              <Select 
                value={alertData.expiry}
                onValueChange={(value) => setAlertData(prev => ({ ...prev, expiry: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="end-of-day">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>End of Day</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="1-week">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>1 Week</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="1-month">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>1 Month</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="never">No Expiry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>AI Suggestions</Label>
                <p className="text-sm text-muted-foreground">
                  Get AI-powered improvements for this alert
                </p>
              </div>
              <Switch
                checked={alertData.aiSuggestions}
                onCheckedChange={(checked) => setAlertData(prev => ({ ...prev, aiSuggestions: checked }))}
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Alert'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};