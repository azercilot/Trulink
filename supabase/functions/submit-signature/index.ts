import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Generate SHA-256 hash
async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, signatureData, userAgent } = await req.json();

    if (!token || !signatureData) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get client IP
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

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
        JSON.stringify({ error: 'Invalid token', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already used
    if (tokenData.used_at) {
      return new Response(
        JSON.stringify({ error: 'Token already used', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if OTP was verified
    if (!tokenData.otp_verified) {
      return new Response(
        JSON.stringify({ error: 'OTP not verified', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Token expired', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get contract data
    const { data: contract, error: contractError } = await serviceClient
      .from('contracts')
      .select('*')
      .eq('id', tokenData.contract_id)
      .single();

    if (contractError || !contract) {
      console.error('Contract fetch error:', contractError);
      return new Response(
        JSON.stringify({ error: 'Contract not found', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get party info
    const { data: partyData } = await serviceClient
      .from('contract_parties')
      .select('*')
      .eq('contract_id', tokenData.contract_id)
      .maybeSingle();

    // Generate signature hash
    const signatureHash = await generateHash(signatureData + tokenData.contract_id + new Date().toISOString());

    // Store signature
    const { error: signatureError } = await serviceClient
      .from('contract_signatures')
      .insert({
        contract_id: tokenData.contract_id,
        signer_email: tokenData.party_email,
        signer_name: partyData?.party_name || null,
        signature_data: signatureData,
        signature_hash: signatureHash,
        ip_address: clientIP,
        user_agent: userAgent || null,
        otp_verified: true,
      });

    if (signatureError) {
      console.error('Error storing signature:', signatureError);
      throw new Error('Failed to store signature');
    }

    // Generate document hash for cryptographic locking
    const documentContent = JSON.stringify({
      contract,
      signature: signatureHash,
      signedAt: new Date().toISOString(),
      signerEmail: tokenData.party_email,
      signerIP: clientIP,
    });
    const documentHash = await generateHash(documentContent);

    // Update contract status and lock it
    const { error: updateContractError } = await serviceClient
      .from('contracts')
      .update({
        status: 'signed',
        signed_at: new Date().toISOString(),
        is_locked: true,
        document_hash: documentHash,
      })
      .eq('id', tokenData.contract_id);

    if (updateContractError) {
      console.error('Error updating contract:', updateContractError);
    }

    // Mark token as used
    await serviceClient
      .from('signature_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    // Create audit log
    await serviceClient
      .from('contract_audit_logs')
      .insert({
        contract_id: tokenData.contract_id,
        user_id: contract.user_id,
        action: 'signature_completed',
        ip_address: clientIP,
        user_agent: userAgent || null,
        details: {
          signer_email: tokenData.party_email,
          signature_hash: signatureHash,
          document_hash: documentHash,
          otp_verified: true,
          signed_at: new Date().toISOString(),
        },
      });

    console.log("Signature submitted successfully for contract:", tokenData.contract_id);

    return new Response(JSON.stringify({ success: true, documentHash }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in submit-signature function:", error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
