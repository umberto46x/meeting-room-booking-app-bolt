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
      rooms: {
        Row: {
          id: string
          name: string
          capacity: number
          floor: string
          equipment: string[]
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          capacity: number
          floor: string
          equipment?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          capacity?: number
          floor?: string
          equipment?: string[]
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          room_id: string
          user_id: string
          title: string
          description: string
          start_time: string
          end_time: string
          participants_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          title: string
          description?: string
          start_time: string
          end_time: string
          participants_count: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          title?: string
          description?: string
          start_time?: string
          end_time?: string
          participants_count?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
