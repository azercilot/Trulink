import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { token, otp } = await req.json();

    if (!token || !otp) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get token data
    const { data: tokenData, error: tokenError } = await serviceClient
      .from('signature_tokens')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (tokenError || !tokenData) {
      console.error('Token validation error:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Invalid token', verified: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if OTP matches
    if (tokenData.otp_code !== otp) {
      console.log('OTP mismatch:', { provided: otp, expected: tokenData.otp_code });
      return new Response(
        JSON.stringify({ verified: false, error: 'Invalid OTP' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if OTP is expired (10 minutes)
    const otpSentAt = new Date(tokenData.otp_sent_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - otpSentAt.getTime()) / (1000 * 60);

    if (diffMinutes > 10) {
      return new Response(
        JSON.stringify({ verified: false, error: 'OTP expired' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark OTP as verified
    const { error: updateError } = await serviceClient
      .from('signature_tokens')
      .update({ otp_verified: true })
      .eq('id', tokenData.id);

    if (updateError) {
      console.error('Error updating token:', updateError);
      throw new Error('Failed to update verification status');
    }

    console.log("OTP verified successfully for token:", token);

    return new Response(JSON.stringify({ verified: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in verify-signature-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message, verified: false }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
