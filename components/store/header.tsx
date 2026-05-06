'use client'

import Link from 'next/link'
import { Shield, User, LogOut, Wallet, ShoppingBag } from 'lucide-react'
import type { Profile } from '@/lib/types'

interface HeaderProps {
  user: { email: string } | null
  profile: Profile | null
  onLogout: () => void
}

export function Header({ user, profile, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-bold">CyberSec Store</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {profile && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    {profile.balance.toLocaleString()} SYP
                  </span>
                </div>
              )}

              <Link
                href="/orders"
                className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="text-sm">طلباتي</span>
              </Link>

              <Link
                href="/balance"
                className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <Wallet className="w-4 h-4" />
                <span className="text-sm">شحن الرصيد</span>
              </Link>

              <button
                onClick={onLogout}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="تسجيل الخروج"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <User className="w-4 h-4" />
              تسجيل الدخول
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
