import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { business_id } = await req.json()

    if (!business_id) {
      return NextResponse.json({ error: 'business_id가 필요합니다.' }, { status: 400 })
    }

    // 업체 정보 조회
    const { data: biz } = await supabase
      .from('businesses')
      .select('kor_name')
      .eq('id', business_id)
      .single()

    if (!biz) {
      return NextResponse.json({ error: '업체를 찾을 수 없습니다.' }, { status: 404 })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: '이동네 업체 등록',
              description: `${biz.kor_name} - 업체 등록비`,
            },
            unit_amount: 500, // $5.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.nextUrl.origin}/business-register/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/business-register`,
      metadata: {
        business_id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
