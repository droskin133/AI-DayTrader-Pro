import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Seed some basic equity snapshots for popular stocks
    const sampleTickers = [
      { ticker: 'AAPL', basePrice: 175, volatility: 0.02 },
      { ticker: 'MSFT', basePrice: 425, volatility: 0.015 },
      { ticker: 'GOOGL', basePrice: 140, volatility: 0.025 },
      { ticker: 'TSLA', basePrice: 250, volatility: 0.04 },
      { ticker: 'NVDA', basePrice: 875, volatility: 0.035 },
      { ticker: 'SPY', basePrice: 548, volatility: 0.01 },
      { ticker: 'QQQ', basePrice: 485, volatility: 0.015 },
      { ticker: 'DIA', basePrice: 425, volatility: 0.008 },
      { ticker: 'GLD', basePrice: 185, volatility: 0.012 },
      { ticker: 'USO', basePrice: 78, volatility: 0.03 },
    ];

    const snapshots = [];
    const currentTime = new Date();

    for (const stock of sampleTickers) {
      // Generate realistic price movement
      const changePercent = (Math.random() - 0.5) * 2 * stock.volatility * 100;
      const price = stock.basePrice * (1 + changePercent / 100);
      const volume = Math.floor(Math.random() * 50000000) + 1000000;

      snapshots.push({
        ticker: stock.ticker,
        price: Number(price.toFixed(2)),
        percent_change: Number(changePercent.toFixed(2)),
        volume: volume,
        snapshot_time: currentTime.toISOString()
      });
    }

    // Insert snapshots
    const { error: snapshotError } = await supabase
      .from('equity_snapshots')
      .insert(snapshots);

    if (snapshotError) {
      throw snapshotError;
    }

    // Seed some market data cache
    const cacheEntries = snapshots.map(snapshot => ({
      ticker: snapshot.ticker,
      data: {
        price: snapshot.price,
        change_percent: snapshot.percent_change,
        volume: snapshot.volume,
        last_updated: currentTime.toISOString()
      }
    }));

    const { error: cacheError } = await supabase
      .from('market_data_cache')
      .insert(cacheEntries);

    if (cacheError) {
      console.warn('Cache seeding failed:', cacheError);
    }

    return new Response(
      JSON.stringify({ 
        message: 'Sample data seeded successfully',
        snapshots_created: snapshots.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in data-seeder function:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to seed data' }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});