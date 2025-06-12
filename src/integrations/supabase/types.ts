export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
      content_items: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_workflow_status"]
          content: string | null
          created_at: string
          id: string
          metadata: Json | null
          published_url: string | null
          review_deadline: string | null
          reviewer_id: string | null
          seo_score: number | null
          status: string
          submitted_for_review_at: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["approval_workflow_status"]
          content?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          published_url?: string | null
          review_deadline?: string | null
          reviewer_id?: string | null
          seo_score?: number | null
          status?: string
          submitted_for_review_at?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["approval_workflow_status"]
          content?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          published_url?: string | null
          review_deadline?: string | null
          reviewer_id?: string | null
          seo_score?: number | null
          status?: string
          submitted_for_review_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
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
      solutions: {
        Row: {
          category: string | null
          created_at: string
          external_url: string | null
          features: Json | null
          id: string
          logo_url: string | null
          name: string
          pain_points: Json | null
          resources: Json | null
          target_audience: Json | null
          updated_at: string
          use_cases: Json | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          external_url?: string | null
          features?: Json | null
          id?: string
          logo_url?: string | null
          name: string
          pain_points?: Json | null
          resources?: Json | null
          target_audience?: Json | null
          updated_at?: string
          use_cases?: Json | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          external_url?: string | null
          features?: Json | null
          id?: string
          logo_url?: string | null
          name?: string
          pain_points?: Json | null
          resources?: Json | null
          target_audience?: Json | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      migrate_repurposed_content: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
    },
  },
} as const
