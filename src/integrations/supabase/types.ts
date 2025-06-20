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
      booking_notifications: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          user_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          user_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          car_id: number
          created_at: string
          id: string
          message_to_owner: string | null
          owner_id: string
          pickup_date: string
          renter_email: string
          renter_id: string
          renter_mobile: string
          renter_name: string
          return_date: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          car_id: number
          created_at?: string
          id?: string
          message_to_owner?: string | null
          owner_id: string
          pickup_date: string
          renter_email: string
          renter_id: string
          renter_mobile: string
          renter_name: string
          return_date: string
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          car_id?: number
          created_at?: string
          id?: string
          message_to_owner?: string | null
          owner_id?: string
          pickup_date?: string
          renter_email?: string
          renter_id?: string
          renter_mobile?: string
          renter_name?: string
          return_date?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      car_comments: {
        Row: {
          car_id: number
          content: string
          created_at: string
          id: string
          rating: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          car_id: number
          content: string
          created_at?: string
          id?: string
          rating?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          car_id?: number
          content?: string
          created_at?: string
          id?: string
          rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "car_comments_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "car_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      car_photos: {
        Row: {
          car_id: number
          created_at: string | null
          display_order: number | null
          id: string
          photo_url: string
        }
        Insert: {
          car_id: number
          created_at?: string | null
          display_order?: number | null
          id?: string
          photo_url: string
        }
        Update: {
          car_id?: number
          created_at?: string | null
          display_order?: number | null
          id?: string
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "car_photos_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          admin_notes: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          description: string | null
          id: number
          image_url: string | null
          is_available: boolean | null
          location: string | null
          owner_id: string
          price_per_day: number
          title: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          is_available?: boolean | null
          location?: string | null
          owner_id: string
          price_per_day: number
          title: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          is_available?: boolean | null
          location?: string | null
          owner_id?: string
          price_per_day?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          car_id: number
          created_at: string
          id: string
          owner_id: string
          renter_id: string
          updated_at: string
        }
        Insert: {
          car_id: number
          created_at?: string
          id?: string
          owner_id: string
          renter_id: string
          updated_at?: string
        }
        Update: {
          car_id?: number
          created_at?: string
          id?: string
          owner_id?: string
          renter_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      user_documents: {
        Row: {
          admin_notes: string | null
          created_at: string
          date_of_birth: string | null
          document_number: string
          document_type: Database["public"]["Enums"]["document_type"]
          document_url: string
          expiry_date: string | null
          full_name: string
          id: string
          is_mandatory: boolean | null
          issuing_authority: string | null
          nationality: string | null
          status: Database["public"]["Enums"]["verification_status"]
          updated_at: string
          user_id: string
          vehicle_id: number | null
          verification_category:
            | Database["public"]["Enums"]["verification_category"]
            | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          date_of_birth?: string | null
          document_number: string
          document_type: Database["public"]["Enums"]["document_type"]
          document_url: string
          expiry_date?: string | null
          full_name: string
          id?: string
          is_mandatory?: boolean | null
          issuing_authority?: string | null
          nationality?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          updated_at?: string
          user_id: string
          vehicle_id?: number | null
          verification_category?:
            | Database["public"]["Enums"]["verification_category"]
            | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          date_of_birth?: string | null
          document_number?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          document_url?: string
          expiry_date?: string | null
          full_name?: string
          id?: string
          is_mandatory?: boolean | null
          issuing_authority?: string | null
          nationality?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          updated_at?: string
          user_id?: string
          vehicle_id?: number | null
          verification_category?:
            | Database["public"]["Enums"]["verification_category"]
            | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      document_requirements: {
        Row: {
          description: string | null
          document_type: string | null
          is_mandatory: boolean | null
          user_type: Database["public"]["Enums"]["user_type"] | null
          verification_category: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_delete_user: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      get_car_photos: {
        Args: { car_id_param: number }
        Returns: {
          photo_url: string
          display_order: number
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      document_type:
        | "national_id"
        | "iqama"
        | "drivers_license"
        | "passport"
        | "car_registration"
        | "insurance_certificate"
        | "vehicle_inspection"
        | "selfie_with_id"
        | "bank_account_info"
        | "international_drivers_permit"
        | "visa"
      user_type: "car_owner" | "car_renter"
      verification_category:
        | "personal_identification"
        | "vehicle_documents"
        | "additional_verification"
        | "payment_verification"
      verification_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "user"],
      document_type: [
        "national_id",
        "iqama",
        "drivers_license",
        "passport",
        "car_registration",
        "insurance_certificate",
        "vehicle_inspection",
        "selfie_with_id",
        "bank_account_info",
        "international_drivers_permit",
        "visa",
      ],
      user_type: ["car_owner", "car_renter"],
      verification_category: [
        "personal_identification",
        "vehicle_documents",
        "additional_verification",
        "payment_verification",
      ],
      verification_status: ["pending", "approved", "rejected"],
    },
  },
} as const
