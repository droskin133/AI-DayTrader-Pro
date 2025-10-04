import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BuybackBannerProps {
  symbol: string;
}

export default function BuybackBanner({ symbol }: BuybackBannerProps) {
  const [row, setRow] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("buyback_blackout")
        .select("*")
        .eq("ticker", symbol)
        .lte("start_date", today)
        .gte("end_date", today)
        .limit(1);
      setRow(data?.[0] || null);
    })();
  }, [symbol]);

  if (!row) return null;

  return (
    <div className="p-2 rounded bg-amber-100 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-600 text-amber-900 dark:text-amber-100 text-sm">
      Buyback blackout in effect until <b>{row.end_date}</b>. Demand from buybacks may be reduced.
    </div>
  );
}
