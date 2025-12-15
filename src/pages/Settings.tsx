import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, ArrowLeft, User, Mail, Phone, Building, CreditCard, 
  Bell, Lock, Loader2, Check, Globe, Camera, Trash2, LogOut, Eye, EyeOff
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
  avatar_url: string | null;
  gender: string | null;
}

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    company_name: '',
    national_id: '',
    gender: '',
  });
  
  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        setAvatarUrl(data.avatar_url);
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          company_name: data.company_name || '',
          national_id: data.national_id || '',
          gender: data.gender || '',
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
          gender: formData.gender || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: t('settings.saved'),
        description: t('settings.savedDesc'),
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: t('settings.error'),
        description: t('settings.errorDesc'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: t('settings.security.passwordMismatch'),
        description: t('settings.security.passwordMismatchDesc'),
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: t('settings.security.passwordTooShort'),
        description: t('settings.security.passwordTooShortDesc'),
        variant: 'destructive',
      });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast({
        title: t('settings.security.passwordChanged'),
        description: t('settings.security.passwordChangedDesc'),
      });
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: t('settings.security.passwordError'),
        description: t('settings.security.passwordErrorDesc'),
        variant: 'destructive',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: t('settings.avatar.invalidType'),
        description: t('settings.avatar.invalidTypeDesc'),
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: t('settings.avatar.tooLarge'),
        description: t('settings.avatar.tooLargeDesc'),
        variant: 'destructive',
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl + '?t=' + Date.now()); // Add timestamp to bust cache
      toast({
        title: t('settings.avatar.uploaded'),
        description: t('settings.avatar.uploadedDesc'),
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: t('settings.avatar.uploadError'),
        description: t('settings.avatar.uploadErrorDesc'),
        variant: 'destructive',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;

    setUploadingAvatar(true);
    try {
      // List files in user's folder
      const { data: files } = await supabase.storage
        .from('avatars')
        .list(user.id);

      // Delete all avatar files
      if (files && files.length > 0) {
        const filesToDelete = files.map(f => `${user.id}/${f.name}`);
        await supabase.storage.from('avatars').remove(filesToDelete);
      }

      // Update profile
      await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', user.id);

      setAvatarUrl(null);
      toast({
        title: t('settings.avatar.removed'),
        description: t('settings.avatar.removedDesc'),
      });
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast({
        title: t('settings.avatar.removeError'),
        variant: 'destructive',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="animate-pulse text-muted-foreground">{t('settings.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container-narrow flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-muted rounded-lg transition-colors">
              <BackIcon className="w-5 h-5" />
            </Link>
            <h1 className="font-semibold">{t('settings.title')}</h1>
          </div>
        </div>
      </header>

      <div className="container-narrow py-8">
        <div className="max-w-2xl">
          {/* Avatar Section */}
          <div className="bg-background rounded-2xl border border-border p-6 mb-6">
            <h2 className="font-semibold text-lg mb-6">{t('settings.avatar.title')}</h2>
            
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-accent" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground font-medium hover:brightness-110 transition-all disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  {avatarUrl ? t('settings.avatar.change') : t('settings.avatar.upload')}
                </button>
                {avatarUrl && (
                  <button
                    onClick={handleRemoveAvatar}
                    disabled={uploadingAvatar}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('settings.avatar.remove')}
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">{t('settings.avatar.hint')}</p>
          </div>

          {/* Profile Section */}
          <div className="bg-background rounded-2xl border border-border p-6 mb-6">
            <h2 className="font-semibold text-lg mb-6">{t('settings.profile.title')}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">{t('settings.profile.email')}</label>
                <div className="relative">
                  <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className={`w-full h-12 ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} rounded-xl border border-border bg-muted text-muted-foreground cursor-not-allowed`}
                    dir="ltr"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t('settings.profile.emailNote')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">{t('settings.profile.fullName')}</label>
                <div className="relative">
                  <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className={`w-full h-12 ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring`}
                    placeholder={t('settings.profile.fullNamePlaceholder')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">{t('settings.profile.phone')}</label>
                <div className="relative">
                  <Phone className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full h-12 ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring`}
                    placeholder="09123456789"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">{t('settings.profile.companyName')}</label>
                <div className="relative">
                  <Building className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    className={`w-full h-12 ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring`}
                    placeholder={t('settings.profile.companyNamePlaceholder')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">{t('settings.profile.nationalId')}</label>
                <div className="relative">
                  <CreditCard className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                  <input
                    type="text"
                    name="national_id"
                    value={formData.national_id}
                    onChange={handleChange}
                    className={`w-full h-12 ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring`}
                    placeholder="0123456789"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">{t('settings.profile.gender')}</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: 'male', label: t('settings.profile.genderMale') },
                    { value: 'female', label: t('settings.profile.genderFemale') },
                    { value: 'other', label: t('settings.profile.genderOther') },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: option.value })}
                      className={`px-4 py-2.5 rounded-xl border transition-all ${
                        formData.gender === option.value
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                    </button>
                  ))}
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
                {t('settings.profile.save')}
              </button>
            </form>
          </div>

          {/* Language Section */}
          <div className="bg-background rounded-2xl border border-border p-6 mb-6">
            <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Globe className="w-5 h-5 text-muted-foreground" />
              {t('settings.language.title')}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">{t('settings.language.subtitle')}</p>
            
            <div className="flex flex-wrap gap-3">
              {[
                { code: 'fa', label: t('settings.language.fa'), flag: '🇮🇷' },
                { code: 'en', label: t('settings.language.en'), flag: '🇬🇧' },
                { code: 'ar', label: t('settings.language.ar'), flag: '🇸🇦' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                    i18n.language === lang.code
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-medium">{lang.label}</span>
                  {i18n.language === lang.code && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-background rounded-2xl border border-border p-6 mb-6">
            <h2 className="font-semibold text-lg mb-6">{t('settings.notifications.title')}</h2>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{t('settings.notifications.emailNotifications')}</p>
                    <p className="text-sm text-muted-foreground">{t('settings.notifications.emailNotificationsDesc')}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded border-border accent-accent"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{t('settings.notifications.expiryReminders')}</p>
                    <p className="text-sm text-muted-foreground">{t('settings.notifications.expiryRemindersDesc')}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded border-border accent-accent"
                />
              </label>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-background rounded-2xl border border-border p-6 mb-6">
            <h2 className="font-semibold text-lg mb-6">{t('settings.security.title')}</h2>
            
            <button 
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-muted transition-colors w-full"
            >
              <Lock className="w-5 h-5 text-muted-foreground" />
              <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                <p className="font-medium">{t('settings.security.changePassword')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.security.changePasswordDesc')}</p>
              </div>
            </button>

            {showPasswordSection && (
              <form onSubmit={handlePasswordChange} className="mt-6 space-y-4 pt-6 border-t border-border">
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('settings.security.currentPassword')}</label>
                  <div className="relative">
                    <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className={`w-full h-12 ${isRTL ? 'pr-11 pl-11' : 'pl-11 pr-11'} rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring`}
                      required
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground`}
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('settings.security.newPassword')}</label>
                  <div className="relative">
                    <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className={`w-full h-12 ${isRTL ? 'pr-11 pl-11' : 'pl-11 pr-11'} rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring`}
                      required
                      minLength={6}
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground`}
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t('settings.security.passwordHint')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('settings.security.confirmPassword')}</label>
                  <div className="relative">
                    <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className={`w-full h-12 ${isRTL ? 'pr-11 pl-11' : 'pl-11 pr-11'} rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring`}
                      required
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground`}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {changingPassword ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  {t('settings.security.updatePassword')}
                </button>
              </form>
            )}
          </div>

          {/* Logout Section */}
          <div className="bg-background rounded-2xl border border-red-200 p-6">
            <h2 className="font-semibold text-lg mb-2 text-red-600">{t('settings.logout.title')}</h2>
            <p className="text-sm text-muted-foreground mb-4">{t('settings.logout.description')}</p>
            
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {t('settings.logout.button')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
