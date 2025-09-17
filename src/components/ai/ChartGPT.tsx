import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ChartGPTProps {
  ticker?: string;
}

export function ChartGPT({ ticker }: ChartGPTProps) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const generateChartExplanation = async () => {
    if (!ticker) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: { 
          prompt: `Analyze the current chart pattern and technical indicators for ${ticker}. Provide a brief trading analysis including key support/resistance levels, trend direction, and potential entry/exit points. Keep it under 150 words.` 
        }
      });
      
      if (error) {
        console.error('Error generating chart analysis:', error);
        setSummary("Chart analysis temporarily unavailable. Please try again.");
      } else {
        setSummary(data?.message || "No analysis available");
      }
    } catch (error) {
      console.error('Error:', error);
      setSummary("Chart analysis temporarily unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Chart Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-20 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI Chart Analysis
        </CardTitle>
        <Button
          onClick={generateChartExplanation}
          disabled={loading || !ticker}
          size="sm"
          variant="outline"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            "Analyze Chart"
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {summary ? (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {summary}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            {ticker ? "Click 'Analyze Chart' to get AI insights for this stock" : "Select a stock to analyze"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}