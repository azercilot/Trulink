import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  contractText: string;
  contractType: string;
  analysisType: 'risk' | 'summary' | 'both';
  language?: string;
}

const getRiskAnalysisPrompt = (contractType: string, language: string) => {
  if (language === 'fa') {
    return `شما یک وکیل متخصص در حقوق قراردادها هستید. این قرارداد ${contractType} را تحلیل کنید و موارد زیر را ارائه دهید:

1. **ریسک‌های حقوقی**: فهرستی از ریسک‌های احتمالی با سطح خطر (کم، متوسط، زیاد)
2. **ابهامات**: بندهایی که نیاز به شفاف‌سازی دارند
3. **پیشنهادات**: راهکارهای تقویت حقوقی قرارداد
4. **امتیاز کلی**: امتیاز از 0 تا 100 برای امنیت حقوقی قرارداد

پاسخ را به صورت JSON با ساختار زیر برگردانید:
{
  "riskLevel": "low" | "medium" | "high",
  "overallScore": number,
  "risks": [{"title": string, "description": string, "severity": "low" | "medium" | "high"}],
  "ambiguities": [{"clause": string, "issue": string}],
  "suggestions": [{"title": string, "description": string}]
}`;
  }
  return `You are an expert contract lawyer. Analyze this ${contractType} contract and provide:

1. **Legal Risks**: List potential risks with severity level (low, medium, high)
2. **Ambiguities**: Clauses that need clarification
3. **Suggestions**: Ways to strengthen the contract legally
4. **Overall Score**: Score from 0 to 100 for contract legal security

Return response as JSON with this structure:
{
  "riskLevel": "low" | "medium" | "high",
  "overallScore": number,
  "risks": [{"title": string, "description": string, "severity": "low" | "medium" | "high"}],
  "ambiguities": [{"clause": string, "issue": string}],
  "suggestions": [{"title": string, "description": string}]
}`;
};

const getSummaryPrompt = (contractType: string, language: string) => {
  if (language === 'fa') {
    return `شما یک متخصص خلاصه‌سازی حقوقی هستید. این قرارداد ${contractType} را خلاصه کنید و موارد زیر را استخراج کنید:

1. **موضوع قرارداد**: موضوع اصلی به زبان ساده
2. **طرفین**: اطلاعات طرفین قرارداد
3. **مبلغ**: مبلغ و شرایط پرداخت
4. **مدت**: مدت اعتبار قرارداد
5. **شرایط فسخ**: شرایط پایان قرارداد
6. **تعهدات کلیدی**: مهم‌ترین تعهدات هر طرف

پاسخ را به صورت JSON با ساختار زیر برگردانید:
{
  "subject": string,
  "parties": [{"name": string, "role": string}],
  "amount": {"value": string, "paymentTerms": string},
  "duration": {"start": string, "end": string, "notes": string},
  "terminationConditions": [string],
  "keyObligations": [{"party": string, "obligations": [string]}],
  "simpleSummary": string
}`;
  }
  return `You are a legal summarization expert. Summarize this ${contractType} contract and extract:

1. **Subject**: Main subject in simple language
2. **Parties**: Contract parties information
3. **Amount**: Amount and payment terms
4. **Duration**: Contract validity period
5. **Termination Conditions**: Contract ending conditions
6. **Key Obligations**: Most important obligations of each party

Return response as JSON with this structure:
{
  "subject": string,
  "parties": [{"name": string, "role": string}],
  "amount": {"value": string, "paymentTerms": string},
  "duration": {"start": string, "end": string, "notes": string},
  "terminationConditions": [string],
  "keyObligations": [{"party": string, "obligations": [string]}],
  "simpleSummary": string
}`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contractText, contractType, analysisType, language = 'fa' }: AnalysisRequest = await req.json();

    if (!contractText) {
      throw new Error('Contract text is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const results: { riskAnalysis?: any; summary?: any } = {};

    // Perform risk analysis if requested
    if (analysisType === 'risk' || analysisType === 'both') {
      console.log('Performing risk analysis...');
      const riskResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: getRiskAnalysisPrompt(contractType, language) },
            { role: 'user', content: contractText }
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (!riskResponse.ok) {
        const errorText = await riskResponse.text();
        console.error('Risk analysis error:', errorText);
        if (riskResponse.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (riskResponse.status === 402) {
          throw new Error('Payment required. Please add credits to your account.');
        }
        throw new Error('Failed to analyze contract risks');
      }

      const riskData = await riskResponse.json();
      const riskContent = riskData.choices?.[0]?.message?.content;
      
      try {
        results.riskAnalysis = JSON.parse(riskContent);
      } catch {
        results.riskAnalysis = { raw: riskContent };
      }
    }

    // Perform summary if requested
    if (analysisType === 'summary' || analysisType === 'both') {
      console.log('Generating summary...');
      const summaryResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: getSummaryPrompt(contractType, language) },
            { role: 'user', content: contractText }
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (!summaryResponse.ok) {
        const errorText = await summaryResponse.text();
        console.error('Summary error:', errorText);
        if (summaryResponse.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (summaryResponse.status === 402) {
          throw new Error('Payment required. Please add credits to your account.');
        }
        throw new Error('Failed to generate contract summary');
      }

      const summaryData = await summaryResponse.json();
      const summaryContent = summaryData.choices?.[0]?.message?.content;
      
      try {
        results.summary = JSON.parse(summaryContent);
      } catch {
        results.summary = { raw: summaryContent };
      }
    }

    console.log('Analysis completed successfully');

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in analyze-contract function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
