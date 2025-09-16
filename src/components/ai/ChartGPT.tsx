import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface ChartGPTProps {
  ticker?: string;
}

export function ChartGPT({ ticker }: ChartGPTProps) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticker) return;
    
    const generateChartExplanation = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.functions.invoke('ai-chart-analysis', {
          body: { ticker }
        });
        
        if (error) {
          console.error('Error generating chart analysis:', error);
          setSummary("Chart analysis temporarily unavailable");
        } else {
          setSummary(data?.analysis || "No analysis available");
        }
      } catch (error) {
        console.error('Error:', error);
        setSummary("Chart analysis temporarily unavailable");
      } finally {
        setLoading(false);
      }
    };

    generateChartExplanation();
  }, [ticker]);

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
      <CardHeader>
        <CardTitle>AI Chart Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{summary}</p>
      </CardContent>
    </Card>
  );
}