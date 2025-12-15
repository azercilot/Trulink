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
      return new Response(
        JSON.stringify({ error: 'Invalid token', verified: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();

    // Check if locked due to too many attempts
    if (tokenData.otp_locked_until && new Date(tokenData.otp_locked_until) > now) {
      const remainingMinutes = Math.ceil((new Date(tokenData.otp_locked_until).getTime() - now.getTime()) / (1000 * 60));
      return new Response(
        JSON.stringify({ 
          verified: false, 
          error: `Too many failed attempts. Please wait ${remainingMinutes} minutes.`,
          locked: true
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if OTP is expired (10 minutes)
    const otpSentAt = new Date(tokenData.otp_sent_at);
    const diffMinutes = (now.getTime() - otpSentAt.getTime()) / (1000 * 60);

    if (diffMinutes > 10) {
      return new Response(
        JSON.stringify({ verified: false, error: 'OTP expired' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if OTP matches
    const currentAttempts = (tokenData.otp_attempts || 0) + 1;
    const MAX_ATTEMPTS = 5;

    if (tokenData.otp_code !== otp) {
      // Update attempt counter
      const updateData: Record<string, unknown> = { otp_attempts: currentAttempts };
      
      // Lock after MAX_ATTEMPTS failed attempts (15 minute lockout)
      if (currentAttempts >= MAX_ATTEMPTS) {
        updateData.otp_locked_until = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
      }
      
      await serviceClient
        .from('signature_tokens')
        .update(updateData)
        .eq('id', tokenData.id);

      const remainingAttempts = MAX_ATTEMPTS - currentAttempts;
      const errorMessage = currentAttempts >= MAX_ATTEMPTS
        ? 'Too many failed attempts. Locked for 15 minutes.'
        : `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`;

      return new Response(
        JSON.stringify({ 
          verified: false, 
          error: errorMessage,
          remainingAttempts: Math.max(0, remainingAttempts)
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // OTP is correct - mark as verified and reset attempts
    const { error: updateError } = await serviceClient
      .from('signature_tokens')
      .update({ 
        otp_verified: true, 
        otp_attempts: 0,
        otp_locked_until: null 
      })
      .eq('id', tokenData.id);

    if (updateError) {
      throw new Error('Failed to update verification status');
    }

    return new Response(JSON.stringify({ verified: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, verified: false }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
