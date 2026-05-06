'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, Loader2, Shield } from 'lucide-react'

// الإيميل والباسورد الثابت للمدير
const ADMIN_EMAIL = 'admin@cybersec.com'
const ADMIN_PASSWORD = 'Admin123456'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    // محاولة تسجيل الدخول
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // بعد تسجيل الدخول، نتحقق إذا كان المدير
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      router.push('/admin')
    } else {
      router.push('/')
    }
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="grid-bg" />

      <form onSubmit={handleSubmit} className="login-form">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Shield className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <h1 className="login-heading text-center">تسجيل الدخول</h1>
        <p className="text-center text-sm text-muted-foreground mb-6">
          متجر الأمن السيبراني
        </p>

        <div className="login-input-container">
          <Mail className="login-input-icon w-4 h-4 text-muted-foreground" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            className="login-input"
            required
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
            'دخول'
          )}
        </button>

        <div className="text-center text-xs text-muted-foreground mt-4">
          <p>للمدير فقط: admin@cybersec.com</p>
        </div>
      </form>
    </div>
  )
}
