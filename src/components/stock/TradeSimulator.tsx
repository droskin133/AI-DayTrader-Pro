import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TradeSimulatorProps {
  symbol: string;
  currentPrice: number;
}

export function TradeSimulator({ symbol, currentPrice }: TradeSimulatorProps) {
  const [quantity, setQuantity] = useState(100);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState(currentPrice);
  const { toast } = useToast();

  const handleTrade = (action: 'buy' | 'sell') => {
    const total = quantity * (orderType === 'market' ? currentPrice : limitPrice);
    
    toast({
      title: `Simulated ${action.toUpperCase()} Order Placed`,
      description: `${action === 'buy' ? 'Bought' : 'Sold'} ${quantity} shares of ${symbol} at $${(orderType === 'market' ? currentPrice : limitPrice).toFixed(2)} for $${total.toFixed(2)}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Trade Simulator
          <Badge variant="secondary">Demo Mode</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={orderType === 'market' ? 'default' : 'outline'}
            onClick={() => setOrderType('market')}
            size="sm"
          >
            Market
          </Button>
          <Button
            variant={orderType === 'limit' ? 'default' : 'outline'}
            onClick={() => setOrderType('limit')}
            size="sm"
          >
            Limit
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Quantity</label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="1"
          />
        </div>

        {orderType === 'limit' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Limit Price</label>
            <Input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(Number(e.target.value))}
              step="0.01"
            />
          </div>
        )}

        <div className="bg-muted rounded p-3">
          <div className="text-sm text-muted-foreground">Estimated Total</div>
          <div className="text-lg font-semibold">
            ${(quantity * (orderType === 'market' ? currentPrice : limitPrice)).toFixed(2)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => handleTrade('buy')}
            className="bg-green-600 hover:bg-green-700"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Buy
          </Button>
          <Button
            onClick={() => handleTrade('sell')}
            variant="destructive"
          >
            <TrendingDown className="w-4 h-4 mr-2" />
            Sell
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}