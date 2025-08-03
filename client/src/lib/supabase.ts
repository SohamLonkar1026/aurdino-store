import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

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