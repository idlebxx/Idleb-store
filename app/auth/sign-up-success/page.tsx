import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="grid-bg" />

      <div className="login-form text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary" />
        </div>

        <h1 className="login-heading">تم إرسال رسالة التأكيد</h1>

        <p className="text-muted-foreground mb-6">
          يرجى التحقق من بريدك الإلكتروني والضغط على رابط التأكيد لتفعيل حسابك.
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
