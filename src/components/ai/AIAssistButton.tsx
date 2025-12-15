import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIAssistButtonProps {
  type: 'suggest_title' | 'suggest_description' | 'suggest_terms' | 'improve_text' | 'explain_clause';
  context: {
    contractType?: string;
    existingText?: string;
    partyName?: string;
    amount?: string;
  };
  onSuggestion: (suggestion: string) => void;
  className?: string;
  variant?: 'icon' | 'button' | 'inline';
}

const AIAssistButton = ({ type, context, onSuggestion, className = '', variant = 'icon' }: AIAssistButtonProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleAssist = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assist', {
        body: { type, context, language: i18n.language }
      });

      if (error) throw error;

      if (data?.suggestion) {
        onSuggestion(data.suggestion);
        toast({
          title: t('ai.suggestionReady'),
          description: t('ai.suggestionApplied'),
        });
      }
    } catch (error) {
      console.error('AI assist error:', error);
      toast({
        title: t('ai.error'),
        description: t('ai.errorDesc'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const labels: Record<string, string> = {
    suggest_title: t('ai.suggestTitle'),
    suggest_description: t('ai.suggestDescription'),
    suggest_terms: t('ai.suggestTerms'),
    improve_text: t('ai.improveText'),
    explain_clause: t('ai.explainClause'),
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleAssist}
        disabled={loading}
        className={`p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:opacity-90 transition-all disabled:opacity-50 ${className}`}
        title={labels[type]}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
      </button>
    );
  }

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={handleAssist}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 transition-colors disabled:opacity-50 ${className}`}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5" />
        )}
        {labels[type]}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAssist}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4" />
      )}
      {labels[type]}
    </button>
  );
};

export default AIAssistButton;
