import { supabase } from "@/integrations/supabase/client";

export async function fetchLivePrice(symbol: string): Promise<number | null> {
  try {
    console.log(`Fetching live price for ${symbol}`);
    
    const { data, error } = await supabase.functions.invoke('finnhub-data', {
      body: { type: 'quote', ticker: symbol }
    });

    if (error) {
      console.error(`Error fetching live price for ${symbol}:`, error);
      return null;
    }

    console.log(`Received data for ${symbol}:`, data);

    // Finnhub returns current price in 'c' field
    const price = data?.c ?? null;
    if (price !== null) {
      console.log(`Live price for ${symbol}: $${price}`);
    } else {
      console.warn(`No price data returned for ${symbol}`);
    }
    
    return price;
  } catch (err) {
    console.error(`Failed to fetch live price for ${symbol}:`, err);
    return null;
  }
}

export async function fetchStockNews(symbol: string) {
  try {
    const { data, error } = await supabase.functions.invoke('finnhub-data', {
      body: { type: 'news', ticker: symbol }
    });

    if (error) {
      console.error('Error fetching stock news:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Failed to fetch stock news:', err);
    return [];
  }
}