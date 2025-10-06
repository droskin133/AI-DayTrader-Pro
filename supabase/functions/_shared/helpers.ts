// Standard response helpers - enforce live data only
export function ok(data: unknown) {
  return new Response(JSON.stringify({ data, error: null }), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
}

export async function fail(fn: string, err: unknown, ctx: Record<string, unknown> = {}, supabase?: any) {
  const message = (err as Error)?.message ?? String(err);
  
  // Log to error_logs table if supabase client is provided
  if (supabase) {
    try {
      await supabase.from("error_logs").insert({ 
        function_name: fn, 
        context: ctx, 
        error: message 
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }
  
  return new Response(JSON.stringify({ data: null, error: message }), {
    status: 500,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit helper
export async function checkRateLimit(
  supabase: any,
  userId: string | null,
  bucket: string,
  limit: number,
  windowSeconds: number = 60
): Promise<{ allowed: boolean; count: number }> {
  // Extract user_id from UUID if userId is provided, otherwise use 'anon'
  const userIdStr = userId ? String(userId) : 'anon';
  
  const { data, error } = await supabase.rpc('increment_rate_limit', {
    p_user_id: userIdStr,
    p_bucket: bucket,
    p_window_seconds: windowSeconds
  });
  
  if (error) {
    console.error('Rate limit check failed:', error);
    return { allowed: true, count: 0 }; // Fail open
  }
  
  const count = data?.[0]?.count ?? 0;
  return { allowed: count <= limit, count };
}

// Validate required env vars
export function requireEnv(key: string): string {
  const value = Deno.env.get(key);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
