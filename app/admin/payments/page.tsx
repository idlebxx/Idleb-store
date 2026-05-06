'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface Payment {
  id: string
  user_id: string
  amount: number
  receipt_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  created_at: string
  profiles?: { username: string | null }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('payments')
      .select('*, profiles(username)')
      .order('created_at', { ascending: false })
    
    if (data) setPayments(data)
    setLoading(false)
  }

  const updateStatus = async (id: string, newStatus: 'approved' | 'rejected', notes?: string) => {
    const supabase = createClient()
    
    if (newStatus === 'approved') {
      // Get payment amount and user
      const payment = payments.find(p => p.id === id)
      if (payment) {
        // Update user balance
        const { data: profile } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', payment.user_id)
          .single()
        
        if (profile) {
          await supabase
            .from('profiles')
            .update({ balance: (profile.balance || 0) + payment.amount })
            .eq('id', payment.user_id)
        }
      }
    }

    await supabase
      .from('payments')
      .update({ 
        status: newStatus,
        admin_notes: notes || null
      })
      .eq('id', id)
    fetchPayments()
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
      <h1 className="text-2xl font-bold mb-6">إدارة المدفوعات</h1>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="text-right p-3">المستخدم</th>
                <th className="text-right p-3">المبلغ</th>
                <th className="text-right p-3">إيصال الدفع</th>
                <th className="text-right p-3">الحالة</th>
                <th className="text-right p-3">تاريخ الإيداع</th>
                <th className="text-right p-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-muted-foreground">
                    لا توجد مدفوعات
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">{payment.profiles?.username || payment.user_id.slice(0, 8)}</td>
                    <td className="p-3">{payment.amount} ₽</td>
                    <td className="p-3">
                      {payment.receipt_url ? (
                        <a 
                          href={payment.receipt_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          عرض الإيصال
                        </a>
                      ) : '-'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        payment.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                        payment.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                        'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {payment.status === 'approved' ? 'موافق' :
                         payment.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      {new Date(payment.created_at).toLocaleDateString('ar')}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {payment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(payment.id, 'approved')}
                              className="p-1 text-green-500 hover:bg-green-500/10 rounded transition-colors"
                              title="موافقة"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const notes = prompt('سبب الرفض (اختياري):')
                                updateStatus(payment.id, 'rejected', notes || undefined)
                              }}
                              className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                              title="رفض"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
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
