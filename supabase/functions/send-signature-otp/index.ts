import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, email } = await req.json();

    if (!token || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate token exists
    const { data: tokenData, error: tokenError } = await serviceClient
      .from('signature_tokens')
      .select('*')
      .eq('token', token)
      .eq('party_email', email)
      .maybeSingle();

    if (tokenError || !tokenData) {
      console.error('Token validation error:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate OTP
    const otpCode = generateOTP();

    // Store OTP in database
    const { error: updateError } = await serviceClient
      .from('signature_tokens')
      .update({
        otp_code: otpCode,
        otp_sent_at: new Date().toISOString(),
      })
      .eq('id', tokenData.id);

    if (updateError) {
      console.error('Error storing OTP:', updateError);
      throw new Error('Failed to store OTP');
    }

    // Send OTP email
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "TruLink <onboarding@resend.dev>",
        to: [email],
        subject: `کد تأیید امضای قرارداد: ${otpCode}`,
        html: `
          <!DOCTYPE html>
          <html dir="rtl" lang="fa">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Vazirmatn, Tahoma, Arial, sans-serif; background-color: #f5f5f5; padding: 20px; direction: rtl;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <div style="background-color: #00C853; padding: 24px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">TruLink</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">کد تأیید هویت</p>
              </div>
              
              <div style="padding: 32px; text-align: center;">
                <h2 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 20px;">کد تأیید شما</h2>
                
                <p style="color: #4a4a4a; line-height: 1.8; margin: 0 0 24px 0;">
                  برای تأیید هویت و امضای قرارداد، کد زیر را وارد کنید:
                </p>
                
                <div style="background-color: #f8f8f8; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                  <p style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #00C853; margin: 0; font-family: monospace;">
                    ${otpCode}
                  </p>
                </div>
                
                <p style="color: #888888; font-size: 14px; margin: 0;">
                  این کد تا ۱۰ دقیقه معتبر است.
                </p>
              </div>
              
              <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                <p style="color: #888888; font-size: 12px; margin: 0;">
                  اگر شما این درخواست را ارسال نکرده‌اید، این ایمیل را نادیده بگیرید.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Resend API error:", errorData);
      throw new Error("Failed to send OTP email");
    }

    console.log("OTP email sent successfully to:", email);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-signature-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
