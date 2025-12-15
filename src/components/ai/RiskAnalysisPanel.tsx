import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  AlertTriangle, CheckCircle, AlertCircle, Lightbulb, 
  Loader2, Brain, ChevronDown, ChevronUp, Shield
} from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

interface RiskItem {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

interface Ambiguity {
  clause: string;
  issue: string;
}

interface Suggestion {
  title: string;
  description: string;
}

interface RiskAnalysis {
  riskLevel?: 'low' | 'medium' | 'high';
  overallScore?: number;
  risks?: RiskItem[];
  ambiguities?: Ambiguity[];
  suggestions?: Suggestion[];
}

interface RiskAnalysisPanelProps {
  riskAnalysis: Json | null;
  onAnalyze: () => void;
  analyzing: boolean;
}

const RiskAnalysisPanel = ({ 
  riskAnalysis, 
  onAnalyze,
  analyzing 
}: RiskAnalysisPanelProps) => {
  const { t } = useTranslation();
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

  // Parse the JSON risk analysis
  const analysis: RiskAnalysis | null = riskAnalysis ? (riskAnalysis as RiskAnalysis) : null;

  if (!analysis || !analysis.riskLevel) {
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
        
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{t('ai.noAnalysisYet')}</p>
        </div>
        
        <button
          onClick={onAnalyze}
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
        {analysis.overallScore !== undefined && (
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
              {analysis.overallScore}
            </div>
            <div className="text-xs text-muted-foreground">{t('ai.score')}</div>
          </div>
        )}
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
        onClick={onAnalyze}
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