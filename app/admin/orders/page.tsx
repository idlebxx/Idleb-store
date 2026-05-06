'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'

interface Order {
  id: string
  user_id: string
  product_name: string
  product_price: number
  contact_info: string
  notes: string | null
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
}

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  confirmed: 'bg-blue-500/10 text-blue-500',
  completed: 'bg-green-500/10 text-green-500',
  cancelled: 'bg-red-500/10 text-red-500'
}

const statusLabels = {
  pending: 'قيد الانتظار',
  confirmed: 'تم التأكيد',
  completed: 'مكتمل',
  cancelled: 'ملغي'
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setOrders(data)
    setLoading(false)
  }

  const updateStatus = async (id: string, newStatus: Order['status']) => {
    const supabase = createClient()
    await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id)
    fetchOrders()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">إدارة الطلبات</h1>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="text-right p-3">المنتج</th>
                <th className="text-right p-3">السعر</th>
                <th className="text-right p-3">معلومات الاتصال</th>
                <th className="text-right p-3">ملاحظات</th>
                <th className="text-right p-3">الحالة</th>
                <th className="text-right p-3">تاريخ الطلب</th>
                <th className="text-right p-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-muted-foreground">
                    لا توجد طلبات
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">{order.product_name}</td>
                    <td className="p-3">{order.product_price} ₽</td>
                    <td className="p-3">{order.contact_info}</td>
                    <td className="p-3 max-w-[200px] truncate">{order.notes || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      {new Date(order.created_at).toLocaleDateString('ar')}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateStatus(order.id, 'confirmed')}
                            className="p-1 text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                            title="تأكيد"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatus(order.id, 'completed')}
                            className="p-1 text-green-500 hover:bg-green-500/10 rounded transition-colors"
                            title="إكمال"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {(order.status === 'pending' || order.status === 'confirmed') && (
                          <button
                            onClick={() => updateStatus(order.id, 'cancelled')}
                            className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            title="إلغاء"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
