import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, Loader2, Eye, EyeOff, CheckCircle, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import Logo from '@/components/Logo';

const loginSchema = z.object({
  email: z.string().email('ایمیل معتبر نیست'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
});

const signupSchema = z.object({
  email: z.string().email('ایمیل معتبر نیست'),
  password: z.string()
    .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
    .regex(/[0-9]/, 'رمز عبور باید حداقل یک عدد داشته باشد'),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !showOnboarding) {
      navigate('/dashboard');
    }
  }, [user, navigate, showOnboarding]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (isLogin) {
        const result = loginSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'خطا در ورود',
              description: 'ایمیل یا رمز عبور اشتباه است',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'خطا',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'خوش آمدید!',
            description: 'ورود با موفقیت انجام شد',
          });
          navigate('/dashboard');
        }
      } else {
        const result = signupSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signUp(formData.email, formData.password, '');
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'خطا در ثبت‌نام',
              description: 'این ایمیل قبلاً ثبت شده است',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'خطا',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          setShowOnboarding(true);
        }
      }
    } catch (err) {
      toast({
        title: 'خطا',
        description: 'مشکلی پیش آمد. لطفاً دوباره تلاش کنید.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onboardingSteps = [
    {
      title: 'به TruLink خوش آمدید!',
      description: 'شما با موفقیت ثبت‌نام کردید. بیایید با هم مهم‌ترین ویژگی‌ها را مرور کنیم.',
    },
    {
      title: 'قالب‌های آماده',
      description: 'از صدها قالب قرارداد حرفه‌ای استفاده کنید و وقت خود را صرفه‌جویی کنید.',
    },
    {
      title: 'امضای دیجیتال',
      description: 'قراردادها را به صورت آنلاین امضا کنید و به طرف مقابل ارسال نمایید.',
    },
  ];

  const handleOnboardingNext = () => {
    if (onboardingStep < onboardingSteps.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      navigate('/dashboard');
    }
  };

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6" dir="rtl">
        <div className="w-full max-w-md text-center">
          <div className="card-elevated p-8 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-2xl font-black mb-3">{onboardingSteps[onboardingStep].title}</h2>
            <p className="text-muted-foreground font-light mb-6">{onboardingSteps[onboardingStep].description}</p>
            
            <div className="flex justify-center gap-2 mb-6">
              {onboardingSteps.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-2 h-2 rounded-full transition-colors ${idx === onboardingStep ? 'bg-accent' : 'bg-border'}`} 
                />
              ))}
            </div>

            <button
              onClick={handleOnboardingNext}
              className="btn-accent w-full h-12 rounded-xl font-medium"
            >
              {onboardingStep < onboardingSteps.length - 1 ? 'بعدی' : 'شروع کنید'}
            </button>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            رد کردن
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            بازگشت به صفحه اصلی
          </Link>
          
          <div className="flex items-center gap-2 mb-8">
            <Logo size={40} />
            <span className="font-bold text-xl">
              <span className="text-foreground">Tru</span>
              <span className="text-accent">Link</span>
            </span>
          </div>

          <h1 className="text-2xl font-black mb-2">
            {isLogin ? 'ورود به حساب کاربری' : 'ایجاد حساب کاربری'}
          </h1>
          <p className="text-muted-foreground font-light mb-8">
            {isLogin 
              ? 'خوش آمدید! لطفاً وارد حساب خود شوید.' 
              : 'برای استفاده از امکانات TruLink ثبت‌نام کنید.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">ایمیل</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-elevated w-full h-12 pr-11 pl-4 focus:outline-none"
                  placeholder="example@email.com"
                  dir="ltr"
                />
              </div>
              {errors.email && <p className="text-destructive text-sm mt-1.5">{errors.email}</p>}
              <p className="text-muted-foreground text-xs mt-1.5 font-light">آدرس ایمیل معتبر وارد کنید</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">رمز عبور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-elevated w-full h-12 pr-11 pl-11 focus:outline-none"
                  placeholder="••••••••"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-sm mt-1.5">{errors.password}</p>}
              <p className="text-muted-foreground text-xs mt-1.5 font-light">
                {isLogin ? 'رمز عبور خود را وارد کنید' : 'حداقل ۸ کاراکتر و یک عدد'}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full h-12 rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLogin ? 'ورود' : 'ثبت‌نام'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted-foreground">یا</span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                setGoogleLoading(true);
                const { error } = await signInWithGoogle();
                if (error) {
                  toast({
                    title: 'خطا در ورود با گوگل',
                    description: error.message === 'Popup closed' ? 'ورود لغو شد' : error.message,
                    variant: 'destructive',
                  });
                  setGoogleLoading(false);
                }
              }}
              disabled={googleLoading}
              className="w-full h-12 rounded-xl font-medium border border-border bg-background hover:bg-muted transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              ورود با گوگل
            </button>
          </form>

          <p className="text-center text-muted-foreground mt-6 font-light">
            {isLogin ? 'حساب کاربری ندارید؟' : 'قبلاً ثبت‌نام کرده‌اید؟'}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-accent font-medium mr-1 hover:underline"
            >
              {isLogin ? 'ثبت‌نام کنید' : 'وارد شوید'}
            </button>
          </p>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground">
          <h2 className="text-3xl font-black mb-6">
            قراردادهای هوشمند، معاملات مطمئن
          </h2>
          <p className="text-primary-foreground/70 text-lg font-light mb-8">
            با TruLink، قراردادهای خود را به صورت آنلاین تنظیم، امضا و مدیریت کنید. سریع، امن و حرفه‌ای.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <span className="text-primary-foreground/80 font-light">صدها قالب قرارداد آماده</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-accent" />
              </div>
              <span className="text-primary-foreground/80 font-light">امضای دیجیتال امن</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-accent" />
              </div>
              <span className="text-primary-foreground/80 font-light">احراز هویت طرفین قرارداد</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;