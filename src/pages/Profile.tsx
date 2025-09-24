import React, { useState, useEffect } from 'react';
import { User, CreditCard, FileText, LogOut, Trash2, Send, ExternalLink } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FeedbackButton } from '@/components/layout/FeedbackButton';

interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  role?: string;
  is_trial_active?: boolean;
  trial_end?: string;
}

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [discordWebhook, setDiscordWebhook] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        // Create profile if it doesn't exist
        const newProfile = {
          id: user?.id,
          email: user?.email,
          full_name: user?.user_metadata?.full_name || ''
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) throw createError;
        setProfile(createdProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWebhook = async () => {
    if (!discordWebhook.trim()) return;

    setSavingWebhook(true);
    try {
      // For now, we'll store in a simple text field
      // In a real app, this would be encrypted
      // Store webhook in localStorage for demo purposes
      localStorage.setItem(`discord_webhook_${user?.id}`, discordWebhook);

      toast.success('Discord webhook saved');
    } catch (error) {
      console.error('Error saving webhook:', error);
      toast.error('Failed to save webhook');
    } finally {
      setSavingWebhook(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!discordWebhook.trim()) {
      toast.error('Please enter a webhook URL first');
      return;
    }

    setTestingWebhook(true);
    try {
      const response = await fetch(discordWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: `🤖 Test message from AI DayTrader Pro\nUser: ${user?.email}\nTime: ${new Date().toLocaleString()}`
        }),
      });

      if (response.ok) {
        toast.success('Test message sent to Discord!');
      } else {
        throw new Error('Failed to send test message');
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast.error('Failed to send test message');
    } finally {
      setTestingWebhook(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: 'price_premium', // This would be a real Stripe price ID
          success_url: `${window.location.origin}/profile?success=true`,
          cancel_url: `${window.location.origin}/profile`,
        }
      });

      if (error) throw error;

      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start upgrade process');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const openLegalDisclaimer = () => {
    // This would open the stored legal disclaimer
    window.open('/legal', '_blank');
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>

          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Account Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile?.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile?.full_name || ''}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Label>Current Plan:</Label>
                <Badge variant={profile?.role === 'premium' ? 'default' : 'secondary'}>
                  {profile?.role?.toUpperCase() || 'FREE'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Subscription</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {profile?.role === 'free' ? (
                  <p>You're currently on the free plan. Upgrade to unlock advanced features:</p>
                ) : (
                  <p>You're subscribed to our premium plan with full access to all features.</p>
                )}
              </div>
              
              {profile?.role === 'free' && (
                <div className="space-y-2">
                  <div className="text-sm">
                    <strong>Premium features include:</strong>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>• Unlimited alerts and backtests</li>
                      <li>• Advanced AI analysis</li>
                      <li>• Real-time institutional data</li>
                      <li>• Discord notifications</li>
                      <li>• Priority support</li>
                    </ul>
                  </div>
                  <Button onClick={handleUpgrade} className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Upgrade to Premium - $29/month
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Discord Integration */}
          <Card>
            <CardHeader>
              <CardTitle>Discord Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Connect your Discord webhook to receive trading alerts directly in your Discord channel.
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook">Discord Webhook URL</Label>
                <Input
                  id="webhook"
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  type="url"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleSaveWebhook}
                  disabled={!discordWebhook.trim() || savingWebhook}
                  className="flex-1"
                >
                  {savingWebhook ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Save Webhook
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTestWebhook}
                  disabled={!discordWebhook.trim() || testingWebhook}
                  className="flex-1"
                >
                  {testingWebhook ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Test
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Legal & Support */}
          <Card>
            <CardHeader>
              <CardTitle>Legal & Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                onClick={openLegalDisclaimer}
                className="w-full justify-start"
              >
                <FileText className="h-4 w-4 mr-2" />
                View Legal Disclaimer
                <ExternalLink className="h-4 w-4 ml-auto" />
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="flex-1"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => toast.error('Account deletion not implemented in demo')}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <FeedbackButton />
      </div>
    </Layout>
  );
};

export default Profile;