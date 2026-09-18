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
      audit_events: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          id: number
          metadata: Json
          operation_id: string | null
          reason: string | null
          record_id: string | null
          redacted_diff: Json
          resource_type: string | null
          tenant_id: string | null
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          id?: never
          metadata?: Json
          operation_id?: string | null
          reason?: string | null
          record_id?: string | null
          redacted_diff?: Json
          resource_type?: string | null
          tenant_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          id?: never
          metadata?: Json
          operation_id?: string | null
          reason?: string | null
          record_id?: string | null
          redacted_diff?: Json
          resource_type?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_cycles: {
        Row: {
          id: string
          period_end: string
          period_start: string
          plan_version_id: string
          status: string
          tenant_id: string
        }
        Insert: {
          id?: string
          period_end: string
          period_start: string
          plan_version_id: string
          status: string
          tenant_id: string
        }
        Update: {
          id?: string
          period_end?: string
          period_start?: string
          plan_version_id?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_cycles_plan_version_id_fkey"
            columns: ["plan_version_id"]
            isOneToOne: false
            referencedRelation: "plan_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          audience: string
          created_at: string
          id: string
          repair_id: string | null
          tenant_id: string
        }
        Insert: {
          audience: string
          created_at?: string
          id?: string
          repair_id?: string | null
          tenant_id: string
        }
        Update: {
          audience?: string
          created_at?: string
          id?: string
          repair_id?: string | null
          tenant_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          id: string
          name: string
          phone: string
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          phone?: string
          tenant_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_tenant_id_user_id_fkey"
            columns: ["tenant_id", "user_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["tenant_id", "user_id"]
          },
        ]
      }
      delegations: {
        Row: {
          active: boolean
          created_at: string
          expires_at: string
          granted_by: string
          granted_to: string
          id: string
          permission: string
          request_id: string
          resource_id: string | null
          revoked_at: string | null
          tenant_id: string
          valid_from: string
          version: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          expires_at: string
          granted_by: string
          granted_to: string
          id?: string
          permission: string
          request_id: string
          resource_id?: string | null
          revoked_at?: string | null
          tenant_id: string
          valid_from?: string
          version?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          expires_at?: string
          granted_by?: string
          granted_to?: string
          id?: string
          permission?: string
          request_id?: string
          resource_id?: string | null
          revoked_at?: string | null
          tenant_id?: string
          valid_from?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "delegations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delegations_tenant_id_granted_to_fkey"
            columns: ["tenant_id", "granted_to"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["tenant_id", "user_id"]
          },
        ]
      }
      delivery_events: {
        Row: {
          confirmed_at: string
          confirmed_by: string
          id: string
          notes: string
          operation_id: string
          recipient_name: string
          repair_id: string
          tenant_id: string
        }
        Insert: {
          confirmed_at?: string
          confirmed_by: string
          id?: string
          notes?: string
          operation_id: string
          recipient_name: string
          repair_id: string
          tenant_id: string
        }
        Update: {
          confirmed_at?: string
          confirmed_by?: string
          id?: string
          notes?: string
          operation_id?: string
          recipient_name?: string
          repair_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_events_tenant_id_repair_id_fkey"
            columns: ["tenant_id", "repair_id"]
            isOneToOne: true
            referencedRelation: "advisor_work_queue"
            referencedColumns: ["tenant_id", "repair_id"]
          },
          {
            foreignKeyName: "delivery_events_tenant_id_repair_id_fkey"
            columns: ["tenant_id", "repair_id"]
            isOneToOne: true
            referencedRelation: "repairs"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      diagnostics: {
        Row: {
          created_at: string
          created_by: string
          id: string
          repair_id: string
          summary: string
          tenant_id: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          repair_id: string
          summary: string
          tenant_id: string
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          repair_id?: string
          summary?: string
          tenant_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "diagnostics_tenant_id_repair_id_fkey"
            columns: ["tenant_id", "repair_id"]
            isOneToOne: false
            referencedRelation: "advisor_work_queue"
            referencedColumns: ["tenant_id", "repair_id"]
          },
          {
            foreignKeyName: "diagnostics_tenant_id_repair_id_fkey"
            columns: ["tenant_id", "repair_id"]
            isOneToOne: false
            referencedRelation: "repairs"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      document_snapshots: {
        Row: {
          created_at: string
          created_by: string
          id: string
          kind: string
          repair_id: string | null
          schema_version: number
          snapshot: Json
          template_code: string
          template_version: number
          tenant_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          kind: string
          repair_id?: string | null
          schema_version?: number
          snapshot: Json
          template_code: string
          template_version: number
          tenant_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          kind?: string
          repair_id?: string | null
          schema_version?: number
          snapshot?: Json
          template_code?: string
          template_version?: number
          tenant_id?: string
        }
        Relationships: []
      }
      document_templates: {
        Row: {
          active: boolean
          body: Json
          code: string
          format: string
          id: string
          tenant_id: string | null
          version: number
        }
        Insert: {
          active?: boolean
          body: Json
          code: string
          format: string
          id?: string
          tenant_id?: string | null
          version: number
        }
        Update: {
          active?: boolean
          body?: Json
          code?: string
          format?: string
          id?: string
          tenant_id?: string | null
          version?: number
        }
        Relationships: []
      }
      equipment: {
        Row: {
          brand: string
          created_at: string
          created_by: string
          customer_id: string
          id: string
          kind: string
          model: string
          notes: string
          serial_number: string | null
          tenant_id: string
          updated_at: string
          version: number
        }
        Insert: {
          brand?: string
          created_at?: string
          created_by: string
          customer_id: string
          id?: string
          kind: string
          model?: string
          notes?: string
          serial_number?: string | null
          tenant_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          brand?: string
          created_at?: string
          created_by?: string
          customer_id?: string
          id?: string
          kind?: string
          model?: string
          notes?: string
          serial_number?: string | null
          tenant_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "equipment_tenant_id_customer_id_fkey"
            columns: ["tenant_id", "customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      equipment_events: {
        Row: {
          actor_id: string
          created_at: string
          equipment_id: string
          event_type: string
          id: number
          snapshot: Json
          tenant_id: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          equipment_id: string
          event_type: string
          id?: never
          snapshot?: Json
          tenant_id: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          equipment_id?: string
          event_type?: string
          id?: never
          snapshot?: Json
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_events_tenant_id_equipment_id_fkey"
            columns: ["tenant_id", "equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      export_jobs: {
        Row: {
          created_at: string
          created_by: string
          filters: Json
          id: string
          kind: string
          status: string
          storage_path: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          filters?: Json
          id?: string
          kind: string
          status?: string
          storage_path?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          filters?: Json
          id?: string
          kind?: string
          status?: string
          storage_path?: string | null
          tenant_id?: string
        }
        Relationships: []
      }
      identity_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          activated_at: string | null
          activated_by: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          proposed_role: string
          request_id: string
          revoked_at: string | null
          status: string
          tenant_id: string
          version: number
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by: string
          proposed_role: string
          request_id: string
          revoked_at?: string | null
          status?: string
          tenant_id: string
          version?: number
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          proposed_role?: string
          request_id?: string
          revoked_at?: string | null
          status?: string
          tenant_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "identity_invitations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_events: {
        Row: {
          accessories: string
          actor_id: string
          confirmed_at: string
          id: string
          operation_id: string
          physical_condition: string
          repair_id: string
          tenant_id: string
          voucher_id: string
        }
        Insert: {
          accessories: string
          actor_id: string
          confirmed_at?: string
          id?: string
          operation_id: string
          physical_condition: string
          repair_id: string
          tenant_id: string
          voucher_id: string
        }
        Update: {
          accessories?: string
          actor_id?: string
          confirmed_at?: string
          id?: string
          operation_id?: string
          physical_condition?: string
          repair_id?: string
          tenant_id?: string
          voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "intake_events_tenant_id_repair_id_fkey"
            columns: ["tenant_id", "repair_id"]
            isOneToOne: true
            referencedRelation: "advisor_work_queue"
            referencedColumns: ["tenant_id", "repair_id"]
          },
          {
            foreignKeyName: "intake_events_tenant_id_repair_id_fkey"
            columns: ["tenant_id", "repair_id"]
            isOneToOne: true
            referencedRelation: "repairs"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "intake_events_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: true
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_adapters: {
        Row: {
          capability: string
          config_public: Json
          credentials_ref: string | null
          id: string
          provider: string
          status: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          capability: string
          config_public?: Json
          credentials_ref?: string | null
          id?: string
          provider: string
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          capability?: string
          config_public?: Json
          credentials_ref?: string | null
          id?: string
          provider?: string
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          id: string
          name: string
          reserved: number
          sku: string
          stock: number
          tenant_id: string
          version: number
        }
        Insert: {
          id?: string
          name: string
          reserved?: number
          sku: string
          stock?: number
          tenant_id: string
          version?: number
        }
        Update: {
          id?: string
          name?: string
          reserved?: number
          sku?: string
          stock?: number
          tenant_id?: string
          version?: number
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string
          id: string
          item_id: string
          kind: string
          quantity: number
          repair_id: string | null
          request_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          item_id: string
          kind: string
          quantity: number
          repair_id?: string | null
          request_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          item_id?: string
          kind?: string
          quantity?: number
          repair_id?: string | null
          request_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_tenant_id_item_id_fkey"
            columns: ["tenant_id", "item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      ledger_allocations: {
        Row: {
          amount_minor: number
          entry_id: string
          id: string
          obligation_id: string
          tenant_id: string
        }
        Insert: {
          amount_minor: number
          entry_id: string
          id?: string
          obligation_id: string
          tenant_id: string
        }
        Update: {
          amount_minor?: number
          entry_id?: string
          id?: string
          obligation_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ledger_allocations_tenant_id_entry_id_fkey"
            columns: ["tenant_id", "entry_id"]
            isOneToOne: false
            referencedRelation: "ledger_entries"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "ledger_allocations_tenant_id_obligation_id_fkey"
            columns: ["tenant_id", "obligation_id"]
            isOneToOne: false
            referencedRelation: "obligations"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      ledger_entries: {
        Row: {
          amount_minor: number
          created_at: string
          created_by: string
          id: string
          kind: string
          method: string | null
          reference: string | null
          request_id: string
          reverses_id: string | null
          tenant_id: string
        }
        Insert: {
          amount_minor: number
          created_at?: string
          created_by: string
          id?: string
          kind: string
          method?: string | null
          reference?: string | null
          request_id: string
          reverses_id?: string | null
          tenant_id: string
        }
        Update: {
          amount_minor?: number
          created_at?: string
          created_by?: string
          id?: string
          kind?: string
          method?: string | null
          reference?: string | null
          request_id?: string
          reverses_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_reverses_id_fkey"
            columns: ["reverses_id"]
            isOneToOne: false
            referencedRelation: "ledger_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      master_control_contexts: {
        Row: {
          actor_id: string
          ended_at: string | null
          id: string
          reason: string
          request_id: string
          started_at: string
          tenant_id: string
          version: number
        }
        Insert: {
          actor_id: string
          ended_at?: string | null
          id?: string
          reason: string
          request_id: string
          started_at?: string
          tenant_id: string
          version?: number
        }
        Update: {
          actor_id?: string
          ended_at?: string | null
          id?: string
          reason?: string
          request_id?: string
          started_at?: string
          tenant_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "master_control_contexts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          active: boolean
          created_at: string
          role: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          role: string
          tenant_id: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          role?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          active: boolean
          body: string
          channel: string
          code: string
          id: string
          tenant_id: string
        }
        Insert: {
          active?: boolean
          body: string
          channel: string
          code: string
          id?: string
          tenant_id: string
        }
        Update: {
          active?: boolean
          body?: string
          channel?: string
          code?: string
          id?: string
          tenant_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          author_id: string
          body: string
          conversation_id: string
          created_at: string
          id: string
          request_id: string
          status: string
          tenant_id: string
        }
        Insert: {
          author_id: string
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          request_id: string
          status?: string
          tenant_id: string
        }
        Update: {
          author_id?: string
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          request_id?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_tenant_id_conversation_id_fkey"
            columns: ["tenant_id", "conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      obligations: {
        Row: {
          amount_minor: number
          created_at: string
          currency: string
          id: string
          kind: string
          repair_id: string | null
          status: string
          tenant_id: string
        }
        Insert: {
          amount_minor: number
          created_at?: string
          currency?: string
          id?: string
          kind: string
          repair_id?: string | null
          status?: string
          tenant_id: string
        }
        Update: {
          amount_minor?: number
          created_at?: string
          currency?: string
          id?: string
          kind?: string
          repair_id?: string | null
          status?: string
          tenant_id?: string
        }
        Relationships: []
      }
      onboarding_drafts: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string
          finalize_request_id: string | null
          id: string
          request_id: string
          snapshot: Json
          status: string
          step: string
          tenant_id: string | null
          updated_at: string
          version: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by: string
          finalize_request_id?: string | null
          id?: string
          request_id: string
          snapshot?: Json
          status?: string
          step?: string
          tenant_id?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string
          finalize_request_id?: string | null
          id?: string
          request_id?: string
          snapshot?: Json
          status?: string
          step?: string
          tenant_id?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_drafts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_jobs: {
        Row: {
          available_at: string
          completed_at: string | null
          created_at: string
          id: string
          kind: string
          operation_id: string
          requested_by: string
          status: string
          tenant_id: string
        }
        Insert: {
          available_at?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          kind: string
          operation_id: string
          requested_by: string
          status?: string
          tenant_id: string
        }
        Update: {
          available_at?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          kind?: string
          operation_id?: string
          requested_by?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "operation_jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operation_jobs_tenant_id_requested_by_fkey"
            columns: ["tenant_id", "requested_by"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["tenant_id", "user_id"]
          },
        ]
      }
      operation_receipts: {
        Row: {
          created_by: string
          error_code: string | null
          id: string
          kind: string
          operation_id: string
          resource_id: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_by: string
          error_code?: string | null
          id?: string
          kind: string
          operation_id: string
          resource_id?: string | null
          status: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_by?: string
          error_code?: string | null
          id?: string
          kind?: string
          operation_id?: string
          resource_id?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_evidence: {
        Row: {
          byte_size: number
          captured_at: string
          captured_by: string
          content_type: string
          id: string
          kind: string
          object_path: string
          repair_id: string
          tenant_id: string
        }
        Insert: {
          byte_size: number
          captured_at?: string
          captured_by: string
          content_type: string
          id?: string
          kind: string
          object_path: string
          repair_id: string
          tenant_id: string
        }
        Update: {
          byte_size?: number
          captured_at?: string
          captured_by?: string
          content_type?: string
          id?: string
          kind?: string
          object_path?: string
          repair_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_evidence_tenant_id_repair_id_fkey"
            columns: ["tenant_id", "repair_id"]
            isOneToOne: false
            referencedRelation: "advisor_work_queue"
            referencedColumns: ["tenant_id", "repair_id"]
          },
          {
            foreignKeyName: "order_evidence_tenant_id_repair_id_fkey"
            columns: ["tenant_id", "repair_id"]
            isOneToOne: false
            referencedRelation: "repairs"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_minor: number
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          created_by: string
          currency: string
          id: string
          idempotency_key: string
          method: string
          repair_id: string
          status: string
          tenant_id: string
        }
        Insert: {
          amount_minor: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by: string
          currency?: string
          id?: string
          idempotency_key: string
          method: string
          repair_id: string
          status?: string
          tenant_id: string
        }
        Update: {
          amount_minor?: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string
          currency?: string
          id?: string
          idempotency_key?: string
          method?: string
          repair_id?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_tenant_id_repair_id_fkey"
            columns: ["tenant_id", "repair_id"]
            isOneToOne: false
            referencedRelation: "advisor_work_queue"
            referencedColumns: ["tenant_id", "repair_id"]
          },
          {
            foreignKeyName: "payments_tenant_id_repair_id_fkey"
            columns: ["tenant_id", "repair_id"]
            isOneToOne: false
            referencedRelation: "repairs"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      plan_versions: {
        Row: {
          currency: string
          effective_from: string
          entitlements: Json
          id: string
          plan_code: string
          price_minor: number | null
          version: number
        }
        Insert: {
          currency?: string
          effective_from: string
          entitlements: Json
          id?: string
          plan_code: string
          price_minor?: number | null
          version: number
        }
        Update: {
          currency?: string
          effective_from?: string
          entitlements?: Json
          id?: string
          plan_code?: string
          price_minor?: number | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "plan_versions_plan_code_fkey"
            columns: ["plan_code"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["code"]
          },
        ]
      }
      plans: {
        Row: {
          code: string
          currency: string
          entitlements: Json
          name: string
          price_minor: number | null
        }
        Insert: {
          code: string
          currency?: string
          entitlements: Json
          name: string
          price_minor?: number | null
        }
        Update: {
          code?: string
          currency?: string
          entitlements?: Json
          name?: string
          price_minor?: number | null
        }
        Relationships: []
      }
      public_catalog_items: {
        Row: {
          active: boolean
          description: string
          id: string
          kind: string
          name: string
          price_label: string | null
          sort_order: number
          tenant_id: string
          version: number
        }
        Insert: {
          active?: boolean
          description?: string
          id?: string
          kind: string
          name: string
          price_label?: string | null
          sort_order?: number
          tenant_id: string
          version?: number
        }
        Update: {
          active?: boolean
          description?: string
          id?: string
          kind?: string
          name?: string
          price_label?: string | null
          sort_order?: number
          tenant_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "public_catalog_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      qa_checks: {
        Row: {
          id: string
          label: string
          na_reason: string | null
          qa_run_id: string
          result: string
          tenant_id: string
        }
        Insert: {
          id?: string
          label: string
          na_reason?: string | null
          qa_run_id: string
          result: string
          tenant_id: string
        }
        Update: {
          id?: string
          label?: string
          na_reason?: string | null
          qa_run_id?: string
          result?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qa_checks_tenant_id_qa_run_id_fkey"
            columns: ["tenant_id", "qa_run_id"]
            isOneToOne: false
            referencedRelation: "qa_runs"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      qa_runs: {
        Row: {
          completed_at: string | null
          created_by: string
          id: string
          notes: string | null
          repair_id: string
          status: string
          tenant_id: string
          version: number
        }
        Insert: {
          completed_at?: string | null
          created_by: string
          id?: string
          notes?: string | null
          repair_id: string
          status?: string
          tenant_id: string
          version?: number
        }
        Update: {
          completed_at?: string | null
          created_by?: string
          id?: string
          notes?: string | null
          repair_id?: string
          status?: string
          tenant_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "qa_runs_tenant_id_repair_id_fkey"
            columns: ["tenant_id", "repair_id"]
            isOneToOne: false
            referencedRelation: "advisor_work_queue"
            referencedColumns: ["tenant_id", "repair_id"]
          },
          {
            foreignKeyName: "qa_runs_tenant_id_repair_id_fkey"
            columns: ["tenant_id", "repair_id"]
            isOneToOne: false
            referencedRelation: "repairs"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      quote_items: {
        Row: {
          id: string
          label: string
          quantity: number
          quote_id: string
          tenant_id: string
          unit_minor: number
        }
        Insert: {
          id?: string
          label: string
          quantity: number
          quote_id: string
          tenant_id: string
          unit_minor: number
        }
        Update: {
          id?: string
          label?: string
          quantity?: number
          quote_id?: string
          tenant_id?: string
          unit_minor?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_tenant_id_quote_id_fkey"
            columns: ["tenant_id", "quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      quote_responses: {
        Row: {
          actor_id: string
          created_at: string
          id: string
          quote_id: string
          request_id: string
          response: string
          tenant_id: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          id?: string
          quote_id: string
          request_id: string
          response: string
          tenant_id: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          id?: string
          quote_id?: string
          request_id?: string
          response?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_responses_tenant_id_quote_id_fkey"
            columns: ["tenant_id", "quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      quotes: {
        Row: {
          created_at: string
          created_by: string
          currency: string
          id: string
          published_at: string | null
          repair_id: string
          request_id: string
          responded_at: string | null
          revision: number
          status: string
          tenant_id: string
          total_minor: number
          valid_until: string | null
          version: number
        }
        Insert: {
          created_at?: string
          created_by: string
          currency?: string
          id?: string
          published_at?: string | null
          repair_id: string
          request_id: string
          responded_at?: string | null
          revision: number
          status?: string
          tenant_id: string
          total_minor?: number
          valid_until?: string | null
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string
          currency?: string
          id?: string
          published_at?: string | null
          repair_id?: string
          request_id?: string
          responded_at?: string | null
          revision?: number
          status?: string
          tenant_id?: string
          total_minor?: number
          valid_until?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotes_tenant_id_repair_id_fkey"
            columns: ["tenant_id", "repair_id"]
            isOneToOne: false
            referencedRelation: "advisor_work_queue"
            referencedColumns: ["tenant_id", "repair_id"]
          },
          {
            foreignKeyName: "quotes_tenant_id_repair_id_fkey"
            columns: ["tenant_id", "repair_id"]
            isOneToOne: false
            referencedRelation: "repairs"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      render_jobs: {
        Row: {
          attempts: number
          created_at: string
          document_id: string
          error_code: string | null
          format: string
          id: string
          status: string
          storage_path: string | null
          tenant_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          document_id: string
          error_code?: string | null
          format: string
          id?: string
          status?: string
          storage_path?: string | null
          tenant_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          document_id?: string
          error_code?: string | null
          format?: string
          id?: string
          status?: string
          storage_path?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "render_jobs_tenant_id_document_id_fkey"
            columns: ["tenant_id", "document_id"]
            isOneToOne: false
            referencedRelation: "document_snapshots"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      repair_events: {
        Row: {
          actor_id: string
          created_at: string
          id: string
          repair_id: string
          status: string
          tenant_id: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          id?: string
          repair_id: string
          status: string
          tenant_id: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          id?: string
          repair_id?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "repair_events_tenant_id_repair_id_fkey"
            columns: ["tenant_id", "repair_id"]
            isOneToOne: false
            referencedRelation: "advisor_work_queue"
            referencedColumns: ["tenant_id", "repair_id"]
          },
          {
            foreignKeyName: "repair_events_tenant_id_repair_id_fkey"
            columns: ["tenant_id", "repair_id"]
            isOneToOne: false
            referencedRelation: "repairs"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      repairs: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string
          customer_id: string
          device: string
          equipment_id: string | null
          id: string
          issue: string
          request_id: string
          status: string
          tenant_id: string
          updated_at: string
          version: number
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by: string
          customer_id: string
          device: string
          equipment_id?: string | null
          id?: string
          issue: string
          request_id: string
          status?: string
          tenant_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          customer_id?: string
          device?: string
          equipment_id?: string | null
          id?: string
          issue?: string
          request_id?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "repairs_equipment_fk"
            columns: ["tenant_id", "equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "repairs_tenant_id_assigned_to_fkey"
            columns: ["tenant_id", "assigned_to"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["tenant_id", "user_id"]
          },
          {
            foreignKeyName: "repairs_tenant_id_customer_id_fkey"
            columns: ["tenant_id", "customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "repairs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_charges: {
        Row: {
          amount_minor: number
          billing_cycle_id: string
          created_at: string
          currency: string
          id: string
          kind: string
          tenant_id: string
        }
        Insert: {
          amount_minor: number
          billing_cycle_id: string
          created_at?: string
          currency?: string
          id?: string
          kind: string
          tenant_id: string
        }
        Update: {
          amount_minor?: number
          billing_cycle_id?: string
          created_at?: string
          currency?: string
          id?: string
          kind?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saas_charges_billing_cycle_id_fkey"
            columns: ["billing_cycle_id"]
            isOneToOne: false
            referencedRelation: "billing_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_payments: {
        Row: {
          amount_minor: number
          billing_cycle_id: string
          created_at: string
          created_by: string
          id: string
          method: string
          reference: string | null
          request_id: string
          tenant_id: string
        }
        Insert: {
          amount_minor: number
          billing_cycle_id: string
          created_at?: string
          created_by: string
          id?: string
          method: string
          reference?: string | null
          request_id: string
          tenant_id: string
        }
        Update: {
          amount_minor?: number
          billing_cycle_id?: string
          created_at?: string
          created_by?: string
          id?: string
          method?: string
          reference?: string | null
          request_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saas_payments_billing_cycle_id_fkey"
            columns: ["billing_cycle_id"]
            isOneToOne: false
            referencedRelation: "billing_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          id: string
          item_id: string
          quantity: number
          sale_id: string
          tenant_id: string
          unit_minor: number
        }
        Insert: {
          id?: string
          item_id: string
          quantity: number
          sale_id: string
          tenant_id: string
          unit_minor: number
        }
        Update: {
          id?: string
          item_id?: string
          quantity?: number
          sale_id?: string
          tenant_id?: string
          unit_minor?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_tenant_id_item_id_fkey"
            columns: ["tenant_id", "item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "sale_items_tenant_id_sale_id_fkey"
            columns: ["tenant_id", "sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string
          created_by: string
          discount_authorized_by: string | null
          discount_minor: number
          id: string
          request_id: string
          status: string
          subtotal_minor: number
          tenant_id: string
          total_minor: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          discount_authorized_by?: string | null
          discount_minor?: number
          id?: string
          request_id: string
          status?: string
          subtotal_minor?: number
          tenant_id: string
          total_minor?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          discount_authorized_by?: string | null
          discount_minor?: number
          id?: string
          request_id?: string
          status?: string
          subtotal_minor?: number
          tenant_id?: string
          total_minor?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          current_period_end: string
          plan_code: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          current_period_end: string
          plan_code: string
          status: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          current_period_end?: string
          plan_code?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_code_fkey"
            columns: ["plan_code"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_files: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          status: string
          storage_key: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          status?: string
          storage_key: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          status?: string
          storage_key?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_files_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_files_tenant_id_owner_id_fkey"
            columns: ["tenant_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["tenant_id", "user_id"]
          },
        ]
      }
      tenant_public_profiles: {
        Row: {
          brand_name: string
          contact_text: string
          description: string
          headline: string
          published: boolean
          tenant_id: string
          updated_at: string
          version: number
        }
        Insert: {
          brand_name: string
          contact_text?: string
          description?: string
          headline?: string
          published?: boolean
          tenant_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          brand_name?: string
          contact_text?: string
          description?: string
          headline?: string
          published?: boolean
          tenant_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "tenant_public_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_restrictions: {
        Row: {
          allowed_routes: string[]
          mode: string
          reason: string
          tenant_id: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          allowed_routes?: string[]
          mode: string
          reason: string
          tenant_id: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          allowed_routes?: string[]
          mode?: string
          reason?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_restrictions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_route_changes: {
        Row: {
          actor_id: string
          assigned_slug: string
          created_at: string
          id: string
          previous_slug: string
          request_id: string
          result_version: number
          tenant_id: string
        }
        Insert: {
          actor_id: string
          assigned_slug: string
          created_at?: string
          id?: string
          previous_slug: string
          request_id: string
          result_version: number
          tenant_id: string
        }
        Update: {
          actor_id?: string
          assigned_slug?: string
          created_at?: string
          id?: string
          previous_slug?: string
          request_id?: string
          result_version?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_route_changes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_routes: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          redirect_to_slug: string | null
          slug: string
          status: string
          tenant_id: string
          version: number
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          redirect_to_slug?: string | null
          slug: string
          status: string
          tenant_id: string
          version?: number
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          redirect_to_slug?: string | null
          slug?: string
          status?: string
          tenant_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "tenant_routes_redirect_to_slug_fkey"
            columns: ["redirect_to_slug"]
            isOneToOne: false
            referencedRelation: "tenant_routes"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "tenant_routes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_settings: {
        Row: {
          locale: string
          public_contact: string | null
          public_page_enabled: boolean
          tenant_id: string
          timezone: string
          updated_at: string
        }
        Insert: {
          locale?: string
          public_contact?: string | null
          public_page_enabled?: boolean
          tenant_id: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          locale?: string
          public_contact?: string | null
          public_page_enabled?: boolean
          tenant_id?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          name: string
          provision_request_id: string | null
          slug: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          provision_request_id?: string | null
          slug: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          provision_request_id?: string | null
          slug?: string
          status?: string
        }
        Relationships: []
      }
      vouchers: {
        Row: {
          created_at: string
          id: string
          kind: string
          payment_id: string | null
          repair_id: string
          schema_version: number
          snapshot: Json
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          payment_id?: string | null
          repair_id: string
          schema_version?: number
          snapshot: Json
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          payment_id?: string | null
          repair_id?: string
          schema_version?: number
          snapshot?: Json
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vouchers_tenant_id_payment_id_fkey"
            columns: ["tenant_id", "payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "vouchers_tenant_id_repair_id_fkey"
            columns: ["tenant_id", "repair_id"]
            isOneToOne: false
            referencedRelation: "advisor_work_queue"
            referencedColumns: ["tenant_id", "repair_id"]
          },
          {
            foreignKeyName: "vouchers_tenant_id_repair_id_fkey"
            columns: ["tenant_id", "repair_id"]
            isOneToOne: false
            referencedRelation: "repairs"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
    }
    Views: {
      advisor_work_queue: {
        Row: {
          created_at: string | null
          customer_name: string | null
          customer_phone: string | null
          device: string | null
          repair_id: string | null
          status: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repairs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_kpis: {
        Row: {
          completed_count: number | null
          open_count: number | null
          repair_count: number | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repairs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_identity_invitation: {
        Args: { p_expected_version: number; p_invitation: string }
        Returns: number
      }
      activate_invited_membership: {
        Args: {
          p_expected_version: number
          p_invitation: string
          p_tenant: string
        }
        Returns: number
      }
      assign_technician: {
        Args: { p_repair: string; p_tenant: string; p_user: string }
        Returns: undefined
      }
      assign_tenant_slug: {
        Args: {
          p_expected_version: number
          p_request_id: string
          p_slug: string
          p_tenant: string
        }
        Returns: number
      }
      attach_order_evidence: {
        Args: {
          p_kind: string
          p_path: string
          p_repair: string
          p_size: number
          p_tenant: string
          p_type: string
        }
        Returns: string
      }
      complete_qa: {
        Args: {
          p_checks: Json
          p_notes: string
          p_repair: string
          p_tenant: string
        }
        Returns: string
      }
      confirm_delivery: {
        Args: {
          p_notes: string
          p_operation_id: string
          p_recipient: string
          p_repair: string
          p_tenant: string
        }
        Returns: string
      }
      confirm_intake: {
        Args: {
          p_accessories: string
          p_condition: string
          p_expected_version: number
          p_operation_id: string
          p_repair: string
          p_tenant: string
        }
        Returns: string
      }
      confirm_payment: {
        Args: { p_payment: string; p_tenant: string }
        Returns: string
      }
      create_customer: {
        Args: { p_name: string; p_phone: string; p_tenant: string }
        Returns: string
      }
      create_customer_repair_request: {
        Args: {
          p_device: string
          p_issue: string
          p_request_id: string
          p_tenant: string
        }
        Returns: string
      }
      create_customer_repair_request_v2: {
        Args: {
          p_device: string
          p_equipment: string | null
          p_issue: string
          p_request_id: string
          p_tenant: string
        }
        Returns: string
      }
      create_equipment: {
        Args: {
          p_brand: string
          p_customer: string
          p_kind: string
          p_model: string
          p_notes: string
          p_serial: string
          p_tenant: string
        }
        Returns: string
      }
      create_identity_invitation: {
        Args: {
          p_email: string
          p_expires_at: string
          p_request_id: string
          p_role: string
          p_tenant: string
        }
        Returns: string
      }
      create_onboarding_draft: {
        Args: { p_request_id: string }
        Returns: string
      }
      create_quote: {
        Args: {
          p_items: Json
          p_repair: string
          p_request_id: string
          p_tenant: string
          p_valid_until: string
        }
        Returns: string
      }
      create_repair: {
        Args: {
          p_customer: string
          p_device: string
          p_issue: string
          p_request_id: string
          p_tenant: string
        }
        Returns: string
      }
      end_master_control_context: {
        Args: {
          p_context: string
          p_expected_version: number
          p_tenant: string
        }
        Returns: number
      }
      finalize_onboarding_draft: {
        Args: {
          p_draft: string
          p_expected_version: number
          p_request_id: string
        }
        Returns: string
      }
      get_public_catalog: {
        Args: { p_kind: string; p_slug: string }
        Returns: {
          description: string
          id: string
          kind: string
          name: string
          price_label: string
        }[]
      }
      get_public_profile: {
        Args: { p_slug: string }
        Returns: {
          brand_name: string
          contact_text: string
          current_slug: string
          description: string
          headline: string
          requested_status: string
          tenant_id: string
        }[]
      }
      grant_delegation: {
        Args: {
          p_expires_at: string
          p_grantee: string
          p_permission: string
          p_request_id: string
          p_resource: string
          p_tenant: string
        }
        Returns: string
      }
      has_delegation: {
        Args: { p_permission: string; p_resource?: string; p_tenant: string }
        Returns: boolean
      }
      has_master_control_context: {
        Args: { p_context: string; p_tenant: string }
        Returns: boolean
      }
      has_platform_access: { Args: never; Returns: boolean }
      is_platform_admin: { Args: never; Returns: boolean }
      link_customer: {
        Args: { p_customer: string; p_tenant: string; p_user: string }
        Returns: undefined
      }
      list_team_members: {
        Args: { p_tenant: string }
        Returns: {
          active: boolean
          display_name: string
          role: string
          user_id: string
        }[]
      }
      list_verified_users: {
        Args: never
        Returns: {
          display_name: string
          email: string
          user_id: string
        }[]
      }
      move_inventory: {
        Args: {
          p_item: string
          p_kind: string
          p_quantity: number
          p_repair?: string
          p_request: string
          p_tenant: string
        }
        Returns: string
      }
      provision_tenant: {
        Args: {
          p_admin: string
          p_name: string
          p_period_end: string
          p_slug: string
        }
        Returns: string
      }
      provision_tenant_v2: {
        Args: {
          p_admin: string
          p_name: string
          p_period_end: string
          p_request_id: string
          p_slug: string
        }
        Returns: string
      }
      publish_quote: {
        Args: { p_expected_version: number; p_quote: string; p_tenant: string }
        Returns: number
      }
      record_payment: {
        Args: {
          p_amount: number
          p_idempotency_key: string
          p_method: string
          p_repair: string
          p_tenant: string
        }
        Returns: string
      }
      resolve_tenant_slug: {
        Args: { p_slug: string }
        Returns: {
          status: string
          target_slug: string
          tenant_id: string
        }[]
      }
      respond_quote: {
        Args: {
          p_quote: string
          p_request_id: string
          p_response: string
          p_tenant: string
        }
        Returns: string
      }
      revoke_delegation: {
        Args: {
          p_delegation: string
          p_expected_version: number
          p_tenant: string
        }
        Returns: number
      }
      revoke_identity_invitation: {
        Args: {
          p_expected_version: number
          p_invitation: string
          p_tenant: string
        }
        Returns: number
      }
      save_diagnostic: {
        Args: { p_repair: string; p_summary: string; p_tenant: string }
        Returns: string
      }
      send_repair_message: {
        Args: {
          p_body: string
          p_repair: string
          p_request_id: string
          p_tenant: string
        }
        Returns: string
      }
      set_membership: {
        Args: {
          p_active: boolean
          p_role: string
          p_tenant: string
          p_user: string
        }
        Returns: undefined
      }
      set_public_profile: {
        Args: {
          p_brand: string
          p_contact: string
          p_description: string
          p_expected_version: number
          p_headline: string
          p_published: boolean
          p_tenant: string
        }
        Returns: number
      }
      set_tenant_status: {
        Args: { p_reason: string; p_status: string; p_tenant: string }
        Returns: undefined
      }
      start_master_control_context: {
        Args: { p_reason: string; p_request_id: string; p_tenant: string }
        Returns: string
      }
      tenant_operational: { Args: { p_tenant: string }; Returns: boolean }
      tenant_slug_available: { Args: { p_slug: string }; Returns: boolean }
      transition_repair: {
        Args: {
          p_expected_version: number
          p_repair: string
          p_status: string
          p_tenant: string
        }
        Returns: number
      }
      update_onboarding_draft: {
        Args: {
          p_draft: string
          p_expected_version: number
          p_patch: Json
          p_step: string
        }
        Returns: number
      }
      upsert_catalog_item: {
        Args: {
          p_active: boolean
          p_description: string
          p_expected_version: number
          p_item: string
          p_kind: string
          p_name: string
          p_price_label: string
          p_sort: number
          p_tenant: string
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
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
