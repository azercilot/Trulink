import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OTPVerificationProps {
  email: string;
  token: string;
  onVerified: () => void;
}

const OTPVerification = ({ email, token, onVerified }: OTPVerificationProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [otp, setOtp] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleSendOTP = async () => {
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-signature-otp', {
        body: { token, email },
      });

      if (error) throw error;

      setOtpSent(true);
      toast({
        title: t('signature.otpSent', 'کد تأیید ارسال شد'),
        description: t('signature.checkEmail', 'لطفاً ایمیل خود را بررسی کنید'),
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: t('common.error', 'خطا'),
        description: t('signature.otpSendError', 'در ارسال کد تأیید مشکلی پیش آمد'),
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;

    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-signature-otp', {
        body: { token, otp },
      });

      if (error) throw error;

      if (data?.verified) {
        setVerified(true);
        toast({
          title: t('signature.verified', 'هویت تأیید شد'),
          description: t('signature.canNowSign', 'اکنون می‌توانید قرارداد را امضا کنید'),
        });
        onVerified();
      } else {
        toast({
          title: t('common.error', 'خطا'),
          description: t('signature.invalidOtp', 'کد تأیید نادرست است'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: t('common.error', 'خطا'),
        description: t('signature.verifyError', 'در تأیید کد مشکلی پیش آمد'),
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };

  if (verified) {
    return (
      <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-xl">
        <CheckCircle className="w-5 h-5" />
        <span>{t('signature.identityVerified', 'هویت شما تأیید شد')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Mail className="w-4 h-4" />
        <span>{t('signature.verifyIdentity', 'برای امضا، ابتدا هویت خود را تأیید کنید')}</span>
      </div>

      {/* Show email address prominently */}
      <div className="bg-background border border-border rounded-lg p-3 text-center">
        <p className="text-xs text-muted-foreground mb-1">{t('signature.yourEmail', 'ایمیل شما')}</p>
        <p className="font-medium text-foreground" dir="ltr">{email}</p>
      </div>

      {!otpSent ? (
        <Button
          onClick={handleSendOTP}
          disabled={sending}
          className="w-full gap-2"
        >
          {sending && <Loader2 className="w-4 h-4 animate-spin" />}
          {t('signature.sendOtp', 'ارسال کد تأیید به ایمیل')}
        </Button>
      ) : (
        <div className="space-y-3">
          {/* Success message showing email was sent */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <p className="text-sm text-green-700">
              {t('signature.otpSentTo', 'کد تأیید ۶ رقمی به ایمیل زیر ارسال شد:')}
            </p>
            <p className="font-medium text-green-800 mt-1" dir="ltr">{email}</p>
            <p className="text-xs text-green-600 mt-2">
              {t('signature.checkSpam', 'لطفاً پوشه اسپم/جانک را هم بررسی کنید')}
            </p>
          </div>

          <Input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="۰۰۰۰۰۰"
            className="text-center text-2xl tracking-widest font-mono"
            dir="ltr"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleVerifyOTP}
              disabled={verifying || otp.length !== 6}
              className="flex-1 gap-2"
            >
              {verifying && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('signature.verifyOtp', 'تأیید کد')}
            </Button>
            <Button
              variant="outline"
              onClick={handleSendOTP}
              disabled={sending}
            >
              {t('signature.resend', 'ارسال مجدد')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OTPVerification;
