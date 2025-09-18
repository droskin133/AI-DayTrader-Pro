import { useEffect, useState } from 'react';
import { fetchLivePrice } from '@/lib/fetchLivePrice';
import { Badge } from '@/components/ui/badge';

interface LivePriceProps {
  symbol: string;
  className?: string;
}

export default function LivePrice({ symbol, className = "" }: LivePriceProps) {
  const [price, setPrice] = useState<number | null>(null);
  const [prevPrice, setPrevPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const getPrice = async () => {
      const live = await fetchLivePrice(symbol);
      if (isMounted && live !== null) {
        setPrevPrice(price);
        setPrice(live);
        setLoading(false);
      }
    };

    getPrice();
    const interval = setInterval(getPrice, 5000); // Update every 5 seconds
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol]); // Removed price dependency to prevent infinite re-renders

  const getChangeColor = () => {
    if (prevPrice === null || price === null) return '';
    if (price > prevPrice) return 'text-bull';
    if (price < prevPrice) return 'text-bear';
    return '';
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-muted rounded w-24"></div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-semibold text-foreground">{symbol}:</span>
      <Badge variant="outline" className={`font-mono ${getChangeColor()}`}>
        {price !== null ? `$${price.toFixed(2)}` : 'N/A'}
      </Badge>
    </div>
  );
}