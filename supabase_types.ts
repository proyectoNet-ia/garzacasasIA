export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          role: 'admin' | 'agent' | 'user' | null
          avatar_url: string | null
          bio: string | null
          company_name: string | null
          phone: string | null
          whatsapp: string | null
          subscription_plan: string | null
          subscription_status: 'active' | 'pending' | 'cancelled' | 'expired' | null
          subscription_expires_at: string | null
          is_unlimited: boolean | null
          paypal_payer_id: string | null
          paypal_subscription_id: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string }
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
      properties: {
        Row: {
          id: string
          agent_id: string
          title: string
          description: string | null
          price: number
          property_type: string
          listing_type: 'venta' | 'renta' | null
          status: 'active' | 'draft' | 'sold' | 'archived'
          location: string
          bedrooms: number | null
          bathrooms: number | null
          area_m2: number | null
          main_image_url: string | null
          images: string[] | null
          latitude: number | null
          longitude: number | null
          municipio_clave: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['properties']['Row']> & {
          agent_id: string
          title: string
          price: number
        }
        Update: Partial<Database['public']['Tables']['properties']['Row']>
      }
      subscriptions_config: {
        Row: {
          id: string
          name: string
          monthly_price: number
          yearly_price: number | null
          priority: number | null
          properties_limit: number
          images_per_property: number
          is_popular: boolean
          has_ai_analysis: boolean
          has_priority_support: boolean
          cta_type: 'register' | 'checkout' | 'contact'
          cta_label: string
          cta_url: string | null
          features: Json
          created_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['subscriptions_config']['Row']> & { name: string }
        Update: Partial<Database['public']['Tables']['subscriptions_config']['Row']>
      }
      payments: {
        Row: {
          id: string
          user_id: string
          plan_id: string | null
          plan_name: string
          amount: number
          currency: string
          status: 'pending' | 'approved' | 'completed' | 'rejected' | 'refunded' | 'cancelled' | 'in_process'
          gateway: string | null
          payment_method: string | null
          paypal_order_id: string | null
          paypal_capture_id: string | null
          paypal_payer_id: string | null
          mp_preference_id: string | null
          mp_external_reference: string | null
          billing_period: 'monthly' | 'yearly'
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['payments']['Row']> & {
          user_id: string
          plan_name: string
          amount: number
        }
        Update: Partial<Database['public']['Tables']['payments']['Row']>
      }
      site_settings: {
        Row: {
          id: number
          hero_title: string | null
          hero_subtitle: string | null
          hero_image_url: string | null
          contact_phone: string | null
          contact_email: string | null
          contact_whatsapp: string | null
          social_instagram: string | null
          social_facebook: string | null
          social_linkedin: string | null
          social_twitter: string | null
          social_youtube: string | null
          seo_title: string | null
          seo_description: string | null
          seo_keywords: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['site_settings']['Row']>
        Update: Partial<Database['public']['Tables']['site_settings']['Row']>
      }
      inegi_cache: {
        Row: {
          id: string
          cache_key: string
          data: Json
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          cache_key: string
          data: Json
          expires_at: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['inegi_cache']['Row']>
      }
      support_tickets: {
        Row: {
          id: string
          agent_id: string
          subject: string
          description: string
          priority: 'standard' | 'priority'
          status: 'open' | 'in_progress' | 'resolved' | 'closed'
          category: 'general' | 'technical' | 'billing' | 'property_ai' | 'other'
          last_message_at: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['support_tickets']['Row']> & {
          agent_id: string
          subject: string
          description: string
        }
        Update: Partial<Database['public']['Tables']['support_tickets']['Row']>
      }
    }
    Functions: {
      get_agent_plan_limits: {
        Args: { p_agent_id: string }
        Returns: {
          plan_name: string
          properties_limit: number
          images_per_property: number
          priority_tier: number
          has_ai_analysis: boolean
          has_advanced_stats: boolean
          has_priority_support: boolean
          has_featured_badge: boolean
          is_unlimited: boolean
        }[]
      }
      check_property_limit: {
        Args: { p_agent_id: string }
        Returns: {
          can_create: boolean
          current_count: number
          max_limit: number
          message: string
        }[]
      }
      update_user_subscription_after_payment: {
        Args: {
          p_user_id: string
          p_plan_name: string
          p_billing_period?: string
        }
        Returns: void
      }
      expire_overdue_subscriptions: {
        Args: Record<string, never>
        Returns: number
      }
    }
  }
}
