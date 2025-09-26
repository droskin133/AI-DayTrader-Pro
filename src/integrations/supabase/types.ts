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
      admin_users: {
        Row: {
          created_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_auto_flags: {
        Row: {
          created_at: string | null
          event_type: string
          explanation: string | null
          id: string
          metadata: Json | null
          risk_score: number | null
          symbol: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          explanation?: string | null
          id?: string
          metadata?: Json | null
          risk_score?: number | null
          symbol: string
          user_id?: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          explanation?: string | null
          id?: string
          metadata?: Json | null
          risk_score?: number | null
          symbol?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_auto_generated_alerts: {
        Row: {
          alert_text: string
          created_at: string | null
          id: string
          status: string | null
          symbol: string
          trigger_context: Json | null
          user_id: string
        }
        Insert: {
          alert_text: string
          created_at?: string | null
          id?: string
          status?: string | null
          symbol: string
          trigger_context?: Json | null
          user_id?: string
        }
        Update: {
          alert_text?: string
          created_at?: string | null
          id?: string
          status?: string | null
          symbol?: string
          trigger_context?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      ai_autoscan_results: {
        Row: {
          alert_json: Json | null
          confidence: number | null
          detected_pattern: string | null
          id: string
          scanned_at: string | null
          symbol: string
        }
        Insert: {
          alert_json?: Json | null
          confidence?: number | null
          detected_pattern?: string | null
          id?: string
          scanned_at?: string | null
          symbol: string
        }
        Update: {
          alert_json?: Json | null
          confidence?: number | null
          detected_pattern?: string | null
          id?: string
          scanned_at?: string | null
          symbol?: string
        }
        Relationships: []
      }
      ai_commodity_signals: {
        Row: {
          breakout_level: number | null
          commodity: string
          confidence_score: number | null
          created_at: string | null
          event: string
          id: number
          reason: string | null
          ticker: string
        }
        Insert: {
          breakout_level?: number | null
          commodity: string
          confidence_score?: number | null
          created_at?: string | null
          event: string
          id?: number
          reason?: string | null
          ticker: string
        }
        Update: {
          breakout_level?: number | null
          commodity?: string
          confidence_score?: number | null
          created_at?: string | null
          event?: string
          id?: number
          reason?: string | null
          ticker?: string
        }
        Relationships: []
      }
      ai_configs: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          user_id: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string
          value?: Json
        }
        Relationships: []
      }
      ai_feedback: {
        Row: {
          ai_output_id: string | null
          created_at: string | null
          feature: string | null
          id: string
          prompt: string | null
          response: string | null
          thumbs_up: boolean | null
          user_id: string
        }
        Insert: {
          ai_output_id?: string | null
          created_at?: string | null
          feature?: string | null
          id?: string
          prompt?: string | null
          response?: string | null
          thumbs_up?: boolean | null
          user_id?: string
        }
        Update: {
          ai_output_id?: string | null
          created_at?: string | null
          feature?: string | null
          id?: string
          prompt?: string | null
          response?: string | null
          thumbs_up?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      ai_global_knowledge: {
        Row: {
          confidence: number | null
          content: string | null
          created_at: string | null
          id: number
          insight_type: string | null
          reinforced_count: number | null
          source_user: string | null
          ticker: string | null
        }
        Insert: {
          confidence?: number | null
          content?: string | null
          created_at?: string | null
          id?: number
          insight_type?: string | null
          reinforced_count?: number | null
          source_user?: string | null
          ticker?: string | null
        }
        Update: {
          confidence?: number | null
          content?: string | null
          created_at?: string | null
          id?: number
          insight_type?: string | null
          reinforced_count?: number | null
          source_user?: string | null
          ticker?: string | null
        }
        Relationships: []
      }
      ai_institutional_signals: {
        Row: {
          details: string | null
          detected_at: string | null
          id: number
          signal_type: string | null
          source: string | null
          ticker: string
        }
        Insert: {
          details?: string | null
          detected_at?: string | null
          id?: number
          signal_type?: string | null
          source?: string | null
          ticker: string
        }
        Update: {
          details?: string | null
          detected_at?: string | null
          id?: number
          signal_type?: string | null
          source?: string | null
          ticker?: string
        }
        Relationships: []
      }
      ai_learning_log: {
        Row: {
          context: string | null
          created_at: string | null
          id: string
          input: Json
          mode: string
          output: Json
          ticker: string | null
          user_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          id?: string
          input: Json
          mode: string
          output: Json
          ticker?: string | null
          user_id?: string
        }
        Update: {
          context?: string | null
          created_at?: string | null
          id?: string
          input?: Json
          mode?: string
          output?: Json
          ticker?: string | null
          user_id?: string
        }
        Relationships: []
      }
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
          user_id: string
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
          user_id?: string
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
          user_id?: string
          win_rate?: number | null
        }
        Relationships: []
      }
      ai_run_metrics: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          latency_ms: number | null
          mode: string
          ticker: string | null
          upstream_status: number | null
          used_cache: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          mode: string
          ticker?: string | null
          upstream_status?: number | null
          used_cache?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          mode?: string
          ticker?: string | null
          upstream_status?: number | null
          used_cache?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_suggestion_scores: {
        Row: {
          ai_tool: Database["public"]["Enums"]["ai_tool_enum"]
          created_at: string | null
          feedback_score: number | null
          id: string
          stock_id: string | null
          suggestion: string | null
          user_id: string
        }
        Insert: {
          ai_tool: Database["public"]["Enums"]["ai_tool_enum"]
          created_at?: string | null
          feedback_score?: number | null
          id?: string
          stock_id?: string | null
          suggestion?: string | null
          user_id?: string
        }
        Update: {
          ai_tool?: Database["public"]["Enums"]["ai_tool_enum"]
          created_at?: string | null
          feedback_score?: number | null
          id?: string
          stock_id?: string | null
          suggestion?: string | null
          user_id?: string
        }
        Relationships: []
      }
      alert_events: {
        Row: {
          alert_id: string
          delivered: boolean
          delivered_at: string | null
          fired_at: string
          id: number
          payload: Json
        }
        Insert: {
          alert_id: string
          delivered?: boolean
          delivered_at?: string | null
          fired_at?: string
          id?: number
          payload: Json
        }
        Update: {
          alert_id?: string
          delivered?: boolean
          delivered_at?: string | null
          fired_at?: string
          id?: number
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "alert_events_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_events_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "user_alerts_view"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "alert_triggers_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "user_alerts_view"
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
          owner: string
          source: Database["public"]["Enums"]["alert_source_enum"]
          status: string
          ticker: string
          triggered_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          condition: string
          created_at?: string
          expires_at?: string | null
          id?: string
          owner: string
          source?: Database["public"]["Enums"]["alert_source_enum"]
          status?: string
          ticker: string
          triggered_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          condition?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          owner?: string
          source?: Database["public"]["Enums"]["alert_source_enum"]
          status?: string
          ticker?: string
          triggered_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      alerts_fired: {
        Row: {
          alert_id: string | null
          fired_at: string | null
          id: string
          result_data: Json | null
          symbol: string | null
          user_id: string | null
        }
        Insert: {
          alert_id?: string | null
          fired_at?: string | null
          id?: string
          result_data?: Json | null
          symbol?: string | null
          user_id?: string | null
        }
        Update: {
          alert_id?: string | null
          fired_at?: string | null
          id?: string
          result_data?: Json | null
          symbol?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_fired_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_fired_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "user_alerts_view"
            referencedColumns: ["id"]
          },
        ]
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
      announcements: {
        Row: {
          audience: Database["public"]["Enums"]["user_role_enum"][] | null
          content: string
          created_at: string | null
          id: string
          title: string
        }
        Insert: {
          audience?: Database["public"]["Enums"]["user_role_enum"][] | null
          content: string
          created_at?: string | null
          id?: string
          title: string
        }
        Update: {
          audience?: Database["public"]["Enums"]["user_role_enum"][] | null
          content?: string
          created_at?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      api_usage: {
        Row: {
          last_reset: string | null
          request_count: number | null
          user_id: string
        }
        Insert: {
          last_reset?: string | null
          request_count?: number | null
          user_id: string
        }
        Update: {
          last_reset?: string | null
          request_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor: string
          created_at: string
          id: number
          meta: Json
          target: string | null
        }
        Insert: {
          action: string
          actor: string
          created_at?: string
          id?: number
          meta?: Json
          target?: string | null
        }
        Update: {
          action?: string
          actor?: string
          created_at?: string
          id?: number
          meta?: Json
          target?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          function_name: string
          id: string
          latency_ms: number | null
          payload_hash: string | null
          request_id: string | null
          upstream_status: number | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          function_name: string
          id?: string
          latency_ms?: number | null
          payload_hash?: string | null
          request_id?: string | null
          upstream_status?: number | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          function_name?: string
          id?: string
          latency_ms?: number | null
          payload_hash?: string | null
          request_id?: string | null
          upstream_status?: number | null
        }
        Relationships: []
      }
      backtest_results: {
        Row: {
          backtest_id: string
          created_at: string
          id: number
          metrics: Json
          symbol: string
        }
        Insert: {
          backtest_id: string
          created_at?: string
          id?: number
          metrics: Json
          symbol: string
        }
        Update: {
          backtest_id?: string
          created_at?: string
          id?: number
          metrics?: Json
          symbol?: string
        }
        Relationships: [
          {
            foreignKeyName: "backtest_results_backtest_id_fkey"
            columns: ["backtest_id"]
            isOneToOne: false
            referencedRelation: "backtests"
            referencedColumns: ["id"]
          },
        ]
      }
      backtests: {
        Row: {
          completed_at: string | null
          id: string
          name: string
          owner: string
          requested_at: string
          result_summary: Json | null
          status: string
          strategy: Json
        }
        Insert: {
          completed_at?: string | null
          id?: string
          name: string
          owner: string
          requested_at?: string
          result_summary?: Json | null
          status?: string
          strategy: Json
        }
        Update: {
          completed_at?: string | null
          id?: string
          name?: string
          owner?: string
          requested_at?: string
          result_summary?: Json | null
          status?: string
          strategy?: Json
        }
        Relationships: []
      }
      billing_accounts: {
        Row: {
          created_at: string
          plan: string
          status: string
          stripe_customer_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      commodity_equity_map: {
        Row: {
          commodity: string
          created_at: string | null
          id: number
          impact_type: string | null
          notes: string | null
          sector: string
          symbol: string
          weight: number | null
        }
        Insert: {
          commodity: string
          created_at?: string | null
          id?: number
          impact_type?: string | null
          notes?: string | null
          sector: string
          symbol: string
          weight?: number | null
        }
        Update: {
          commodity?: string
          created_at?: string | null
          id?: number
          impact_type?: string | null
          notes?: string | null
          sector?: string
          symbol?: string
          weight?: number | null
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
      device_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          id: string
          last_active: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          id?: string
          last_active?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          id?: string
          last_active?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      drivers: {
        Row: {
          created_at: string | null
          event_date: string | null
          event_type: string
          headline: string
          id: string
          impact_summary: string | null
          source_url: string | null
          stock_ticker: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_date?: string | null
          event_type: string
          headline: string
          id?: string
          impact_summary?: string | null
          source_url?: string | null
          stock_ticker: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_date?: string | null
          event_type?: string
          headline?: string
          id?: string
          impact_summary?: string | null
          source_url?: string | null
          stock_ticker?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      equity_snapshots: {
        Row: {
          id: string
          percent_change: number | null
          price: number
          snapshot_time: string | null
          ticker: string
          volume: number | null
        }
        Insert: {
          id?: string
          percent_change?: number | null
          price: number
          snapshot_time?: string | null
          ticker: string
          volume?: number | null
        }
        Update: {
          id?: string
          percent_change?: number | null
          price?: number
          snapshot_time?: string | null
          ticker?: string
          volume?: number | null
        }
        Relationships: []
      }
      event_macro_map: {
        Row: {
          created_at: string
          event_type_id: string
          id: string
          index_symbol: string
          propagation: Json | null
        }
        Insert: {
          created_at?: string
          event_type_id: string
          id?: string
          index_symbol: string
          propagation?: Json | null
        }
        Update: {
          created_at?: string
          event_type_id?: string
          id?: string
          index_symbol?: string
          propagation?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "event_macro_map_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      event_sector_layers: {
        Row: {
          created_at: string
          event_type_id: string
          id: string
          impact: string
          layer: number
          sector: string | null
          ticker: string
          weight: number
        }
        Insert: {
          created_at?: string
          event_type_id: string
          id?: string
          impact: string
          layer: number
          sector?: string | null
          ticker: string
          weight?: number
        }
        Update: {
          created_at?: string
          event_type_id?: string
          id?: string
          impact?: string
          layer?: number
          sector?: string | null
          ticker?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_sector_layers_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      event_ticker_map: {
        Row: {
          created_at: string
          event_type_id: string
          id: string
          sector: string | null
          ticker: string
          weight: number
        }
        Insert: {
          created_at?: string
          event_type_id: string
          id?: string
          sector?: string | null
          ticker: string
          weight?: number
        }
        Update: {
          created_at?: string
          event_type_id?: string
          id?: string
          sector?: string | null
          ticker?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_ticker_map_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      event_types: {
        Row: {
          created_at: string
          decay_factor: number
          default_shock: Json
          description: string | null
          half_life_days: number
          id: string
          model: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          decay_factor?: number
          default_shock?: Json
          description?: string | null
          half_life_days?: number
          id?: string
          model?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          decay_factor?: number
          default_shock?: Json
          description?: string | null
          half_life_days?: number
          id?: string
          model?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      export_logs: {
        Row: {
          exported_at: string | null
          format: string | null
          id: string
          table_exported: string | null
          user_id: string | null
        }
        Insert: {
          exported_at?: string | null
          format?: string | null
          id?: string
          table_exported?: string | null
          user_id?: string | null
        }
        Update: {
          exported_at?: string | null
          format?: string | null
          id?: string
          table_exported?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      export_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          requested_by: string
          scope: string
          status: string
          token: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          requested_by: string
          scope: string
          status?: string
          token?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          requested_by?: string
          scope?: string
          status?: string
          token?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          is_enabled: boolean
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          is_enabled?: boolean
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          is_enabled?: boolean
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          id: string
          message: string
          page: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          page: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          page?: string
          user_id?: string
        }
        Relationships: []
      }
      function_logs: {
        Row: {
          created_at: string | null
          function_name: string | null
          id: string
          log_message: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          function_name?: string | null
          id?: string
          log_message?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          function_name?: string | null
          id?: string
          log_message?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      hedge_fund_signals: {
        Row: {
          action: string | null
          detected_at: string | null
          fund_name: string
          id: number
          size: number | null
          source: string | null
          ticker: string | null
        }
        Insert: {
          action?: string | null
          detected_at?: string | null
          fund_name: string
          id?: number
          size?: number | null
          source?: string | null
          ticker?: string | null
        }
        Update: {
          action?: string | null
          detected_at?: string | null
          fund_name?: string
          id?: number
          size?: number | null
          source?: string | null
          ticker?: string | null
        }
        Relationships: []
      }
      impersonation_logs: {
        Row: {
          admin_user: string
          id: string
          target_user: string
          timestamp: string | null
        }
        Insert: {
          admin_user: string
          id?: string
          target_user: string
          timestamp?: string | null
        }
        Update: {
          admin_user?: string
          id?: string
          target_user?: string
          timestamp?: string | null
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
      institutional_trades: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          reported_at: string | null
          source: string
          symbol: string
        }
        Insert: {
          created_at?: string | null
          data: Json
          id?: string
          reported_at?: string | null
          source: string
          symbol: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          reported_at?: string | null
          source?: string
          symbol?: string
        }
        Relationships: []
      }
      legal_acceptances: {
        Row: {
          accepted_at: string | null
          legal_text_id: number | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          legal_text_id?: number | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          legal_text_id?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_acceptances_legal_text_id_fkey"
            columns: ["legal_text_id"]
            isOneToOne: false
            referencedRelation: "legal_texts"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_texts: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: number
          is_active: boolean
          kind: string
          version: number
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: number
          is_active?: boolean
          kind: string
          version: number
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: number
          is_active?: boolean
          kind?: string
          version?: number
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
      market_anticipation: {
        Row: {
          anticipated_at: string | null
          anticipation_type: string | null
          created_at: string | null
          factor: string
          id: string
          notes: string | null
          priced_in: boolean | null
          strength: number | null
          ticker: string | null
        }
        Insert: {
          anticipated_at?: string | null
          anticipation_type?: string | null
          created_at?: string | null
          factor: string
          id?: string
          notes?: string | null
          priced_in?: boolean | null
          strength?: number | null
          ticker?: string | null
        }
        Update: {
          anticipated_at?: string | null
          anticipation_type?: string | null
          created_at?: string | null
          factor?: string
          id?: string
          notes?: string | null
          priced_in?: boolean | null
          strength?: number | null
          ticker?: string | null
        }
        Relationships: []
      }
      market_data_cache: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          ticker: string
        }
        Insert: {
          created_at?: string | null
          data: Json
          id?: string
          ticker: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          ticker?: string
        }
        Relationships: []
      }
      market_snapshots: {
        Row: {
          adv_dec_line: number | null
          advancers: number | null
          asof: string
          breadth_score: number | null
          created_at: string | null
          decliners: number | null
          id: number
          put_call_ratio: number | null
          sector_flows: Json | null
          vix: number | null
          volume_down: number | null
          volume_up: number | null
        }
        Insert: {
          adv_dec_line?: number | null
          advancers?: number | null
          asof: string
          breadth_score?: number | null
          created_at?: string | null
          decliners?: number | null
          id?: number
          put_call_ratio?: number | null
          sector_flows?: Json | null
          vix?: number | null
          volume_down?: number | null
          volume_up?: number | null
        }
        Update: {
          adv_dec_line?: number | null
          advancers?: number | null
          asof?: string
          breadth_score?: number | null
          created_at?: string | null
          decliners?: number | null
          id?: number
          put_call_ratio?: number | null
          sector_flows?: Json | null
          vix?: number | null
          volume_down?: number | null
          volume_up?: number | null
        }
        Relationships: []
      }
      news_cache: {
        Row: {
          created_at: string | null
          headline: string | null
          id: string
          published_at: string | null
          raw: Json | null
          sentiment: number | null
          symbol: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          headline?: string | null
          id: string
          published_at?: string | null
          raw?: Json | null
          sentiment?: number | null
          symbol?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          headline?: string | null
          id?: string
          published_at?: string | null
          raw?: Json | null
          sentiment?: number | null
          symbol?: string | null
          url?: string | null
        }
        Relationships: []
      }
      news_event_links: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          macro_factor: string | null
          relation_type: string | null
          sector: string | null
          ticker: string | null
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          macro_factor?: string | null
          relation_type?: string | null
          sector?: string | null
          ticker?: string | null
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          macro_factor?: string | null
          relation_type?: string | null
          sector?: string | null
          ticker?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "news_event_links_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "news_events"
            referencedColumns: ["id"]
          },
        ]
      }
      news_events: {
        Row: {
          body: string | null
          created_at: string
          driver_event_id: string | null
          duplicate_of: string | null
          event_group: string | null
          headline: string
          id: string
          is_derivative: boolean | null
          is_duplicate: boolean | null
          is_macro: boolean | null
          mention_count: number
          predicted_confidence: number | null
          predicted_event_type_id: string | null
          published_at: string
          raw_sentiment: number | null
          retraction_at: string | null
          sentiment: number | null
          source: string | null
          source_quality: number | null
          tickers: string[] | null
          unique_hash: string
          updated_at: string
          url: string | null
          verified_source: boolean | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          driver_event_id?: string | null
          duplicate_of?: string | null
          event_group?: string | null
          headline: string
          id?: string
          is_derivative?: boolean | null
          is_duplicate?: boolean | null
          is_macro?: boolean | null
          mention_count?: number
          predicted_confidence?: number | null
          predicted_event_type_id?: string | null
          published_at: string
          raw_sentiment?: number | null
          retraction_at?: string | null
          sentiment?: number | null
          source?: string | null
          source_quality?: number | null
          tickers?: string[] | null
          unique_hash: string
          updated_at?: string
          url?: string | null
          verified_source?: boolean | null
        }
        Update: {
          body?: string | null
          created_at?: string
          driver_event_id?: string | null
          duplicate_of?: string | null
          event_group?: string | null
          headline?: string
          id?: string
          is_derivative?: boolean | null
          is_duplicate?: boolean | null
          is_macro?: boolean | null
          mention_count?: number
          predicted_confidence?: number | null
          predicted_event_type_id?: string | null
          published_at?: string
          raw_sentiment?: number | null
          retraction_at?: string | null
          sentiment?: number | null
          source?: string | null
          source_quality?: number | null
          tickers?: string[] | null
          unique_hash?: string
          updated_at?: string
          url?: string | null
          verified_source?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "news_events_driver_event_id_fkey"
            columns: ["driver_event_id"]
            isOneToOne: false
            referencedRelation: "news_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_events_duplicate_of_fkey"
            columns: ["duplicate_of"]
            isOneToOne: false
            referencedRelation: "news_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_events_predicted_event_type_id_fkey"
            columns: ["predicted_event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
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
      options_flow: {
        Row: {
          asof: string
          call_wall: number | null
          charm: number | null
          created_at: string | null
          crowd_intensity_score: number | null
          expiry: string | null
          gamma_flip_price: number | null
          gex: number | null
          id: number
          iv: number | null
          iv_rank: number | null
          iv_realized_gap: number | null
          max_pain: number | null
          oi_change: number | null
          open_interest: number | null
          option_type: string | null
          put_floor: number | null
          residual_flow_excess: number | null
          snapshot_time: string | null
          source: string | null
          strike: number | null
          ticker: string
          vanna: number | null
          volume: number | null
        }
        Insert: {
          asof: string
          call_wall?: number | null
          charm?: number | null
          created_at?: string | null
          crowd_intensity_score?: number | null
          expiry?: string | null
          gamma_flip_price?: number | null
          gex?: number | null
          id?: number
          iv?: number | null
          iv_rank?: number | null
          iv_realized_gap?: number | null
          max_pain?: number | null
          oi_change?: number | null
          open_interest?: number | null
          option_type?: string | null
          put_floor?: number | null
          residual_flow_excess?: number | null
          snapshot_time?: string | null
          source?: string | null
          strike?: number | null
          ticker: string
          vanna?: number | null
          volume?: number | null
        }
        Update: {
          asof?: string
          call_wall?: number | null
          charm?: number | null
          created_at?: string | null
          crowd_intensity_score?: number | null
          expiry?: string | null
          gamma_flip_price?: number | null
          gex?: number | null
          id?: number
          iv?: number | null
          iv_rank?: number | null
          iv_realized_gap?: number | null
          max_pain?: number | null
          oi_change?: number | null
          open_interest?: number | null
          option_type?: string | null
          put_floor?: number | null
          residual_flow_excess?: number | null
          snapshot_time?: string | null
          source?: string | null
          strike?: number | null
          ticker?: string
          vanna?: number | null
          volume?: number | null
        }
        Relationships: []
      }
      order_flow_tape: {
        Row: {
          asof: string
          created_at: string | null
          id: number
          price: number
          side: string | null
          size: number
          ticker: string
          trade_conditions: string[] | null
          venue: string | null
        }
        Insert: {
          asof: string
          created_at?: string | null
          id?: number
          price: number
          side?: string | null
          size: number
          ticker: string
          trade_conditions?: string[] | null
          venue?: string | null
        }
        Update: {
          asof?: string
          created_at?: string | null
          id?: number
          price?: number
          side?: string | null
          size?: number
          ticker?: string
          trade_conditions?: string[] | null
          venue?: string | null
        }
        Relationships: []
      }
      plan_throttles: {
        Row: {
          max_alerts: number
          max_backtests: number
          plan: string
          rpd: number
          rpm: number
        }
        Insert: {
          max_alerts: number
          max_backtests: number
          plan: string
          rpd: number
          rpm: number
        }
        Update: {
          max_alerts?: number
          max_backtests?: number
          plan?: string
          rpd?: number
          rpm?: number
        }
        Relationships: []
      }
      price_action_levels: {
        Row: {
          asof: string
          buy_walls: Json | null
          created_at: string | null
          depth: number | null
          execution_constraints: Json | null
          id: number
          r1: number | null
          r2: number | null
          s1: number | null
          s2: number | null
          sell_walls: Json | null
          snapshot_time: string | null
          ticker: string
          vacuum_bands: Json | null
          vwap: number | null
        }
        Insert: {
          asof: string
          buy_walls?: Json | null
          created_at?: string | null
          depth?: number | null
          execution_constraints?: Json | null
          id?: number
          r1?: number | null
          r2?: number | null
          s1?: number | null
          s2?: number | null
          sell_walls?: Json | null
          snapshot_time?: string | null
          ticker: string
          vacuum_bands?: Json | null
          vwap?: number | null
        }
        Update: {
          asof?: string
          buy_walls?: Json | null
          created_at?: string | null
          depth?: number | null
          execution_constraints?: Json | null
          id?: number
          r1?: number | null
          r2?: number | null
          s1?: number | null
          s2?: number | null
          sell_walls?: Json | null
          snapshot_time?: string | null
          ticker?: string
          vacuum_bands?: Json | null
          vwap?: number | null
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
          is_trial_active: boolean | null
          role: Database["public"]["Enums"]["user_role_enum"] | null
          trial_end: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          initials?: string | null
          is_trial_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role_enum"] | null
          trial_end?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          initials?: string | null
          is_trial_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role_enum"] | null
          trial_end?: string | null
          username?: string | null
        }
        Relationships: []
      }
      prompt_templates: {
        Row: {
          id: string
          last_tuned: string | null
          template_content: string | null
          template_name: string | null
        }
        Insert: {
          id?: string
          last_tuned?: string | null
          template_content?: string | null
          template_name?: string | null
        }
        Update: {
          id?: string
          last_tuned?: string | null
          template_content?: string | null
          template_name?: string | null
        }
        Relationships: []
      }
      push_notifications: {
        Row: {
          body: string | null
          id: string
          sent_at: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          body?: string | null
          id?: string
          sent_at?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string | null
          id?: string
          sent_at?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      scenarios: {
        Row: {
          created_at: string | null
          driver_id: string | null
          eps_best: number | null
          eps_mid: number | null
          eps_worst: number | null
          id: string
          price_best: number | null
          price_mid: number | null
          price_worst: number | null
          stock_ticker: string
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string | null
          driver_id?: string | null
          eps_best?: number | null
          eps_mid?: number | null
          eps_worst?: number | null
          id?: string
          price_best?: number | null
          price_mid?: number | null
          price_worst?: number | null
          stock_ticker: string
          updated_at?: string | null
          user_id?: string
          year: number
        }
        Update: {
          created_at?: string | null
          driver_id?: string | null
          eps_best?: number | null
          eps_mid?: number | null
          eps_worst?: number | null
          id?: string
          price_best?: number | null
          price_mid?: number | null
          price_worst?: number | null
          stock_ticker?: string
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "scenarios_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
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
      sec_insider_trades: {
        Row: {
          created_at: string | null
          id: string
          insider_name: string
          price: number | null
          role: string | null
          shares: number | null
          ticker: string
          transaction_date: string | null
          transaction_type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          insider_name: string
          price?: number | null
          role?: string | null
          shares?: number | null
          ticker: string
          transaction_date?: string | null
          transaction_type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          insider_name?: string
          price?: number | null
          role?: string | null
          shares?: number | null
          ticker?: string
          transaction_date?: string | null
          transaction_type?: string | null
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
      stock_price_ticks: {
        Row: {
          close: number | null
          created_at: string | null
          high: number | null
          id: string
          low: number | null
          open: number | null
          symbol: string
          timestamp: string
          volume: number | null
        }
        Insert: {
          close?: number | null
          created_at?: string | null
          high?: number | null
          id?: string
          low?: number | null
          open?: number | null
          symbol: string
          timestamp: string
          volume?: number | null
        }
        Update: {
          close?: number | null
          created_at?: string | null
          high?: number | null
          id?: string
          low?: number | null
          open?: number | null
          symbol?: string
          timestamp?: string
          volume?: number | null
        }
        Relationships: []
      }
      stocks: {
        Row: {
          company_name: string | null
          id: string
          symbol: string
        }
        Insert: {
          company_name?: string | null
          id?: string
          symbol: string
        }
        Update: {
          company_name?: string | null
          id?: string
          symbol?: string
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
      system_config: {
        Row: {
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      top_movers: {
        Row: {
          category: string
          created_at: string | null
          id: string
          percent_change: number | null
          price: number | null
          ticker: string
          volume: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          percent_change?: number | null
          price?: number | null
          ticker: string
          volume?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          percent_change?: number | null
          price?: number | null
          ticker?: string
          volume?: number | null
        }
        Relationships: []
      }
      user_ai_profiles: {
        Row: {
          ai_opinion: string | null
          alert_style: string | null
          notes: string | null
          preferred_sector: string | null
          profile_embedding: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_opinion?: string | null
          alert_style?: string | null
          notes?: string | null
          preferred_sector?: string | null
          profile_embedding?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_opinion?: string | null
          alert_style?: string | null
          notes?: string | null
          preferred_sector?: string | null
          profile_embedding?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_alert_audit_log: {
        Row: {
          alert_id: string | null
          event_json: Json | null
          fired_at: string | null
          id: string
          symbol: string | null
          user_id: string | null
        }
        Insert: {
          alert_id?: string | null
          event_json?: Json | null
          fired_at?: string | null
          id?: string
          symbol?: string | null
          user_id?: string | null
        }
        Update: {
          alert_id?: string | null
          event_json?: Json | null
          fired_at?: string | null
          id?: string
          symbol?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_alert_audit_log_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "user_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_alerts: {
        Row: {
          active: boolean | null
          alert_type: string | null
          condition_text: string | null
          created_at: string | null
          id: string
          is_global: boolean | null
          symbol: string
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          alert_type?: string | null
          condition_text?: string | null
          created_at?: string | null
          id?: string
          is_global?: boolean | null
          symbol: string
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          alert_type?: string | null
          condition_text?: string | null
          created_at?: string | null
          id?: string
          is_global?: boolean | null
          symbol?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_event_log: {
        Row: {
          event_type: string
          id: string
          metadata: Json | null
          symbol: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          event_type: string
          id?: string
          metadata?: Json | null
          symbol?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          event_type?: string
          id?: string
          metadata?: Json | null
          symbol?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_legal_acceptance: {
        Row: {
          agreed_at: string | null
          user_id: string
        }
        Insert: {
          agreed_at?: string | null
          user_id: string
        }
        Update: {
          agreed_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_plans: {
        Row: {
          created_at: string | null
          is_admin: boolean
          plan: Database["public"]["Enums"]["plan_t"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          is_admin?: boolean
          plan?: Database["public"]["Enums"]["plan_t"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          is_admin?: boolean
          plan?: Database["public"]["Enums"]["plan_t"]
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["user_role_enum"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          ai_suggestions_default: boolean
          created_at: string
          email_notifications: boolean
          legal_accept: string | null
          push_notifications: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_suggestions_default?: boolean
          created_at?: string
          email_notifications?: boolean
          legal_accept?: string | null
          push_notifications?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_suggestions_default?: boolean
          created_at?: string
          email_notifications?: boolean
          legal_accept?: string | null
          push_notifications?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vendor_configs: {
        Row: {
          api_key: string
          created_at: string
          created_by: string
          id: number
          meta: Json
          scope: string
          updated_at: string
          vendor: string
        }
        Insert: {
          api_key: string
          created_at?: string
          created_by: string
          id?: number
          meta?: Json
          scope?: string
          updated_at?: string
          vendor: string
        }
        Update: {
          api_key?: string
          created_at?: string
          created_by?: string
          id?: number
          meta?: Json
          scope?: string
          updated_at?: string
          vendor?: string
        }
        Relationships: []
      }
      vendor_keys: {
        Row: {
          created_at: string | null
          id: string
          key_value: string
          scope: Database["public"]["Enums"]["user_role_enum"] | null
          updated_at: string | null
          vendor: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key_value: string
          scope?: Database["public"]["Enums"]["user_role_enum"] | null
          updated_at?: string | null
          vendor: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key_value?: string
          scope?: Database["public"]["Enums"]["user_role_enum"] | null
          updated_at?: string | null
          vendor?: string
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          created_at: string
          id: string
          sort_order: number | null
          ticker: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sort_order?: number | null
          ticker: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sort_order?: number | null
          ticker?: string
          user_id?: string
        }
        Relationships: []
      }
      watchlist_tags: {
        Row: {
          color: string | null
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          color?: string | null
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          color?: string | null
          id?: string
          name?: string
          user_id?: string | null
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
      ai_scan_top_scores_view: {
        Row: {
          alert_json: Json | null
          confidence: number | null
          detected_pattern: string | null
          id: string | null
          scanned_at: string | null
          symbol: string | null
        }
        Insert: {
          alert_json?: Json | null
          confidence?: number | null
          detected_pattern?: string | null
          id?: string | null
          scanned_at?: string | null
          symbol?: string | null
        }
        Update: {
          alert_json?: Json | null
          confidence?: number | null
          detected_pattern?: string | null
          id?: string | null
          scanned_at?: string | null
          symbol?: string | null
        }
        Relationships: []
      }
      current_user_plan: {
        Row: {
          is_admin: boolean | null
          plan: Database["public"]["Enums"]["plan_t"] | null
          user_id: string | null
        }
        Insert: {
          is_admin?: boolean | null
          plan?: Database["public"]["Enums"]["plan_t"] | null
          user_id?: string | null
        }
        Update: {
          is_admin?: boolean | null
          plan?: Database["public"]["Enums"]["plan_t"] | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_alerts_view: {
        Row: {
          condition: string | null
          created_at: string | null
          expires_at: string | null
          id: string | null
          owner: string | null
          source: Database["public"]["Enums"]["alert_source_enum"] | null
          status: string | null
          ticker: string | null
          triggered_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          condition?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          owner?: string | null
          source?: Database["public"]["Enums"]["alert_source_enum"] | null
          status?: string | null
          ticker?: string | null
          triggered_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          condition?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          owner?: string | null
          source?: Database["public"]["Enums"]["alert_source_enum"] | null
          status?: string | null
          ticker?: string | null
          triggered_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_set_role: {
        Args: { p_role: string; p_user: string }
        Returns: undefined
      }
      ai_config_set: {
        Args: { _key: string; _value: Json }
        Returns: undefined
      }
      audit_impersonation: {
        Args: { target_user: string }
        Returns: undefined
      }
      audit_write: {
        Args: { _action: string; _meta?: Json; _target: string }
        Returns: undefined
      }
      autonomous_ai_scan: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      expire_alerts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      export_approve_full: {
        Args: { _export_id: string }
        Returns: undefined
      }
      export_logger: {
        Args: { type: string }
        Returns: undefined
      }
      f_horizon_days: {
        Args: { _h: string }
        Returns: number
      }
      f_news_hash: {
        Args: { _headline: string; _source: string; _ts: string }
        Returns: string
      }
      flag_set: {
        Args: { _is_enabled: boolean; _key: string; _value?: Json }
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      legal_acceptance: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      legal_upsert: {
        Args: { _activate?: boolean; _content: string; _kind: string }
        Returns: undefined
      }
      process_alerts: {
        Args: {
          alert_json: Json
          alert_type: Database["public"]["Enums"]["alert_type_enum"]
        }
        Returns: undefined
      }
      prompt_optimizer: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      rating_handler: {
        Args: { prompt_id: string; rating: number }
        Returns: undefined
      }
      rbac_grant_admin: {
        Args: { target: string }
        Returns: undefined
      }
      rbac_revoke_admin: {
        Args: { target: string }
        Returns: undefined
      }
      rbac_transfer_presidency: {
        Args: { new_president: string }
        Returns: undefined
      }
      reset_throttle: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      run_backtest: {
        Args: { alert_id: string }
        Returns: Json
      }
      send_push_notification: {
        Args: { body: string; title: string }
        Returns: undefined
      }
      throttle_set: {
        Args: {
          _max_alerts: number
          _max_backtests: number
          _plan: string
          _rpd: number
          _rpm: number
        }
        Returns: undefined
      }
      toggle_watchlist: {
        Args: { ticker: string }
        Returns: undefined
      }
      trigger_alerts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      vendor_set: {
        Args: {
          _api_key: string
          _meta?: Json
          _scope: string
          _vendor: string
        }
        Returns: undefined
      }
    }
    Enums: {
      ai_tool_enum: "alpha_scout" | "chart_gpt" | "deep_scanner" | "news_sweep"
      alert_source_enum: "user" | "ai" | "community"
      alert_type_enum: "price" | "volume" | "news" | "technical" | "custom"
      notification_type_enum: "alert_trigger" | "system" | "news"
      plan_enum: "basic" | "premium" | "trial"
      plan_t: "Free" | "Basic" | "Premium" | "President"
      user_role_enum:
        | "admin"
        | "president"
        | "premium"
        | "basic"
        | "trial"
        | "premium_user"
        | "free_user"
        | "free"
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
      ai_tool_enum: ["alpha_scout", "chart_gpt", "deep_scanner", "news_sweep"],
      alert_source_enum: ["user", "ai", "community"],
      alert_type_enum: ["price", "volume", "news", "technical", "custom"],
      notification_type_enum: ["alert_trigger", "system", "news"],
      plan_enum: ["basic", "premium", "trial"],
      plan_t: ["Free", "Basic", "Premium", "President"],
      user_role_enum: [
        "admin",
        "president",
        "premium",
        "basic",
        "trial",
        "premium_user",
        "free_user",
        "free",
      ],
    },
  },
} as const
