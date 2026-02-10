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
    public: {
        Tables: {
            brand_settings: {
                Row: {
                    announcement_color: string | null
                    announcement_text: string | null
                    brand_name: string | null
                    contact_email: string | null
                    google_analytics_id: string | null
                    hero_image_url: string | null
                    hero_subtitle: string | null
                    hero_title: string | null
                    id: string
                    instagram_url: string | null
                    logo_url: string | null
                    maintenance_mode: boolean | null
                    primary_color: string | null
                    site_description: string | null
                    site_title: string | null
                    tiktok_url: string | null
                    updated_at: string | null
                    usd_exchange_rate: number | null
                    whatsapp_number: string | null
                    whatsapp_template: string | null
                }
                Insert: {
                    announcement_color?: string | null
                    announcement_text?: string | null
                    brand_name?: string | null
                    contact_email?: string | null
                    google_analytics_id?: string | null
                    hero_image_url?: string | null
                    hero_subtitle?: string | null
                    hero_title?: string | null
                    id?: string
                    instagram_url?: string | null
                    logo_url?: string | null
                    maintenance_mode?: boolean | null
                    primary_color?: string | null
                    site_description?: string | null
                    site_title?: string | null
                    tiktok_url?: string | null
                    updated_at?: string | null
                    usd_exchange_rate?: number | null
                    whatsapp_number?: string | null
                    whatsapp_template?: string | null
                }
                Update: {
                    announcement_color?: string | null
                    announcement_text?: string | null
                    brand_name?: string | null
                    contact_email?: string | null
                    google_analytics_id?: string | null
                    hero_image_url?: string | null
                    hero_subtitle?: string | null
                    hero_title?: string | null
                    id?: string
                    instagram_url?: string | null
                    logo_url?: string | null
                    maintenance_mode?: boolean | null
                    primary_color?: string | null
                    site_description?: string | null
                    site_title?: string | null
                    tiktok_url?: string | null
                    updated_at?: string | null
                    usd_exchange_rate?: number | null
                    whatsapp_number?: string | null
                    whatsapp_template?: string | null
                }
                Relationships: []
            }
            products: {
                Row: {
                    badge: string | null
                    category: string | null
                    collection: string | null
                    created_at: string | null
                    description: string | null
                    id: string
                    images: string[] | null
                    name: string
                    price: number
                    status: string
                    stock: number | null
                    updated_at: string | null
                    variants: Json | null
                    whatsapp_clicks: number | null
                }
                Insert: {
                    badge?: string | null
                    category?: string | null
                    collection?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    images?: string[] | null
                    name: string
                    price: number
                    status?: string
                    stock?: number | null
                    updated_at?: string | null
                    variants?: Json | null
                    whatsapp_clicks?: number | null
                }
                Update: {
                    badge?: string | null
                    category?: string | null
                    collection?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    images?: string[] | null
                    name?: string
                    price?: number
                    status?: string
                    stock?: number | null
                    updated_at?: string | null
                    variants?: Json | null
                    whatsapp_clicks?: number | null
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    created_at: string
                    email: string | null
                    id: string
                    role: string | null
                }
                Insert: {
                    created_at?: string
                    email?: string | null
                    id: string
                    role?: string | null
                }
                Update: {
                    created_at?: string
                    email?: string | null
                    id?: string
                    role?: string | null
                }
                Relationships: []
            }
            transactions: {
                Row: {
                    amount: number
                    category: string | null
                    created_at: string
                    date: string | null
                    description: string
                    id: string
                    type: string
                }
                Insert: {
                    amount: number
                    category?: string | null
                    created_at?: string
                    date?: string | null
                    description: string
                    id?: string
                    type: string
                }
                Update: {
                    amount?: number
                    category?: string | null
                    created_at?: string
                    date?: string | null
                    description?: string
                    id?: string
                    type?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            increment_whatsapp_clicks: {
                Args: { product_id: string }
                Returns: undefined
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
        Enums: {},
    },
} as const
