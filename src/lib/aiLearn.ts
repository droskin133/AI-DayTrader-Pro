import { supabase } from "@/integrations/supabase/client";

export async function logUserEvent(event_type: string, payload: any) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.functions.invoke("ai-learn-user-behavior", {
      body: {
        user_id: user.id,
        event_type,
        payload
      }
    });
  } catch (error) {
    console.error("Failed to log user event:", error);
  }
}
