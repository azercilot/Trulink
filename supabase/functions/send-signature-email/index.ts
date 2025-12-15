import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PartyInfo {
  name: string;
  email: string;
}

interface SignatureEmailRequest {
  contractId: string;
  contractTitle: string;
  parties?: PartyInfo[];
  senderName: string;
  // Backward compatibility
  partyName?: string;
  partyEmail?: string;
}

// Generate a secure random token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

const handler = async (req: Request): Promise<Response> => {
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

    const requestData: SignatureEmailRequest = await req.json();
    const { contractId, contractTitle, senderName } = requestData;

    // Support both old single-party and new multi-party format
    let parties: PartyInfo[] = requestData.parties || [];
    if (parties.length === 0 && requestData.partyEmail) {
      parties = [{ name: requestData.partyName || '', email: requestData.partyEmail }];
    }

    // Validate input
    if (!contractId || !contractTitle || parties.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending signature emails for contract ${contractId} to ${parties.length} parties`);

    // Store token in database using service role client
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const results: { email: string; success: boolean; error?: string }[] = [];
    const siteUrl = 'https://gharardadino.lovable.app';

    for (const party of parties) {
      if (!party.email) continue;

      try {
        // Generate signature token for each party
        const signatureToken = generateToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        const { error: tokenError } = await serviceClient
          .from('signature_tokens')
          .insert({
            contract_id: contractId,
            party_email: party.email,
            token: signatureToken,
            expires_at: expiresAt.toISOString(),
          });

        if (tokenError) {
          console.error(`Error creating signature token for ${party.email}:`, tokenError);
          results.push({ email: party.email, success: false, error: 'Failed to create token' });
          continue;
        }

        const signatureUrl = `${siteUrl}/sign/${signatureToken}`;

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "TruLink <onboarding@resend.dev>",
            to: [party.email],
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
                    <h2 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 20px;">سلام ${party.name || 'کاربر گرامی'}،</h2>
                    
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
                      برای مشاهده و امضای قرارداد، روی دکمه زیر کلیک کنید:
                    </p>
                    
                    <div style="text-align: center; margin-bottom: 24px;">
                      <a href="${signatureUrl}" style="display: inline-block; background-color: #00C853; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        مشاهده و امضای قرارداد
                      </a>
                    </div>
                    
                    <p style="color: #888888; font-size: 12px; line-height: 1.6; margin: 0 0 16px 0;">
                      اگر دکمه بالا کار نمی‌کند، لینک زیر را در مرورگر خود کپی کنید:
                    </p>
                    <p style="color: #00C853; font-size: 12px; word-break: break-all; margin: 0 0 24px 0;">
                      ${signatureUrl}
                    </p>
                    
                    <div style="background-color: #FFF3E0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                      <p style="color: #E65100; font-size: 14px; margin: 0;">
                        ⚠️ این لینک تا ۷ روز معتبر است. پس از آن منقضی خواهد شد.
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
          console.error(`Resend API error for ${party.email}:`, emailResponse);
          results.push({ email: party.email, success: false, error: emailResponse.message });
          continue;
        }

        console.log(`Signature email sent successfully to ${party.email}`);
        results.push({ email: party.email, success: true });
      } catch (emailError: any) {
        console.error(`Error sending email to ${party.email}:`, emailError);
        results.push({ email: party.email, success: false, error: emailError.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Sent ${successCount}/${parties.length} signature emails successfully`);

    return new Response(
      JSON.stringify({ 
        success: successCount > 0, 
        sentCount: successCount,
        totalCount: parties.length,
        results 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-signature-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
