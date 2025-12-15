import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface VerificationStatusProps {
  status: 'pending' | 'verified' | 'rejected' | 'not_checked';
  compact?: boolean;
}

const VerificationStatus = ({ status, compact = false }: VerificationStatusProps) => {
  const { t } = useTranslation();

  const statusConfig = {
    pending: {
      icon: Clock,
      label: t('kyc.statusPending'),
      className: 'text-yellow-600 bg-yellow-100',
    },
    verified: {
      icon: CheckCircle,
      label: t('kyc.statusVerified'),
      className: 'text-green-600 bg-green-100',
    },
    rejected: {
      icon: XCircle,
      label: t('kyc.statusRejected'),
      className: 'text-red-600 bg-red-100',
    },
    not_checked: {
      icon: AlertTriangle,
      label: t('kyc.statusNotChecked'),
      className: 'text-gray-600 bg-gray-100',
    },
  };

  const config = statusConfig[status] || statusConfig.not_checked;
  const Icon = config.icon;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${config.className}`}>
      <Icon className="w-5 h-5" />
      <span className="font-medium text-sm">{config.label}</span>
    </div>
  );
};

export default VerificationStatus;
