import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role for database access
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get pending signatures that need reminders
    const { data: pendingTokens, error: fetchError } = await serviceClient
      .from('signature_tokens')
      .select(`
        id,
        contract_id,
        party_email,
        token,
        expires_at,
        created_at,
        reminder_sent_at,
        contracts!inner(title, user_id)
      `)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .or('reminder_sent_at.is.null,reminder_sent_at.lt.' + new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString());

    if (fetchError) {
      console.error('Error fetching pending tokens:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${pendingTokens?.length || 0} pending signatures to remind`);

    const results: { email: string; success: boolean; error?: string }[] = [];

    for (const token of pendingTokens || []) {
      const contractData = token.contracts as unknown as { title: string; user_id: string };
      const siteUrl = 'https://gharardadino.lovable.app';
      const signatureUrl = `${siteUrl}/sign/${token.token}`;

      // Calculate days until expiry
      const expiresAt = new Date(token.expires_at);
      const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "TruLink <onboarding@resend.dev>",
            to: [token.party_email],
            subject: `یادآوری: امضای قرارداد "${contractData.title}" - ${daysLeft} روز مانده`,
            html: `
              <!DOCTYPE html>
              <html dir="rtl" lang="fa">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: Vazirmatn, Tahoma, Arial, sans-serif; background-color: #f5f5f5; padding: 20px; direction: rtl;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                  <div style="background-color: #FFA000; padding: 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">⏰ یادآوری امضا</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">TruLink - پلتفرم قراردادهای دیجیتال</p>
                  </div>
                  
                  <div style="padding: 32px;">
                    <h2 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 20px;">کاربر گرامی،</h2>
                    
                    <p style="color: #4a4a4a; line-height: 1.8; margin: 0 0 24px 0;">
                      یک قرارداد در انتظار امضای شماست و تنها <strong>${daysLeft} روز</strong> تا پایان مهلت امضا باقی مانده است.
                    </p>
                    
                    <div style="background-color: #f8f8f8; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                      <h3 style="color: #1a1a1a; margin: 0 0 12px 0; font-size: 16px;">جزئیات قرارداد:</h3>
                      <p style="color: #4a4a4a; margin: 0;">
                        <strong>عنوان:</strong> ${contractData.title}
                      </p>
                      <p style="color: #E65100; margin: 8px 0 0 0; font-size: 14px;">
                        <strong>انقضا:</strong> ${expiresAt.toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                    
                    <div style="text-align: center; margin-bottom: 24px;">
                      <a href="${signatureUrl}" style="display: inline-block; background-color: #00C853; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        امضای قرارداد
                      </a>
                    </div>
                    
                    <div style="background-color: #FFF3E0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                      <p style="color: #E65100; font-size: 14px; margin: 0;">
                        ⚠️ لطفاً قبل از پایان مهلت، قرارداد را امضا کنید.
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
          console.error(`Failed to send reminder to ${token.party_email}:`, emailResponse);
          results.push({ email: token.party_email, success: false, error: emailResponse.message });
          continue;
        }

        // Update reminder_sent_at
        await serviceClient
          .from('signature_tokens')
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq('id', token.id);

        console.log(`Reminder sent to ${token.party_email}`);
        results.push({ email: token.party_email, success: true });
      } catch (emailError: any) {
        console.error(`Error sending reminder to ${token.party_email}:`, emailError);
        results.push({ email: token.party_email, success: false, error: emailError.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        results 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-signature-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
