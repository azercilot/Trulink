import { useTranslation } from 'react-i18next';
import { 
  FileText, Loader2, Users, DollarSign, Calendar, 
  XCircle, ClipboardList, Sparkles
} from 'lucide-react';

interface ContractSummaryPanelProps {
  summary: string | null;
  onAnalyze: () => void;
  analyzing: boolean;
}

const ContractSummaryPanel = ({ 
  summary, 
  onAnalyze,
  analyzing 
}: ContractSummaryPanelProps) => {
  const { t } = useTranslation();

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

      {summary ? (
        <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{summary}</p>
        </div>
      ) : (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{t('ai.noSummaryYet')}</p>
        </div>
      )}

      <button
        onClick={onAnalyze}
        disabled={analyzing}
        className="mt-4 w-full flex items-center justify-center gap-2 border border-border py-3 rounded-xl font-medium hover:bg-muted transition-colors disabled:opacity-50"
      >
        {analyzing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t('ai.analyzing')}
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {summary ? t('ai.regenerateSummary') : t('ai.generateSummary')}
          </>
        )}
      </button>
    </div>
  );
};

export default ContractSummaryPanel;