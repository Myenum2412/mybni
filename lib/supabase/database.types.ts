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
      chapters: {
        Row: {
          id: number
          name: string
          region: string
          meeting_day: string
          meeting_time: string
          location: string
          president: string
          members: number
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          region: string
          meeting_day: string
          meeting_time: string
          location: string
          president: string
          members?: number
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          region?: string
          meeting_day?: string
          meeting_time?: string
          location?: string
          president?: string
          members?: number
          created_at?: string
        }
      }
      tyfcbs: {
        Row: {
          id: number
          chapter_id: number
          user_name: string
          thank_you_to: string
          amount: string
          business_type: string
          referral_type: string
          comments: string | null
          created_at: string
        }
        Insert: {
          id?: number
          chapter_id: number
          user_name: string
          thank_you_to: string
          amount: string
          business_type: string
          referral_type: string
          comments?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          chapter_id?: number
          user_name?: string
          thank_you_to?: string
          amount?: string
          business_type?: string
          referral_type?: string
          comments?: string | null
          created_at?: string
        }
      }
      referrals: {
        Row: {
          id: number
          chapter_id: number
          user_name: string
          referred_to: string
          referral_type: string
          referral_status: string
          referral: string
          telephone: string | null
          email: string | null
          address: string | null
          created_at: string
        }
        Insert: {
          id?: number
          chapter_id: number
          user_name: string
          referred_to: string
          referral_type: string
          referral_status: string
          referral: string
          telephone?: string | null
          email?: string | null
          address?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          chapter_id?: number
          user_name?: string
          to?: string
          referral_type?: string
          referral_status?: string
          referral?: string
          telephone?: string | null
          email?: string | null
          address?: string | null
          created_at?: string
        }
      }
      one_and_ones: {
        Row: {
          id: number
          chapter_id: number
          user_name: string
          met_with: string
          initiated_by: string
          where_did_you_meet: string
          date: string
          topics_of_conversation: string | null
          created_at: string
        }
        Insert: {
          id?: number
          chapter_id: number
          user_name: string
          met_with: string
          initiated_by?: string
          where_did_you_meet: string
          date: string
          topics_of_conversation?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          chapter_id?: number
          user_name?: string
          met_with?: string
          initiated_by?: string
          where_did_you_meet?: string
          date?: string
          topics_of_conversation?: string | null
          created_at?: string
        }
      }
      attendance: {
        Row: {
          id: number
          chapter_id: number
          member_name: string
          date: string
          status: string
          created_at: string
        }
        Insert: {
          id?: number
          chapter_id: number
          member_name: string
          date: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: number
          chapter_id?: number
          member_name?: string
          date?: string
          status?: string
          created_at?: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Chapter = Tables<'chapters'>
export type Tyfcb = Tables<'tyfcbs'>
export type Referral = Tables<'referrals'>
export type OneAndOne = Tables<'one_and_ones'>
export type Attendance = Tables<'attendance'>

export type TyfcbInsert = TablesInsert<'tyfcbs'>
export type ReferralInsert = TablesInsert<'referrals'>
export type OneAndOneInsert = TablesInsert<'one_and_ones'>
export type ChapterInsert = TablesInsert<'chapters'>
