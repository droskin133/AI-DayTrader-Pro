import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.23.0?target=deno";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sig = req.headers.get("stripe-signature");
    let event;

    try {
      const body = await req.text();
      event = stripe.webhooks.constructEvent(
        body,
        sig!,
        Deno.env.get("STRIPE_WEBHOOK_SECRET")!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(`Webhook Error: ${err.message}`, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    console.log('Processing webhook event:', event.type);

    if (event.type === "checkout.session.completed") {
      const session: any = event.data.object;
      const userId = session.metadata.user_id;
      const plan = session.metadata.plan || "basic";

      console.log('Creating subscription for user:', userId);

      // Create subscription record
      const { error: subError } = await supabase.from("subscriptions").upsert({
        user_id: userId,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        plan: plan,
        status: "active",
      });

      if (subError) {
        console.error('Error creating subscription:', subError);
      }

      // Update user role
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ 
          role: "basic",
          is_trial_active: false 
        })
        .eq("id", userId);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }

      console.log('Successfully processed subscription for user:', userId);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});