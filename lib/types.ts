export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  username: string | null
  phone: string | null
  telegram: string | null
  balance: number
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  product_id: string
  product_name: string
  product_price: number
  contact_info: string
  notes: string | null
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  amount: number
  receipt_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  created_at: string
  updated_at: string
}
