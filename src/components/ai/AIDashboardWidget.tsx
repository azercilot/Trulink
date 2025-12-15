import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, MessageCircle, Loader2, Send, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIDashboardWidget = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-assist', {
        body: {
          type: 'suggest_description',
          context: { existingText: userMessage },
          language: i18n.language
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data?.suggestion || t('ai.noResponse')
      }]);
    } catch (error) {
      console.error('AI chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: t('ai.errorResponse')
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
      >
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">{t('ai.assistant')}</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 w-80 sm:w-96 bg-background rounded-2xl border border-border shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">{t('ai.assistant')}</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded-lg hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-72 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">{t('ai.welcomeMessage')}</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-xl text-sm ${
                msg.role === 'user'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted px-4 py-2 rounded-xl">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('ai.inputPlaceholder')}
            className="flex-1 h-10 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent text-sm"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIDashboardWidget;
