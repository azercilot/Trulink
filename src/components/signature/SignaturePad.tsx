import { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Eraser, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SignaturePadProps {
  onSignatureComplete: (signatureData: string) => void;
  disabled?: boolean;
}

const SignaturePad = ({ onSignatureComplete, disabled = false }: SignaturePadProps) => {
  const { t } = useTranslation();
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const clear = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
  };

  const handleEnd = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      setIsEmpty(false);
    }
  };

  const handleConfirm = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const signatureData = sigCanvas.current.toDataURL('image/png');
      onSignatureComplete(signatureData);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-2">
        {t('signature.drawYourSignature', 'لطفاً امضای خود را در کادر زیر رسم کنید')}
      </div>
      
      <div className={`border-2 border-dashed rounded-xl bg-background overflow-hidden ${disabled ? 'opacity-50 pointer-events-none' : 'border-border hover:border-primary/50'}`}>
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{
            width: 500,
            height: 200,
            className: 'w-full touch-none',
            style: { width: '100%', height: '200px' }
          }}
          onEnd={handleEnd}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clear}
          disabled={disabled || isEmpty}
          className="gap-1.5"
        >
          <Eraser className="w-4 h-4" />
          {t('signature.clear', 'پاک کردن')}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleConfirm}
          disabled={disabled || isEmpty}
          className="gap-1.5"
        >
          <Check className="w-4 h-4" />
          {t('signature.confirm', 'تأیید امضا')}
        </Button>
      </div>
    </div>
  );
};

export default SignaturePad;
