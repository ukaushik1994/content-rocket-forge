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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      action_analytics: {
        Row: {
          action_id: string
          action_label: string
          action_type: string
          completed_at: string | null
          conversation_id: string | null
          created_at: string
          effectiveness_score: number | null
          id: string
          interaction_data: Json | null
          success: boolean
          triggered_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_id: string
          action_label: string
          action_type: string
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          effectiveness_score?: number | null
          id?: string
          interaction_data?: Json | null
          success?: boolean
          triggered_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_id?: string
          action_label?: string
          action_type?: string
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          effectiveness_score?: number | null
          id?: string
          interaction_data?: Json | null
          success?: boolean
          triggered_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      action_patterns: {
        Row: {
          action_sequence: string[]
          context: Json | null
          created_at: string
          id: string
          outcome: string
          user_id: string
        }
        Insert: {
          action_sequence: string[]
          context?: Json | null
          created_at?: string
          id?: string
          outcome: string
          user_id: string
        }
        Update: {
          action_sequence?: string[]
          context?: Json | null
          created_at?: string
          id?: string
          outcome?: string
          user_id?: string
        }
        Relationships: []
      }
      adaptive_ui_state: {
        Row: {
          collapsed_sections: Json | null
          created_at: string | null
          dashboard_config: Json | null
          favorite_features: Json | null
          id: string
          preferred_layout: string | null
          quick_access_items: Json | null
          theme_preferences: Json | null
          updated_at: string | null
          user_id: string
          widget_positions: Json | null
        }
        Insert: {
          collapsed_sections?: Json | null
          created_at?: string | null
          dashboard_config?: Json | null
          favorite_features?: Json | null
          id?: string
          preferred_layout?: string | null
          quick_access_items?: Json | null
          theme_preferences?: Json | null
          updated_at?: string | null
          user_id: string
          widget_positions?: Json | null
        }
        Update: {
          collapsed_sections?: Json | null
          created_at?: string | null
          dashboard_config?: Json | null
          favorite_features?: Json | null
          id?: string
          preferred_layout?: string | null
          quick_access_items?: Json | null
          theme_preferences?: Json | null
          updated_at?: string | null
          user_id?: string
          widget_positions?: Json | null
        }
        Relationships: []
      }
      ai_chat_contexts: {
        Row: {
          context_data: Json
          context_type: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          context_data?: Json
          context_type: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          context_data?: Json
          context_type?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_context_snapshots: {
        Row: {
          conversation_type: string | null
          created_at: string
          id: string
          messages: Json | null
          title: string
          user_id: string
          workflow_state: Json | null
        }
        Insert: {
          conversation_type?: string | null
          created_at?: string
          id?: string
          messages?: Json | null
          title: string
          user_id: string
          workflow_state?: Json | null
        }
        Update: {
          conversation_type?: string | null
          created_at?: string
          id?: string
          messages?: Json | null
          title?: string
          user_id?: string
          workflow_state?: Json | null
        }
        Relationships: []
      }
      ai_context_state: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
          workflow_state: Json | null
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          workflow_state?: Json | null
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          workflow_state?: Json | null
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          archived: boolean | null
          created_at: string
          id: string
          pinned: boolean | null
          tags: string[] | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean | null
          created_at?: string
          id?: string
          pinned?: boolean | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean | null
          created_at?: string
          id?: string
          pinned?: boolean | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_file_analyses: {
        Row: {
          analysis_type: string
          competitive_analysis: Json | null
          content_preview: string | null
          created_at: string
          entities: Json | null
          extracted_text: string | null
          file_name: string
          file_size: number
          file_type: string
          id: string
          insights: Json | null
          key_topics: string[] | null
          optimization_suggestions: Json | null
          sentiment_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_type?: string
          competitive_analysis?: Json | null
          content_preview?: string | null
          created_at?: string
          entities?: Json | null
          extracted_text?: string | null
          file_name: string
          file_size: number
          file_type: string
          id?: string
          insights?: Json | null
          key_topics?: string[] | null
          optimization_suggestions?: Json | null
          sentiment_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_type?: string
          competitive_analysis?: Json | null
          content_preview?: string | null
          created_at?: string
          entities?: Json | null
          extracted_text?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          insights?: Json | null
          key_topics?: string[] | null
          optimization_suggestions?: Json | null
          sentiment_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          attachments: Json | null
          content: string
          conversation_id: string
          created_at: string
          delivery_attempts: number | null
          error_details: string | null
          function_calls: Json | null
          id: string
          is_streaming: boolean | null
          message_sequence: number
          message_status: string | null
          progress_indicator: Json | null
          read_by: Json | null
          status: string
          type: string
          visual_data: Json | null
          workflow_context: Json | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          conversation_id: string
          created_at?: string
          delivery_attempts?: number | null
          error_details?: string | null
          function_calls?: Json | null
          id?: string
          is_streaming?: boolean | null
          message_sequence?: number
          message_status?: string | null
          progress_indicator?: Json | null
          read_by?: Json | null
          status?: string
          type: string
          visual_data?: Json | null
          workflow_context?: Json | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string
          delivery_attempts?: number | null
          error_details?: string | null
          function_calls?: Json | null
          id?: string
          is_streaming?: boolean | null
          message_sequence?: number
          message_status?: string | null
          progress_indicator?: Json | null
          read_by?: Json | null
          status?: string
          type?: string
          visual_data?: Json | null
          workflow_context?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_service_providers: {
        Row: {
          api_key: string
          available_models: Json | null
          capabilities: Json | null
          category: string | null
          created_at: string
          description: string | null
          error_message: string | null
          icon_name: string | null
          id: string
          is_required: boolean | null
          last_verified: string | null
          preferred_model: string | null
          priority: number
          provider: string
          setup_url: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key: string
          available_models?: Json | null
          capabilities?: Json | null
          category?: string | null
          created_at?: string
          description?: string | null
          error_message?: string | null
          icon_name?: string | null
          id?: string
          is_required?: boolean | null
          last_verified?: string | null
          preferred_model?: string | null
          priority?: number
          provider: string
          setup_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          available_models?: Json | null
          capabilities?: Json | null
          category?: string | null
          created_at?: string
          description?: string | null
          error_message?: string | null
          icon_name?: string | null
          id?: string
          is_required?: boolean | null
          last_verified?: string | null
          preferred_model?: string | null
          priority?: number
          provider?: string
          setup_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_strategies: {
        Row: {
          created_at: string
          description: string | null
          goals: Json
          id: string
          keywords: string[]
          proposals: Json
          serp_data: Json | null
          session_metadata: Json
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          goals?: Json
          id?: string
          keywords?: string[]
          proposals?: Json
          serp_data?: Json | null
          session_metadata?: Json
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          goals?: Json
          id?: string
          keywords?: string[]
          proposals?: Json
          serp_data?: Json | null
          session_metadata?: Json
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_strategy_conversations: {
        Row: {
          company_context: Json | null
          completed_at: string | null
          created_at: string
          current_step: number
          final_strategy_id: string | null
          goals: Json
          id: string
          solutions_context: Json | null
          status: string
          total_steps: number
          updated_at: string
          user_id: string
        }
        Insert: {
          company_context?: Json | null
          completed_at?: string | null
          created_at?: string
          current_step?: number
          final_strategy_id?: string | null
          goals?: Json
          id?: string
          solutions_context?: Json | null
          status?: string
          total_steps?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          company_context?: Json | null
          completed_at?: string | null
          created_at?: string
          current_step?: number
          final_strategy_id?: string | null
          goals?: Json
          id?: string
          solutions_context?: Json | null
          status?: string
          total_steps?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_strategy_proposals: {
        Row: {
          completed_at: string | null
          content_suggestions: string[] | null
          content_type: string | null
          created_at: string
          description: string | null
          estimated_impressions: number | null
          id: string
          primary_keyword: string
          priority_tag: string | null
          proposal_data: Json | null
          related_keywords: string[] | null
          scheduled_at: string | null
          serp_data: Json | null
          status: string
          strategy_session_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          content_suggestions?: string[] | null
          content_type?: string | null
          created_at?: string
          description?: string | null
          estimated_impressions?: number | null
          id?: string
          primary_keyword: string
          priority_tag?: string | null
          proposal_data?: Json | null
          related_keywords?: string[] | null
          scheduled_at?: string | null
          serp_data?: Json | null
          status?: string
          strategy_session_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          content_suggestions?: string[] | null
          content_type?: string | null
          created_at?: string
          description?: string | null
          estimated_impressions?: number | null
          id?: string
          primary_keyword?: string
          priority_tag?: string | null
          proposal_data?: Json | null
          related_keywords?: string[] | null
          scheduled_at?: string | null
          serp_data?: Json | null
          status?: string
          strategy_session_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_training_logs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          model_type: string
          status: string
          training_data: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          model_type: string
          status: string
          training_data?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          model_type?: string
          status?: string
          training_data?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_workflow_states: {
        Row: {
          conversation_id: string | null
          created_at: string
          current_step: string
          id: string
          updated_at: string
          user_id: string
          workflow_data: Json
          workflow_type: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          current_step: string
          id?: string
          updated_at?: string
          user_id: string
          workflow_data?: Json
          workflow_type: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          current_step?: string
          id?: string
          updated_at?: string
          user_id?: string
          workflow_data?: Json
          workflow_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_workflow_states_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          encrypted_key: string
          id: string
          is_active: boolean
          service: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          encrypted_key: string
          id?: string
          is_active?: boolean
          service: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          encrypted_key?: string
          id?: string
          is_active?: boolean
          service?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      approval_actions_log: {
        Row: {
          accepted_recommendation: boolean
          action: string
          content_id: string
          created_at: string
          id: string
          latency_ms: number | null
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_recommendation?: boolean
          action: string
          content_id: string
          created_at?: string
          id?: string
          latency_ms?: number | null
          source?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_recommendation?: boolean
          action?: string
          content_id?: string
          created_at?: string
          id?: string
          latency_ms?: number | null
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_actions_log_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string
          content_id: string
          due_date: string | null
          id: string
          is_active: boolean | null
          priority: string | null
          reviewer_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by: string
          content_id: string
          due_date?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          reviewer_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string
          content_id?: string
          due_date?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_assignments_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_comments: {
        Row: {
          approval_id: string
          comment: string
          comment_type: string | null
          created_at: string
          id: string
          reviewer_id: string
        }
        Insert: {
          approval_id: string
          comment: string
          comment_type?: string | null
          created_at?: string
          id?: string
          reviewer_id: string
        }
        Update: {
          approval_id?: string
          comment?: string
          comment_type?: string | null
          created_at?: string
          id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_comments_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "content_approvals"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_history: {
        Row: {
          action: string
          content_id: string
          created_at: string | null
          from_status:
            | Database["public"]["Enums"]["approval_workflow_status"]
            | null
          id: string
          notes: string | null
          to_status:
            | Database["public"]["Enums"]["approval_workflow_status"]
            | null
          user_id: string
        }
        Insert: {
          action: string
          content_id: string
          created_at?: string | null
          from_status?:
            | Database["public"]["Enums"]["approval_workflow_status"]
            | null
          id?: string
          notes?: string | null
          to_status?:
            | Database["public"]["Enums"]["approval_workflow_status"]
            | null
          user_id: string
        }
        Update: {
          action?: string
          content_id?: string
          created_at?: string | null
          from_status?:
            | Database["public"]["Enums"]["approval_workflow_status"]
            | null
          id?: string
          notes?: string | null
          to_status?:
            | Database["public"]["Enums"]["approval_workflow_status"]
            | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_history_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_recommendations: {
        Row: {
          action: string
          confidence: number | null
          content_id: string
          created_at: string
          id: string
          model: string | null
          reasoning: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          action: string
          confidence?: number | null
          content_id: string
          created_at?: string
          id?: string
          model?: string | null
          reasoning?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          action?: string
          confidence?: number | null
          content_id?: string
          created_at?: string
          id?: string
          model?: string | null
          reasoning?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_recommendations_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_triggers: {
        Row: {
          action_config: Json
          action_type: string
          confidence_threshold: number | null
          created_at: string | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          success_count: number | null
          trigger_conditions: Json
          trigger_name: string
          trigger_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_config?: Json
          action_type: string
          confidence_threshold?: number | null
          created_at?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          success_count?: number | null
          trigger_conditions?: Json
          trigger_name: string
          trigger_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_config?: Json
          action_type?: string
          confidence_threshold?: number | null
          created_at?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          success_count?: number | null
          trigger_conditions?: Json
          trigger_name?: string
          trigger_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      behavioral_analytics_sessions: {
        Row: {
          actions_performed: Json | null
          ai_interactions_count: number | null
          content_created: number | null
          created_at: string | null
          engagement_score: number | null
          features_used: Json | null
          id: string
          pages_visited: Json | null
          productivity_score: number | null
          session_duration: number | null
          session_end: string | null
          session_metadata: Json | null
          session_start: string
          user_id: string
          workflows_completed: Json | null
        }
        Insert: {
          actions_performed?: Json | null
          ai_interactions_count?: number | null
          content_created?: number | null
          created_at?: string | null
          engagement_score?: number | null
          features_used?: Json | null
          id?: string
          pages_visited?: Json | null
          productivity_score?: number | null
          session_duration?: number | null
          session_end?: string | null
          session_metadata?: Json | null
          session_start: string
          user_id: string
          workflows_completed?: Json | null
        }
        Update: {
          actions_performed?: Json | null
          ai_interactions_count?: number | null
          content_created?: number | null
          created_at?: string | null
          engagement_score?: number | null
          features_used?: Json | null
          id?: string
          pages_visited?: Json | null
          productivity_score?: number | null
          session_duration?: number | null
          session_end?: string | null
          session_metadata?: Json | null
          session_start?: string
          user_id?: string
          workflows_completed?: Json | null
        }
        Relationships: []
      }
      brand_guidelines: {
        Row: {
          accent_color: string | null
          brand_assets_url: string | null
          brand_personality: string | null
          brand_story: string | null
          brand_values: string | null
          company_id: string | null
          created_at: string
          do_use: Json | null
          dont_use: Json | null
          font_family: string
          id: string
          imagery_guidelines: string | null
          keywords: Json | null
          logo_usage_notes: string
          mission_statement: string | null
          neutral_color: string | null
          primary_color: string
          secondary_color: string
          secondary_font_family: string | null
          target_audience: string | null
          tone: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accent_color?: string | null
          brand_assets_url?: string | null
          brand_personality?: string | null
          brand_story?: string | null
          brand_values?: string | null
          company_id?: string | null
          created_at?: string
          do_use?: Json | null
          dont_use?: Json | null
          font_family: string
          id?: string
          imagery_guidelines?: string | null
          keywords?: Json | null
          logo_usage_notes: string
          mission_statement?: string | null
          neutral_color?: string | null
          primary_color: string
          secondary_color: string
          secondary_font_family?: string | null
          target_audience?: string | null
          tone?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accent_color?: string | null
          brand_assets_url?: string | null
          brand_personality?: string | null
          brand_story?: string | null
          brand_values?: string | null
          company_id?: string | null
          created_at?: string
          do_use?: Json | null
          dont_use?: Json | null
          font_family?: string
          id?: string
          imagery_guidelines?: string | null
          keywords?: Json | null
          logo_usage_notes?: string
          mission_statement?: string | null
          neutral_color?: string | null
          primary_color?: string
          secondary_color?: string
          secondary_font_family?: string | null
          target_audience?: string | null
          tone?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_guidelines_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_info"
            referencedColumns: ["id"]
          },
        ]
      }
      chart_insight_analytics: {
        Row: {
          action_taken: string | null
          analysis_id: string | null
          chart_index: number | null
          created_at: string
          id: string
          insight_content: string
          insight_type: string
          interaction_data: Json | null
          user_id: string
        }
        Insert: {
          action_taken?: string | null
          analysis_id?: string | null
          chart_index?: number | null
          created_at?: string
          id?: string
          insight_content: string
          insight_type: string
          interaction_data?: Json | null
          user_id: string
        }
        Update: {
          action_taken?: string | null
          analysis_id?: string | null
          chart_index?: number | null
          created_at?: string
          id?: string
          insight_content?: string
          insight_type?: string
          interaction_data?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chart_insight_analytics_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "saved_chart_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      cluster_keywords: {
        Row: {
          cluster_id: string
          created_at: string
          difficulty: number | null
          id: string
          is_primary: boolean | null
          keyword_id: string
          volume: number | null
        }
        Insert: {
          cluster_id: string
          created_at?: string
          difficulty?: number | null
          id?: string
          is_primary?: boolean | null
          keyword_id: string
          volume?: number | null
        }
        Update: {
          cluster_id?: string
          created_at?: string
          difficulty?: number | null
          id?: string
          is_primary?: boolean | null
          keyword_id?: string
          volume?: number | null
        }
        Relationships: []
      }
      collaboration_sessions: {
        Row: {
          conversation_id: string | null
          created_at: string
          ended_at: string | null
          host_user_id: string
          id: string
          participants: Json | null
          screen_sharing_active: boolean | null
          screen_sharing_user_id: string | null
          session_data: Json | null
          session_name: string
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          ended_at?: string | null
          host_user_id: string
          id?: string
          participants?: Json | null
          screen_sharing_active?: boolean | null
          screen_sharing_user_id?: string | null
          session_data?: Json | null
          session_name: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          ended_at?: string | null
          host_user_id?: string
          id?: string
          participants?: Json | null
          screen_sharing_active?: boolean | null
          screen_sharing_user_id?: string | null
          session_data?: Json | null
          session_name?: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_competitors: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          market_position: string | null
          name: string
          notes: string | null
          priority_order: number | null
          resources: Json | null
          strengths: Json | null
          updated_at: string
          user_id: string
          weaknesses: Json | null
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          market_position?: string | null
          name: string
          notes?: string | null
          priority_order?: number | null
          resources?: Json | null
          strengths?: Json | null
          updated_at?: string
          user_id: string
          weaknesses?: Json | null
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          market_position?: string | null
          name?: string
          notes?: string | null
          priority_order?: number | null
          resources?: Json | null
          strengths?: Json | null
          updated_at?: string
          user_id?: string
          weaknesses?: Json | null
          website?: string | null
        }
        Relationships: []
      }
      company_info: {
        Row: {
          created_at: string
          description: string | null
          founded: string | null
          id: string
          industry: string | null
          logo_url: string | null
          mission: string | null
          name: string
          size: string | null
          updated_at: string
          user_id: string
          values: Json | null
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          founded?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          mission?: string | null
          name: string
          size?: string | null
          updated_at?: string
          user_id: string
          values?: Json | null
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          founded?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          mission?: string | null
          name?: string
          size?: string | null
          updated_at?: string
          user_id?: string
          values?: Json | null
          website?: string | null
        }
        Relationships: []
      }
      competitor_cache: {
        Row: {
          cache_key: string
          created_at: string | null
          diagnostics: Json | null
          domain: string
          etag: string | null
          id: string
          last_crawled_at: string | null
          profile_data: Json
          url_count: number | null
        }
        Insert: {
          cache_key: string
          created_at?: string | null
          diagnostics?: Json | null
          domain: string
          etag?: string | null
          id?: string
          last_crawled_at?: string | null
          profile_data: Json
          url_count?: number | null
        }
        Update: {
          cache_key?: string
          created_at?: string | null
          diagnostics?: Json | null
          domain?: string
          etag?: string | null
          id?: string
          last_crawled_at?: string | null
          profile_data?: Json
          url_count?: number | null
        }
        Relationships: []
      }
      content_activity_log: {
        Row: {
          action: string
          change_summary: string | null
          content_id: string | null
          content_snapshot: Json | null
          content_type: string
          id: string
          metadata: Json | null
          module: string | null
          notes: string | null
          prompt: string | null
          timestamp: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action: string
          change_summary?: string | null
          content_id?: string | null
          content_snapshot?: Json | null
          content_type: string
          id?: string
          metadata?: Json | null
          module?: string | null
          notes?: string | null
          prompt?: string | null
          timestamp?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action?: string
          change_summary?: string | null
          content_id?: string | null
          content_snapshot?: Json | null
          content_type?: string
          id?: string
          metadata?: Json | null
          module?: string | null
          notes?: string | null
          prompt?: string | null
          timestamp?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_ai_analyses: {
        Row: {
          ai_provider: string | null
          analysis: Json
          analyzed_at: string
          content_id: string
          created_at: string
          id: string
          model: string | null
          prompt_version: string | null
          readability_score: number | null
          reanalyze_count: number
          seo_score: number | null
          settings_snapshot: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_provider?: string | null
          analysis?: Json
          analyzed_at?: string
          content_id: string
          created_at?: string
          id?: string
          model?: string | null
          prompt_version?: string | null
          readability_score?: number | null
          reanalyze_count?: number
          seo_score?: number | null
          settings_snapshot?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_provider?: string | null
          analysis?: Json
          analyzed_at?: string
          content_id?: string
          created_at?: string
          id?: string
          model?: string | null
          prompt_version?: string | null
          readability_score?: number | null
          reanalyze_count?: number
          seo_score?: number | null
          settings_snapshot?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_ai_analyses_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      content_analysis_settings: {
        Row: {
          created_at: string
          id: string
          prompt_template: string | null
          scoring_metrics: Json
          updated_at: string
          user_id: string
          version: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          prompt_template?: string | null
          scoring_metrics?: Json
          updated_at?: string
          user_id: string
          version?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          prompt_template?: string | null
          scoring_metrics?: Json
          updated_at?: string
          user_id?: string
          version?: string | null
        }
        Relationships: []
      }
      content_analytics: {
        Row: {
          analytics_data: Json | null
          content_id: string
          created_at: string
          id: string
          last_fetched_at: string | null
          published_url: string
          search_console_data: Json | null
          updated_at: string
        }
        Insert: {
          analytics_data?: Json | null
          content_id: string
          created_at?: string
          id?: string
          last_fetched_at?: string | null
          published_url: string
          search_console_data?: Json | null
          updated_at?: string
        }
        Update: {
          analytics_data?: Json | null
          content_id?: string
          created_at?: string
          id?: string
          last_fetched_at?: string | null
          published_url?: string
          search_console_data?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_analytics_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      content_approvals: {
        Row: {
          approval_notes: string | null
          assigned_at: string | null
          comments: string | null
          content_id: string
          created_at: string
          id: string
          priority: string | null
          reviewed_at: string | null
          reviewer_id: string
          status: string
          updated_at: string
        }
        Insert: {
          approval_notes?: string | null
          assigned_at?: string | null
          comments?: string | null
          content_id: string
          created_at?: string
          id?: string
          priority?: string | null
          reviewed_at?: string | null
          reviewer_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          approval_notes?: string | null
          assigned_at?: string | null
          comments?: string | null
          content_id?: string
          created_at?: string
          id?: string
          priority?: string | null
          reviewed_at?: string | null
          reviewer_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_approvals_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      content_briefs: {
        Row: {
          ai_model_used: string | null
          brief_content: string | null
          content_type: string
          created_at: string
          cta_suggestions: Json | null
          external_links: Json | null
          faq_section: Json | null
          generation_prompt: string | null
          id: string
          internal_links: Json | null
          introduction: string | null
          meta_description: string | null
          meta_title: string | null
          opportunity_id: string | null
          outline: Json | null
          quality_score: number | null
          status: string
          suggested_headings: Json | null
          target_word_count: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_model_used?: string | null
          brief_content?: string | null
          content_type?: string
          created_at?: string
          cta_suggestions?: Json | null
          external_links?: Json | null
          faq_section?: Json | null
          generation_prompt?: string | null
          id?: string
          internal_links?: Json | null
          introduction?: string | null
          meta_description?: string | null
          meta_title?: string | null
          opportunity_id?: string | null
          outline?: Json | null
          quality_score?: number | null
          status?: string
          suggested_headings?: Json | null
          target_word_count?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_model_used?: string | null
          brief_content?: string | null
          content_type?: string
          created_at?: string
          cta_suggestions?: Json | null
          external_links?: Json | null
          faq_section?: Json | null
          generation_prompt?: string | null
          id?: string
          internal_links?: Json | null
          introduction?: string | null
          meta_description?: string | null
          meta_title?: string | null
          opportunity_id?: string | null
          outline?: Json | null
          quality_score?: number | null
          status?: string
          suggested_headings?: Json | null
          target_word_count?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_calendar: {
        Row: {
          assigned_to: string | null
          content_id: string | null
          content_type: string
          created_at: string
          estimated_hours: number | null
          id: string
          notes: string | null
          priority: string
          proposal_data: Json | null
          proposal_id: string | null
          scheduled_date: string
          source_proposal_id: string | null
          status: string
          strategy_id: string | null
          tags: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          content_id?: string | null
          content_type?: string
          created_at?: string
          estimated_hours?: number | null
          id?: string
          notes?: string | null
          priority?: string
          proposal_data?: Json | null
          proposal_id?: string | null
          scheduled_date: string
          source_proposal_id?: string | null
          status?: string
          strategy_id?: string | null
          tags?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          content_id?: string | null
          content_type?: string
          created_at?: string
          estimated_hours?: number | null
          id?: string
          notes?: string | null
          priority?: string
          proposal_data?: Json | null
          proposal_id?: string | null
          scheduled_date?: string
          source_proposal_id?: string | null
          status?: string
          strategy_id?: string | null
          tags?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_calendar_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_calendar_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "ai_strategy_proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_calendar_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "content_strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      content_clusters: {
        Row: {
          competitor_analysis: Json | null
          created_at: string
          description: string | null
          estimated_traffic: number | null
          id: string
          name: string
          priority_tag: string | null
          solution_mapping: string[] | null
          status: string
          suggested_assets: Json | null
          timeframe_weeks: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          competitor_analysis?: Json | null
          created_at?: string
          description?: string | null
          estimated_traffic?: number | null
          id?: string
          name: string
          priority_tag?: string | null
          solution_mapping?: string[] | null
          status?: string
          suggested_assets?: Json | null
          timeframe_weeks?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          competitor_analysis?: Json | null
          created_at?: string
          description?: string | null
          estimated_traffic?: number | null
          id?: string
          name?: string
          priority_tag?: string | null
          solution_mapping?: string[] | null
          status?: string
          suggested_assets?: Json | null
          timeframe_weeks?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_formats: {
        Row: {
          created_at: string
          description: string | null
          format_code: string
          icon_type: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          format_code: string
          icon_type?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          format_code?: string
          icon_type?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      content_gaps: {
        Row: {
          competition_level: string | null
          created_at: string | null
          current_ranking: number | null
          description: string | null
          gap_type: string
          id: string
          keywords: string[] | null
          metadata: Json | null
          opportunity_score: number | null
          potential_traffic: number | null
          search_volume: number | null
          status: string | null
          target_cluster_id: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          competition_level?: string | null
          created_at?: string | null
          current_ranking?: number | null
          description?: string | null
          gap_type: string
          id?: string
          keywords?: string[] | null
          metadata?: Json | null
          opportunity_score?: number | null
          potential_traffic?: number | null
          search_volume?: number | null
          status?: string | null
          target_cluster_id?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          competition_level?: string | null
          created_at?: string | null
          current_ranking?: number | null
          description?: string | null
          gap_type?: string
          id?: string
          keywords?: string[] | null
          metadata?: Json | null
          opportunity_score?: number | null
          potential_traffic?: number | null
          search_volume?: number | null
          status?: string | null
          target_cluster_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_gaps_target_cluster_id_fkey"
            columns: ["target_cluster_id"]
            isOneToOne: false
            referencedRelation: "topic_clusters"
            referencedColumns: ["id"]
          },
        ]
      }
      content_goals: {
        Row: {
          created_at: string
          goal_article: number | null
          goal_blog: number | null
          goal_glossary: number | null
          goal_strategy: number | null
          id: string
          month: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_article?: number | null
          goal_blog?: number | null
          goal_glossary?: number | null
          goal_strategy?: number | null
          id?: string
          month: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal_article?: number | null
          goal_blog?: number | null
          goal_glossary?: number | null
          goal_strategy?: number | null
          id?: string
          month?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_input_history: {
        Row: {
          content_id: string | null
          created_at: string
          id: string
          primary_keyword: string | null
          used_faqs: Json | null
          used_headings: Json | null
          used_titles: Json | null
          user_id: string
        }
        Insert: {
          content_id?: string | null
          created_at?: string
          id?: string
          primary_keyword?: string | null
          used_faqs?: Json | null
          used_headings?: Json | null
          used_titles?: Json | null
          user_id: string
        }
        Update: {
          content_id?: string | null
          created_at?: string
          id?: string
          primary_keyword?: string | null
          used_faqs?: Json | null
          used_headings?: Json | null
          used_titles?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      content_items: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_workflow_status"]
          content: string | null
          content_type: Database["public"]["Enums"]["content_type_enum"] | null
          created_at: string
          glossary_id: string | null
          id: string
          keywords: Json | null
          meta_description: string | null
          meta_title: string | null
          metadata: Json | null
          published_url: string | null
          review_deadline: string | null
          reviewer_id: string | null
          seo_score: number | null
          solution_id: string | null
          status: string
          submitted_for_review_at: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["approval_workflow_status"]
          content?: string | null
          content_type?: Database["public"]["Enums"]["content_type_enum"] | null
          created_at?: string
          glossary_id?: string | null
          id?: string
          keywords?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          metadata?: Json | null
          published_url?: string | null
          review_deadline?: string | null
          reviewer_id?: string | null
          seo_score?: number | null
          solution_id?: string | null
          status?: string
          submitted_for_review_at?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["approval_workflow_status"]
          content?: string | null
          content_type?: Database["public"]["Enums"]["content_type_enum"] | null
          created_at?: string
          glossary_id?: string | null
          id?: string
          keywords?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          metadata?: Json | null
          published_url?: string | null
          review_deadline?: string | null
          reviewer_id?: string | null
          seo_score?: number | null
          solution_id?: string | null
          status?: string
          submitted_for_review_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_items_glossary_id_fkey"
            columns: ["glossary_id"]
            isOneToOne: false
            referencedRelation: "glossaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_items_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_keywords: {
        Row: {
          content_id: string
          keyword_id: string
        }
        Insert: {
          content_id: string
          keyword_id: string
        }
        Update: {
          content_id?: string
          keyword_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_keywords_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_keywords_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keywords"
            referencedColumns: ["id"]
          },
        ]
      }
      content_opportunities: {
        Row: {
          cluster_id: string | null
          competitor_count: number | null
          content_angle: string | null
          content_quality_gap: number | null
          created_at: string | null
          description: string | null
          estimated_effort: string | null
          estimated_traffic: number | null
          id: string
          keyword_difficulty: number | null
          metadata: Json | null
          opportunity_type: string
          primary_keyword: string
          priority_score: number | null
          related_keywords: string[] | null
          scheduled_date: string | null
          search_volume: number | null
          serp_features: string[] | null
          status: string | null
          suggested_format: string | null
          target_audience: string | null
          title: string
          trending_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cluster_id?: string | null
          competitor_count?: number | null
          content_angle?: string | null
          content_quality_gap?: number | null
          created_at?: string | null
          description?: string | null
          estimated_effort?: string | null
          estimated_traffic?: number | null
          id?: string
          keyword_difficulty?: number | null
          metadata?: Json | null
          opportunity_type: string
          primary_keyword: string
          priority_score?: number | null
          related_keywords?: string[] | null
          scheduled_date?: string | null
          search_volume?: number | null
          serp_features?: string[] | null
          status?: string | null
          suggested_format?: string | null
          target_audience?: string | null
          title: string
          trending_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cluster_id?: string | null
          competitor_count?: number | null
          content_angle?: string | null
          content_quality_gap?: number | null
          created_at?: string | null
          description?: string | null
          estimated_effort?: string | null
          estimated_traffic?: number | null
          id?: string
          keyword_difficulty?: number | null
          metadata?: Json | null
          opportunity_type?: string
          primary_keyword?: string
          priority_score?: number | null
          related_keywords?: string[] | null
          scheduled_date?: string | null
          search_volume?: number | null
          serp_features?: string[] | null
          status?: string | null
          suggested_format?: string | null
          target_audience?: string | null
          title?: string
          trending_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_opportunities_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "topic_clusters"
            referencedColumns: ["id"]
          },
        ]
      }
      content_optimization_logs: {
        Row: {
          content_id: string | null
          created_at: string | null
          error_details: string | null
          feedback_score: number | null
          id: string
          optimization_results: Json | null
          optimization_settings: Json | null
          optimized_content_length: number | null
          original_content_length: number
          performance_metrics: Json | null
          reasoning: Json
          session_id: string
          success: boolean | null
          suggestions_analyzed: Json
          suggestions_applied: Json
          suggestions_rejected: Json
          updated_at: string | null
          user_feedback: string | null
          user_id: string
        }
        Insert: {
          content_id?: string | null
          created_at?: string | null
          error_details?: string | null
          feedback_score?: number | null
          id?: string
          optimization_results?: Json | null
          optimization_settings?: Json | null
          optimized_content_length?: number | null
          original_content_length: number
          performance_metrics?: Json | null
          reasoning?: Json
          session_id: string
          success?: boolean | null
          suggestions_analyzed?: Json
          suggestions_applied?: Json
          suggestions_rejected?: Json
          updated_at?: string | null
          user_feedback?: string | null
          user_id: string
        }
        Update: {
          content_id?: string | null
          created_at?: string | null
          error_details?: string | null
          feedback_score?: number | null
          id?: string
          optimization_results?: Json | null
          optimization_settings?: Json | null
          optimized_content_length?: number | null
          original_content_length?: number
          performance_metrics?: Json | null
          reasoning?: Json
          session_id?: string
          success?: boolean | null
          suggestions_analyzed?: Json
          suggestions_applied?: Json
          suggestions_rejected?: Json
          updated_at?: string | null
          user_feedback?: string | null
          user_id?: string
        }
        Relationships: []
      }
      content_performance_predictions: {
        Row: {
          confidence_interval: Json | null
          content_id: string | null
          created_at: string | null
          factors: Json | null
          id: string
          keyword: string | null
          predicted_clicks: number | null
          predicted_ctr: number | null
          predicted_engagement_score: number | null
          predicted_impressions: number | null
          predicted_position: number | null
          prediction_date: string
          prediction_horizon: string
          user_id: string
        }
        Insert: {
          confidence_interval?: Json | null
          content_id?: string | null
          created_at?: string | null
          factors?: Json | null
          id?: string
          keyword?: string | null
          predicted_clicks?: number | null
          predicted_ctr?: number | null
          predicted_engagement_score?: number | null
          predicted_impressions?: number | null
          predicted_position?: number | null
          prediction_date: string
          prediction_horizon: string
          user_id: string
        }
        Update: {
          confidence_interval?: Json | null
          content_id?: string | null
          created_at?: string | null
          factors?: Json | null
          id?: string
          keyword?: string | null
          predicted_clicks?: number | null
          predicted_ctr?: number | null
          predicted_engagement_score?: number | null
          predicted_impressions?: number | null
          predicted_position?: number | null
          prediction_date?: string
          prediction_horizon?: string
          user_id?: string
        }
        Relationships: []
      }
      content_pipeline: {
        Row: {
          assigned_to: string | null
          blockers: Json | null
          calendar_item_id: string | null
          content_id: string | null
          content_type: string
          created_at: string
          due_date: string | null
          id: string
          image_url: string | null
          notes: string | null
          priority: string
          progress_percentage: number | null
          proposal_data: Json | null
          seo_score: number | null
          source_proposal_id: string | null
          stage: string
          strategy_id: string | null
          target_keyword: string | null
          title: string
          updated_at: string
          user_id: string
          word_count: number | null
        }
        Insert: {
          assigned_to?: string | null
          blockers?: Json | null
          calendar_item_id?: string | null
          content_id?: string | null
          content_type?: string
          created_at?: string
          due_date?: string | null
          id?: string
          image_url?: string | null
          notes?: string | null
          priority?: string
          progress_percentage?: number | null
          proposal_data?: Json | null
          seo_score?: number | null
          source_proposal_id?: string | null
          stage?: string
          strategy_id?: string | null
          target_keyword?: string | null
          title: string
          updated_at?: string
          user_id: string
          word_count?: number | null
        }
        Update: {
          assigned_to?: string | null
          blockers?: Json | null
          calendar_item_id?: string | null
          content_id?: string | null
          content_type?: string
          created_at?: string
          due_date?: string | null
          id?: string
          image_url?: string | null
          notes?: string | null
          priority?: string
          progress_percentage?: number | null
          proposal_data?: Json | null
          seo_score?: number | null
          source_proposal_id?: string | null
          stage?: string
          strategy_id?: string | null
          target_keyword?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_pipeline_calendar_item_id_fkey"
            columns: ["calendar_item_id"]
            isOneToOne: false
            referencedRelation: "content_calendar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_pipeline_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_pipeline_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "content_strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reuse_history: {
        Row: {
          content_id: string
          created_at: string
          id: string
          primary_keyword: string
          selected_solution_id: string | null
          selected_solution_name: string | null
          used_faqs: string[]
          used_headings: string[]
          used_titles: string[]
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: string
          primary_keyword: string
          selected_solution_id?: string | null
          selected_solution_name?: string | null
          used_faqs?: string[]
          used_headings?: string[]
          used_titles?: string[]
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: string
          primary_keyword?: string
          selected_solution_id?: string | null
          selected_solution_name?: string | null
          used_faqs?: string[]
          used_headings?: string[]
          used_titles?: string[]
          user_id?: string
        }
        Relationships: []
      }
      content_strategies: {
        Row: {
          brand_voice: string | null
          content_pieces_per_month: number | null
          content_pillars: Json | null
          created_at: string
          id: string
          is_active: boolean
          main_keyword: string | null
          monthly_traffic_goal: number | null
          name: string
          target_audience: string | null
          timeline: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_voice?: string | null
          content_pieces_per_month?: number | null
          content_pillars?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          main_keyword?: string | null
          monthly_traffic_goal?: number | null
          name?: string
          target_audience?: string | null
          timeline?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_voice?: string | null
          content_pieces_per_month?: number | null
          content_pillars?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          main_keyword?: string | null
          monthly_traffic_goal?: number | null
          name?: string
          target_audience?: string | null
          timeline?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      context_topics: {
        Row: {
          created_at: string | null
          description: string | null
          embedding: string | null
          frequency: number | null
          id: string
          last_mentioned: string | null
          topic_name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          frequency?: number | null
          id?: string
          last_mentioned?: string | null
          topic_name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          frequency?: number | null
          id?: string
          last_mentioned?: string | null
          topic_name?: string
          user_id?: string
        }
        Relationships: []
      }
      conversation_insights: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          id: string
          importance: number | null
          insight_data: Json
          insight_type: string
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          importance?: number | null
          insight_data: Json
          insight_type: string
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          importance?: number | null
          insight_data?: Json
          insight_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_insights_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_steps: {
        Row: {
          ai_input: Json
          ai_output: Json
          completed_at: string | null
          conversation_id: string
          created_at: string
          error_message: string | null
          id: string
          processing_time_ms: number | null
          status: string
          step_name: string
          step_number: number
          user_feedback: Json | null
        }
        Insert: {
          ai_input?: Json
          ai_output?: Json
          completed_at?: string | null
          conversation_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          processing_time_ms?: number | null
          status?: string
          step_name: string
          step_number: number
          user_feedback?: Json | null
        }
        Update: {
          ai_input?: Json
          ai_output?: Json
          completed_at?: string | null
          conversation_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          processing_time_ms?: number | null
          status?: string
          step_name?: string
          step_number?: number
          user_feedback?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_conversation_steps_conversation_id"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_strategy_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_summaries: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          entities: Json | null
          id: string
          importance_score: number | null
          key_topics: string[] | null
          sentiment_score: number | null
          summary: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          entities?: Json | null
          id?: string
          importance_score?: number | null
          key_topics?: string[] | null
          sentiment_score?: number | null
          summary: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          entities?: Json | null
          id?: string
          importance_score?: number | null
          key_topics?: string[] | null
          sentiment_score?: number | null
          summary?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_summaries_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_models: {
        Row: {
          accuracy: number | null
          base_model: string
          created_at: string
          dataset_id: string | null
          id: string
          model_config: Json
          name: string
          status: string
          training_progress: number | null
          updated_at: string
          use_case: string | null
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          base_model?: string
          created_at?: string
          dataset_id?: string | null
          id?: string
          model_config?: Json
          name: string
          status?: string
          training_progress?: number | null
          updated_at?: string
          use_case?: string | null
          user_id: string
        }
        Update: {
          accuracy?: number | null
          base_model?: string
          created_at?: string
          dataset_id?: string | null
          id?: string
          model_config?: Json
          name?: string
          status?: string
          training_progress?: number | null
          updated_at?: string
          use_case?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_models_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "training_datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_alerts: {
        Row: {
          action_buttons: Json | null
          action_label: string | null
          action_url: string | null
          category: string
          created_at: string
          expires_at: string | null
          grouped_id: string | null
          id: string
          interaction_count: number | null
          is_read: boolean | null
          last_interaction_at: string | null
          link_url: string | null
          message: string
          metadata: Json
          module: string | null
          notification_type: string | null
          preview_data: Json | null
          priority: string | null
          severity: string
          status: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          action_buttons?: Json | null
          action_label?: string | null
          action_url?: string | null
          category?: string
          created_at?: string
          expires_at?: string | null
          grouped_id?: string | null
          id?: string
          interaction_count?: number | null
          is_read?: boolean | null
          last_interaction_at?: string | null
          link_url?: string | null
          message: string
          metadata?: Json
          module?: string | null
          notification_type?: string | null
          preview_data?: Json | null
          priority?: string | null
          severity?: string
          status?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          action_buttons?: Json | null
          action_label?: string | null
          action_url?: string | null
          category?: string
          created_at?: string
          expires_at?: string | null
          grouped_id?: string | null
          id?: string
          interaction_count?: number | null
          is_read?: boolean | null
          last_interaction_at?: string | null
          link_url?: string | null
          message?: string
          metadata?: Json
          module?: string | null
          notification_type?: string | null
          preview_data?: Json | null
          priority?: string | null
          severity?: string
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          id: string
          message: string
          sentiment: string
          status: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sentiment: string
          status?: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sentiment?: string
          status?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      glossaries: {
        Row: {
          created_at: string
          description: string | null
          domain_url: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          domain_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      glossary_terms: {
        Row: {
          created_at: string
          expanded_explanation: string | null
          glossary_id: string
          id: string
          internal_links: Json | null
          keyword_difficulty: number | null
          last_updated: string
          paa_questions: Json | null
          related_terms: Json | null
          search_volume: number | null
          short_definition: string | null
          term: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expanded_explanation?: string | null
          glossary_id: string
          id?: string
          internal_links?: Json | null
          keyword_difficulty?: number | null
          last_updated?: string
          paa_questions?: Json | null
          related_terms?: Json | null
          search_volume?: number | null
          short_definition?: string | null
          term: string
          user_id: string
        }
        Update: {
          created_at?: string
          expanded_explanation?: string | null
          glossary_id?: string
          id?: string
          internal_links?: Json | null
          keyword_difficulty?: number | null
          last_updated?: string
          paa_questions?: Json | null
          related_terms?: Json | null
          search_volume?: number | null
          short_definition?: string | null
          term?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "glossary_terms_glossary_id_fkey"
            columns: ["glossary_id"]
            isOneToOne: false
            referencedRelation: "glossaries"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligent_workflows: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          solution_integrations: Json | null
          status: string
          success_metrics: Json | null
          template_metadata: Json | null
          title: string
          updated_at: string
          user_id: string
          workflow_data: Json
          workflow_type: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          solution_integrations?: Json | null
          status?: string
          success_metrics?: Json | null
          template_metadata?: Json | null
          title: string
          updated_at?: string
          user_id: string
          workflow_data?: Json
          workflow_type?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          solution_integrations?: Json | null
          status?: string
          success_metrics?: Json | null
          template_metadata?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
          workflow_data?: Json
          workflow_type?: string
        }
        Relationships: []
      }
      keyword_performance_cache: {
        Row: {
          cached_at: string
          competition_score: number | null
          cpc: number | null
          created_at: string
          expires_at: string
          intent: string | null
          keyword: string
          keyword_difficulty: number
          search_volume: number
          serp_features: Json | null
          user_id: string | null
        }
        Insert: {
          cached_at?: string
          competition_score?: number | null
          cpc?: number | null
          created_at?: string
          expires_at?: string
          intent?: string | null
          keyword: string
          keyword_difficulty?: number
          search_volume?: number
          serp_features?: Json | null
          user_id?: string | null
        }
        Update: {
          cached_at?: string
          competition_score?: number | null
          cpc?: number | null
          created_at?: string
          expires_at?: string
          intent?: string | null
          keyword?: string
          keyword_difficulty?: number
          search_volume?: number
          serp_features?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      keyword_position_history: {
        Row: {
          created_at: string
          domain: string
          id: string
          position: number
          position_change: number | null
          previous_position: number | null
          snippet: string | null
          title: string | null
          tracking_id: string | null
          url: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          position: number
          position_change?: number | null
          previous_position?: number | null
          snippet?: string | null
          title?: string | null
          tracking_id?: string | null
          url: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          position?: number
          position_change?: number | null
          previous_position?: number | null
          snippet?: string | null
          title?: string | null
          tracking_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "keyword_position_history_tracking_id_fkey"
            columns: ["tracking_id"]
            isOneToOne: false
            referencedRelation: "serp_tracking_history"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_topics: {
        Row: {
          cluster_id: string | null
          competition_level: string | null
          created_at: string | null
          id: string
          keyword: string
          relevance_score: number | null
          search_volume: number | null
          topic_id: string | null
          user_id: string
        }
        Insert: {
          cluster_id?: string | null
          competition_level?: string | null
          created_at?: string | null
          id?: string
          keyword: string
          relevance_score?: number | null
          search_volume?: number | null
          topic_id?: string | null
          user_id: string
        }
        Update: {
          cluster_id?: string | null
          competition_level?: string | null
          created_at?: string | null
          id?: string
          keyword?: string
          relevance_score?: number | null
          search_volume?: number | null
          topic_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "keyword_topics_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "topic_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "keyword_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "context_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_usage_log: {
        Row: {
          content_id: string | null
          content_type: string
          created_at: string
          id: string
          unified_keyword_id: string
          usage_type: string
        }
        Insert: {
          content_id?: string | null
          content_type: string
          created_at?: string
          id?: string
          unified_keyword_id: string
          usage_type: string
        }
        Update: {
          content_id?: string | null
          content_type?: string
          created_at?: string
          id?: string
          unified_keyword_id?: string
          usage_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "keyword_usage_log_unified_keyword_id_fkey"
            columns: ["unified_keyword_id"]
            isOneToOne: false
            referencedRelation: "unified_keywords"
            referencedColumns: ["id"]
          },
        ]
      }
      keywords: {
        Row: {
          created_at: string
          difficulty: number | null
          id: string
          keyword: string
          search_volume: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty?: number | null
          id?: string
          keyword: string
          search_volume?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          difficulty?: number | null
          id?: string
          keyword?: string
          search_volume?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "keywords_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learned_patterns: {
        Row: {
          confidence: number | null
          created_at: string | null
          id: string
          last_seen: string | null
          occurrences: number | null
          pattern_data: Json
          pattern_type: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          last_seen?: string | null
          occurrences?: number | null
          pattern_data: Json
          pattern_type: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          last_seen?: string | null
          occurrences?: number | null
          pattern_data?: Json
          pattern_type?: string
          user_id?: string
        }
        Relationships: []
      }
      llm_usage_logs: {
        Row: {
          completion_tokens: number | null
          cost_estimate: number | null
          created_at: string
          error_message: string | null
          id: string
          model: string
          prompt_tokens: number | null
          provider: string
          request_duration_ms: number | null
          success: boolean
          total_tokens: number | null
          user_id: string
        }
        Insert: {
          completion_tokens?: number | null
          cost_estimate?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          model: string
          prompt_tokens?: number | null
          provider: string
          request_duration_ms?: number | null
          success?: boolean
          total_tokens?: number | null
          user_id: string
        }
        Update: {
          completion_tokens?: number | null
          cost_estimate?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          model?: string
          prompt_tokens?: number | null
          provider?: string
          request_duration_ms?: number | null
          success?: boolean
          total_tokens?: number | null
          user_id?: string
        }
        Relationships: []
      }
      message_embeddings: {
        Row: {
          created_at: string | null
          embedding: string | null
          id: string
          message_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          embedding?: string | null
          id?: string
          message_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          embedding?: string | null
          id?: string
          message_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_embeddings_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "ai_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      ml_models: {
        Row: {
          accuracy_score: number | null
          created_at: string | null
          id: string
          last_trained_at: string | null
          model_config: Json
          model_name: string
          model_type: string
          model_version: string
          status: string
          training_data_source: string
          training_metrics: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accuracy_score?: number | null
          created_at?: string | null
          id?: string
          last_trained_at?: string | null
          model_config?: Json
          model_name: string
          model_type: string
          model_version?: string
          status?: string
          training_data_source: string
          training_metrics?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accuracy_score?: number | null
          created_at?: string | null
          id?: string
          last_trained_at?: string | null
          model_config?: Json
          model_name?: string
          model_type?: string
          model_version?: string
          status?: string
          training_data_source?: string
          training_metrics?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mobile_settings: {
        Row: {
          created_at: string
          id: string
          notification_settings: Json
          notifications_enabled: boolean
          offline_mode: boolean
          performance_settings: Json
          pwa_enabled: boolean
          ui_settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_settings?: Json
          notifications_enabled?: boolean
          offline_mode?: boolean
          performance_settings?: Json
          pwa_enabled?: boolean
          ui_settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_settings?: Json
          notifications_enabled?: boolean
          offline_mode?: boolean
          performance_settings?: Json
          pwa_enabled?: boolean
          ui_settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_categories: {
        Row: {
          created_at: string | null
          default_enabled: boolean | null
          default_frequency: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          default_enabled?: boolean | null
          default_frequency?: string | null
          description?: string | null
          icon?: string | null
          id: string
          name: string
        }
        Update: {
          created_at?: string | null
          default_enabled?: boolean | null
          default_frequency?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          auto_dismiss_after_days: number | null
          category: string
          channels: Json | null
          created_at: string | null
          enabled: boolean | null
          frequency: string | null
          id: string
          priority_threshold: string | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_dismiss_after_days?: number | null
          category: string
          channels?: Json | null
          created_at?: string | null
          enabled?: boolean | null
          frequency?: string | null
          id?: string
          priority_threshold?: string | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_dismiss_after_days?: number | null
          category?: string
          channels?: Json | null
          created_at?: string | null
          enabled?: boolean | null
          frequency?: string | null
          id?: string
          priority_threshold?: string | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      opportunity_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string
          assigned_to: string
          due_date: string | null
          id: string
          notes: string | null
          opportunity_id: string
          priority: string | null
          status: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          assigned_to: string
          due_date?: string | null
          id?: string
          notes?: string | null
          opportunity_id: string
          priority?: string | null
          status?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          assigned_to?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          opportunity_id?: string
          priority?: string | null
          status?: string
        }
        Relationships: []
      }
      opportunity_briefs: {
        Row: {
          ai_model_used: string | null
          content_brief: string | null
          content_type: string | null
          created_at: string
          faq_section: Json | null
          format: string
          generation_prompt: string | null
          id: string
          internal_links: Json | null
          introduction: string | null
          meta_description: string | null
          meta_title: string | null
          opportunity_id: string
          outline: Json | null
          status: string
          target_word_count: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_model_used?: string | null
          content_brief?: string | null
          content_type?: string | null
          created_at?: string
          faq_section?: Json | null
          format?: string
          generation_prompt?: string | null
          id?: string
          internal_links?: Json | null
          introduction?: string | null
          meta_description?: string | null
          meta_title?: string | null
          opportunity_id: string
          outline?: Json | null
          status?: string
          target_word_count?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_model_used?: string | null
          content_brief?: string | null
          content_type?: string | null
          created_at?: string
          faq_section?: Json | null
          format?: string
          generation_prompt?: string | null
          id?: string
          internal_links?: Json | null
          introduction?: string | null
          meta_description?: string | null
          meta_title?: string | null
          opportunity_id?: string
          outline?: Json | null
          status?: string
          target_word_count?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      opportunity_metrics: {
        Row: {
          click_through_rate: number | null
          clicks: number | null
          content_id: string | null
          conversions: number | null
          created_at: string
          current_rank: number | null
          id: string
          impressions: number | null
          initial_rank: number | null
          last_updated: string | null
          opportunity_id: string
          published_url: string | null
        }
        Insert: {
          click_through_rate?: number | null
          clicks?: number | null
          content_id?: string | null
          conversions?: number | null
          created_at?: string
          current_rank?: number | null
          id?: string
          impressions?: number | null
          initial_rank?: number | null
          last_updated?: string | null
          opportunity_id: string
          published_url?: string | null
        }
        Update: {
          click_through_rate?: number | null
          clicks?: number | null
          content_id?: string | null
          conversions?: number | null
          created_at?: string
          current_rank?: number | null
          id?: string
          impressions?: number | null
          initial_rank?: number | null
          last_updated?: string | null
          opportunity_id?: string
          published_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_metrics_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_notifications: {
        Row: {
          created_at: string
          dismissed_at: string | null
          id: string
          metadata: Json | null
          notification_type: string
          opportunity_id: string
          read_at: string | null
          sent_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dismissed_at?: string | null
          id?: string
          metadata?: Json | null
          notification_type?: string
          opportunity_id: string
          read_at?: string | null
          sent_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dismissed_at?: string | null
          id?: string
          metadata?: Json | null
          notification_type?: string
          opportunity_id?: string
          read_at?: string | null
          sent_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      opportunity_seeds: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          keyword: string
          last_scanned: string | null
          scan_frequency: string | null
          search_volume: number | null
          strategy_id: string | null
          topic_cluster: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          keyword: string
          last_scanned?: string | null
          scan_frequency?: string | null
          search_volume?: number | null
          strategy_id?: string | null
          topic_cluster?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          keyword?: string
          last_scanned?: string | null
          scan_frequency?: string | null
          search_volume?: number | null
          strategy_id?: string | null
          topic_cluster?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_seeds_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "content_strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          avg_time_on_page: number | null
          bounce_rate: number | null
          cluster_id: string | null
          content_id: string
          content_type: string
          conversions: number | null
          created_at: string
          id: string
          traffic_last_30d: number | null
          traffic_last_7d: number | null
          updated_at: string
        }
        Insert: {
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          cluster_id?: string | null
          content_id: string
          content_type: string
          conversions?: number | null
          created_at?: string
          id?: string
          traffic_last_30d?: number | null
          traffic_last_7d?: number | null
          updated_at?: string
        }
        Update: {
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          cluster_id?: string | null
          content_id?: string
          content_type?: string
          conversions?: number | null
          created_at?: string
          id?: string
          traffic_last_30d?: number | null
          traffic_last_7d?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      personalization_profiles: {
        Row: {
          ai_personality_preference: string | null
          automation_preference: string | null
          created_at: string | null
          custom_ai_instructions: string | null
          expertise_level: string | null
          id: string
          learning_style: string | null
          notification_preferences: Json | null
          preferred_content_types: Json | null
          preferred_workflows: Json | null
          success_metrics: Json | null
          ui_preferences: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_personality_preference?: string | null
          automation_preference?: string | null
          created_at?: string | null
          custom_ai_instructions?: string | null
          expertise_level?: string | null
          id?: string
          learning_style?: string | null
          notification_preferences?: Json | null
          preferred_content_types?: Json | null
          preferred_workflows?: Json | null
          success_metrics?: Json | null
          ui_preferences?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_personality_preference?: string | null
          automation_preference?: string | null
          created_at?: string | null
          custom_ai_instructions?: string | null
          expertise_level?: string | null
          id?: string
          learning_style?: string | null
          notification_preferences?: Json | null
          preferred_content_types?: Json | null
          preferred_workflows?: Json | null
          success_metrics?: Json | null
          ui_preferences?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      prediction_results: {
        Row: {
          actual_values: Json | null
          confidence_score: number | null
          created_at: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          model_id: string | null
          predicted_values: Json
          prediction_accuracy: number | null
          prediction_type: string
          target_entity_id: string | null
          target_entity_type: string | null
          user_id: string
        }
        Insert: {
          actual_values?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          model_id?: string | null
          predicted_values?: Json
          prediction_accuracy?: number | null
          prediction_type: string
          target_entity_id?: string | null
          target_entity_type?: string | null
          user_id: string
        }
        Update: {
          actual_values?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          model_id?: string | null
          predicted_values?: Json
          prediction_accuracy?: number | null
          prediction_type?: string
          target_entity_id?: string | null
          target_entity_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_results_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ml_models"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string
          department: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          department?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          department?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      proposal_lifecycle_logs: {
        Row: {
          calendar_status: string | null
          created_at: string
          id: string
          notes: string | null
          pipeline_stage: string | null
          progress: number | null
          proposal_id: string
          status: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          calendar_status?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          pipeline_stage?: string | null
          progress?: number | null
          proposal_id: string
          status: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          calendar_status?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          pipeline_stage?: string | null
          progress?: number | null
          proposal_id?: string
          status?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: []
      }
      raw_serp_data: {
        Row: {
          cached_at: string
          expires_at: string | null
          featured_snippet: Json | null
          id: string
          keyword: string
          language: string | null
          location: string | null
          organic_results: Json | null
          people_also_ask: Json | null
          related_searches: Json | null
          search_engine: string | null
          serp_response: Json
          total_results: number | null
        }
        Insert: {
          cached_at?: string
          expires_at?: string | null
          featured_snippet?: Json | null
          id?: string
          keyword: string
          language?: string | null
          location?: string | null
          organic_results?: Json | null
          people_also_ask?: Json | null
          related_searches?: Json | null
          search_engine?: string | null
          serp_response: Json
          total_results?: number | null
        }
        Update: {
          cached_at?: string
          expires_at?: string | null
          featured_snippet?: Json | null
          id?: string
          keyword?: string
          language?: string | null
          location?: string | null
          organic_results?: Json | null
          people_also_ask?: Json | null
          related_searches?: Json | null
          search_engine?: string | null
          serp_response?: Json
          total_results?: number | null
        }
        Relationships: []
      }
      realtime_notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          category: string
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
          timestamp: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          category: string
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          timestamp?: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          category?: string
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          timestamp?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recommendation_cache: {
        Row: {
          cache_expires_at: string
          created_at: string | null
          generation_method: string
          id: string
          interaction_tracking: Json | null
          personalization_factors: Json | null
          recommendation_type: string
          recommendations: Json
          relevance_scores: Json | null
          user_id: string
        }
        Insert: {
          cache_expires_at: string
          created_at?: string | null
          generation_method: string
          id?: string
          interaction_tracking?: Json | null
          personalization_factors?: Json | null
          recommendation_type: string
          recommendations?: Json
          relevance_scores?: Json | null
          user_id: string
        }
        Update: {
          cache_expires_at?: string
          created_at?: string | null
          generation_method?: string
          id?: string
          interaction_tracking?: Json | null
          personalization_factors?: Json | null
          recommendation_type?: string
          recommendations?: Json
          relevance_scores?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      repurposed_contents: {
        Row: {
          content: string
          content_id: string
          created_at: string
          format_code: string
          id: string
          metadata: Json | null
          status: string
          title: string | null
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          content: string
          content_id: string
          created_at?: string
          format_code: string
          id?: string
          metadata?: Json | null
          status?: string
          title?: string | null
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          content?: string
          content_id?: string
          created_at?: string
          format_code?: string
          id?: string
          metadata?: Json | null
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "repurposed_contents_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repurposed_contents_format_code_fkey"
            columns: ["format_code"]
            isOneToOne: false
            referencedRelation: "content_formats"
            referencedColumns: ["format_code"]
          },
        ]
      }
      saved_chart_analyses: {
        Row: {
          actionable_items: Json | null
          charts_data: Json
          context: Json | null
          created_at: string
          deep_dive_prompts: Json | null
          description: string | null
          id: string
          insights: Json | null
          is_public: boolean | null
          title: string
          updated_at: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          actionable_items?: Json | null
          charts_data?: Json
          context?: Json | null
          created_at?: string
          deep_dive_prompts?: Json | null
          description?: string | null
          id?: string
          insights?: Json | null
          is_public?: boolean | null
          title: string
          updated_at?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          actionable_items?: Json | null
          charts_data?: Json
          context?: Json | null
          created_at?: string
          deep_dive_prompts?: Json | null
          description?: string | null
          id?: string
          insights?: Json | null
          is_public?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      saved_chart_analyses_versions: {
        Row: {
          actionable_items: Json
          analysis_id: string
          change_summary: string | null
          charts_data: Json
          context: Json
          created_at: string
          created_by: string
          deep_dive_prompts: Json
          description: string | null
          id: string
          insights: Json
          title: string
          version_number: number
        }
        Insert: {
          actionable_items?: Json
          analysis_id: string
          change_summary?: string | null
          charts_data?: Json
          context?: Json
          created_at?: string
          created_by: string
          deep_dive_prompts?: Json
          description?: string | null
          id?: string
          insights?: Json
          title: string
          version_number?: number
        }
        Update: {
          actionable_items?: Json
          analysis_id?: string
          change_summary?: string | null
          charts_data?: Json
          context?: Json
          created_at?: string
          created_by?: string
          deep_dive_prompts?: Json
          description?: string | null
          id?: string
          insights?: Json
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "saved_chart_analyses_versions_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "saved_chart_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      serp_alerts: {
        Row: {
          alert_data: Json | null
          alert_type: string
          config_id: string
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean
          message: string
          severity: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_data?: Json | null
          alert_type: string
          config_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          severity?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_data?: Json | null
          alert_type?: string
          config_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          severity?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "serp_alerts_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "serp_monitoring_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      serp_analysis_history: {
        Row: {
          analysis_data: Json
          created_at: string
          expires_at: string | null
          id: string
          keyword: string
          location: string | null
          user_id: string
          workflow_id: string | null
        }
        Insert: {
          analysis_data?: Json
          created_at?: string
          expires_at?: string | null
          id?: string
          keyword: string
          location?: string | null
          user_id: string
          workflow_id?: string | null
        }
        Update: {
          analysis_data?: Json
          created_at?: string
          expires_at?: string | null
          id?: string
          keyword?: string
          location?: string | null
          user_id?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "serp_analysis_history_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      serp_cache: {
        Row: {
          created_at: string | null
          expires_at: string
          geo: string | null
          id: string
          keyword: string
          payload: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string
          geo?: string | null
          id?: string
          keyword: string
          payload: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          geo?: string | null
          id?: string
          keyword?: string
          payload?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      serp_conversation_context: {
        Row: {
          context_data: Json
          context_type: string
          conversation_id: string | null
          created_at: string
          id: string
          keywords: string[] | null
          last_serp_analysis: Json | null
          updated_at: string
          user_id: string
          workflow_state: Json | null
        }
        Insert: {
          context_data?: Json
          context_type: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          keywords?: string[] | null
          last_serp_analysis?: Json | null
          updated_at?: string
          user_id: string
          workflow_state?: Json | null
        }
        Update: {
          context_data?: Json
          context_type?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          keywords?: string[] | null
          last_serp_analysis?: Json | null
          updated_at?: string
          user_id?: string
          workflow_state?: Json | null
        }
        Relationships: []
      }
      serp_monitoring_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_active: boolean | null
          keyword: string
          last_triggered: string | null
          threshold_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          keyword: string
          last_triggered?: string | null
          threshold_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          keyword?: string
          last_triggered?: string | null
          threshold_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      serp_monitoring_configs: {
        Row: {
          alert_thresholds: Json | null
          check_frequency: number
          created_at: string
          id: string
          is_active: boolean
          keyword: string
          language: string | null
          location: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_thresholds?: Json | null
          check_frequency?: number
          created_at?: string
          id?: string
          is_active?: boolean
          keyword: string
          language?: string | null
          location?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_thresholds?: Json | null
          check_frequency?: number
          created_at?: string
          id?: string
          is_active?: boolean
          keyword?: string
          language?: string | null
          location?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      serp_monitoring_history: {
        Row: {
          check_timestamp: string
          config_id: string
          created_at: string
          featured_snippet_changes: Json | null
          id: string
          keyword: string
          lost_competitors: Json | null
          new_competitors: Json | null
          position_changes: Json | null
          serp_data: Json
          user_id: string
        }
        Insert: {
          check_timestamp?: string
          config_id: string
          created_at?: string
          featured_snippet_changes?: Json | null
          id?: string
          keyword: string
          lost_competitors?: Json | null
          new_competitors?: Json | null
          position_changes?: Json | null
          serp_data?: Json
          user_id: string
        }
        Update: {
          check_timestamp?: string
          config_id?: string
          created_at?: string
          featured_snippet_changes?: Json | null
          id?: string
          keyword?: string
          lost_competitors?: Json | null
          new_competitors?: Json | null
          position_changes?: Json | null
          serp_data?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "serp_monitoring_history_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "serp_monitoring_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      serp_tracking_history: {
        Row: {
          competition_score: number | null
          cpc: number | null
          created_at: string
          id: string
          keyword: string
          keyword_difficulty: number | null
          keyword_id: string | null
          location: string | null
          search_date: string
          search_volume: number | null
          serp_features: Json | null
          top_10_results: Json | null
          total_results: number | null
          updated_at: string
        }
        Insert: {
          competition_score?: number | null
          cpc?: number | null
          created_at?: string
          id?: string
          keyword: string
          keyword_difficulty?: number | null
          keyword_id?: string | null
          location?: string | null
          search_date?: string
          search_volume?: number | null
          serp_features?: Json | null
          top_10_results?: Json | null
          total_results?: number | null
          updated_at?: string
        }
        Update: {
          competition_score?: number | null
          cpc?: number | null
          created_at?: string
          id?: string
          keyword?: string
          keyword_difficulty?: number | null
          keyword_id?: string | null
          location?: string | null
          search_date?: string
          search_volume?: number | null
          serp_features?: Json | null
          top_10_results?: Json | null
          total_results?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      serp_usage_logs: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          operation: string
          provider: string
          success: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          operation: string
          provider: string
          success?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          operation?: string
          provider?: string
          success?: boolean
          user_id?: string
        }
        Relationships: []
      }
      serp_workflow_states: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          metadata: Json
          progress: Json
          results: Json | null
          started_at: string
          status: string
          updated_at: string
          user_id: string
          workflow_id: string
          workflow_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          progress?: Json
          results?: Json | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
          workflow_id: string
          workflow_type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          progress?: Json
          results?: Json | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
          workflow_id?: string
          workflow_type?: string
        }
        Relationships: []
      }
      solution_personas: {
        Row: {
          created_at: string
          id: string
          key_topics: Json
          pain_points: Json
          persona_name: string
          persona_type: Database["public"]["Enums"]["persona_type"]
          preferred_tone: string
          role_title: string
          solution_id: string
          typical_goals: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_topics?: Json
          pain_points?: Json
          persona_name: string
          persona_type: Database["public"]["Enums"]["persona_type"]
          preferred_tone: string
          role_title: string
          solution_id: string
          typical_goals?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key_topics?: Json
          pain_points?: Json
          persona_name?: string
          persona_type?: Database["public"]["Enums"]["persona_type"]
          preferred_tone?: string
          role_title?: string
          solution_id?: string
          typical_goals?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      solutions: {
        Row: {
          benefits: Json | null
          case_studies: Json | null
          category: string | null
          competitors: Json | null
          created_at: string
          description: string | null
          external_url: string | null
          features: Json | null
          id: string
          integrations: Json | null
          key_differentiators: Json | null
          logo_url: string | null
          market_data: Json | null
          metadata: Json | null
          metrics: Json | null
          name: string
          pain_points: Json | null
          positioning_statement: string | null
          pricing_model: Json | null
          resources: Json | null
          short_description: string | null
          tags: Json | null
          target_audience: Json | null
          technical_specs: Json | null
          unique_value_propositions: Json | null
          updated_at: string
          use_cases: Json | null
          user_id: string
        }
        Insert: {
          benefits?: Json | null
          case_studies?: Json | null
          category?: string | null
          competitors?: Json | null
          created_at?: string
          description?: string | null
          external_url?: string | null
          features?: Json | null
          id?: string
          integrations?: Json | null
          key_differentiators?: Json | null
          logo_url?: string | null
          market_data?: Json | null
          metadata?: Json | null
          metrics?: Json | null
          name: string
          pain_points?: Json | null
          positioning_statement?: string | null
          pricing_model?: Json | null
          resources?: Json | null
          short_description?: string | null
          tags?: Json | null
          target_audience?: Json | null
          technical_specs?: Json | null
          unique_value_propositions?: Json | null
          updated_at?: string
          use_cases?: Json | null
          user_id: string
        }
        Update: {
          benefits?: Json | null
          case_studies?: Json | null
          category?: string | null
          competitors?: Json | null
          created_at?: string
          description?: string | null
          external_url?: string | null
          features?: Json | null
          id?: string
          integrations?: Json | null
          key_differentiators?: Json | null
          logo_url?: string | null
          market_data?: Json | null
          metadata?: Json | null
          metrics?: Json | null
          name?: string
          pain_points?: Json | null
          positioning_statement?: string | null
          pricing_model?: Json | null
          resources?: Json | null
          short_description?: string | null
          tags?: Json | null
          target_audience?: Json | null
          technical_specs?: Json | null
          unique_value_propositions?: Json | null
          updated_at?: string
          use_cases?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "solutions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_briefs: {
        Row: {
          brief_stub_json: Json | null
          cluster_id: string
          id: string
        }
        Insert: {
          brief_stub_json?: Json | null
          cluster_id: string
          id?: string
        }
        Update: {
          brief_stub_json?: Json | null
          cluster_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_briefs_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "strategy_clusters"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_calendar: {
        Row: {
          cluster_id: string
          id: string
          title: string | null
          type: string | null
          week: number | null
        }
        Insert: {
          cluster_id: string
          id?: string
          title?: string | null
          type?: string | null
          week?: number | null
        }
        Update: {
          cluster_id?: string
          id?: string
          title?: string | null
          type?: string | null
          week?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "strategy_calendar_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "strategy_clusters"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_clusters: {
        Row: {
          asset_mix_json: Json | null
          edge_note: string | null
          forecast_best: number | null
          forecast_cons: number | null
          id: string
          name: string
          priority_score: number | null
          run_id: string
        }
        Insert: {
          asset_mix_json?: Json | null
          edge_note?: string | null
          forecast_best?: number | null
          forecast_cons?: number | null
          id?: string
          name: string
          priority_score?: number | null
          run_id: string
        }
        Update: {
          asset_mix_json?: Json | null
          edge_note?: string | null
          forecast_best?: number | null
          forecast_cons?: number | null
          id?: string
          name?: string
          priority_score?: number | null
          run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_clusters_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "strategy_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_generation_progress: {
        Row: {
          created_at: string
          id: string
          progress_percentage: number
          session_id: string
          status: string
          step: number
          step_data: Json | null
          step_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          progress_percentage?: number
          session_id: string
          status?: string
          step?: number
          step_data?: Json | null
          step_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          progress_percentage?: number
          session_id?: string
          status?: string
          step?: number
          step_data?: Json | null
          step_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      strategy_insights: {
        Row: {
          competition_score: number | null
          content_gaps: Json | null
          created_at: string
          id: string
          keyword: string
          keyword_difficulty: number | null
          last_analyzed: string
          opportunity_score: number | null
          search_volume: number | null
          serp_data: Json | null
          strategy_id: string | null
          suggested_content: Json | null
          top_competitors: Json | null
          user_id: string
        }
        Insert: {
          competition_score?: number | null
          content_gaps?: Json | null
          created_at?: string
          id?: string
          keyword: string
          keyword_difficulty?: number | null
          last_analyzed?: string
          opportunity_score?: number | null
          search_volume?: number | null
          serp_data?: Json | null
          strategy_id?: string | null
          suggested_content?: Json | null
          top_competitors?: Json | null
          user_id: string
        }
        Update: {
          competition_score?: number | null
          content_gaps?: Json | null
          created_at?: string
          id?: string
          keyword?: string
          keyword_difficulty?: number | null
          last_analyzed?: string
          opportunity_score?: number | null
          search_volume?: number | null
          serp_data?: Json | null
          strategy_id?: string | null
          suggested_content?: Json | null
          top_competitors?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_insights_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "content_strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_keyword_integrations: {
        Row: {
          content_gap_score: number | null
          created_at: string
          id: string
          keyword_id: string
          priority: string
          strategy_id: string
          target_position: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content_gap_score?: number | null
          created_at?: string
          id?: string
          keyword_id: string
          priority?: string
          strategy_id: string
          target_position?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content_gap_score?: number | null
          created_at?: string
          id?: string
          keyword_id?: string
          priority?: string
          strategy_id?: string
          target_position?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_keyword_integrations_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "unified_keywords"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_keywords: {
        Row: {
          cluster_id: string
          difficulty: number | null
          forecast_best: number | null
          forecast_cons: number | null
          has_ai_overview: boolean | null
          has_snippet: boolean | null
          id: string
          intent: string | null
          kw: string
          paa_questions: Json | null
          priority_score: number | null
          related_searches: Json | null
          top_titles: Json | null
          volume: number | null
        }
        Insert: {
          cluster_id: string
          difficulty?: number | null
          forecast_best?: number | null
          forecast_cons?: number | null
          has_ai_overview?: boolean | null
          has_snippet?: boolean | null
          id?: string
          intent?: string | null
          kw: string
          paa_questions?: Json | null
          priority_score?: number | null
          related_searches?: Json | null
          top_titles?: Json | null
          volume?: number | null
        }
        Update: {
          cluster_id?: string
          difficulty?: number | null
          forecast_best?: number | null
          forecast_cons?: number | null
          has_ai_overview?: boolean | null
          has_snippet?: boolean | null
          id?: string
          intent?: string | null
          kw?: string
          paa_questions?: Json | null
          priority_score?: number | null
          related_searches?: Json | null
          top_titles?: Json | null
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "strategy_keywords_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "strategy_clusters"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_logs: {
        Row: {
          action: string
          cluster_id: string | null
          id: string
          metadata: Json | null
          timestamp: string
          user_id: string
        }
        Insert: {
          action: string
          cluster_id?: string | null
          id?: string
          metadata?: Json | null
          timestamp?: string
          user_id: string
        }
        Update: {
          action?: string
          cluster_id?: string | null
          id?: string
          metadata?: Json | null
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      strategy_recommendations: {
        Row: {
          accepted_at: string | null
          action_items: Json | null
          completed_at: string | null
          confidence_score: number | null
          created_at: string | null
          data_sources: Json | null
          description: string
          effort_estimate: string | null
          expected_impact: string | null
          id: string
          priority: string | null
          reasoning: string | null
          recommendation_type: string
          related_cluster_id: string | null
          related_gap_id: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          action_items?: Json | null
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string | null
          data_sources?: Json | null
          description: string
          effort_estimate?: string | null
          expected_impact?: string | null
          id?: string
          priority?: string | null
          reasoning?: string | null
          recommendation_type: string
          related_cluster_id?: string | null
          related_gap_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          action_items?: Json | null
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string | null
          data_sources?: Json | null
          description?: string
          effort_estimate?: string | null
          expected_impact?: string | null
          id?: string
          priority?: string | null
          reasoning?: string | null
          recommendation_type?: string
          related_cluster_id?: string | null
          related_gap_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_recommendations_related_cluster_id_fkey"
            columns: ["related_cluster_id"]
            isOneToOne: false
            referencedRelation: "topic_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategy_recommendations_related_gap_id_fkey"
            columns: ["related_gap_id"]
            isOneToOne: false
            referencedRelation: "content_gaps"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_runs: {
        Row: {
          created_at: string
          id: string
          language: string | null
          region: string | null
          status: string
          summary_json: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string | null
          region?: string | null
          status?: string
          summary_json?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string | null
          region?: string | null
          status?: string
          summary_json?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          invited_by: string | null
          joined_at: string
          last_active: string | null
          permissions: Json
          role: string
          status: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string
          last_active?: string | null
          permissions?: Json
          role?: string
          status?: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string
          last_active?: string | null
          permissions?: Json
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "team_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      team_workspaces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          settings: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          settings?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      topic_clusters: {
        Row: {
          cluster_name: string
          created_at: string | null
          description: string | null
          embedding: string | null
          id: string
          importance_score: number | null
          parent_cluster_id: string | null
          topic_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cluster_name: string
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          id?: string
          importance_score?: number | null
          parent_cluster_id?: string | null
          topic_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cluster_name?: string
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          id?: string
          importance_score?: number | null
          parent_cluster_id?: string | null
          topic_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_clusters_parent_cluster_id_fkey"
            columns: ["parent_cluster_id"]
            isOneToOne: false
            referencedRelation: "topic_clusters"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_performance: {
        Row: {
          average_position: number | null
          clicks: number | null
          cluster_id: string | null
          content_count: number | null
          conversion_score: number | null
          created_at: string | null
          ctr: number | null
          engagement_score: number | null
          id: string
          impressions: number | null
          metadata: Json | null
          metric_date: string
          topic_id: string | null
          user_id: string
        }
        Insert: {
          average_position?: number | null
          clicks?: number | null
          cluster_id?: string | null
          content_count?: number | null
          conversion_score?: number | null
          created_at?: string | null
          ctr?: number | null
          engagement_score?: number | null
          id?: string
          impressions?: number | null
          metadata?: Json | null
          metric_date: string
          topic_id?: string | null
          user_id: string
        }
        Update: {
          average_position?: number | null
          clicks?: number | null
          cluster_id?: string | null
          content_count?: number | null
          conversion_score?: number | null
          created_at?: string | null
          ctr?: number | null
          engagement_score?: number | null
          id?: string
          impressions?: number | null
          metadata?: Json | null
          metric_date?: string
          topic_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_performance_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "topic_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_performance_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "context_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_relationships: {
        Row: {
          created_at: string | null
          id: string
          relationship_type: string
          strength: number | null
          topic_a_id: string | null
          topic_b_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          relationship_type: string
          strength?: number | null
          topic_a_id?: string | null
          topic_b_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          relationship_type?: string
          strength?: number | null
          topic_a_id?: string | null
          topic_b_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_relationships_topic_a_id_fkey"
            columns: ["topic_a_id"]
            isOneToOne: false
            referencedRelation: "context_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_relationships_topic_b_id_fkey"
            columns: ["topic_b_id"]
            isOneToOne: false
            referencedRelation: "context_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      training_datasets: {
        Row: {
          accuracy: number | null
          created_at: string
          file_path: string | null
          id: string
          metadata: Json
          name: string
          size: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          file_path?: string | null
          id?: string
          metadata?: Json
          name: string
          size?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          file_path?: string | null
          id?: string
          metadata?: Json
          name?: string
          size?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      unified_keywords: {
        Row: {
          competition_score: number | null
          content_usage: Json
          cpc: number | null
          difficulty: number | null
          first_discovered_at: string
          id: string
          intent: string | null
          is_active: boolean
          keyword: string
          last_updated_at: string
          notes: string | null
          search_volume: number | null
          seasonality: boolean | null
          serp_data_quality: string | null
          serp_last_updated: string | null
          source_id: string | null
          source_type: string
          trend_direction: string | null
          usage_count: number
          user_id: string
        }
        Insert: {
          competition_score?: number | null
          content_usage?: Json
          cpc?: number | null
          difficulty?: number | null
          first_discovered_at?: string
          id?: string
          intent?: string | null
          is_active?: boolean
          keyword: string
          last_updated_at?: string
          notes?: string | null
          search_volume?: number | null
          seasonality?: boolean | null
          serp_data_quality?: string | null
          serp_last_updated?: string | null
          source_id?: string | null
          source_type: string
          trend_direction?: string | null
          usage_count?: number
          user_id: string
        }
        Update: {
          competition_score?: number | null
          content_usage?: Json
          cpc?: number | null
          difficulty?: number | null
          first_discovered_at?: string
          id?: string
          intent?: string | null
          is_active?: boolean
          keyword?: string
          last_updated_at?: string
          notes?: string | null
          search_volume?: number | null
          seasonality?: boolean | null
          serp_data_quality?: string | null
          serp_last_updated?: string | null
          source_id?: string | null
          source_type?: string
          trend_direction?: string | null
          usage_count?: number
          user_id?: string
        }
        Relationships: []
      }
      user_behavior_patterns: {
        Row: {
          created_at: string | null
          day_of_week_pattern: Json | null
          features_used: Json | null
          frequency_score: number | null
          id: string
          importance_score: number | null
          pattern_data: Json
          pattern_type: string
          recency_score: number | null
          session_duration_avg: number | null
          time_of_day_pattern: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week_pattern?: Json | null
          features_used?: Json | null
          frequency_score?: number | null
          id?: string
          importance_score?: number | null
          pattern_data?: Json
          pattern_type: string
          recency_score?: number | null
          session_duration_avg?: number | null
          time_of_day_pattern?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week_pattern?: Json | null
          features_used?: Json | null
          frequency_score?: number | null
          id?: string
          importance_score?: number | null
          pattern_data?: Json
          pattern_type?: string
          recency_score?: number | null
          session_duration_avg?: number | null
          time_of_day_pattern?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_content_instructions: {
        Row: {
          applied_count: number
          content_id: string | null
          created_at: string
          effectiveness_score: number | null
          format_type: string | null
          id: string
          instruction_text: string
          session_id: string | null
          updated_at: string
          use_case: string
          user_id: string
        }
        Insert: {
          applied_count?: number
          content_id?: string | null
          created_at?: string
          effectiveness_score?: number | null
          format_type?: string | null
          id?: string
          instruction_text: string
          session_id?: string | null
          updated_at?: string
          use_case?: string
          user_id: string
        }
        Update: {
          applied_count?: number
          content_id?: string | null
          created_at?: string
          effectiveness_score?: number | null
          format_type?: string | null
          id?: string
          instruction_text?: string
          session_id?: string | null
          updated_at?: string
          use_case?: string
          user_id?: string
        }
        Relationships: []
      }
      user_llm_keys: {
        Row: {
          api_key: string
          created_at: string
          default_model: string | null
          id: string
          is_active: boolean
          model: string | null
          preferences: Json | null
          provider: string
          updated_at: string
          usage_stats: Json | null
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          default_model?: string | null
          id?: string
          is_active?: boolean
          model?: string | null
          preferences?: Json | null
          provider: string
          updated_at?: string
          usage_stats?: Json | null
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          default_model?: string | null
          id?: string
          is_active?: boolean
          model?: string | null
          preferences?: Json | null
          provider?: string
          updated_at?: string
          usage_stats?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_opportunity_settings: {
        Row: {
          aio_friendly_only: boolean | null
          auto_generate_briefs: boolean | null
          created_at: string
          excluded_keywords: Json | null
          id: string
          is_active: boolean | null
          max_keyword_difficulty: number | null
          min_search_volume: number | null
          notification_channels: Json | null
          preferred_content_formats: Json | null
          relevance_threshold: number | null
          scan_frequency: string
          trend_threshold: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aio_friendly_only?: boolean | null
          auto_generate_briefs?: boolean | null
          created_at?: string
          excluded_keywords?: Json | null
          id?: string
          is_active?: boolean | null
          max_keyword_difficulty?: number | null
          min_search_volume?: number | null
          notification_channels?: Json | null
          preferred_content_formats?: Json | null
          relevance_threshold?: number | null
          scan_frequency?: string
          trend_threshold?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aio_friendly_only?: boolean | null
          auto_generate_briefs?: boolean | null
          created_at?: string
          excluded_keywords?: Json | null
          id?: string
          is_active?: boolean | null
          max_keyword_difficulty?: number | null
          min_search_volume?: number | null
          notification_channels?: Json | null
          preferred_content_formats?: Json | null
          relevance_threshold?: number | null
          scan_frequency?: string
          trend_threshold?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          id: string
          preference_type: string
          preference_value: Json
          source_conversation_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          preference_type: string
          preference_value: Json
          source_conversation_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          preference_type?: string
          preference_value?: Json
          source_conversation_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_source_conversation_id_fkey"
            columns: ["source_conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_typing_indicators: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          is_typing: boolean | null
          last_activity: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          is_typing?: boolean | null
          last_activity?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_typing?: boolean | null
          last_activity?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_typing_indicators_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string
          events: Json
          failure_count: number
          id: string
          last_triggered: string | null
          name: string
          secret: string
          status: string
          success_count: number
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          events?: Json
          failure_count?: number
          id?: string
          last_triggered?: string | null
          name: string
          secret: string
          status?: string
          success_count?: number
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          events?: Json
          failure_count?: number
          id?: string
          last_triggered?: string | null
          name?: string
          secret?: string
          status?: string
          success_count?: number
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      website_connections: {
        Row: {
          access_token: string | null
          app_password: string | null
          connection_status: string | null
          created_at: string
          default_settings: Json | null
          id: string
          is_active: boolean
          last_tested_at: string | null
          provider: string
          refresh_token: string | null
          scopes: string[] | null
          site_email: string | null
          site_id: string | null
          site_name: string | null
          site_url: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          access_token?: string | null
          app_password?: string | null
          connection_status?: string | null
          created_at?: string
          default_settings?: Json | null
          id?: string
          is_active?: boolean
          last_tested_at?: string | null
          provider: string
          refresh_token?: string | null
          scopes?: string[] | null
          site_email?: string | null
          site_id?: string | null
          site_name?: string | null
          site_url?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          access_token?: string | null
          app_password?: string | null
          connection_status?: string | null
          created_at?: string
          default_settings?: Json | null
          id?: string
          is_active?: boolean
          last_tested_at?: string | null
          provider?: string
          refresh_token?: string | null
          scopes?: string[] | null
          site_email?: string | null
          site_id?: string | null
          site_name?: string | null
          site_url?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      workflow_automations: {
        Row: {
          actions: Json | null
          automation_name: string
          created_at: string
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          success_count: number | null
          trigger_conditions: Json | null
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actions?: Json | null
          automation_name: string
          created_at?: string
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          success_count?: number | null
          trigger_conditions?: Json | null
          trigger_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json | null
          automation_name?: string
          created_at?: string
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          success_count?: number | null
          trigger_conditions?: Json | null
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workflow_executions: {
        Row: {
          ai_model: string | null
          ai_provider: string | null
          completed_at: string | null
          created_at: string
          error_details: Json | null
          execution_name: string | null
          id: string
          input_context: Json | null
          output_results: Json | null
          performance_metrics: Json | null
          progress: Json
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
          workflow_id: string
        }
        Insert: {
          ai_model?: string | null
          ai_provider?: string | null
          completed_at?: string | null
          created_at?: string
          error_details?: Json | null
          execution_name?: string | null
          id?: string
          input_context?: Json | null
          output_results?: Json | null
          performance_metrics?: Json | null
          progress?: Json
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
          workflow_id: string
        }
        Update: {
          ai_model?: string | null
          ai_provider?: string | null
          completed_at?: string | null
          created_at?: string
          error_details?: Json | null
          execution_name?: string | null
          id?: string
          input_context?: Json | null
          output_results?: Json | null
          performance_metrics?: Json | null
          progress?: Json
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "intelligent_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_predictions: {
        Row: {
          created_at: string | null
          id: string
          optimization_suggestions: Json | null
          predicted_bottlenecks: Json | null
          predicted_completion_date: string | null
          predicted_duration: number | null
          predicted_resource_needs: Json | null
          predicted_success_probability: number | null
          risk_factors: Json | null
          user_id: string
          workflow_id: string | null
          workflow_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          optimization_suggestions?: Json | null
          predicted_bottlenecks?: Json | null
          predicted_completion_date?: string | null
          predicted_duration?: number | null
          predicted_resource_needs?: Json | null
          predicted_success_probability?: number | null
          risk_factors?: Json | null
          user_id: string
          workflow_id?: string | null
          workflow_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          optimization_suggestions?: Json | null
          predicted_bottlenecks?: Json | null
          predicted_completion_date?: string | null
          predicted_duration?: number | null
          predicted_resource_needs?: Json | null
          predicted_success_probability?: number | null
          risk_factors?: Json | null
          user_id?: string
          workflow_id?: string | null
          workflow_type?: string
        }
        Relationships: []
      }
      workflow_schedules: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          last_run: string | null
          metadata: Json | null
          next_run: string
          schedule_expression: string
          timezone: string
          updated_at: string
          user_id: string
          workflow_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_run?: string | null
          metadata?: Json | null
          next_run: string
          schedule_expression: string
          timezone?: string
          updated_at?: string
          user_id: string
          workflow_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_run?: string | null
          metadata?: Json | null
          next_run?: string
          schedule_expression?: string
          timezone?: string
          updated_at?: string
          user_id?: string
          workflow_id?: string
        }
        Relationships: []
      }
      workflow_steps_log: {
        Row: {
          ai_prompt: string | null
          ai_response: string | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          execution_id: string
          execution_time_ms: number | null
          id: string
          input_data: Json | null
          output_data: Json | null
          retry_count: number | null
          solution_id: string | null
          started_at: string | null
          status: string
          step_index: number
          step_name: string
          step_type: string
        }
        Insert: {
          ai_prompt?: string | null
          ai_response?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          execution_id: string
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          retry_count?: number | null
          solution_id?: string | null
          started_at?: string | null
          status?: string
          step_index: number
          step_name: string
          step_type: string
        }
        Update: {
          ai_prompt?: string | null
          ai_response?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          execution_id?: string
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          retry_count?: number | null
          solution_id?: string | null
          started_at?: string | null
          status?: string
          step_index?: number
          step_name?: string
          step_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_log_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "workflow_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string
          difficulty_level: string | null
          estimated_duration: string | null
          id: string
          is_public: boolean | null
          name: string
          required_solutions: Json | null
          success_rate: number | null
          tags: Json | null
          template_data: Json
          updated_at: string
          use_count: number | null
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description: string
          difficulty_level?: string | null
          estimated_duration?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          required_solutions?: Json | null
          success_rate?: number | null
          tags?: Json | null
          template_data?: Json
          updated_at?: string
          use_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          difficulty_level?: string | null
          estimated_duration?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          required_solutions?: Json | null
          success_rate?: number | null
          tags?: Json | null
          template_data?: Json
          updated_at?: string
          use_count?: number | null
        }
        Relationships: []
      }
      workflows: {
        Row: {
          completed_at: string | null
          context: Json
          created_at: string
          current_step_index: number
          id: string
          started_at: string
          status: string
          steps: Json
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          context?: Json
          created_at?: string
          current_step_index?: number
          id?: string
          started_at?: string
          status?: string
          steps?: Json
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          context?: Json
          created_at?: string
          current_step_index?: number
          id?: string
          started_at?: string
          status?: string
          steps?: Json
          title?: string
          type?: string
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
      clean_expired_serp_cache: { Args: never; Returns: undefined }
      cleanup_expired_keyword_cache: { Args: never; Returns: undefined }
      cleanup_expired_notifications: { Args: never; Returns: undefined }
      cleanup_expired_serp_history: { Args: never; Returns: undefined }
      cleanup_old_serp_monitoring: { Args: never; Returns: undefined }
      get_conversation_messages: {
        Args: { conv_id: string; limit_count?: number; offset_count?: number }
        Returns: {
          content: string
          conversation_id: string
          created_at: string
          function_calls: Json
          id: string
          is_streaming: boolean
          message_sequence: number
          message_status: string
          progress_indicator: Json
          read_by: Json
          status: string
          type: string
          visual_data: Json
          workflow_context: Json
        }[]
      }
      get_serp_usage_count: {
        Args: { p_start_date: string; p_user_id: string }
        Returns: number
      }
      get_user_role: { Args: { user_id: string }; Returns: string }
      group_notifications: {
        Args: {
          p_module: string
          p_severity: string
          p_timeframe?: unknown
          p_user_id: string
        }
        Returns: string
      }
      increment_topic_frequency: {
        Args: { p_topic_name: string; p_user_id: string }
        Returns: undefined
      }
      initialize_default_ai_providers: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      log_optimization_activity: {
        Args: {
          p_content_id: string
          p_optimization_settings?: Json
          p_optimized_length?: number
          p_original_length: number
          p_performance_metrics?: Json
          p_reasoning?: Json
          p_session_id: string
          p_success?: boolean
          p_suggestions_analyzed?: Json
          p_suggestions_applied?: Json
          p_suggestions_rejected?: Json
          p_user_id: string
        }
        Returns: string
      }
      log_serp_usage: {
        Args: {
          p_metadata?: Json
          p_operation: string
          p_provider: string
          p_success: boolean
          p_user_id: string
        }
        Returns: undefined
      }
      match_messages: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          message_id: string
          similarity: number
        }[]
      }
      match_topics: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          id: string
          similarity: number
          topic_name: string
        }[]
      }
      migrate_repurposed_content: { Args: never; Returns: undefined }
      refresh_keyword_usage_counts: { Args: never; Returns: undefined }
      update_message_status: {
        Args: { message_id: string; new_status: string; user_id?: string }
        Returns: undefined
      }
      update_optimization_feedback: {
        Args: {
          p_feedback_score: number
          p_log_id: string
          p_optimization_results?: Json
          p_user_feedback: string
        }
        Returns: boolean
      }
    }
    Enums: {
      approval_workflow_status:
        | "draft"
        | "pending_review"
        | "in_review"
        | "approved"
        | "rejected"
        | "needs_changes"
        | "published"
      content_type_enum:
        | "article"
        | "blog"
        | "glossary"
        | "social_post"
        | "email"
        | "landing_page"
      persona_type: "end_user" | "decision_maker" | "influencer"
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
      approval_workflow_status: [
        "draft",
        "pending_review",
        "in_review",
        "approved",
        "rejected",
        "needs_changes",
        "published",
      ],
      content_type_enum: [
        "article",
        "blog",
        "glossary",
        "social_post",
        "email",
        "landing_page",
      ],
      persona_type: ["end_user", "decision_maker", "influencer"],
    },
  },
} as const
