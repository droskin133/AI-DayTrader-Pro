import React, { useState } from 'react';
import { CreditCard, Check, Star, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  popular?: boolean;
  current?: boolean;
}

const Billing: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const plans: Plan[] = [
    {
      id: 'trial',
      name: 'Trial',
      price: 0,
      interval: 'free',
      features: [
        'Basic real-time quotes',
        'AI Deep Scanner (limited)',
        '5 custom alerts',
        'Basic news feed',
        'Standard support'
      ],
      current: user?.role === 'trial'
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 29,
      interval: 'month',
      features: [
        'Real-time market data',
        'Full AI Deep Scanner',
        'Unlimited alerts',
        'Priority news feed',
        'Technical indicators',
        'Email support'
      ],
      current: user?.role === 'basic'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 79,
      interval: 'month',
      popular: true,
      features: [
        'Everything in Basic',
        'Institutional data access',
        'Congress trading data',
        'Advanced AI insights',
        'Benzinga news feed',
        'Priority support',
        'Custom dashboards',
        'API access'
      ],
      current: user?.role === 'premium'
    }
  ];

  const handleUpgrade = async (planId: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch('/functions/v1/stripe-checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getAccessToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          priceId: planId === 'basic' ? 'basic_price_id' : 'premium_price_id'
        })
      });

      const data = await response.json();
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAccessToken = async () => {
    // Implementation to get current session token
    return '';
  };

  const handleManageSubscription = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/functions/v1/customer-portal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upgrade your trading experience with advanced AI insights and professional-grade data
          </p>
        </div>

        {/* Current Plan Status */}
        {user && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Current Subscription</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Plan
                  </h3>
                  <p className="text-muted-foreground">
                    {user.role === 'trial' 
                      ? 'Free trial access with basic features'
                      : user.role === 'basic'
                      ? 'Full access to trading tools and AI insights'
                      : 'Premium access with institutional data and advanced features'
                    }
                  </p>
                </div>
                {user.role !== 'trial' && (
                  <Button variant="outline" onClick={handleManageSubscription}>
                    Manage Subscription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'ring-2 ring-primary' : ''} ${
                plan.current ? 'bg-muted/50' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">/{plan.interval}</span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="h-4 w-4 text-bull mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="pt-4">
                  {plan.current ? (
                    <Button variant="secondary" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : plan.id === 'trial' ? (
                    <Button variant="outline" className="w-full" disabled>
                      Free Trial
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={loading}
                    >
                      {plan.popular && <Zap className="h-4 w-4 mr-2" />}
                      Upgrade to {plan.name}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-muted-foreground text-sm">
                  Yes, you can cancel your subscription at any time through the customer portal. 
                  Your access will continue until the end of your billing period.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground text-sm">
                  We accept all major credit cards including Visa, Mastercard, and American Express 
                  through our secure Stripe payment processor.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Is my data secure?</h3>
                <p className="text-muted-foreground text-sm">
                  Absolutely. We use enterprise-grade security and encryption to protect your data. 
                  Your trading information is never shared with third parties.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
                <p className="text-muted-foreground text-sm">
                  We offer a 30-day money-back guarantee for new subscribers. 
                  Contact support if you're not satisfied with our service.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;