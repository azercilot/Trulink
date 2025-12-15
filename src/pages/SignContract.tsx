import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, CheckCircle, AlertCircle, Loader2, Shield, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import SignaturePad from '@/components/signature/SignaturePad';
import OTPVerification from '@/components/signature/OTPVerification';

interface ContractData {
  id: string;
  title: string;
  description: string | null;
  contract_type: string;
  total_amount: number | null;
  currency: string | null;
}

interface TokenData {
  id: string;
  contract_id: string;
  party_email: string;
  otp_verified: boolean;
  expires_at: string;
  used_at: string | null;
}

const SignContract = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [contract, setContract] = useState<ContractData | null>(null);
  const [otpVerified, setOtpVerified] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  const validateToken = async () => {
    try {
      // Use edge function to validate token securely (bypasses public RLS)
      const { data, error: funcError } = await supabase.functions.invoke('validate-signature-token', {
        body: { token },
      });

      if (funcError) throw funcError;

      if (!data.valid) {
        // Handle specific error types
        switch (data.error) {
          case 'invalid_token':
            setError(t('signature.invalidToken', 'لینک امضا نامعتبر است'));
            break;
          case 'token_expired':
            setError(t('signature.tokenExpired', 'لینک امضا منقضی شده است'));
            break;
          case 'already_signed':
            setError(t('signature.alreadySigned', 'این قرارداد قبلاً امضا شده است'));
            break;
          case 'contract_not_found':
            setError(t('signature.contractNotFound', 'قرارداد یافت نشد'));
            break;
          default:
            setError(t('signature.loadError', 'در بارگذاری قرارداد مشکلی پیش آمد'));
        }
        setLoading(false);
        return;
      }

      setTokenData(data.tokenData);
      setOtpVerified(data.tokenData.otp_verified);
      setContract(data.contract);
    } catch (err) {
      console.error('Error validating token:', err);
      setError(t('signature.loadError', 'در بارگذاری قرارداد مشکلی پیش آمد'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignature = async (signatureData: string) => {
    if (!tokenData || !contract || !otpVerified) return;

    setSigning(true);
    try {
      const { data, error } = await supabase.functions.invoke('submit-signature', {
        body: {
          token: token,
          signatureData,
          userAgent: navigator.userAgent,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setSigned(true);
        toast({
          title: t('signature.success', 'امضا ثبت شد'),
          description: t('signature.successDesc', 'قرارداد با موفقیت امضا شد'),
        });
      }
    } catch (err) {
      console.error('Error submitting signature:', err);
      toast({
        title: t('common.error', 'خطا'),
        description: t('signature.submitError', 'در ثبت امضا مشکلی پیش آمد'),
        variant: 'destructive',
      });
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center" dir="rtl">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-background rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">{t('common.error', 'خطا')}</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate('/')} variant="outline">
            {t('common.backToHome', 'بازگشت به صفحه اصلی')}
          </Button>
        </div>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-background rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">
            {t('signature.signedSuccess', 'قرارداد امضا شد')}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t('signature.signedSuccessDesc', 'امضای شما با موفقیت ثبت شد. یک نسخه از قرارداد برای شما ارسال خواهد شد.')}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <Lock className="w-4 h-4" />
            <span>{t('signature.documentLocked', 'سند با رمزنگاری قفل شده است')}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-xl font-bold">
              <span className="text-foreground">Tru</span>
              <span className="text-accent">Link</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {t('signature.signContract', 'امضای قرارداد')}
          </h1>
          <p className="text-muted-foreground">
            {t('signature.reviewAndSign', 'لطفاً قرارداد را بررسی کرده و امضا کنید')}
          </p>
        </div>

        {/* Contract Info */}
        <div className="bg-background rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg text-foreground mb-1">
                {contract?.title}
              </h2>
              {contract?.description && (
                <p className="text-sm text-muted-foreground mb-3">{contract.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="text-muted-foreground">
                  {t('newContract.contractType', 'نوع قرارداد')}: <strong>{contract?.contract_type}</strong>
                </span>
                {contract?.total_amount && (
                  <span className="text-muted-foreground">
                    {t('newContract.amount', 'مبلغ')}: <strong>{contract.total_amount.toLocaleString('fa-IR')} {contract.currency}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
          <Shield className="w-4 h-4 text-accent" />
          <span>{t('signature.secureSignature', 'امضای امن با رمزنگاری و تأیید هویت')}</span>
        </div>

        {/* OTP Verification */}
        {!otpVerified && tokenData && (
          <div className="bg-background rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-semibold mb-4">{t('signature.step1', 'مرحله ۱: تأیید هویت')}</h3>
            <OTPVerification
              email={tokenData.party_email}
              token={token!}
              onVerified={() => setOtpVerified(true)}
            />
          </div>
        )}

        {/* Signature Pad */}
        <div className={`bg-background rounded-2xl shadow-lg p-6 ${!otpVerified ? 'opacity-50' : ''}`}>
          <h3 className="font-semibold mb-4">
            {t('signature.step2', 'مرحله ۲: امضای قرارداد')}
          </h3>
          <SignaturePad
            onSignatureComplete={handleSignature}
            disabled={!otpVerified || signing}
          />
          {signing && (
            <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('signature.processing', 'در حال ثبت امضا...')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignContract;
