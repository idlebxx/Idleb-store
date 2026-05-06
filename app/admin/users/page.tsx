'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, ShieldOff, Loader2 } from 'lucide-react'

interface User {
  id: string
  username: string | null
  email: string
  phone: string | null
  balance: number
  is_admin: boolean
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const supabase = createClient()
    
    // Get profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    // Get auth users emails (need to use admin API or join)
    if (profiles) {
      const usersWithEmail = await Promise.all(
        profiles.map(async (profile) => {
          const { data: { user } } = await supabase.auth.admin.getUserById(profile.id)
          return {
            ...profile,
            email: user?.email || ''
          }
        })
      )
      setUsers(usersWithEmail)
    }
    
    setLoading(false)
  }

  const toggleAdmin = async (id: string, currentIsAdmin: boolean) => {
    const supabase = createClient()
    await supabase
      .from('profiles')
      .update({ is_admin: !currentIsAdmin })
      .eq('id', id)
    fetchUsers()
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
      <h1 className="text-2xl font-bold mb-6">إدارة المستخدمين</h1>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="text-right p-3">اسم المستخدم</th>
                <th className="text-right p-3">البريد الإلكتروني</th>
                <th className="text-right p-3">رقم الهاتف</th>
                <th className="text-right p-3">الرصيد</th>
                <th className="text-right p-3">الصلاحية</th>
                <th className="text-right p-3">تاريخ التسجيل</th>
                <th className="text-right p-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-muted-foreground">
                    لا توجد مستخدمين
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">{user.username || '-'}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.phone || '-'}</td>
                    <td className="p-3">{user.balance} ₽</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.is_admin 
                          ? 'bg-purple-500/10 text-purple-500' 
                          : 'bg-gray-500/10 text-gray-500'
                      }`}>
                        {user.is_admin ? 'مدير' : 'مستخدم'}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      {new Date(user.created_at).toLocaleDateString('ar')}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleAdmin(user.id, user.is_admin)}
                        className={`p-1 rounded transition-colors ${
                          user.is_admin 
                            ? 'text-red-500 hover:bg-red-500/10' 
                            : 'text-purple-500 hover:bg-purple-500/10'
                        }`}
                        title={user.is_admin ? 'إزالة صلاحية المدير' : 'جعل مدير'}
                      >
                        {user.is_admin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </button>
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
