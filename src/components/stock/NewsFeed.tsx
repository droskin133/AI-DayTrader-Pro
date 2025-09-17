import { useEffect, useState } from 'react';
import { fetchStockNews } from '@/lib/fetchLivePrice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface NewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

interface NewsFeedProps {
  symbols?: string[];
}

export function NewsFeed({ symbols = [] }: NewsFeedProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiExplanation, setAiExplanation] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const fetchNews = async () => {
      if (symbols.length === 0) return;
      
      setLoading(true);
      const allNews: NewsItem[] = [];
      
      for (const symbol of symbols) {
        const symbolNews = await fetchStockNews(symbol);
        allNews.push(...symbolNews);
      }
      
      // Sort by date and remove duplicates
      const uniqueNews = allNews
        .filter((item, index, self) => 
          index === self.findIndex(t => t.id === item.id)
        )
        .sort((a, b) => b.datetime - a.datetime)
        .slice(0, 10);
        
      setNews(uniqueNews);
      setLoading(false);
    };

    fetchNews();
  }, [symbols]);

  const explainNews = async (newsItem: NewsItem) => {
    try {
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: { 
          prompt: `Explain what this news means for traders in 2-3 sentences: "${newsItem.headline}" - ${newsItem.summary}` 
        }
      });
      
      if (!error && data) {
        setAiExplanation(prev => ({
          ...prev,
          [newsItem.id]: data.message || 'Analysis unavailable'
        }));
      }
    } catch (error) {
      console.error('Error getting AI explanation:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>News Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>News Feed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {news.map((item) => (
          <div key={item.id} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm leading-tight">{item.headline}</h4>
              <Badge variant="outline" className="text-xs shrink-0">
                {item.source}
              </Badge>
            </div>
            
            <p className="text-xs text-muted-foreground line-clamp-2">
              {item.summary}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {new Date(item.datetime * 1000).toLocaleDateString()}
              </span>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => explainNews(item)}
                  className="text-xs h-7"
                  disabled={!!aiExplanation[item.id]}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Explain
                </Button>
                
                <Button size="sm" variant="ghost" asChild className="text-xs h-7">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </div>
            </div>
            
            {aiExplanation[item.id] && (
              <div className="bg-muted/50 rounded p-2 text-xs">
                <strong>AI Analysis:</strong> {aiExplanation[item.id]}
              </div>
            )}
          </div>
        ))}
        
        {news.length === 0 && (
          <p className="text-center text-muted-foreground">
            No recent news available
          </p>
        )}
      </CardContent>
    </Card>
  );
}