import { createClient } from '@supabase/supabase-js'

// Use dummy values for Supabase (not actually used in this app)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dummy.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'dummy-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Order {
  id: number
  order_id: string
  full_name: string
  address: string
  mobile: string
  class_branch: string
  items: any[] | string
  total: number
  status: 'pending' | 'completed'
  created_at: string
}

export interface Contact {
  id: number
  name: string
  email: string
  message: string
  created_at: string
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
} 