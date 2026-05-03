import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const TOPIC_LABELS: Record<string, string> = {
  business_register: '업체 등록',
  plan_upgrade: '플랜 업그레이드',
  advertising: '광고/마케팅',
  web_development: '웹사이트 제작',
  partnership: '제휴/협업',
  bug_report: '오류/건의',
  account: '계정 관련',
  other: '기타',
}

export async function POST(request: Request) {
  try {
    const { name, email, phone, topic, message } = await request.json()

    if (!name || !email || !phone || !topic || !message) {
      return NextResponse.json({ error: '모든 필드를 입력해주세요' }, { status: 400 })
    }

    // 1. Save to Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error: dbError } = await supabase.from('inquiries').insert({
      name, email, phone, topic, message,
    })

    if (dbError) {
      console.error('DB insert error:', dbError)
      return NextResponse.json({ error: 'DB 저장 실패' }, { status: 500 })
    }

    // 2. Send email notification via Resend
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const topicLabel = TOPIC_LABELS[topic] || topic
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'onboarding@resend.dev',
            to: 'info@edongne.com',
            subject: `[이동네 문의] ${topicLabel} - ${name}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="border-bottom: 2px solid #000; padding-bottom: 10px;">새로운 문의가 접수되었습니다</h2>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr><td style="padding: 8px 0; color: #666; width: 80px;">주제</td><td style="padding: 8px 0; font-weight: bold;">${topicLabel}</td></tr>
                  <tr><td style="padding: 8px 0; color: #666;">이름</td><td style="padding: 8px 0;">${name}</td></tr>
                  <tr><td style="padding: 8px 0; color: #666;">이메일</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
                  <tr><td style="padding: 8px 0; color: #666;">전화</td><td style="padding: 8px 0;"><a href="tel:${phone}">${phone}</a></td></tr>
                </table>
                <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 20px 0;">
                  <p style="color: #666; margin: 0 0 8px; font-size: 13px;">문의 내용</p>
                  <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>
                </div>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">이 메일은 edongne.com 문의 폼에서 자동 발송되었습니다.</p>
              </div>
            `,
          }),
        })
      } catch (emailError) {
        console.error('Email send error:', emailError)
        // 이메일 실패해도 DB에는 저장됨 → 에러 무시
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
