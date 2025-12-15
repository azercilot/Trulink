import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  History, FileText, Edit, Send, Check, User, 
  Globe, Loader2, Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AuditLog {
  id: string;
  action: string;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface AuditTrailProps {
  contractId: string;
}

const AuditTrail = ({ contractId }: AuditTrailProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [contractId]);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('contract_audit_logs')
        .select('*')
        .eq('contract_id', contractId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return FileText;
      case 'edited': return Edit;
      case 'sent_for_signature': return Send;
      case 'signed': return Check;
      case 'viewed': return User;
      default: return History;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: t('audit.actionCreated'),
      edited: t('audit.actionEdited'),
      sent_for_signature: t('audit.actionSentForSignature'),
      signed: t('audit.actionSigned'),
      viewed: t('audit.actionViewed'),
      version_created: t('audit.actionVersionCreated'),
    };
    return labels[action] || action;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(i18n.language === 'fa' ? 'fa-IR' : i18n.language === 'ar' ? 'ar-SA' : 'en-US'),
      time: date.toLocaleTimeString(i18n.language === 'fa' ? 'fa-IR' : i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  if (loading) {
    return (
      <div className="bg-background rounded-2xl border border-border p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-2xl border border-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
          <History className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-semibold">{t('audit.title')}</h3>
          <p className="text-sm text-muted-foreground">{t('audit.subtitle')}</p>
        </div>
      </div>

      {logs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {t('audit.noLogs')}
        </p>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-0 bottom-0 w-px bg-border`} />

          <div className="space-y-4">
            {logs.map((log) => {
              const Icon = getActionIcon(log.action);
              const { date, time } = formatDate(log.created_at);

              return (
                <div key={log.id} className={`relative flex gap-4 ${isRTL ? 'pr-10' : 'pl-10'}`}>
                  {/* Icon */}
                  <div className={`absolute ${isRTL ? 'right-0' : 'left-0'} w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 rounded-xl bg-muted">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{getActionLabel(log.action)}</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{date}</span>
                        <span>{time}</span>
                      </div>
                    </div>

                    {log.details && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                      </p>
                    )}

                    {log.ip_address && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Globe className="w-3 h-3" />
                        <span dir="ltr">{log.ip_address}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditTrail;
