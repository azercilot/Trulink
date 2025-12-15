import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  AlertTriangle, CheckCircle, AlertCircle, Lightbulb, 
  Loader2, Brain, ChevronDown, ChevronUp, Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RiskAnalysis {
  riskLevel: 'low' | 'medium' | 'high';
  overallScore: number;
  risks: Array<{ title: string; description: string; severity: 'low' | 'medium' | 'high' }>;
  ambiguities: Array<{ clause: string; issue: string }>;
  suggestions: Array<{ title: string; description: string }>;
}

interface RiskAnalysisPanelProps {
  contractText: string;
  contractType: string;
  existingAnalysis?: RiskAnalysis | null;
  onAnalysisComplete?: (analysis: RiskAnalysis) => void;
}

const RiskAnalysisPanel = ({ 
  contractText, 
  contractType, 
  existingAnalysis,
  onAnalysisComplete 
}: RiskAnalysisPanelProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(existingAnalysis || null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['risks']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const analyzeContract = async () => {
    if (!contractText.trim()) {
      toast({
        title: t('ai.noContent'),
        description: t('ai.noContentDesc'),
        variant: 'destructive',
      });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-contract', {
        body: {
          contractText,
          contractType,
          analysisType: 'risk',
          language: i18n.language,
        },
      });

      if (error) throw error;
      
      if (data.riskAnalysis) {
        setAnalysis(data.riskAnalysis);
        onAnalysisComplete?.(data.riskAnalysis);
        toast({
          title: t('ai.analysisComplete'),
          description: t('ai.analysisCompleteDesc'),
        });
      }
    } catch (error: any) {
      console.error('Error analyzing contract:', error);
      toast({
        title: t('ai.analysisError'),
        description: error.message || t('ai.analysisErrorDesc'),
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLevelLabel = (level: string) => {
    switch (level) {
      case 'low': return t('ai.riskLow');
      case 'medium': return t('ai.riskMedium');
      case 'high': return t('ai.riskHigh');
      default: return level;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!analysis) {
    return (
      <div className="bg-background rounded-2xl border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold">{t('ai.riskAnalysis')}</h3>
            <p className="text-sm text-muted-foreground">{t('ai.riskAnalysisDesc')}</p>
          </div>
        </div>
        
        <button
          onClick={analyzeContract}
          disabled={analyzing}
          className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground py-3 rounded-xl font-medium hover:brightness-110 transition-all disabled:opacity-50"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('ai.analyzing')}
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              {t('ai.startAnalysis')}
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold">{t('ai.riskAnalysis')}</h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(analysis.riskLevel)}`}>
              {getRiskLevelLabel(analysis.riskLevel)}
            </span>
          </div>
        </div>
        <div className="text-center">
          <div className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
            {analysis.overallScore}
          </div>
          <div className="text-xs text-muted-foreground">{t('ai.score')}</div>
        </div>
      </div>

      {/* Risks Section */}
      {analysis.risks && analysis.risks.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => toggleSection('risks')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="font-medium">{t('ai.risks')} ({analysis.risks.length})</span>
            </div>
            {expandedSections.has('risks') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {expandedSections.has('risks') && (
            <div className="mt-2 space-y-2">
              {analysis.risks.map((risk, index) => (
                <div key={index} className="p-3 rounded-xl border border-border">
                  <div className="flex items-start gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRiskLevelColor(risk.severity)}`}>
                      {getRiskLevelLabel(risk.severity)}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{risk.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ambiguities Section */}
      {analysis.ambiguities && analysis.ambiguities.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => toggleSection('ambiguities')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">{t('ai.ambiguities')} ({analysis.ambiguities.length})</span>
            </div>
            {expandedSections.has('ambiguities') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {expandedSections.has('ambiguities') && (
            <div className="mt-2 space-y-2">
              {analysis.ambiguities.map((amb, index) => (
                <div key={index} className="p-3 rounded-xl border border-border">
                  <p className="font-medium text-sm">{amb.clause}</p>
                  <p className="text-sm text-muted-foreground mt-1">{amb.issue}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Suggestions Section */}
      {analysis.suggestions && analysis.suggestions.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => toggleSection('suggestions')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent" />
              <span className="font-medium">{t('ai.suggestions')} ({analysis.suggestions.length})</span>
            </div>
            {expandedSections.has('suggestions') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {expandedSections.has('suggestions') && (
            <div className="mt-2 space-y-2">
              {analysis.suggestions.map((sug, index) => (
                <div key={index} className="p-3 rounded-xl border border-accent/30 bg-accent/5">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{sug.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{sug.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Re-analyze button */}
      <button
        onClick={analyzeContract}
        disabled={analyzing}
        className="w-full flex items-center justify-center gap-2 border border-border py-2 rounded-xl font-medium hover:bg-muted transition-colors disabled:opacity-50 text-sm"
      >
        {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
        {t('ai.reanalyze')}
      </button>
    </div>
  );
};

export default RiskAnalysisPanel;
