import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LegalText {
  id: string;
  title: string;
  body: string;
  version: string;
  effective_date: string;
}

interface DisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onAccept }) => {
  const [legalText, setLegalText] = useState<LegalText | null>(null);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchLatestLegalText();
    }
  }, [isOpen]);

  const fetchLatestLegalText = async () => {
    try {
      setLoading(true);
      
      // Mock legal text for demonstration - will be replaced with real Supabase query when tables are available
      const mockLegalText: LegalText = {
        id: '1',
        title: 'AI DayTrader Pro Terms and Disclaimers',
        body: `IMPORTANT DISCLAIMER: AI DayTrader Pro is for informational purposes only.

RISK WARNING: Trading stocks involves substantial risk of loss and may not be suitable for all investors.

NOT FINANCIAL ADVICE: The content provided by AI DayTrader Pro, including AI-generated insights, alerts, and analysis, does not constitute financial advice, investment recommendations, or trading signals.

DATA ACCURACY: While we strive for accuracy, we cannot guarantee the completeness or accuracy of market data, AI analysis, or third-party information.

LIMITATION OF LIABILITY: AI DayTrader Pro and its operators shall not be liable for any trading losses, missed opportunities, or damages arising from the use of this platform.

By accepting these terms, you acknowledge that you understand these risks and agree to use AI DayTrader Pro at your own discretion.`,
        version: '1.0',
        effective_date: new Date().toISOString().split('T')[0]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setLegalText(mockLegalText);

      // Check if user has already accepted this version (mock check)
      const hasAcceptedKey = `legal_accepted_${user?.id}_${mockLegalText.version}`;
      const hasAcceptedBefore = localStorage.getItem(hasAcceptedKey);
      
      if (hasAcceptedBefore) {
        onAccept();
        return;
      }
    } catch (error) {
      console.error('Error fetching legal text:', error);
      toast.error('Failed to load legal terms');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!user || !legalText || !hasAccepted) return;

    try {
      setAccepting(true);
      
      // Mock acceptance storage - will be replaced with real Supabase call when tables are available
      const hasAcceptedKey = `legal_accepted_${user.id}_${legalText.version}`;
      localStorage.setItem(hasAcceptedKey, new Date().toISOString());

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      toast.success('Legal terms accepted');
      onAccept();
    } catch (error) {
      console.error('Error accepting legal terms:', error);
      toast.error('Failed to accept legal terms');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!legalText) {
    return null;
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{legalText.title}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-96 pr-4">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {legalText.body}
          </div>
        </ScrollArea>

        <div className="flex items-center space-x-2 py-4">
          <Checkbox
            id="accept-terms"
            checked={hasAccepted}
            onCheckedChange={(checked) => setHasAccepted(checked as boolean)}
          />
          <label 
            htmlFor="accept-terms" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I have read and accept these terms and disclaimers
          </label>
        </div>

        <DialogFooter>
          <Button
            onClick={handleAccept}
            disabled={!hasAccepted || accepting}
            className="w-full"
          >
            {accepting ? 'Accepting...' : 'Accept and Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};