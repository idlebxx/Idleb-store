import Link from 'next/link'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="grid-bg" />

      <div className="login-form text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>

        <h1 className="login-heading text-destructive">حدث خطأ</h1>

        <p className="text-muted-foreground mb-6">
          حدث خطأ أثناء عملية المصادقة. يرجى المحاولة مرة أخرى.
        </p>

        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          العودة لتسجيل الدخول
        </Link>
      </div>
    </div>
  )
}
