import { Link } from 'react-router-dom';
import { Shield, Users, ArrowLeft, CheckCircle, Zap, Lock, FileText, Edit3, Send, FileCheck } from 'lucide-react';
import Logo from '@/components/Logo';

const Navbar = () => (
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
        <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors link-underline">امکانات</a>
        <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors link-underline">نحوه کار</a>
        <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors link-underline">تعرفه‌ها</a>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          ورود
        </Link>
        <Link to="/auth" className="text-sm font-medium btn-accent px-4 py-2">
          شروع کنید
        </Link>
      </div>
    </div>
  </nav>
);

const Hero = () => (
  <section className="pt-32 pb-20 md:pt-40 md:pb-32">
    <div className="container-narrow text-center">
      <div className="animate-fade-up">
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted px-4 py-1.5 rounded-full mb-6">
          <Zap className="w-4 h-4 text-accent" />
          پلتفرم هوشمند قراردادها
        </span>
      </div>
      <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 animate-fade-up-delay-1">
        قراردادهای آنلاین
        <br />
        <span className="text-muted-foreground font-bold">ساده، امن، حرفه‌ای</span>
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto mb-10 animate-fade-up-delay-2">
        تنظیم، امضا و مدیریت قراردادهای خرید و فروش به صورت کاملاً آنلاین.
        بدون نیاز به کاغذ، با اعتبار حقوقی کامل.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up-delay-3">
        <Link to="/auth" className="w-full sm:w-auto btn-accent px-8 py-3 text-center hover:scale-105 transition-transform">
          ثبت‌نام رایگان
        </Link>
        <button className="w-full sm:w-auto flex items-center justify-center gap-2 border border-border px-8 py-3 rounded-xl font-medium hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
          مشاهده دمو
        </button>
      </div>
    </div>
  </section>
);

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: 'امنیت بالا',
      description: 'رمزنگاری پیشرفته و ذخیره‌سازی امن تمام اسناد شما',
    },
    {
      icon: FileText,
      title: 'قالب‌های آماده',
      description: 'دسترسی به صدها قالب قرارداد حقوقی و تجاری',
    },
    {
      icon: Users,
      title: 'همکاری تیمی',
      description: 'امکان مشارکت چند نفره در تنظیم و بررسی قراردادها',
    },
    {
      icon: Lock,
      title: 'امضای دیجیتال',
      description: 'امضای الکترونیکی معتبر با احراز هویت دو مرحله‌ای',
    },
  ];

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container-narrow">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            امکانات پلتفرم
          </h2>
          <p className="text-muted-foreground text-lg font-light max-w-xl mx-auto">
            همه چیزهایی که برای مدیریت حرفه‌ای قراردادها نیاز دارید
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
  const steps = [
    {
      icon: FileText,
      title: 'انتخاب قالب',
      description: 'از میان صدها قالب آماده، قرارداد مورد نظر خود را انتخاب کنید',
    },
    {
      icon: Edit3,
      title: 'تکمیل اطلاعات',
      description: 'اطلاعات طرفین و شرایط قرارداد را وارد کنید',
    },
    {
      icon: Send,
      title: 'دعوت طرف مقابل',
      description: 'لینک قرارداد را برای طرف مقابل ارسال کنید',
    },
    {
      icon: FileCheck,
      title: 'امضا و نهایی‌سازی',
      description: 'پس از امضای دو طرف، قرارداد نهایی و معتبر می‌شود',
    },
  ];

  return (
    <section id="how-it-works" className="py-20">
      <div className="container-narrow">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            نحوه کار
          </h2>
          <p className="text-muted-foreground text-lg font-light max-w-xl mx-auto">
            در ۴ مرحله ساده، قرارداد خود را تنظیم و امضا کنید
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

const Pricing = () => {
  const plans = [
    {
      name: 'رایگان',
      price: '۰',
      description: 'برای شروع و آشنایی',
      features: ['۳ قرارداد در ماه', 'قالب‌های پایه', 'امضای دیجیتال'],
      highlighted: false,
    },
    {
      name: 'حرفه‌ای',
      price: '۹۹,۰۰۰',
      description: 'برای کسب‌وکارهای کوچک',
      features: ['قرارداد نامحدود', 'همه قالب‌ها', 'همکاری تیمی', 'پشتیبانی اولویت‌دار'],
      highlighted: true,
    },
    {
      name: 'سازمانی',
      price: 'تماس بگیرید',
      description: 'برای شرکت‌های بزرگ',
      features: ['همه امکانات حرفه‌ای', 'API اختصاصی', 'مدیر حساب', 'SLA تضمینی'],
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container-narrow">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            تعرفه‌ها
          </h2>
          <p className="text-muted-foreground text-lg font-light max-w-xl mx-auto">
            پلن مناسب کسب‌وکار خود را انتخاب کنید
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`p-8 rounded-2xl border transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-primary text-primary-foreground border-primary shadow-xl'
                  : 'bg-card border-border card-hover'
              }`}
              style={plan.highlighted ? { boxShadow: '0 20px 40px -10px hsl(0 0% 10% / 0.25)' } : {}}
            >
              <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
              <p className={`text-sm mb-4 font-light ${plan.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                {plan.description}
              </p>
              <div className="mb-6">
                <span className="text-4xl font-black">{plan.price}</span>
                {plan.price !== 'تماس بگیرید' && <span className={`text-sm font-light ${plan.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}> تومان/ماه</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className={`w-4 h-4 ${plan.highlighted ? 'text-accent' : 'text-accent'}`} />
                    <span className="font-light">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-xl font-medium transition-all ${
                  plan.highlighted
                    ? 'bg-background text-foreground hover:bg-card'
                    : 'btn-accent'
                }`}
              >
                شروع کنید
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = () => (
  <section className="py-20">
    <div className="container-narrow">
      <div className="bg-primary text-primary-foreground rounded-3xl p-12 md:p-16 text-center" style={{ boxShadow: '0 20px 40px -10px hsl(0 0% 10% / 0.25)' }}>
        <h2 className="text-3xl md:text-4xl font-black mb-4">
          همین الان شروع کنید
        </h2>
        <p className="text-primary-foreground/70 text-lg font-light max-w-xl mx-auto mb-8">
          اولین قرارداد آنلاین خود را رایگان تنظیم کنید
        </p>
        <Link to="/auth" className="inline-block bg-accent text-accent-foreground px-8 py-3 rounded-xl font-medium hover:brightness-110 transition-all" style={{ boxShadow: '0 4px 14px -3px hsl(145 100% 39% / 0.40)' }}>
          ثبت‌نام رایگان
        </Link>
      </div>
    </div>
  </section>
);

const Footer = () => (
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
          <a href="#" className="hover:text-foreground transition-colors">درباره ما</a>
          <a href="#" className="hover:text-foreground transition-colors">تماس</a>
          <a href="#" className="hover:text-foreground transition-colors">حریم خصوصی</a>
          <a href="#" className="hover:text-foreground transition-colors">قوانین</a>
        </div>
      </div>
      <div className="text-center text-sm text-muted-foreground mt-8">
        © ۱۴۰۳ TruLink. تمامی حقوق محفوظ است.
      </div>
    </div>
  </footer>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;