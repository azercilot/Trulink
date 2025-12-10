import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('ایمیل معتبر نیست'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  email: z.string().email('ایمیل معتبر نیست'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'رمز عبور و تکرار آن یکسان نیستند',
  path: ['confirmPassword'],
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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

        const { error } = await signUp(formData.email, formData.password, formData.fullName);
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
          toast({
            title: 'ثبت‌نام موفق!',
            description: 'حساب کاربری شما ایجاد شد',
          });
          navigate('/dashboard');
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
            <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
              <FileText className="w-5 h-5 text-background" />
            </div>
            <span className="font-bold text-xl">قراردادینو</span>
          </div>

          <h1 className="text-2xl font-bold mb-2">
            {isLogin ? 'ورود به حساب کاربری' : 'ایجاد حساب کاربری'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isLogin 
              ? 'خوش آمدید! لطفاً وارد حساب خود شوید.' 
              : 'برای استفاده از امکانات قراردادینو ثبت‌نام کنید.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-1.5">نام و نام خانوادگی</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full h-12 pr-11 pl-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="نام کامل خود را وارد کنید"
                  />
                </div>
                {errors.fullName && <p className="text-destructive text-sm mt-1">{errors.fullName}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5">ایمیل</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-12 pr-11 pl-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="example@email.com"
                  dir="ltr"
                />
              </div>
              {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">رمز عبور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-12 pr-11 pl-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>
              {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-1.5">تکرار رمز عبور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full h-12 pr-11 pl-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>
                {errors.confirmPassword && <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-foreground text-background rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLogin ? 'ورود' : 'ثبت‌نام'}
            </button>
          </form>

          <p className="text-center text-muted-foreground mt-6">
            {isLogin ? 'حساب کاربری ندارید؟' : 'قبلاً ثبت‌نام کرده‌اید؟'}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-foreground font-medium mr-1 hover:underline"
            >
              {isLogin ? 'ثبت‌نام کنید' : 'وارد شوید'}
            </button>
          </p>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-foreground items-center justify-center p-12">
        <div className="max-w-md text-background">
          <h2 className="text-3xl font-bold mb-6">
            قراردادهای هوشمند، معاملات مطمئن
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            با قراردادینو، قراردادهای خود را به صورت آنلاین تنظیم، امضا و مدیریت کنید. سریع، امن و حرفه‌ای.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              <span className="text-gray-300">صدها قالب قرارداد آماده</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <span className="text-gray-300">امضای دیجیتال امن</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <span className="text-gray-300">احراز هویت طرفین قرارداد</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
