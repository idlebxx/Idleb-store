'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/store/header'
import type { Payment, Profile } from '@/lib/types'
import {
  Loader2,
  ArrowRight,
  Upload,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  Check,
} from 'lucide-react'

const statusConfig = {
  pending: {
    label: 'قيد المراجعة',
    icon: Clock,
    className: 'bg-yellow-500/10 text-yellow-500',
  },
  approved: {
    label: 'تمت الموافقة',
    icon: CheckCircle,
    className: 'bg-green-500/10 text-green-500',
  },
  rejected: {
    label: 'مرفوض',
    icon: XCircle,
    className: 'bg-red-500/10 text-red-500',
  },
}

export default function BalancePage() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [amount, setAmount] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  const shamcashNumber = process.env.NEXT_PUBLIC_SHAMCASH_NUMBER || 'غير محدد'

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

      // Fetch payments
      const response = await fetch('/api/payments')
      const data = await response.json()
      if (data.payments) {
        setPayments(data.payments)
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

  const handleCopy = () => {
    navigator.clipboard.writeText(shamcashNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!amount || parseFloat(amount) <= 0) {
      setError('يرجى إدخال مبلغ صحيح')
      return
    }

    if (!file) {
      setError('يرجى رفع إيصال الدفع')
      return
    }

    setSubmitting(true)

    try {
      // Upload receipt
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('فشل رفع الإيصال')
      }

      const { url } = await uploadResponse.json()

      // Create payment
      const paymentResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          receiptUrl: url,
        }),
      })

      if (!paymentResponse.ok) {
        throw new Error('فشل إنشاء طلب الشحن')
      }

      setSuccess(true)
      setAmount('')
      setFile(null)

      // Refresh payments
      const response = await fetch('/api/payments')
      const data = await response.json()
      if (data.payments) {
        setPayments(data.payments)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setSubmitting(false)
    }
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
          <h1 className="text-3xl font-bold">شحن الرصيد</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Balance & Form */}
          <div className="space-y-6">
            {/* Balance Card */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="w-6 h-6 text-primary" />
                <span className="text-muted-foreground">رصيدك الحالي</span>
              </div>
              <p className="text-4xl font-bold text-primary">
                {profile?.balance.toLocaleString() || 0} SYP
              </p>
            </div>

            {/* Payment Instructions */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">طريقة الشحن</h2>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <span>
                    حوّل المبلغ المطلوب إلى رقم شام كاش التالي:
                    <div className="flex items-center gap-2 mt-2 p-3 bg-muted rounded-lg">
                      <span className="font-mono font-bold text-foreground text-lg">
                        {shamcashNumber}
                      </span>
                      <button
                        onClick={handleCopy}
                        className="p-1.5 rounded hover:bg-background transition-colors"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <span>خذ سكرين شوت أو صورة للإيصال</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <span>ارفع الإيصال في النموذج أدناه</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  <span>سيتم إضافة الرصيد بعد التحقق من الدفع</span>
                </li>
              </ol>
            </div>

            {/* Recharge Form */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">إرسال طلب الشحن</h2>

              {success ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h3 className="text-xl font-semibold mb-2">تم الإرسال بنجاح</h3>
                  <p className="text-muted-foreground mb-4">
                    سيتم مراجعة طلبك وإضافة الرصيد قريبًا
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="px-6 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    إرسال طلب آخر
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      المبلغ (SYP)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="أدخل المبلغ الذي حوّلته"
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      dir="ltr"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      إيصال الدفع
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="receipt-upload"
                      />
                      <label
                        htmlFor="receipt-upload"
                        className="flex items-center justify-center gap-2 w-full px-4 py-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        <Upload className="w-6 h-6 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {file ? file.name : 'اضغط لرفع الإيصال'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {error && (
                    <p className="text-destructive text-sm text-center">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      'إرسال طلب الشحن'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Payment History */}
          <div>
            <h2 className="text-lg font-semibold mb-4">سجل الشحن</h2>

            {payments.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  لم تقم بأي عمليات شحن بعد
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => {
                  const status = statusConfig[payment.status]
                  const StatusIcon = status.icon

                  return (
                    <div
                      key={payment.id}
                      className="bg-card border border-border rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xl font-bold">
                          {payment.amount.toLocaleString()} SYP
                        </span>
                        <div
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${status.className}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleString('ar-SY')}
                      </div>
                      {payment.admin_notes && (
                        <div className="mt-2 text-sm p-2 bg-muted rounded">
                          <span className="font-medium">ملاحظة:</span>{' '}
                          {payment.admin_notes}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
