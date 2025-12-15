import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Loader2, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateIranianNationalId, validateBirthDate } from '@/lib/validation';

interface KYCVerificationFormProps {
  contractId: string;
  initialData?: {
    nationalId?: string;
    birthDate?: string;
    fullName?: string;
  };
  onVerificationComplete?: (result: any) => void;
}

const KYCVerificationForm = ({ contractId, initialData, onVerificationComplete }: KYCVerificationFormProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';

  const [formData, setFormData] = useState({
    nationalId: initialData?.nationalId || '',
    birthDate: initialData?.birthDate || '',
    fullName: initialData?.fullName || '',
  });
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<{ nationalId?: string; birthDate?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setVerificationResult(null);
    
    // Clear validation error for the field being changed
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors({ ...validationErrors, [name]: undefined });
    }
  };

  const validateForm = (): boolean => {
    const errors: { nationalId?: string; birthDate?: string } = {};
    
    // Validate National ID
    const nationalIdResult = validateIranianNationalId(formData.nationalId);
    if (!nationalIdResult.valid && nationalIdResult.error) {
      errors.nationalId = t(`kyc.${nationalIdResult.error}`);
    }
    
    // Validate Birth Date
    const birthDateResult = validateBirthDate(formData.birthDate);
    if (!birthDateResult.valid && birthDateResult.error) {
      errors.birthDate = t(`kyc.${birthDateResult.error}`);
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleVerify = async () => {
    if (!validateForm()) {
      toast({
        title: t('kyc.incompleteData'),
        description: t('kyc.incompleteDataDesc'),
        variant: 'destructive',
      });
      return;
    }

    setVerifying(true);
    try {
      // Call verification edge function
      const { data, error } = await supabase.functions.invoke('verify-identity', {
        body: {
          nationalId: formData.nationalId,
          birthDate: formData.birthDate,
          fullName: formData.fullName,
          contractId,
        }
      });

      if (error) throw error;

      setVerificationResult(data);

      // Save verification to database
      if (data.success) {
        await supabase.from('party_verifications').upsert({
          contract_id: contractId,
          national_id: formData.nationalId,
          birth_date: formData.birthDate,
          verification_status: data.verification_status,
          verification_result: data.details,
          verified_at: data.verified_at,
        }, {
          onConflict: 'contract_id'
        });

        toast({
          title: t('kyc.verified'),
          description: t('kyc.verifiedDesc'),
        });
      } else {
        toast({
          title: t('kyc.verificationFailed'),
          description: data.error || t('kyc.verificationFailedDesc'),
          variant: 'destructive',
        });
      }

      onVerificationComplete?.(data);
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: t('kyc.error'),
        description: t('kyc.errorDesc'),
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };

  const getStatusIcon = () => {
    if (!verificationResult) return null;
    if (verificationResult.success) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (verificationResult.verification_status === 'failed') {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return <AlertCircle className="w-5 h-5 text-yellow-500" />;
  };

  return (
    <div className="bg-background rounded-xl border border-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <Shield className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold">{t('kyc.title')}</h3>
          <p className="text-sm text-muted-foreground">{t('kyc.subtitle')}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">{t('kyc.nationalId')}</label>
          <input
            type="text"
            name="nationalId"
            value={formData.nationalId}
            onChange={handleChange}
            className={`w-full h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring ${
              validationErrors.nationalId ? 'border-red-500' : 'border-border'
            }`}
            placeholder="0123456789"
            dir="ltr"
            maxLength={10}
          />
          {validationErrors.nationalId && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.nationalId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">{t('kyc.birthDate')}</label>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            className={`w-full h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring ${
              validationErrors.birthDate ? 'border-red-500' : 'border-border'
            }`}
            dir="ltr"
            max={new Date().toISOString().split('T')[0]}
          />
          {validationErrors.birthDate && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.birthDate}</p>
          )}
        </div>

        {/* Verification Disclaimer */}
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg border border-border">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            {t('kyc.verificationDisclaimer')}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">{t('kyc.fullName')}</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder={t('kyc.fullNamePlaceholder')}
          />
        </div>

        {verificationResult && (
          <div className={`p-4 rounded-xl ${
            verificationResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon()}
              <span className={`font-medium ${
                verificationResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {verificationResult.success ? t('kyc.identityVerified') : t('kyc.identityNotVerified')}
              </span>
            </div>
            {verificationResult.details && (
              <div className="text-sm space-y-1">
                {verificationResult.details.registered_name && (
                  <p className="text-muted-foreground">
                    {t('kyc.registeredName')}: {verificationResult.details.registered_name}
                  </p>
                )}
                {verificationResult.details.registration_location && (
                  <p className="text-muted-foreground">
                    {t('kyc.registrationLocation')}: {verificationResult.details.registration_location}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleVerify}
          disabled={verifying || !formData.nationalId || !formData.birthDate}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {verifying ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('kyc.verifying')}
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              {t('kyc.verifyIdentity')}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default KYCVerificationForm;
