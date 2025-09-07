import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.23.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), { apiVersion: "2022-11-15" });

serve(async (req) => {
  const { userId, priceId } = await req.json();
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: "https://your-app.com/success",
    cancel_url: "https://your-app.com/cancel",
    client_reference_id: userId
  });
  return new Response(JSON.stringify({ checkoutUrl: session.url }), { headers: { "Content-Type": "application/json" } });
});