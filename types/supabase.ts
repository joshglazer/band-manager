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
      band_members: {
        Row: {
          band_id: number
          created_at: string
          id: number
          instrument: string | null
          user_id: string
        }
        Insert: {
          band_id: number
          created_at?: string
          id?: number
          instrument?: string | null
          user_id: string
        }
        Update: {
          band_id?: number
          created_at?: string
          id?: number
          instrument?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "band_members_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "band_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bands: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      comment_types: {
        Row: {
          created_at: string
          id: number
          label: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          label?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          label?: string | null
        }
        Relationships: []
      }
      setlist_songs: {
        Row: {
          created_at: string
          id: number
          set: number
          set_weight: number
          setlist_id: number
          song_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          set: number
          set_weight: number
          setlist_id: number
          song_id: number
        }
        Update: {
          created_at?: string
          id?: number
          set?: number
          set_weight?: number
          setlist_id?: number
          song_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "setlist_songs_setlist_id_fkey"
            columns: ["setlist_id"]
            isOneToOne: false
            referencedRelation: "setlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "setlist_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      setlists: {
        Row: {
          band_id: number
          created_at: string
          id: number
          name: string | null
        }
        Insert: {
          band_id: number
          created_at?: string
          id?: number
          name?: string | null
        }
        Update: {
          band_id?: number
          created_at?: string
          id?: number
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "setlists_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
        ]
      }
      song_comments: {
        Row: {
          comment: string | null
          comment_type_id: number | null
          created_at: string
          id: number
          song_id: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          comment_type_id?: number | null
          created_at?: string
          id?: number
          song_id: number
          user_id: string
        }
        Update: {
          comment?: string | null
          comment_type_id?: number | null
          created_at?: string
          id?: number
          song_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_comments_comment_type_id_fkey"
            columns: ["comment_type_id"]
            isOneToOne: false
            referencedRelation: "comment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_comments_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      songs: {
        Row: {
          artist: string | null
          band_id: number
          created_at: string
          duration: number | null
          id: number
          name: string | null
        }
        Insert: {
          artist?: string | null
          band_id: number
          created_at?: string
          duration?: number | null
          id?: number
          name?: string | null
        }
        Update: {
          artist?: string | null
          band_id?: number
          created_at?: string
          duration?: number | null
          id?: number
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "songs_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          bio: string | null
          created_at: string
          first_name: string | null
          id: number
          last_name: string | null
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          first_name?: string | null
          id?: number
          last_name?: string | null
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          first_name?: string | null
          id?: number
          last_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_band_member: {
        Args: {
          band_id_arg: number
        }
        Returns: boolean
      }
    }
    Enums: {
      "Comment Type": "Instrument Setting" | "Instrument Tuning"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
