import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Users, ArrowLeft, ArrowRight, Zap, Lock, FileText, Edit3, Send, FileCheck, Settings } from 'lucide-react';
import Logo from '@/components/Logo';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container-narrow flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Logo size={36} />
          <span className="font-semibold text-lg">
            <span className="text-foreground">Tru</span>
            <span className="text-accent">Link</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors link-underline">{t('nav.features')}</a>
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors link-underline">{t('nav.howItWorks')}</a>
          <Link to="/support" className="text-muted-foreground hover:text-foreground transition-colors link-underline">{t('nav.support')}</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/settings" className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
            <Settings className="w-5 h-5" />
          </Link>
          <Link to="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t('nav.login')}
          </Link>
          <Link to="/auth" className="text-sm font-medium btn-accent px-4 py-2">
            {t('nav.getStarted')}
          </Link>
        </div>
      </div>
    </nav>
  );
};

const Hero = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="container-narrow text-center">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted px-4 py-1.5 rounded-full mb-6">
            <Zap className="w-4 h-4 text-accent" />
            {t('hero.badge')}
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 animate-fade-up-delay-1">
          {t('hero.title')}
          <br />
          <span className="text-muted-foreground font-bold">{t('hero.subtitle')}</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto mb-10 animate-fade-up-delay-2">
          {t('hero.description')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up-delay-3">
          <Link to="/auth" className="w-full sm:w-auto btn-accent px-8 py-3 text-center hover:scale-105 transition-transform">
            {t('hero.freeSignup')}
          </Link>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 border border-border px-8 py-3 rounded-xl font-medium hover:bg-muted transition-colors">
            <ArrowIcon className="w-4 h-4" />
            {t('hero.viewDemo')}
          </button>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: Shield,
      title: t('features.security.title'),
      description: t('features.security.description'),
    },
    {
      icon: FileText,
      title: t('features.templates.title'),
      description: t('features.templates.description'),
    },
    {
      icon: Users,
      title: t('features.teamwork.title'),
      description: t('features.teamwork.description'),
    },
    {
      icon: Lock,
      title: t('features.signature.title'),
      description: t('features.signature.description'),
    },
  ];

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container-narrow">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            {t('features.title')}
          </h2>
          <p className="text-muted-foreground text-lg font-light max-w-xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card p-6 rounded-2xl border border-border card-hover"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm font-light">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const { t } = useTranslation();
  
  const steps = [
    {
      icon: FileText,
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description'),
    },
    {
      icon: Edit3,
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
    },
    {
      icon: Send,
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
    },
    {
      icon: FileCheck,
      title: t('howItWorks.step4.title'),
      description: t('howItWorks.step4.description'),
    },
  ];

  return (
    <section id="how-it-works" className="py-20">
      <div className="container-narrow">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            {t('howItWorks.title')}
          </h2>
          <p className="text-muted-foreground text-lg font-light max-w-xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ boxShadow: '0 8px 24px -4px hsl(145 100% 39% / 0.35)' }}>
                <step.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm font-light">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = () => {
  const { t } = useTranslation();
  
  return (
    <section className="py-20">
      <div className="container-narrow">
        <div className="bg-primary text-primary-foreground rounded-3xl p-12 md:p-16 text-center" style={{ boxShadow: '0 20px 40px -10px hsl(0 0% 10% / 0.25)' }}>
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-primary-foreground/70 text-lg font-light max-w-xl mx-auto mb-8">
            {t('cta.subtitle')}
          </p>
          <Link to="/auth" className="inline-block bg-accent text-accent-foreground px-8 py-3 rounded-xl font-medium hover:brightness-110 transition-all" style={{ boxShadow: '0 4px 14px -3px hsl(145 100% 39% / 0.40)' }}>
            {t('cta.button')}
          </Link>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="py-12 border-t border-border">
      <div className="container-narrow">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Logo size={32} />
            <span className="font-semibold">
              <span className="text-foreground">Tru</span>
              <span className="text-accent">Link</span>
            </span>
          </Link>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">{t('footer.aboutUs')}</a>
            <a href="#" className="hover:text-foreground transition-colors">{t('footer.contact')}</a>
            <a href="#" className="hover:text-foreground transition-colors">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-foreground transition-colors">{t('footer.terms')}</a>
            <Link to="/support" className="hover:text-foreground transition-colors">{t('footer.support')}</Link>
          </div>
        </div>
        <div className="text-center text-sm text-muted-foreground mt-8">
          {t('footer.copyright')}
        </div>
      </div>
    </footer>
  );
};

const Index = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  
  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
