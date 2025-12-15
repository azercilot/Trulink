import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SignatureEmailRequest {
  contractId: string;
  contractTitle: string;
  partyName: string;
  partyEmail: string;
  senderName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { contractId, contractTitle, partyName, partyEmail, senderName }: SignatureEmailRequest = await req.json();

    // Validate input
    if (!contractId || !contractTitle || !partyEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending signature email for contract ${contractId} to ${partyEmail}`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "TruLink <onboarding@resend.dev>",
        to: [partyEmail],
        subject: `درخواست امضای قرارداد: ${contractTitle}`,
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
                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">پلتفرم قراردادهای دیجیتال</p>
              </div>
              
              <div style="padding: 32px;">
                <h2 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 20px;">سلام ${partyName || 'کاربر گرامی'}،</h2>
                
                <p style="color: #4a4a4a; line-height: 1.8; margin: 0 0 24px 0;">
                  <strong>${senderName}</strong> یک قرارداد جدید برای امضای شما ارسال کرده است.
                </p>
                
                <div style="background-color: #f8f8f8; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                  <h3 style="color: #1a1a1a; margin: 0 0 12px 0; font-size: 16px;">جزئیات قرارداد:</h3>
                  <p style="color: #4a4a4a; margin: 0;">
                    <strong>عنوان:</strong> ${contractTitle}
                  </p>
                </div>
                
                <p style="color: #4a4a4a; line-height: 1.8; margin: 0 0 24px 0;">
                  لطفاً برای مشاهده و امضای قرارداد، وارد پلتفرم TruLink شوید.
                </p>
                
                <div style="text-align: center; margin-top: 32px;">
                  <p style="color: #888888; font-size: 12px; margin: 0;">
                    این ایمیل به صورت خودکار از طرف TruLink ارسال شده است.
                  </p>
                </div>
              </div>
              
              <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                <p style="color: #888888; font-size: 12px; margin: 0;">
                  © 2024 TruLink - پلتفرم قراردادهای دیجیتال
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Signature email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-signature-email function:", error);
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
