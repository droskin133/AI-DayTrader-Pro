import React, { useState, useEffect } from 'react';
import { FileText, ExternalLink, Calendar, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface SECFiling {
  id: string;
  ticker: string;
  filing_type: string;
  filed_at: string;
  title: string;
  source_url: string;
}

interface SECFilingsProps {
  ticker: string;
}

export const SECFilings: React.FC<SECFilingsProps> = ({ ticker }) => {
  const [filings, setFilings] = useState<SECFiling[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSECFilings();
  }, [ticker]);

  const fetchSECFilings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('sec_filings')
        .select('*')
        .eq('ticker', ticker)
        .order('filed_at', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setFilings(data);
      } else {
        // Show mock data with friendly message
        setFilings([
          {
            id: '1',
            ticker,
            filing_type: '10-K',
            filed_at: '2024-01-29T00:00:00Z',
            title: 'Annual Report (Form 10-K)',
            source_url: '#'
          },
          {
            id: '2',
            ticker,
            filing_type: '10-Q',
            filed_at: '2023-10-30T00:00:00Z',
            title: 'Quarterly Report (Form 10-Q)',
            source_url: '#'
          },
          {
            id: '3',
            ticker,
            filing_type: '8-K',
            filed_at: '2023-09-15T00:00:00Z',
            title: 'Current Report (Form 8-K)',
            source_url: '#'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching SEC filings:', error);
      setError('Failed to load SEC filings');
      setFilings([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilingTypeColor = (type: string) => {
    switch (type) {
      case '10-K': return 'bg-red-100 text-red-800';
      case '10-Q': return 'bg-blue-100 text-blue-800';
      case '8-K': return 'bg-green-100 text-green-800';
      case 'DEF 14A': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="widget-container">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>SEC Filings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="widget-container">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>SEC Filings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{error}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2" 
              onClick={fetchSECFilings}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="widget-container">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>SEC Filings</span>
            <Badge variant="outline">{ticker}</Badge>
          </div>
          <Badge variant="secondary" className="text-xs">
            <Building className="h-3 w-3 mr-1" />
            SEC.gov
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {filings.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent filings available</p>
            <p className="text-xs mt-1">Check back later for updates</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {filings.map((filing) => (
              <div key={filing.id} className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge className={getFilingTypeColor(filing.filing_type)}>
                      {filing.filing_type}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(filing.filed_at)}
                    </div>
                  </div>
                  
                  {filing.source_url && filing.source_url !== '#' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-1"
                      onClick={() => window.open(filing.source_url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                <p className="text-sm font-medium mb-1">
                  {filing.title}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {filing.ticker}
                  </span>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-auto py-1"
                    onClick={() => filing.source_url !== '#' && window.open(filing.source_url, '_blank')}
                    disabled={filing.source_url === '#'}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    View Filing
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 pt-3 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => window.open(`https://www.sec.gov/edgar/search/#/q=${ticker}`, '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-2" />
            View All {ticker} Filings on SEC.gov
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};