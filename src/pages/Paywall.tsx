import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Paywall() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: { 
          user_id: user.id, 
          plan: "basic" 
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    "Real-time stock data and alerts",
    "AI-powered market analysis",
    "Advanced backtesting tools",
    "Institutional ownership tracking",
    "News sentiment analysis",
    "Price target predictions",
    "Portfolio optimization",
    "24/7 customer support"
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full trading-gradient flex items-center justify-center mx-auto mb-4">
            <span className="text-xl font-bold text-white">AI</span>
          </div>
          <Badge variant="secondary" className="mx-auto mb-4">Trial Expired</Badge>
          <CardTitle className="text-3xl">Upgrade to Basic Plan</CardTitle>
          <CardDescription className="text-lg">
            Continue your trading journey with advanced features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">$19.99</div>
            <div className="text-muted-foreground">per month</div>
          </div>
          
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <Button 
            onClick={handleUpgrade} 
            className="w-full text-lg py-6" 
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Upgrade Now"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Cancel anytime • Secure payment with Stripe
          </div>
        </CardContent>
      </Card>
    </div>
  );
}