'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Package, 
  ShoppingCart, 
  Users, 
  CreditCard,
  TrendingUp,
  DollarSign
} from 'lucide-react'

interface Stats {
  products: number
  orders: number
  users: number
  payments: number
  totalRevenue: number
  pendingOrders: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    products: 0,
    orders: 0,
    users: 0,
    payments: 0,
    totalRevenue: 0,
    pendingOrders: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient()

      // Get products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Get orders count and revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('product_price, status')

      const totalRevenue = orders?.reduce((sum, o) => sum + (o.product_price || 0), 0) || 0
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0

      // Get users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Get payments count
      const { count: paymentsCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })

      setStats({
        products: productsCount || 0,
        orders: orders?.length || 0,
        users: usersCount || 0,
        payments: paymentsCount || 0,
        totalRevenue,
        pendingOrders
      })
      setLoading(false)
    }

    fetchStats()
  }, [])

  const cards = [
    { title: 'المنتجات', value: stats.products, icon: Package, color: 'bg-blue-500/10 text-blue-500' },
    { title: 'الطلبات', value: stats.orders, icon: ShoppingCart, color: 'bg-orange-500/10 text-orange-500' },
    { title: 'المستخدمين', value: stats.users, icon: Users, color: 'bg-green-500/10 text-green-500' },
    { title: 'المدفوعات', value: stats.payments, icon: CreditCard, color: 'bg-purple-500/10 text-purple-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">لوحة التحكم</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  {loading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded mt-1" />
                  ) : (
                    <p className="text-2xl font-bold">{card.value}</p>
                  )}
                </div>
                <div className={`p-3 rounded-full ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Revenue Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-green-500" />
            <h2 className="font-semibold">إجمالي الإيرادات</h2>
          </div>
          {loading ? (
            <div className="h-10 w-32 bg-muted animate-pulse rounded" />
          ) : (
            <p className="text-3xl font-bold">{stats.totalRevenue.toLocaleString()} ₽</p>
          )}
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h2 className="font-semibold">الطلبات المعلقة</h2>
          </div>
          {loading ? (
            <div className="h-10 w-16 bg-muted animate-pulse rounded" />
          ) : (
            <p className="text-3xl font-bold">{stats.pendingOrders}</p>
          )}
        </div>
      </div>
    </div>
  )
}
