import { supabase } from "@/integrations/supabase/client";

export async function fetchLivePrice(symbol: string): Promise<number | null> {
  try {
    const { data, error } = await supabase.functions.invoke('finnhub-data', {
      body: { type: 'quote', ticker: symbol }
    });

    if (error) {
      console.error('Error fetching live price:', error);
      return null;
    }

    // Finnhub returns current price in 'c' field
    return data?.c ?? null;
  } catch (err) {
    console.error('Failed to fetch live price:', err);
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