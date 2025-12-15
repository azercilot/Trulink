import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidateTokenRequest {
  token: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token }: ValidateTokenRequest = await req.json();

    if (!token) {
      console.log("No token provided");
      return new Response(
        JSON.stringify({ error: "Token is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Validating token:", token.substring(0, 8) + "...");

    // Use service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch token data using service role (bypasses RLS)
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from("signature_tokens")
      .select("id, contract_id, party_email, otp_verified, expires_at, used_at")
      .eq("token", token)
      .maybeSingle();

    if (tokenError) {
      console.error("Token fetch error:", tokenError);
      return new Response(
        JSON.stringify({ error: "Failed to validate token" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!tokenData) {
      console.log("Token not found");
      return new Response(
        JSON.stringify({ valid: false, error: "invalid_token" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      console.log("Token expired");
      return new Response(
        JSON.stringify({ valid: false, error: "token_expired" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if already used
    if (tokenData.used_at) {
      console.log("Token already used");
      return new Response(
        JSON.stringify({ valid: false, error: "already_signed" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch contract data
    const { data: contractData, error: contractError } = await supabaseAdmin
      .from("contracts")
      .select("id, title, description, contract_type, total_amount, currency")
      .eq("id", tokenData.contract_id)
      .maybeSingle();

    if (contractError) {
      console.error("Contract fetch error:", contractError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch contract" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!contractData) {
      console.log("Contract not found");
      return new Response(
        JSON.stringify({ valid: false, error: "contract_not_found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Token validated successfully for contract:", contractData.id);

    return new Response(
      JSON.stringify({
        valid: true,
        tokenData: {
          id: tokenData.id,
          contract_id: tokenData.contract_id,
          party_email: tokenData.party_email,
          otp_verified: tokenData.otp_verified,
          expires_at: tokenData.expires_at,
          used_at: tokenData.used_at,
        },
        contract: contractData,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error validating token:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
