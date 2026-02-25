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
    PostgrestVersion: "14.1"
  }
  billing: {
    Tables: {
      accounts: {
        Row: {
          created_at: string
          id: string
          kind: string
          organization_id: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          organization_id?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          organization_id?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      checkout_sessions: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          expires_at: string | null
          id: string
          metadata: Json
          organization_id: number | null
          payrexx_gateway_hash: string | null
          payrexx_gateway_id: number | null
          payrexx_gateway_link: string | null
          payrexx_transaction_id: string | null
          plan: string
          quantity: number
          reference_id: string
          status: string
          subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          metadata?: Json
          organization_id?: number | null
          payrexx_gateway_hash?: string | null
          payrexx_gateway_id?: number | null
          payrexx_gateway_link?: string | null
          payrexx_transaction_id?: string | null
          plan: string
          quantity?: number
          reference_id: string
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          metadata?: Json
          organization_id?: number | null
          payrexx_gateway_hash?: string | null
          payrexx_gateway_id?: number | null
          payrexx_gateway_link?: string | null
          payrexx_transaction_id?: string | null
          plan?: string
          quantity?: number
          reference_id?: string
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkout_sessions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          due_date: string | null
          id: string
          paid_at: string | null
          provider_invoice_id: string | null
          status: string
          subscription_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency: string
          due_date?: string | null
          id?: string
          paid_at?: string | null
          provider_invoice_id?: string | null
          status: string
          subscription_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          paid_at?: string | null
          provider_invoice_id?: string | null
          status?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          account_id: string
          amount_cents: number
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          currency: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          interval: string
          metadata: Json | null
          provider: string
          provider_subscription_id: string
          seat_count: number | null
          started_at: string
          status: string
          trial_end: string | null
        }
        Insert: {
          account_id: string
          amount_cents: number
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          currency: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          interval: string
          metadata?: Json | null
          provider: string
          provider_subscription_id: string
          seat_count?: number | null
          started_at?: string
          status: string
          trial_end?: string | null
        }
        Update: {
          account_id?: string
          amount_cents?: number
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          interval?: string
          metadata?: Json | null
          provider?: string
          provider_subscription_id?: string
          seat_count?: number | null
          started_at?: string
          status?: string
          trial_end?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          created_at: string
          event_key: string
          event_type: string
          id: string
          payload: Json
          processed: boolean
          processed_at: string | null
          processing_error: string | null
        }
        Insert: {
          created_at?: string
          event_key: string
          event_type: string
          id?: string
          payload: Json
          processed?: boolean
          processed_at?: string | null
          processing_error?: string | null
        }
        Update: {
          created_at?: string
          event_key?: string
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          processing_error?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fail_checkout_session: {
        Args: { p_reason?: string; p_reference_id: string; p_status?: string }
        Returns: undefined
      }
      process_payrexx_payment: {
        Args: {
          p_payrexx_gateway_id?: number
          p_payrexx_transaction_id: string
          p_raw_payload?: Json
          p_reference_id: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  legal: {
    Tables: {
      acceptances: {
        Row: {
          accepted_at: string
          accepted_by: string
          document_version_id: number
          id: number
          source: string
          subject_organization_id: number | null
          subject_user_id: string | null
        }
        Insert: {
          accepted_at?: string
          accepted_by: string
          document_version_id: number
          id?: number
          source?: string
          subject_organization_id?: number | null
          subject_user_id?: string | null
        }
        Update: {
          accepted_at?: string
          accepted_by?: string
          document_version_id?: number
          id?: number
          source?: string
          subject_organization_id?: number | null
          subject_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acceptances_document_version_id_fkey"
            columns: ["document_version_id"]
            isOneToOne: false
            referencedRelation: "current_versions"
            referencedColumns: ["document_version_id"]
          },
          {
            foreignKeyName: "acceptances_document_version_id_fkey"
            columns: ["document_version_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          created_at: string
          document_code: string
          effective_at: string
          file_path: string | null
          id: number
          version_label: string
        }
        Insert: {
          created_at?: string
          document_code: string
          effective_at?: string
          file_path?: string | null
          id?: number
          version_label: string
        }
        Update: {
          created_at?: string
          document_code?: string
          effective_at?: string
          file_path?: string | null
          id?: number
          version_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_code_fkey"
            columns: ["document_code"]
            isOneToOne: false
            referencedRelation: "current_versions"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "document_versions_document_code_fkey"
            columns: ["document_code"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["code"]
          },
        ]
      }
      documents: {
        Row: {
          code: string
          created_at: string
          is_active: boolean
          scope: Database["legal"]["Enums"]["scope"]
          title: string
        }
        Insert: {
          code: string
          created_at?: string
          is_active?: boolean
          scope?: Database["legal"]["Enums"]["scope"]
          title: string
        }
        Update: {
          code?: string
          created_at?: string
          is_active?: boolean
          scope?: Database["legal"]["Enums"]["scope"]
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      current_versions: {
        Row: {
          code: string | null
          document_version_id: number | null
          effective_at: string | null
          file_path: string | null
          scope: Database["legal"]["Enums"]["scope"] | null
          title: string | null
          version_label: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      scope: "user" | "organization"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  license: {
    Tables: {
      entitlements: {
        Row: {
          billing_subscription_id: string | null
          created_at: string
          id: string
          kind: Database["license"]["Enums"]["entitlement_kind"]
          organization_id: number | null
          revocation_reason:
            | Database["license"]["Enums"]["entitlement_revocation_reason"]
            | null
          source: Database["license"]["Enums"]["entitlement_source"]
          status: Database["license"]["Enums"]["entitlement_status"]
          updated_at: string
          user_id: string | null
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          billing_subscription_id?: string | null
          created_at?: string
          id?: string
          kind: Database["license"]["Enums"]["entitlement_kind"]
          organization_id?: number | null
          revocation_reason?:
            | Database["license"]["Enums"]["entitlement_revocation_reason"]
            | null
          source: Database["license"]["Enums"]["entitlement_source"]
          status?: Database["license"]["Enums"]["entitlement_status"]
          updated_at?: string
          user_id?: string | null
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          billing_subscription_id?: string | null
          created_at?: string
          id?: string
          kind?: Database["license"]["Enums"]["entitlement_kind"]
          organization_id?: number | null
          revocation_reason?:
            | Database["license"]["Enums"]["entitlement_revocation_reason"]
            | null
          source?: Database["license"]["Enums"]["entitlement_source"]
          status?: Database["license"]["Enums"]["entitlement_status"]
          updated_at?: string
          user_id?: string | null
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      org_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string | null
          id: string
          organization_id: number
          role: string
          status: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          organization_id: number
          role?: string
          status: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          organization_id?: number
          role?: string
          status?: string
          token?: string
        }
        Relationships: []
      }
      student_verifications: {
        Row: {
          created_at: string
          eduid_sub: string
          expires_at: string | null
          id: string
          raw_assertion: Json | null
          status: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          eduid_sub: string
          expires_at?: string | null
          id?: string
          raw_assertion?: Json | null
          status: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          eduid_sub?: string
          expires_at?: string | null
          id?: string
          raw_assertion?: Json | null
          status?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      start_demo: {
        Args: never
        Returns: {
          billing_subscription_id: string | null
          created_at: string
          id: string
          kind: Database["license"]["Enums"]["entitlement_kind"]
          organization_id: number | null
          revocation_reason:
            | Database["license"]["Enums"]["entitlement_revocation_reason"]
            | null
          source: Database["license"]["Enums"]["entitlement_source"]
          status: Database["license"]["Enums"]["entitlement_status"]
          updated_at: string
          user_id: string | null
          valid_from: string
          valid_until: string | null
        }
        SetofOptions: {
          from: "*"
          to: "entitlements"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      entitlement_kind: "trial" | "personal" | "org_seat" | "student"
      entitlement_revocation_reason:
        | "subscription_canceled"
        | "payment_failed"
        | "org_admin_removed"
        | "student_not_eligible"
        | "support_action"
        | "fraud"
        | "other"
      entitlement_source: "system" | "payrexx" | "manual" | "eduid"
      entitlement_status: "pending" | "active" | "revoked" | "expired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      account_deletion: {
        Row: {
          created_at: string
          email: string | null
          id: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          user_id?: string | null
        }
        Relationships: []
      }
      app_min_versions: {
        Row: {
          min_version: string | null
          platform: string
        }
        Insert: {
          min_version?: string | null
          platform: string
        }
        Update: {
          min_version?: string | null
          platform?: string
        }
        Relationships: []
      }
      cantons: {
        Row: {
          annual_work_hours: number
          code: string
          created_at: string
          has_subcategories: boolean
          is_configurable: boolean
          is_working_hours_disabled: boolean
          title: string
          use_custom_work_hours: boolean
        }
        Insert: {
          annual_work_hours: number
          code: string
          created_at?: string
          has_subcategories?: boolean
          is_configurable?: boolean
          is_working_hours_disabled?: boolean
          title: string
          use_custom_work_hours?: boolean
        }
        Update: {
          annual_work_hours?: number
          code?: string
          created_at?: string
          has_subcategories?: boolean
          is_configurable?: boolean
          is_working_hours_disabled?: boolean
          title?: string
          use_custom_work_hours?: boolean
        }
        Relationships: []
      }
      categories: {
        Row: {
          canton_code: string | null
          category_set_id: number
          created_at: string
          id: number
          order: number | null
          subtitle: string
          title: string
        }
        Insert: {
          canton_code?: string | null
          category_set_id: number
          created_at?: string
          id?: number
          order?: number | null
          subtitle: string
          title: string
        }
        Update: {
          canton_code?: string | null
          category_set_id?: number
          created_at?: string
          id?: number
          order?: number | null
          subtitle?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_canton_code_fkey"
            columns: ["canton_code"]
            isOneToOne: false
            referencedRelation: "cantons"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "categories_category_set_fkey"
            columns: ["category_set_id"]
            isOneToOne: false
            referencedRelation: "category_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      category_sets: {
        Row: {
          canton_code: string | null
          color: string
          created_at: string
          id: number
          max_target_percentage: number | null
          min_target_percentage: number | null
          order: number | null
          target_percentage: number
          title: string
        }
        Insert: {
          canton_code?: string | null
          color: string
          created_at?: string
          id?: number
          max_target_percentage?: number | null
          min_target_percentage?: number | null
          order?: number | null
          target_percentage: number
          title: string
        }
        Update: {
          canton_code?: string | null
          color?: string
          created_at?: string
          id?: number
          max_target_percentage?: number | null
          min_target_percentage?: number | null
          order?: number | null
          target_percentage?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_sets_canton_code_fkey"
            columns: ["canton_code"]
            isOneToOne: false
            referencedRelation: "cantons"
            referencedColumns: ["code"]
          },
        ]
      }
      config_profiles: {
        Row: {
          annual_work_hours: number
          created_at: string
          id: string
          title: string
          user_id: string | null
        }
        Insert: {
          annual_work_hours: number
          created_at?: string
          id?: string
          title: string
          user_id?: string | null
        }
        Update: {
          annual_work_hours?: number
          created_at?: string
          id?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      languages: {
        Row: {
          created_at: string
          locale: string
        }
        Insert: {
          created_at?: string
          locale: string
        }
        Update: {
          created_at?: string
          locale?: string
        }
        Relationships: []
      }
      organization_administrators: {
        Row: {
          created_at: string
          id: number
          organization_id: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          organization_id?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          organization_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_administrator_map_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_administrator_map_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      organization_members: {
        Row: {
          comment: string | null
          created_at: string
          id: number
          organization_id: number
          status: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: number
          organization_id: number
          status?: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: number
          organization_id?: number
          status?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: number
          is_active: boolean
          name: string
          seats: number
        }
        Insert: {
          created_at?: string
          id?: number
          is_active?: boolean
          name: string
          seats: number
        }
        Update: {
          created_at?: string
          id?: number
          is_active?: boolean
          name?: string
          seats?: number
        }
        Relationships: []
      }
      profile_categories: {
        Row: {
          color: string
          config_profile_id: string
          created_at: string
          id: string
          order: number | null
          title: string
          user_id: string
          weight: number
        }
        Insert: {
          color?: string
          config_profile_id: string
          created_at?: string
          id?: string
          order?: number | null
          title: string
          user_id: string
          weight?: number
        }
        Update: {
          color?: string
          config_profile_id?: string
          created_at?: string
          id?: string
          order?: number | null
          title?: string
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "profile_categories_config_profile_id_fkey"
            columns: ["config_profile_id"]
            isOneToOne: false
            referencedRelation: "config_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      records: {
        Row: {
          category_id: number | null
          created_at: string
          date: string
          description: string | null
          duration: number | null
          end_time: string | null
          id: number
          is_user_category: boolean
          profile_category_id: string | null
          start_time: string | null
          user_category_id: number | null
          user_id: string
        }
        Insert: {
          category_id?: number | null
          created_at?: string
          date: string
          description?: string | null
          duration?: number | null
          end_time?: string | null
          id?: number
          is_user_category?: boolean
          profile_category_id?: string | null
          start_time?: string | null
          user_category_id?: number | null
          user_id?: string
        }
        Update: {
          category_id?: number | null
          created_at?: string
          date?: string
          description?: string | null
          duration?: number | null
          end_time?: string | null
          id?: number
          is_user_category?: boolean
          profile_category_id?: string | null
          start_time?: string | null
          user_category_id?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "records_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "records_profile_category_id_fkey"
            columns: ["profile_category_id"]
            isOneToOne: false
            referencedRelation: "profile_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "records_user_category_id_fkey"
            columns: ["user_category_id"]
            isOneToOne: false
            referencedRelation: "user_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      stopwatch_sessions: {
        Row: {
          category_id: number | null
          created_at: string
          description: string | null
          id: number
          is_user_category: boolean
          start_time: string
          user_category_id: number | null
          user_id: string
        }
        Insert: {
          category_id?: number | null
          created_at?: string
          description?: string | null
          id?: number
          is_user_category?: boolean
          start_time?: string
          user_category_id?: number | null
          user_id?: string
        }
        Update: {
          category_id?: number | null
          created_at?: string
          description?: string | null
          id?: number
          is_user_category?: boolean
          start_time?: string
          user_category_id?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stopwatch_sessions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stopwatch_sessions_user_category_id_fkey"
            columns: ["user_category_id"]
            isOneToOne: false
            referencedRelation: "user_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_categories: {
        Row: {
          color: string
          created_at: string
          id: number
          subtitle: string
          title: string
          user_id: string
          workload: number
        }
        Insert: {
          color: string
          created_at?: string
          id?: number
          subtitle: string
          title: string
          user_id: string
          workload: number
        }
        Update: {
          color?: string
          created_at?: string
          id?: number
          subtitle?: string
          title?: string
          user_id?: string
          workload?: number
        }
        Relationships: []
      }
      user_custom_targets: {
        Row: {
          category_set_id: number
          created_at: string
          id: number
          target_percentage: number
          user_id: string
        }
        Insert: {
          category_set_id: number
          created_at?: string
          id?: number
          target_percentage: number
          user_id: string
        }
        Update: {
          category_set_id?: number
          created_at?: string
          id?: number
          target_percentage?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_custom_targets_category_set_id_fkey"
            columns: ["category_set_id"]
            isOneToOne: false
            referencedRelation: "category_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          active_config_profile_id: string | null
          canton_code: string
          class_size: number | null
          created_at: string
          custom_work_hours: number
          education_level: Database["public"]["Enums"]["education_level"] | null
          first_name: string
          is_mode_dark: boolean
          language: string
          last_name: string
          stat_end_date: string | null
          stat_start_date: string | null
          teacher_relief: number | null
          user_id: string
          workload: number | null
        }
        Insert: {
          active_config_profile_id?: string | null
          canton_code: string
          class_size?: number | null
          created_at?: string
          custom_work_hours?: number
          education_level?:
            | Database["public"]["Enums"]["education_level"]
            | null
          first_name: string
          is_mode_dark: boolean
          language?: string
          last_name: string
          stat_end_date?: string | null
          stat_start_date?: string | null
          teacher_relief?: number | null
          user_id: string
          workload?: number | null
        }
        Update: {
          active_config_profile_id?: string | null
          canton_code?: string
          class_size?: number | null
          created_at?: string
          custom_work_hours?: number
          education_level?:
            | Database["public"]["Enums"]["education_level"]
            | null
          first_name?: string
          is_mode_dark?: boolean
          language?: string
          last_name?: string
          stat_end_date?: string | null
          stat_start_date?: string | null
          teacher_relief?: number | null
          user_id?: string
          workload?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "users_canton_code_fkey"
            columns: ["canton_code"]
            isOneToOne: false
            referencedRelation: "cantons"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "users_language_fkey"
            columns: ["language"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["locale"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_organization_seats:
        | { Args: { org_id: number }; Returns: boolean }
        | { Args: { organization_id: number }; Returns: boolean }
      is_org_admin: { Args: { p_organization_id: number }; Returns: boolean }
      legal_accept_document: {
        Args: { p_code: string; p_organization_id?: number; p_source?: string }
        Returns: undefined
      }
      legal_missing_documents: {
        Args: { p_context: string; p_organization_id?: number }
        Returns: {
          can_accept: boolean
          code: string
          document_version_id: number
          organization_id: number
          scope: string
          title: string
          version_label: string
        }[]
      }
    }
    Enums: {
      education_level:
        | "kindergarten"
        | "foundation_stage"
        | "lower_primary"
        | "grade_3_4"
        | "middle_primary"
        | "lower_secondary"
        | "special_class"
        | "special_school"
        | "vocational_school"
        | "upper_secondary"
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
  billing: {
    Enums: {},
  },
  legal: {
    Enums: {
      scope: ["user", "organization"],
    },
  },
  license: {
    Enums: {
      entitlement_kind: ["trial", "personal", "org_seat", "student"],
      entitlement_revocation_reason: [
        "subscription_canceled",
        "payment_failed",
        "org_admin_removed",
        "student_not_eligible",
        "support_action",
        "fraud",
        "other",
      ],
      entitlement_source: ["system", "payrexx", "manual", "eduid"],
      entitlement_status: ["pending", "active", "revoked", "expired"],
    },
  },
  public: {
    Enums: {
      education_level: [
        "kindergarten",
        "foundation_stage",
        "lower_primary",
        "grade_3_4",
        "middle_primary",
        "lower_secondary",
        "special_class",
        "special_school",
        "vocational_school",
        "upper_secondary",
      ],
    },
  },
} as const
