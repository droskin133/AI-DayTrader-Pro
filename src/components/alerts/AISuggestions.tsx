import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AISuggestionsProps {
  ticker?: string;
}

interface AlertSuggestion {
  id: string;
  condition: string;
  reason: string;
  confidence: number;
}

export function AISuggestions({ ticker }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<AlertSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!ticker || !user) return;
    
    const fetchAISuggestions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.functions.invoke('ai-alert-suggestions', {
          body: { ticker }
        });
        
        if (error) {
          console.error('Error fetching AI suggestions:', error);
          setSuggestions([]);
        } else {
          setSuggestions(data?.suggestions || []);
        }
      } catch (error) {
        console.error('Error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAISuggestions();
  }, [ticker, user]);

  const createAlert = async (suggestion: AlertSuggestion) => {
    if (!user || !ticker) return;
    
    try {
      const { error } = await supabase.from('alerts').insert({
        user_id: user.id,
        owner: user.id,
        ticker,
        condition: suggestion.condition,
        source: 'ai'
      });
      
      if (error) {
        console.error('Error creating alert:', error);
      } else {
        // Remove the suggestion after creating the alert
        setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Alert Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Alert Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No AI suggestions available for {ticker}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Alert Suggestions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="p-3 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-sm">{suggestion.condition}</h4>
                <span className="text-xs text-muted-foreground">
                  {suggestion.confidence}% confidence
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{suggestion.reason}</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => createAlert(suggestion)}
                className="w-full"
              >
                Create Alert
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}