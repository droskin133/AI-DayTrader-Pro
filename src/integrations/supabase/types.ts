export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_performance_daily: {
        Row: {
          alerts_total: number
          alerts_win: number
          avg_return: number | null
          dt: string
          features: Json | null
          model: string
          ticker: string
          updated_at: string
          win_rate: number | null
        }
        Insert: {
          alerts_total?: number
          alerts_win?: number
          avg_return?: number | null
          dt: string
          features?: Json | null
          model?: string
          ticker: string
          updated_at?: string
          win_rate?: number | null
        }
        Update: {
          alerts_total?: number
          alerts_win?: number
          avg_return?: number | null
          dt?: string
          features?: Json | null
          model?: string
          ticker?: string
          updated_at?: string
          win_rate?: number | null
        }
        Relationships: []
      }
      alert_triggers: {
        Row: {
          acknowledged_at: string | null
          alert_id: string
          delivered_channels: string[] | null
          dismissed: boolean
          evaluation_window_minutes: number
          id: string
          outcome: string | null
          pnl_after_window: number | null
          price: number | null
          snapshot: Json | null
          ticker: string
          triggered_at: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          alert_id: string
          delivered_channels?: string[] | null
          dismissed?: boolean
          evaluation_window_minutes?: number
          id?: string
          outcome?: string | null
          pnl_after_window?: number | null
          price?: number | null
          snapshot?: Json | null
          ticker: string
          triggered_at?: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          alert_id?: string
          delivered_channels?: string[] | null
          dismissed?: boolean
          evaluation_window_minutes?: number
          id?: string
          outcome?: string | null
          pnl_after_window?: number | null
          price?: number | null
          snapshot?: Json | null
          ticker?: string
          triggered_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_triggers_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          condition: string
          created_at: string
          expires_at: string | null
          id: string
          source: Database["public"]["Enums"]["alert_source_enum"]
          status: string
          ticker: string
          triggered_at: string | null
          user_id: string
        }
        Insert: {
          condition: string
          created_at?: string
          expires_at?: string | null
          id?: string
          source?: Database["public"]["Enums"]["alert_source_enum"]
          status?: string
          ticker: string
          triggered_at?: string | null
          user_id: string
        }
        Update: {
          condition?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          source?: Database["public"]["Enums"]["alert_source_enum"]
          status?: string
          ticker?: string
          triggered_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      annotations: {
        Row: {
          at: string
          created_at: string
          data: Json
          id: string
          ticker: string
          type: string
          user_id: string
        }
        Insert: {
          at: string
          created_at?: string
          data: Json
          id?: string
          ticker: string
          type: string
          user_id: string
        }
        Update: {
          at?: string
          created_at?: string
          data?: Json
          id?: string
          ticker?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      congress_trades: {
        Row: {
          amount_range: string | null
          chamber: string | null
          id: string
          ingested_at: string
          person: string | null
          raw: Json | null
          reported_date: string | null
          source_url: string | null
          ticker: string
          trade_date: string | null
          transaction_type: string | null
        }
        Insert: {
          amount_range?: string | null
          chamber?: string | null
          id?: string
          ingested_at?: string
          person?: string | null
          raw?: Json | null
          reported_date?: string | null
          source_url?: string | null
          ticker: string
          trade_date?: string | null
          transaction_type?: string | null
        }
        Update: {
          amount_range?: string | null
          chamber?: string | null
          id?: string
          ingested_at?: string
          person?: string | null
          raw?: Json | null
          reported_date?: string | null
          source_url?: string | null
          ticker?: string
          trade_date?: string | null
          transaction_type?: string | null
        }
        Relationships: []
      }
      institutional_ownership: {
        Row: {
          filer_cik: string | null
          filer_name: string
          id: string
          ingested_at: string
          position_change: string | null
          raw: Json | null
          reported_date: string | null
          shares: number | null
          source_url: string | null
          ticker: string
        }
        Insert: {
          filer_cik?: string | null
          filer_name: string
          id?: string
          ingested_at?: string
          position_change?: string | null
          raw?: Json | null
          reported_date?: string | null
          shares?: number | null
          source_url?: string | null
          ticker: string
        }
        Update: {
          filer_cik?: string | null
          filer_name?: string
          id?: string
          ingested_at?: string
          position_change?: string | null
          raw?: Json | null
          reported_date?: string | null
          shares?: number | null
          source_url?: string | null
          ticker?: string
        }
        Relationships: []
      }
      market_anomalies: {
        Row: {
          data: Json
          detected_at: string
          id: string
          kind: string
          score: number | null
          ticker: string
        }
        Insert: {
          data: Json
          detected_at?: string
          id?: string
          kind: string
          score?: number | null
          ticker: string
        }
        Update: {
          data?: Json
          detected_at?: string
          id?: string
          kind?: string
          score?: number | null
          ticker?: string
        }
        Relationships: []
      }
      news_watches: {
        Row: {
          channels: string[] | null
          created_at: string
          id: string
          keyword: string | null
          ticker: string | null
          user_id: string
        }
        Insert: {
          channels?: string[] | null
          created_at?: string
          id?: string
          keyword?: string | null
          ticker?: string | null
          user_id: string
        }
        Update: {
          channels?: string[] | null
          created_at?: string
          id?: string
          keyword?: string | null
          ticker?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          payload: Json | null
          read_at: string | null
          title: string | null
          type: Database["public"]["Enums"]["notification_type_enum"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          payload?: Json | null
          read_at?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["notification_type_enum"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          payload?: Json | null
          read_at?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["notification_type_enum"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          initials: string | null
          role: Database["public"]["Enums"]["user_role_enum"] | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          initials?: string | null
          role?: Database["public"]["Enums"]["user_role_enum"] | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          initials?: string | null
          role?: Database["public"]["Enums"]["user_role_enum"] | null
        }
        Relationships: []
      }
      sec_filings: {
        Row: {
          filed_at: string
          filing_type: string
          id: string
          ingested_at: string
          raw: Json | null
          source_url: string | null
          ticker: string
          title: string | null
        }
        Insert: {
          filed_at: string
          filing_type: string
          id?: string
          ingested_at?: string
          raw?: Json | null
          source_url?: string | null
          ticker: string
          title?: string | null
        }
        Update: {
          filed_at?: string
          filing_type?: string
          id?: string
          ingested_at?: string
          raw?: Json | null
          source_url?: string | null
          ticker?: string
          title?: string | null
        }
        Relationships: []
      }
      sp500: {
        Row: {
          ticker: string
        }
        Insert: {
          ticker: string
        }
        Update: {
          ticker?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          customer_id: string | null
          history: Json | null
          id: string
          plan: Database["public"]["Enums"]["plan_enum"]
          provider: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          customer_id?: string | null
          history?: Json | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_enum"]
          provider?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          customer_id?: string | null
          history?: Json | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_enum"]
          provider?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          ai_suggestions_default: boolean
          created_at: string
          email_notifications: boolean
          push_notifications: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_suggestions_default?: boolean
          created_at?: string
          email_notifications?: boolean
          push_notifications?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_suggestions_default?: boolean
          created_at?: string
          email_notifications?: boolean
          push_notifications?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          created_at: string
          id: string
          ticker: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ticker: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ticker?: string
          user_id?: string
        }
        Relationships: []
      }
      widget_layouts: {
        Row: {
          id: string
          layout: Json
          page: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          layout: Json
          page: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          layout?: Json
          page?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      alert_source_enum: "user" | "ai" | "community"
      notification_type_enum: "alert_trigger" | "system" | "news"
      plan_enum: "basic" | "premium" | "trial"
      user_role_enum: "admin" | "president" | "premium" | "basic" | "trial"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_source_enum: ["user", "ai", "community"],
      notification_type_enum: ["alert_trigger", "system", "news"],
      plan_enum: ["basic", "premium", "trial"],
      user_role_enum: ["admin", "president", "premium", "basic", "trial"],
    },
  },
} as const
