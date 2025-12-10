import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight, User, Mail, Phone, Building, CreditCard, 
  Bell, Lock, Loader2, Check
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  national_id: string | null;
}

const Settings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    company_name: '',
    national_id: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          company_name: data.company_name || '',
          national_id: data.national_id || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name || null,
          phone: formData.phone || null,
          company_name: formData.company_name || null,
          national_id: formData.national_id || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'ذخیره شد',
        description: 'تغییرات با موفقیت ذخیره شد',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'خطا',
        description: 'در ذخیره تغییرات مشکلی پیش آمد',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="animate-pulse text-muted-foreground">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container-narrow flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ArrowRight className="w-5 h-5" />
            </Link>
            <h1 className="font-semibold">تنظیمات</h1>
          </div>
        </div>
      </header>

      <div className="container-narrow py-8">
        <div className="max-w-2xl">
          {/* Profile Section */}
          <div className="bg-background rounded-2xl border border-border p-6 mb-6">
            <h2 className="font-semibold text-lg mb-6">اطلاعات شخصی</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">ایمیل</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full h-12 pr-11 pl-4 rounded-xl border border-border bg-muted text-muted-foreground cursor-not-allowed"
                    dir="ltr"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">ایمیل قابل تغییر نیست</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">نام و نام خانوادگی</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full h-12 pr-11 pl-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="نام کامل خود را وارد کنید"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">شماره تماس</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full h-12 pr-11 pl-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="09123456789"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">نام شرکت</label>
                <div className="relative">
                  <Building className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    className="w-full h-12 pr-11 pl-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="نام شرکت (اختیاری)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">کد ملی</label>
                <div className="relative">
                  <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    name="national_id"
                    value={formData.national_id}
                    onChange={handleChange}
                    className="w-full h-12 pr-11 pl-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="0123456789"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
                ذخیره تغییرات
              </button>
            </form>
          </div>

          {/* Notifications Section */}
          <div className="bg-background rounded-2xl border border-border p-6 mb-6">
            <h2 className="font-semibold text-lg mb-6">اعلان‌ها</h2>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">اعلان‌های ایمیلی</p>
                    <p className="text-sm text-muted-foreground">دریافت ایمیل برای تغییرات قراردادها</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded border-border"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">یادآوری انقضا</p>
                    <p className="text-sm text-muted-foreground">اطلاع‌رسانی قبل از انقضای قراردادها</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded border-border"
                />
              </label>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-background rounded-2xl border border-border p-6">
            <h2 className="font-semibold text-lg mb-6">امنیت</h2>
            
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-muted transition-colors w-full text-right">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">تغییر رمز عبور</p>
                <p className="text-sm text-muted-foreground">رمز عبور خود را تغییر دهید</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
