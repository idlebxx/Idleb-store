import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, receiptUrl } = await request.json()

    // Create payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        amount,
        receipt_url: receiptUrl,
        status: 'pending',
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Payment creation error:', paymentError)
      return NextResponse.json(
        { error: 'Failed to create payment' },
        { status: 500 }
      )
    }

    // Send Telegram notification
    const telegramMessage = `
<b>💰 طلب شحن رصيد جديد!</b>

<b>المبلغ:</b> ${amount.toLocaleString()} SYP
<b>البريد:</b> ${user.email}
<b>رقم العملية:</b> ${payment.id.slice(0, 8)}

<b>رابط الإيصال:</b>
${receiptUrl}

<b>التاريخ:</b> ${new Date().toLocaleString('ar-SY')}
`

    // Send to Telegram
    fetch(`${request.headers.get('origin')}/api/telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: telegramMessage }),
    }).catch(console.error)

    return NextResponse.json({ payment })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching payments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch payments' },
        { status: 500 }
      )
    }

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
