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
          checkout_session_id: string | null
          created_at: string
          currency: string
          due_date: string | null
          id: string
          issued_at: string
          paid_at: string | null
          provider_invoice_id: string | null
          status: string
          subscription_id: string | null
        }
        Insert: {
          amount_cents: number
          checkout_session_id?: string | null
          created_at?: string
          currency: string
          due_date?: string | null
          id?: string
          issued_at?: string
          paid_at?: string | null
          provider_invoice_id?: string | null
          status: string
          subscription_id?: string | null
        }
        Update: {
          amount_cents?: number
          checkout_session_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          issued_at?: string
          paid_at?: string | null
          provider_invoice_id?: string | null
          status?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_checkout_session_id_fkey"
            columns: ["checkout_session_id"]
            isOneToOne: false
            referencedRelation: "checkout_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      org_legacy_migration_plan: {
        Row: {
          actor_user_id: string | null
          created_at: string
          currency: string
          custom_annual_amount_cents: number | null
          custom_seat_count: number | null
          due_date: string | null
          metadata: Json
          migrate: boolean
          migrate_invites: boolean
          note: string | null
          organization_id: number
          updated_at: string
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          currency?: string
          custom_annual_amount_cents?: number | null
          custom_seat_count?: number | null
          due_date?: string | null
          metadata?: Json
          migrate?: boolean
          migrate_invites?: boolean
          note?: string | null
          organization_id: number
          updated_at?: string
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          currency?: string
          custom_annual_amount_cents?: number | null
          custom_seat_count?: number | null
          due_date?: string | null
          metadata?: Json
          migrate?: boolean
          migrate_invites?: boolean
          note?: string | null
          organization_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      org_renewal_reminders: {
        Row: {
          created_at: string
          id: string
          last_error: string | null
          organization_id: number
          recipient_email: string
          recipient_user_id: string | null
          reminder_type: string
          scheduled_for: string
          sent_at: string | null
          status: string
          subscription_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_error?: string | null
          organization_id: number
          recipient_email: string
          recipient_user_id?: string | null
          reminder_type: string
          scheduled_for: string
          sent_at?: string | null
          status?: string
          subscription_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_error?: string | null
          organization_id?: number
          recipient_email?: string
          recipient_user_id?: string | null
          reminder_type?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          subscription_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_renewal_reminders_subscription_id_fkey"
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
          grace_days: number
          id: string
          interval: string
          metadata: Json | null
          provider: string
          provider_subscription_id: string
          seat_count: number | null
          started_at: string
          status: string
          suspend_at: string | null
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
          grace_days?: number
          id?: string
          interval: string
          metadata?: Json | null
          provider: string
          provider_subscription_id: string
          seat_count?: number | null
          started_at?: string
          status: string
          suspend_at?: string | null
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
          grace_days?: number
          id?: string
          interval?: string
          metadata?: Json | null
          provider?: string
          provider_subscription_id?: string
          seat_count?: number | null
          started_at?: string
          status?: string
          suspend_at?: string | null
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
      accept_org_member_invite: {
        Args: { p_actor_user_id: string; p_organization_id: number }
        Returns: string
      }
      add_organization_admin_by_email: {
        Args: {
          p_actor_user_id: string
          p_admin_email: string
          p_organization_id: number
        }
        Returns: string
      }
      cancel_org_subscription_at_period_end: {
        Args: { p_actor_user_id: string; p_organization_id: number }
        Returns: string
      }
      create_org_checkout: {
        Args: {
          p_actor_user_id: string
          p_amount_cents: number
          p_currency: string
          p_due_date?: string
          p_expires_at?: string
          p_metadata?: Json
          p_organization_id: number
          p_payrexx_gateway_hash?: string
          p_payrexx_gateway_id?: number
          p_payrexx_gateway_link?: string
          p_quantity: number
          p_reference_id: string
        }
        Returns: string
      }
      create_org_member_invite: {
        Args: {
          p_actor_user_id: string
          p_comment?: string
          p_email: string
          p_expires_at?: string
          p_organization_id: number
          p_role?: string
        }
        Returns: string
      }
      create_personal_checkout_session: {
        Args: {
          p_amount_cents: number
          p_billing_cycle?: string
          p_currency: string
          p_expires_at?: string
          p_metadata?: Json
          p_payrexx_gateway_id: number
          p_payrexx_gateway_link: string
          p_reference_id: string
          p_user_id: string
        }
        Returns: string
      }
      deactivate_organization_for_nonpayment: {
        Args: { p_organization_id: number; p_reference_time?: string }
        Returns: undefined
      }
      deactivate_organization_revoke_access: {
        Args: { p_actor_user_id: string; p_organization_id: number }
        Returns: undefined
      }
      ensure_org_actor_entitlement: {
        Args: { p_actor_user_id: string; p_organization_id: number }
        Returns: string
      }
      fail_checkout_session: {
        Args: { p_reason?: string; p_reference_id: string; p_status?: string }
        Returns: undefined
      }
      get_org_billing_status: {
        Args: { p_actor_user_id: string; p_organization_id: number }
        Returns: {
          amount_cents: number
          checkout_reference_id: string
          currency: string
          current_period_end: string
          current_period_start: string
          grace_days: number
          invoice_due_date: string
          invoice_id: string
          invoice_paid_at: string
          invoice_status: string
          payrexx_gateway_link: string
          responsible_email: string
          seat_count: number
          subscription_id: string
          subscription_status: Database["billing"]["Enums"]["org_subscription_status"]
          suspend_at: string
        }[]
      }
      get_personal_subscription_summary: {
        Args: { p_user_id: string }
        Returns: Json
      }
      leave_organization_as_member: {
        Args: { p_actor_user_id: string; p_organization_id: number }
        Returns: undefined
      }
      list_organization_admins: {
        Args: { p_actor_user_id: string; p_organization_id: number }
        Returns: {
          created_at: string
          email: string
          user_id: string
        }[]
      }
      mark_personal_subscription_cancel_pending: {
        Args: {
          p_canceled_at: string
          p_metadata_merge: Json
          p_user_id: string
        }
        Returns: boolean
      }
      migrate_one_legacy_organization: {
        Args: { p_organization_id: number }
        Returns: Json
      }
      pick_org_migration_actor: {
        Args: { p_organization_id: number }
        Returns: string
      }
      process_payrexx_org_payment: {
        Args: {
          p_payrexx_gateway_id?: number
          p_payrexx_transaction_id: string
          p_raw_payload?: Json
          p_reference_id: string
        }
        Returns: string
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
      purge_organizations_past_scheduled_deletion: {
        Args: { p_reference_time?: string }
        Returns: Json
      }
      reactivate_org_subscription: {
        Args: { p_actor_user_id: string; p_organization_id: number }
        Returns: string
      }
      reject_org_invite_membership_fallback: {
        Args: { p_actor_user_id: string; p_organization_id: number }
        Returns: undefined
      }
      reject_org_member_invite: {
        Args: { p_actor_user_id: string; p_organization_id: number }
        Returns: string
      }
      release_org_member_seat: {
        Args: {
          p_actor_user_id: string
          p_membership_id: number
          p_organization_id: number
        }
        Returns: string
      }
      remove_organization_admin: {
        Args: {
          p_actor_user_id: string
          p_organization_id: number
          p_remove_user_id: string
        }
        Returns: string
      }
      resolve_org_migration_amount: {
        Args: { p_custom_amount_cents: number; p_organization_id: number }
        Returns: number
      }
      run_individual_lifecycle_sweep: {
        Args: { p_reference_time?: string }
        Returns: Json
      }
      run_org_cancellation_finalization_sweep: {
        Args: { p_reference_time?: string }
        Returns: Json
      }
      run_org_delinquency_sweep: {
        Args: { p_reference_time?: string }
        Returns: Json
      }
      run_org_hard_delinquency_sweep: {
        Args: { p_reference_time?: string }
        Returns: Json
      }
      run_org_legacy_migration: {
        Args: { p_organization_ids?: number[] }
        Returns: Json
      }
      run_org_renewal_reminder_sweep: {
        Args: { p_reference_time?: string }
        Returns: Json
      }
      seed_org_legacy_migration_plan: { Args: never; Returns: number }
      set_org_custom_price_and_seats: {
        Args: {
          p_amount_cents: number
          p_currency?: string
          p_organization_id: number
          p_seat_count: number
        }
        Returns: string
      }
      update_org_seat_plan: {
        Args: {
          p_actor_user_id: string
          p_apply_immediately?: boolean
          p_metadata?: Json
          p_next_annual_amount_cents?: number
          p_organization_id: number
          p_target_seat_count: number
        }
        Returns: string
      }
      update_organization_name: {
        Args: {
          p_actor_user_id: string
          p_name: string
          p_organization_id: number
        }
        Returns: string
      }
    }
    Enums: {
      org_subscription_status: "active" | "active_unpaid" | "suspended"
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
          user_id: string
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
          user_id: string
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
          user_id?: string
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
      cancel_active_trial_for_user: { Args: never; Returns: string }
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
          user_id: string
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
      user_has_active_personal_license: {
        Args: { p_user_id: string }
        Returns: boolean
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
          processed_at: string | null
          processing_error: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
          processed_at?: string | null
          processing_error?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          processed_at?: string | null
          processing_error?: string | null
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
          scheduled_deletion_at: string | null
          seats: number
        }
        Insert: {
          created_at?: string
          id?: number
          is_active?: boolean
          name: string
          scheduled_deletion_at?: string | null
          seats: number
        }
        Update: {
          created_at?: string
          id?: number
          is_active?: boolean
          name?: string
          scheduled_deletion_at?: string | null
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
      account_deletion_enqueue: { Args: { p_email: string }; Returns: Json }
      account_deletion_validate: { Args: never; Returns: Json }
      api_accept_org_member_invite: {
        Args: { p_organization_id: number }
        Returns: string
      }
      api_add_organization_admin_by_email: {
        Args: { p_admin_email: string; p_organization_id: number }
        Returns: string
      }
      api_cancel_active_trial_for_user: { Args: never; Returns: string }
      api_cancel_org_subscription_at_period_end: {
        Args: { p_organization_id: number }
        Returns: string
      }
      api_create_org_checkout: {
        Args: {
          p_amount_cents: number
          p_currency: string
          p_due_date?: string
          p_expires_at?: string
          p_metadata?: Json
          p_organization_id: number
          p_payrexx_gateway_hash?: string
          p_payrexx_gateway_id?: number
          p_payrexx_gateway_link?: string
          p_quantity: number
          p_reference_id: string
        }
        Returns: string
      }
      api_create_org_member_invite: {
        Args: {
          p_comment?: string
          p_email: string
          p_expires_at?: string
          p_organization_id: number
          p_role?: string
        }
        Returns: Json
      }
      api_create_organization_with_admin: {
        Args: {
          p_max_organizations_per_user?: number
          p_name: string
          p_seats?: number
        }
        Returns: number
      }
      api_create_personal_checkout_session: {
        Args: {
          p_amount_cents: number
          p_billing_cycle?: string
          p_currency: string
          p_expires_at?: string
          p_metadata?: Json
          p_payrexx_gateway_id: number
          p_payrexx_gateway_link: string
          p_reference_id: string
        }
        Returns: string
      }
      api_deactivate_organization_revoke_access: {
        Args: { p_organization_id: number }
        Returns: undefined
      }
      api_get_checkout_completion_state: {
        Args: { p_reference_id: string }
        Returns: Json
      }
      api_get_org_billing_status: {
        Args: { p_organization_id: number }
        Returns: {
          amount_cents: number
          checkout_reference_id: string
          currency: string
          current_period_end: string
          current_period_start: string
          grace_days: number
          invoice_due_date: string
          invoice_id: string
          invoice_paid_at: string
          invoice_status: string
          payrexx_gateway_link: string
          responsible_email: string
          seat_count: number
          subscription_id: string
          subscription_status: Database["billing"]["Enums"]["org_subscription_status"]
          suspend_at: string
        }[]
      }
      api_get_organization_admin_row: {
        Args: { p_organization_id: number }
        Returns: Json
      }
      api_get_organization_management_snapshot: {
        Args: { p_organization_id: number }
        Returns: Json
      }
      api_get_personal_subscription_summary: { Args: never; Returns: Json }
      api_leave_organization_as_member: {
        Args: { p_organization_id: number }
        Returns: undefined
      }
      api_list_organization_admins: {
        Args: { p_organization_id: number }
        Returns: {
          created_at: string
          email: string
          user_id: string
        }[]
      }
      api_mark_personal_subscription_cancel_pending: {
        Args: { p_canceled_at: string; p_metadata_merge?: Json }
        Returns: boolean
      }
      api_reactivate_org_subscription: {
        Args: { p_organization_id: number }
        Returns: string
      }
      api_reject_org_invite_membership_fallback: {
        Args: { p_organization_id: number }
        Returns: undefined
      }
      api_reject_org_member_invite: {
        Args: { p_organization_id: number }
        Returns: string
      }
      api_release_org_member_seat: {
        Args: { p_membership_id: number; p_organization_id: number }
        Returns: string
      }
      api_remove_organization_admin: {
        Args: { p_organization_id: number; p_remove_user_id: string }
        Returns: string
      }
      api_require_uid: { Args: never; Returns: string }
      api_update_org_seat_plan: {
        Args: {
          p_apply_immediately?: boolean
          p_metadata?: Json
          p_next_annual_amount_cents?: number
          p_organization_id: number
          p_target_seat_count: number
        }
        Returns: string
      }
      api_update_organization_name: {
        Args: { p_name: string; p_organization_id: number }
        Returns: string
      }
      api_get_my_entitlements: { Args: never; Returns: Json }
      api_has_ever_had_trial: { Args: never; Returns: boolean }
      api_user_has_active_entitlement: { Args: never; Returns: boolean }
      api_user_has_active_personal_license: { Args: never; Returns: boolean }
      check_organization_seats:
        | { Args: { org_id: number }; Returns: boolean }
        | { Args: { organization_id: number }; Returns: boolean }
      create_organization_with_admin: {
        Args: {
          p_actor_user_id: string
          p_max_organizations_per_user?: number
          p_name: string
          p_seats?: number
        }
        Returns: number
      }
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
    Enums: {
      org_subscription_status: ["active", "active_unpaid", "suspended"],
    },
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
