'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Lock, Mail } from 'lucide-react'

const ADMIN_EMAIL = 'abnadleb08@gmail.com'
const ADMIN_PASSWORD = 'sham20066shamgmail.com'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem('admin_logged_in', 'true')
      localStorage.setItem('admin_email', email)
      router.push('/admin/dashboard')
    } else {
      setError('بيانات الدخول غير صحيحة')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 w-full max-w-md shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-blue-600/20 rounded-full border border-blue-500/30">
            <Shield className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-white mb-2">لوحة التحكم</h1>
        <p className="text-center text-gray-400 text-sm mb-8">أدخل بيانات الدخول الخاصة بك</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>
          </div>
          
          <div>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white transition duration-200 disabled:opacity-50"
          >
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>
        
        <p className="text-center text-gray-500 text-xs mt-6">
          هذا الدخول مخصص للمدير فقط
        </p>
      </div>
    </div>
  )
}
