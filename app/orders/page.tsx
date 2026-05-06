'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/store/header'
import type { Order, Profile } from '@/lib/types'
import {
  Loader2,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'

const statusConfig = {
  pending: {
    label: 'قيد الانتظار',
    icon: Clock,
    className: 'bg-yellow-500/10 text-yellow-500',
  },
  confirmed: {
    label: 'تم التأكيد',
    icon: AlertCircle,
    className: 'bg-blue-500/10 text-blue-500',
  },
  completed: {
    label: 'مكتمل',
    icon: CheckCircle,
    className: 'bg-green-500/10 text-green-500',
  },
  cancelled: {
    label: 'ملغي',
    icon: XCircle,
    className: 'bg-red-500/10 text-red-500',
  },
}

export default function OrdersPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/auth/login')
        return
      }

      setUser({ email: authUser.email || '' })

      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      // Fetch orders
      const response = await fetch('/api/orders')
      const data = await response.json()
      if (data.orders) {
        setOrders(data.orders)
      }

      setLoading(false)
    }

    loadData()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="grid-bg" />
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="grid-bg" />

      <Header user={user} profile={profile} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold">طلباتي</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">لا توجد طلبات</h2>
            <p className="text-muted-foreground mb-6">
              لم تقم بأي طلبات بعد
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status]
              const StatusIcon = status.icon

              return (
                <div
                  key={order.id}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {order.product_name}
                      </h3>
                      <p className="text-primary font-bold">
                        {order.product_price.toLocaleString()} SYP
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.className}`}
                    >
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{status.label}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">التواصل:</span>{' '}
                      {order.contact_info}
                    </div>
                    {order.notes && (
                      <div>
                        <span className="text-muted-foreground">ملاحظات:</span>{' '}
                        {order.notes}
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">التاريخ:</span>{' '}
                      {new Date(order.created_at).toLocaleDateString('ar-SY')}
                    </div>
                    <div>
                      <span className="text-muted-foreground">رقم الطلب:</span>{' '}
                      <span dir="ltr">{order.id.slice(0, 8)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
