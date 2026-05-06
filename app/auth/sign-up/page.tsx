'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, User, Phone, Send, Loader2 } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    phone: '',
    telegram: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    const { error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
        data: {
          username: formData.username,
          phone: formData.phone,
          telegram: formData.telegram,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/auth/sign-up-success')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="grid-bg" />

      <form onSubmit={handleSubmit} className="login-form">
        <h1 className="login-heading">إنشاء حساب</h1>

        <div className="login-input-container">
          <User className="login-input-icon w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            placeholder="اسم المستخدم"
            className="login-input"
            required
          />
        </div>

        <div className="login-input-container">
          <Mail className="login-input-icon w-4 h-4 text-muted-foreground" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="البريد الإلكتروني"
            className="login-input"
            required
            dir="ltr"
          />
        </div>

        <div className="login-input-container">
          <Lock className="login-input-icon w-4 h-4 text-muted-foreground" />
          <input
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="كلمة المرور"
            className="login-input"
            required
            minLength={6}
            dir="ltr"
          />
        </div>

        <div className="login-input-container">
          <Phone className="login-input-icon w-4 h-4 text-muted-foreground" />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="رقم الهاتف"
            className="login-input"
            dir="ltr"
          />
        </div>

        <div className="login-input-container">
          <Send className="login-input-icon w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={formData.telegram}
            onChange={(e) =>
              setFormData({ ...formData, telegram: e.target.value })
            }
            placeholder="حساب التيلجرام (اختياري)"
            className="login-input"
            dir="ltr"
          />
        </div>

        {error && (
          <p className="text-destructive text-sm text-center w-full">{error}</p>
        )}

        <button type="submit" disabled={loading} className="login-button">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري التحميل...
            </span>
          ) : (
            'إنشاء الحساب'
          )}
        </button>

        <div className="login-signup-container">
          <p>لديك حساب بالفعل؟</p>
          <Link href="/auth/login">تسجيل الدخول</Link>
        </div>
      </form>
    </div>
  )
}
