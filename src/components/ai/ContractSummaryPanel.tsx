import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, Loader2, Users, DollarSign, Calendar, 
  XCircle, ClipboardList, Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContractSummary {
  subject: string;
  parties: Array<{ name: string; role: string }>;
  amount: { value: string; paymentTerms: string };
  duration: { start: string; end: string; notes: string };
  terminationConditions: string[];
  keyObligations: Array<{ party: string; obligations: string[] }>;
  simpleSummary: string;
}

interface ContractSummaryPanelProps {
  contractText: string;
  contractType: string;
  existingSummary?: ContractSummary | null;
  onSummaryComplete?: (summary: ContractSummary) => void;
}

const ContractSummaryPanel = ({ 
  contractText, 
  contractType, 
  existingSummary,
  onSummaryComplete 
}: ContractSummaryPanelProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<ContractSummary | null>(existingSummary || null);

  const generateSummary = async () => {
    if (!contractText.trim()) {
      toast({
        title: t('ai.noContent'),
        description: t('ai.noContentDesc'),
        variant: 'destructive',
      });
      return;
    }

    setSummarizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-contract', {
        body: {
          contractText,
          contractType,
          analysisType: 'summary',
          language: i18n.language,
        },
      });

      if (error) throw error;
      
      if (data.summary) {
        setSummary(data.summary);
        onSummaryComplete?.(data.summary);
        toast({
          title: t('ai.summaryComplete'),
          description: t('ai.summaryCompleteDesc'),
        });
      }
    } catch (error: any) {
      console.error('Error generating summary:', error);
      toast({
        title: t('ai.summaryError'),
        description: error.message || t('ai.summaryErrorDesc'),
        variant: 'destructive',
      });
    } finally {
      setSummarizing(false);
    }
  };

  if (!summary) {
    return (
      <button
        onClick={generateSummary}
        disabled={summarizing}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-accent text-accent font-medium hover:bg-accent/10 transition-colors disabled:opacity-50"
      >
        {summarizing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t('ai.summarizing')}
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {t('ai.generateSummary')}
          </>
        )}
      </button>
    );
  }

  return (
    <div className="bg-background rounded-2xl border border-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-semibold">{t('ai.contractSummary')}</h3>
          <p className="text-sm text-muted-foreground">{t('ai.contractSummaryDesc')}</p>
        </div>
      </div>

      {/* Simple Summary */}
      {summary.simpleSummary && (
        <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6">
          <p className="text-sm leading-relaxed">{summary.simpleSummary}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Subject */}
        {summary.subject && (
          <div className="p-4 rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">{t('ai.subject')}</span>
            </div>
            <p className="text-sm">{summary.subject}</p>
          </div>
        )}

        {/* Parties */}
        {summary.parties && summary.parties.length > 0 && (
          <div className="p-4 rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">{t('ai.parties')}</span>
            </div>
            <div className="space-y-1">
              {summary.parties.map((party, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium">{party.name}</span>
                  {party.role && <span className="text-muted-foreground"> - {party.role}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Amount */}
        {summary.amount && (summary.amount.value || summary.amount.paymentTerms) && (
          <div className="p-4 rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">{t('ai.amount')}</span>
            </div>
            {summary.amount.value && <p className="text-sm font-medium">{summary.amount.value}</p>}
            {summary.amount.paymentTerms && (
              <p className="text-sm text-muted-foreground mt-1">{summary.amount.paymentTerms}</p>
            )}
          </div>
        )}

        {/* Duration */}
        {summary.duration && (summary.duration.start || summary.duration.end) && (
          <div className="p-4 rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">{t('ai.duration')}</span>
            </div>
            <div className="text-sm">
              {summary.duration.start && <span>{summary.duration.start}</span>}
              {summary.duration.start && summary.duration.end && <span> - </span>}
              {summary.duration.end && <span>{summary.duration.end}</span>}
            </div>
            {summary.duration.notes && (
              <p className="text-sm text-muted-foreground mt-1">{summary.duration.notes}</p>
            )}
          </div>
        )}
      </div>

      {/* Termination Conditions */}
      {summary.terminationConditions && summary.terminationConditions.length > 0 && (
        <div className="mt-4 p-4 rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">{t('ai.terminationConditions')}</span>
          </div>
          <ul className="space-y-2">
            {summary.terminationConditions.map((condition, index) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                {condition}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Obligations */}
      {summary.keyObligations && summary.keyObligations.length > 0 && (
        <div className="mt-4 p-4 rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">{t('ai.keyObligations')}</span>
          </div>
          <div className="space-y-4">
            {summary.keyObligations.map((item, index) => (
              <div key={index}>
                <p className="text-sm font-medium mb-2">{item.party}</p>
                <ul className="space-y-1">
                  {item.obligations.map((obligation, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      {obligation}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regenerate button */}
      <button
        onClick={generateSummary}
        disabled={summarizing}
        className="mt-4 w-full flex items-center justify-center gap-2 border border-border py-2 rounded-xl font-medium hover:bg-muted transition-colors disabled:opacity-50 text-sm"
      >
        {summarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {t('ai.regenerateSummary')}
      </button>
    </div>
  );
};

export default ContractSummaryPanel;
