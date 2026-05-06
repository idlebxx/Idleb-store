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

    const { productId, productName, productPrice, contactInfo, notes } =
      await request.json()

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        product_id: productId,
        product_name: productName,
        product_price: productPrice,
        contact_info: contactInfo,
        notes: notes || null,
        status: 'pending',
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // Send Telegram notification
    const telegramMessage = `
<b>🛒 طلب جديد!</b>

<b>المنتج:</b> ${productName}
<b>السعر:</b> ${productPrice.toLocaleString()} SYP

<b>معلومات التواصل:</b> ${contactInfo}
${notes ? `<b>ملاحظات:</b> ${notes}` : ''}

<b>البريد:</b> ${user.email}
<b>رقم الطلب:</b> ${order.id.slice(0, 8)}
<b>التاريخ:</b> ${new Date().toLocaleString('ar-SY')}
`

    // Send to Telegram (fire and forget)
    fetch(`${request.headers.get('origin')}/api/telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: telegramMessage }),
    }).catch(console.error)

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error creating order:', error)
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

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
