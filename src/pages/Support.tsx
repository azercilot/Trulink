import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowLeft, ChevronDown, Send, Loader2, MessageCircle, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/Logo';
import { supabase } from '@/integrations/supabase/client';
const Support = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const faqs = [
    { q: t('support.faq.q1'), a: t('support.faq.a1') },
    { q: t('support.faq.q2'), a: t('support.faq.a2') },
    { q: t('support.faq.q3'), a: t('support.faq.a3') },
    { q: t('support.faq.q4'), a: t('support.faq.a4') },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-support-confirmation', {
        body: {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          language: i18n.language,
        },
      });

      if (error) throw error;

      toast({
        title: t('support.contact.success'),
        description: t('support.contact.successDesc'),
      });
      
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      console.error('Error sending support email:', error);
      toast({
        title: t('support.contact.error'),
        description: t('support.contact.errorDesc'),
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container-narrow flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
              <BackIcon className="w-5 h-5" />
            </Link>
            <h1 className="font-semibold">{t('support.title')}</h1>
          </div>
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Logo size={28} />
            <span className="font-semibold text-sm">
              <span className="text-foreground">Tru</span>
              <span className="text-accent">Link</span>
            </span>
          </Link>
        </div>
      </header>

      <div className="container-narrow py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-black mb-2">{t('support.title')}</h1>
          <p className="text-muted-foreground font-light">{t('support.subtitle')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* FAQ Section */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-accent" />
              {t('support.faq.title')}
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-right hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-medium text-sm">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-4 pb-4 text-sm text-muted-foreground font-light">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-accent" />
              {t('support.contact.title')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">{t('support.contact.name')}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  placeholder={t('support.contact.namePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t('support.contact.email')}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  placeholder={t('support.contact.emailPlaceholder')}
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t('support.contact.subject')}</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  placeholder={t('support.contact.subjectPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t('support.contact.message')}</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
                  placeholder={t('support.contact.messagePlaceholder')}
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full h-11 btn-accent flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                {t('support.contact.send')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
