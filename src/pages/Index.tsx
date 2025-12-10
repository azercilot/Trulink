import { Link } from 'react-router-dom';
import { FileText, Shield, Users, ArrowLeft, CheckCircle, Zap, Lock } from 'lucide-react';

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
    <div className="container-narrow flex items-center justify-between h-16">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
          <FileText className="w-4 h-4 text-background" />
        </div>
        <span className="font-semibold text-lg">قراردادینو</span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors link-underline">امکانات</a>
        <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors link-underline">نحوه کار</a>
        <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors link-underline">تعرفه‌ها</a>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          ورود
        </Link>
        <Link to="/auth" className="text-sm font-medium bg-foreground text-background px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
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
          <Zap className="w-4 h-4" />
          پلتفرم هوشمند قراردادها
        </span>
      </div>
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-up-delay-1">
        قراردادهای آنلاین
        <br />
        <span className="text-muted-foreground">ساده، امن، حرفه‌ای</span>
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up-delay-2">
        تنظیم، امضا و مدیریت قراردادهای خرید و فروش به صورت کاملاً آنلاین.
        بدون نیاز به کاغذ، با اعتبار حقوقی کامل.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up-delay-3">
        <button className="w-full sm:w-auto bg-foreground text-background px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-all hover:scale-105">
          ثبت‌نام رایگان
        </button>
        <button className="w-full sm:w-auto flex items-center justify-center gap-2 border border-border px-8 py-3 rounded-lg font-medium hover:bg-muted transition-colors">
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            امکانات پلتفرم
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            همه چیزهایی که برای مدیریت حرفه‌ای قراردادها نیاز دارید
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-background p-6 rounded-2xl border border-border card-hover"
            >
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
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
      number: '۰۱',
      title: 'انتخاب قالب',
      description: 'از میان صدها قالب آماده، قرارداد مورد نظر خود را انتخاب کنید',
    },
    {
      number: '۰۲',
      title: 'تکمیل اطلاعات',
      description: 'اطلاعات طرفین و شرایط قرارداد را وارد کنید',
    },
    {
      number: '۰۳',
      title: 'دعوت طرف مقابل',
      description: 'لینک قرارداد را برای طرف مقابل ارسال کنید',
    },
    {
      number: '۰۴',
      title: 'امضا و نهایی‌سازی',
      description: 'پس از امضای دو طرف، قرارداد نهایی و معتبر می‌شود',
    },
  ];

  return (
    <section id="how-it-works" className="py-20">
      <div className="container-narrow">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            نحوه کار
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            در ۴ مرحله ساده، قرارداد خود را تنظیم و امضا کنید
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <span className="text-6xl font-bold text-muted/50 absolute -top-4 right-0">
                {step.number}
              </span>
              <div className="pt-12">
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            تعرفه‌ها
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            پلن مناسب کسب‌وکار خود را انتخاب کنید
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`p-8 rounded-2xl border card-hover ${
                plan.highlighted
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background border-border'
              }`}
            >
              <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
              <p className={`text-sm mb-4 ${plan.highlighted ? 'text-gray-400' : 'text-muted-foreground'}`}>
                {plan.description}
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== 'تماس بگیرید' && <span className={`text-sm ${plan.highlighted ? 'text-gray-400' : 'text-muted-foreground'}`}> تومان/ماه</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className={`w-4 h-4 ${plan.highlighted ? 'text-gray-400' : 'text-muted-foreground'}`} />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.highlighted
                    ? 'bg-background text-foreground hover:bg-gray-100'
                    : 'bg-muted hover:bg-gray-200'
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
      <div className="bg-foreground text-background rounded-3xl p-12 md:p-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          همین الان شروع کنید
        </h2>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
          اولین قرارداد آنلاین خود را رایگان تنظیم کنید
        </p>
        <button className="bg-background text-foreground px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
          ثبت‌نام رایگان
        </button>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-12 border-t border-border">
    <div className="container-narrow">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
            <FileText className="w-4 h-4 text-background" />
          </div>
          <span className="font-semibold">قراردادینو</span>
        </div>
        <div className="flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">درباره ما</a>
          <a href="#" className="hover:text-foreground transition-colors">تماس</a>
          <a href="#" className="hover:text-foreground transition-colors">حریم خصوصی</a>
          <a href="#" className="hover:text-foreground transition-colors">قوانین</a>
        </div>
      </div>
      <div className="text-center text-sm text-muted-foreground mt-8">
        © ۱۴۰۳ قراردادینو. تمامی حقوق محفوظ است.
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
