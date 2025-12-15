import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssistRequest {
  type: 'suggest_title' | 'suggest_description' | 'suggest_terms' | 'improve_text' | 'explain_clause';
  context: {
    contractType?: string;
    existingText?: string;
    partyName?: string;
    amount?: string;
  };
  language?: string;
}

const MAX_TEXT_LENGTH = 50000; // 50KB max for input text
const VALID_TYPES = ['suggest_title', 'suggest_description', 'suggest_terms', 'improve_text', 'explain_clause'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type, context, language = 'fa' }: AssistRequest = body;

    // Input validation
    if (!type || !VALID_TYPES.includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate context text lengths
    if (context?.existingText && context.existingText.length > MAX_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: 'Text too long. Maximum 50KB allowed.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize input
    const sanitizedContext = {
      ...context,
      existingText: context?.existingText
        ?.replace(/ignore (all |previous |above )?instructions/gi, '[FILTERED]')
        ?.replace(/system prompt/gi, '[FILTERED]'),
    };

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  const systemPrompt = getSystemPrompt(type, language);
    const userPrompt = getUserPrompt(type, sanitizedContext, language);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'محدودیت درخواست. لطفاً کمی صبر کنید.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content || '';

    return new Response(
      JSON.stringify({ suggestion, type }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI assist error:', error);
    return new Response(
      JSON.stringify({ error: 'خطا در دریافت پیشنهاد' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getSystemPrompt(type: string, language: string): string {
  const prompts: Record<string, Record<string, string>> = {
    fa: {
      suggest_title: 'شما یک دستیار حقوقی هستید. عناوین حرفه‌ای و رسمی برای قراردادها پیشنهاد دهید. پاسخ کوتاه و مستقیم باشد.',
      suggest_description: 'شما یک دستیار حقوقی هستید. توضیحات جامع و حرفه‌ای برای قراردادها بنویسید.',
      suggest_terms: 'شما یک دستیار حقوقی هستید. شرایط و بندهای استاندارد قرارداد را پیشنهاد دهید.',
      improve_text: 'شما یک ویراستار حقوقی هستید. متن را حرفه‌ای‌تر و واضح‌تر کنید.',
      explain_clause: 'شما یک وکیل هستید. این بند قرارداد را به زبان ساده توضیح دهید.',
    },
    en: {
      suggest_title: 'You are a legal assistant. Suggest professional contract titles. Keep responses brief.',
      suggest_description: 'You are a legal assistant. Write comprehensive contract descriptions.',
      suggest_terms: 'You are a legal assistant. Suggest standard contract terms and clauses.',
      improve_text: 'You are a legal editor. Improve the text to be more professional.',
      explain_clause: 'You are a lawyer. Explain this contract clause in simple terms.',
    }
  };

  return prompts[language]?.[type] || prompts['fa'][type];
}

function getUserPrompt(type: string, context: any, language: string): string {
  const { contractType, existingText, partyName, amount } = context;
  
  const templates: Record<string, Record<string, string>> = {
    fa: {
      suggest_title: `یک عنوان حرفه‌ای برای قرارداد ${contractType || 'عمومی'} پیشنهاد بده.${partyName ? ` طرف قرارداد: ${partyName}` : ''}`,
      suggest_description: `یک توضیح کامل برای قرارداد ${contractType || 'عمومی'} بنویس.${amount ? ` مبلغ: ${amount} تومان` : ''}`,
      suggest_terms: `شرایط و بندهای مهم برای قرارداد ${contractType || 'عمومی'} را لیست کن.`,
      improve_text: `این متن را حرفه‌ای‌تر کن:\n${existingText}`,
      explain_clause: `این بند قرارداد را توضیح بده:\n${existingText}`,
    },
    en: {
      suggest_title: `Suggest a professional title for a ${contractType || 'general'} contract.${partyName ? ` Party: ${partyName}` : ''}`,
      suggest_description: `Write a comprehensive description for a ${contractType || 'general'} contract.${amount ? ` Amount: ${amount}` : ''}`,
      suggest_terms: `List important terms for a ${contractType || 'general'} contract.`,
      improve_text: `Improve this text:\n${existingText}`,
      explain_clause: `Explain this contract clause:\n${existingText}`,
    }
  };

  return templates[language]?.[type] || templates['fa'][type];
}
