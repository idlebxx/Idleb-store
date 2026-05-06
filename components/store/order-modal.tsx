'use client'

import { useState } from 'react'
import type { Product } from '@/lib/types'
import { X, User, MessageCircle, FileText, Loader2 } from 'lucide-react'

interface OrderModalProps {
  product: Product
  onClose: () => void
  onSubmit: (data: {
    contactInfo: string
    notes: string
  }) => Promise<void>
}

export function OrderModal({ product, onClose, onSubmit }: OrderModalProps) {
  const [contactInfo, setContactInfo] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactInfo.trim()) {
      setError('يرجى إدخال معلومات التواصل')
      return
    }

    setLoading(true)
    setError('')

    try {
      await onSubmit({ contactInfo, notes })
    } catch {
      setError('حدث خطأ أثناء إرسال الطلب')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-2">طلب المنتج</h2>
        <div className="flex items-center gap-3 mb-6 p-3 bg-muted rounded-lg">
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-primary text-lg font-bold">
                {product.name[0]}
              </span>
            )}
          </div>
          <div>
            <p className="font-semibold">{product.name}</p>
            <p className="text-primary font-bold">
              {product.price.toLocaleString()} SYP
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              معلومات التواصل *
            </label>
            <div className="relative">
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="رقم الهاتف أو حساب التيلجرام"
                className="w-full px-4 py-3 pr-10 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                dir="rtl"
              />
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              ملاحظات إضافية
            </label>
            <div className="relative">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="اكتب أي تفاصيل إضافية عن طلبك..."
                rows={3}
                className="w-full px-4 py-3 pr-10 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                dir="rtl"
              />
              <FileText className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4" />
                إرسال الطلب
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
