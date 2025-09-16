import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface LegalText {
  id: number;
  kind: string;
  content: string;
  version: number;
  is_active: boolean;
  created_at: string;
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
      
      const { data, error } = await supabase
        .from('legal_texts')
        .select('*')
        .eq('is_active', true)
        .eq('kind', 'disclaimer')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching legal text:', error);
        toast.error('Failed to load legal terms');
        return;
      }

      if (data && data.length > 0) {
        setLegalText(data[0]);

        // Check if user has already accepted this version
        if (user) {
          const { data: acceptanceData } = await supabase
            .from('legal_acceptances')
            .select('*')
            .eq('user_id', user.id)
            .eq('legal_text_id', data[0].id)
            .single();

          if (acceptanceData) {
            onAccept();
            return;
          }
        }
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
      
      const { error } = await supabase
        .from('legal_acceptances')
        .insert({
          user_id: user.id,
          legal_text_id: legalText.id
        });

      if (error) {
        console.error('Error accepting legal terms:', error);
        toast.error('Failed to accept legal terms');
        return;
      }

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
          <DialogTitle>Legal Terms and Disclaimers</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-96 pr-4">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {legalText.content}
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