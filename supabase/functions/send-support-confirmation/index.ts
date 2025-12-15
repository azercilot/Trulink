import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SupportEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  language?: string;
}

const getEmailContent = (name: string, subject: string, language: string) => {
  if (language === 'fa') {
    return {
      emailSubject: `تأییدیه دریافت پیام پشتیبانی - ${subject}`,
      html: `
        <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #00C853 0%, #00A844 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">TruLink</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <h2 style="color: #333; margin-bottom: 20px;">سلام ${name} عزیز!</h2>
            <p style="color: #555; line-height: 1.8; font-size: 14px;">
              از تماس شما با تیم پشتیبانی TruLink سپاسگزاریم. پیام شما با موضوع "<strong>${subject}</strong>" با موفقیت دریافت شد.
            </p>
            <p style="color: #555; line-height: 1.8; font-size: 14px;">
              تیم ما در اسرع وقت پیام شما را بررسی کرده و پاسخ مناسب را ارسال خواهد کرد.
            </p>
            <div style="background: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #00C853;">
              <p style="color: #666; margin: 0; font-size: 13px;">
                معمولاً پاسخ‌ها ظرف ۲۴ تا ۴۸ ساعت کاری ارسال می‌شوند.
              </p>
            </div>
            <p style="color: #555; line-height: 1.8; font-size: 14px;">
              با احترام،<br>
              <strong>تیم پشتیبانی TruLink</strong>
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>این ایمیل به صورت خودکار ارسال شده است. لطفاً به این ایمیل پاسخ ندهید.</p>
          </div>
        </div>
      `
    };
  } else if (language === 'ar') {
    return {
      emailSubject: `تأكيد استلام رسالة الدعم - ${subject}`,
      html: `
        <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #00C853 0%, #00A844 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">TruLink</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <h2 style="color: #333; margin-bottom: 20px;">مرحباً ${name}!</h2>
            <p style="color: #555; line-height: 1.8; font-size: 14px;">
              شكراً لتواصلك مع فريق دعم TruLink. تم استلام رسالتك بعنوان "<strong>${subject}</strong>" بنجاح.
            </p>
            <p style="color: #555; line-height: 1.8; font-size: 14px;">
              سيقوم فريقنا بمراجعة رسالتك والرد عليك في أقرب وقت ممكن.
            </p>
            <div style="background: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #00C853;">
              <p style="color: #666; margin: 0; font-size: 13px;">
                عادةً ما يتم الرد خلال 24 إلى 48 ساعة عمل.
              </p>
            </div>
            <p style="color: #555; line-height: 1.8; font-size: 14px;">
              مع أطيب التحيات،<br>
              <strong>فريق دعم TruLink</strong>
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>تم إرسال هذا البريد الإلكتروني تلقائياً. يرجى عدم الرد عليه.</p>
          </div>
        </div>
      `
    };
  } else {
    return {
      emailSubject: `Support Request Confirmation - ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #00C853 0%, #00A844 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">TruLink</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
            <p style="color: #555; line-height: 1.8; font-size: 14px;">
              Thank you for contacting TruLink support. Your message regarding "<strong>${subject}</strong>" has been received successfully.
            </p>
            <p style="color: #555; line-height: 1.8; font-size: 14px;">
              Our team will review your message and get back to you as soon as possible.
            </p>
            <div style="background: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00C853;">
              <p style="color: #666; margin: 0; font-size: 13px;">
                Responses are typically sent within 24-48 business hours.
              </p>
            </div>
            <p style="color: #555; line-height: 1.8; font-size: 14px;">
              Best regards,<br>
              <strong>TruLink Support Team</strong>
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>This email was sent automatically. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message, language = 'en' }: SupportEmailRequest = await req.json();

    console.log(`Sending support confirmation email to ${email} in ${language}`);

    const { emailSubject, html } = getEmailContent(name, subject, language);

    // Send email using Resend API directly
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "TruLink Support <onboarding@resend.dev>",
        to: [email],
        subject: emailSubject,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", data);
      throw new Error(data.message || "Failed to send email");
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-support-confirmation function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
