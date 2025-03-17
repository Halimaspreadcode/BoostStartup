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
      startups: {
        Row: {
          created_at: string | null
          diagnostic_results: string | null
          id: string
          name: string
          needs: string | null
          problems: string | null
          representative: string
          resources: Json | null
          sector: string
          solutions: string | null
          status: string
          timeline: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          diagnostic_results?: string | null
          id?: string
          name: string
          needs?: string | null
          problems?: string | null
          representative?: string
          resources?: Json | null
          sector: string
          solutions?: string | null
          status?: string
          timeline?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          diagnostic_results?: string | null
          id?: string
          name?: string
          needs?: string | null
          problems?: string | null
          representative?: string
          resources?: Json | null
          sector?: string
          solutions?: string | null
          status?: string
          timeline?: Json | null
          updated_at?: string | null
        }
      }
    }
  }
} 