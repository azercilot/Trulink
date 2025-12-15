import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Palette, Upload, Loader2, Trash2, Check, Type, Layout, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdvancedBrandingSectionProps {
  userId: string;
}

interface BrandingData {
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  headerStyle: 'minimal' | 'classic' | 'modern';
  showWatermark: boolean;
}

const AdvancedBrandingSection = ({ userId }: AdvancedBrandingSectionProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [branding, setBranding] = useState<BrandingData>({
    logoUrl: null,
    primaryColor: '#00C853',
    secondaryColor: '#1a1a1a',
    fontFamily: 'Vazirmatn',
    headerStyle: 'modern',
    showWatermark: true,
  });

  useEffect(() => {
    if (userId) fetchBranding();
  }, [userId]);

  const fetchBranding = async () => {
    try {
      const { data, error } = await supabase
        .from('user_branding')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setBranding({
          logoUrl: data.logo_url,
          primaryColor: data.primary_color || '#00C853',
          secondaryColor: '#1a1a1a',
          fontFamily: 'Vazirmatn',
          headerStyle: 'modern',
          showWatermark: true,
        });
      }
    } catch (error) {
      console.error('Error fetching branding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: t('branding.invalidFileType'), variant: 'destructive' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: t('branding.fileTooLarge'), variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setBranding(prev => ({ ...prev, logoUrl: publicUrl + '?t=' + Date.now() }));
      toast({ title: t('branding.logoUploaded') });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({ title: t('branding.uploadError'), variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!userId) return;

    setUploading(true);
    try {
      const { data: files } = await supabase.storage
        .from('avatars')
        .list(userId);

      if (files) {
        const logoFiles = files.filter(f => f.name.startsWith('logo'));
        if (logoFiles.length > 0) {
          await supabase.storage
            .from('avatars')
            .remove(logoFiles.map(f => `${userId}/${f.name}`));
        }
      }

      setBranding(prev => ({ ...prev, logoUrl: null }));
      toast({ title: t('branding.logoRemoved') });
    } catch (error) {
      console.error('Error removing logo:', error);
      toast({ title: t('branding.removeError'), variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('user_branding')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      const brandingData = {
        user_id: userId,
        logo_url: branding.logoUrl,
        primary_color: branding.primaryColor,
      };

      if (existing) {
        await supabase.from('user_branding').update(brandingData).eq('user_id', userId);
      } else {
        await supabase.from('user_branding').insert(brandingData);
      }

      toast({ title: t('branding.saved') });
    } catch (error) {
      console.error('Error saving branding:', error);
      toast({ title: t('branding.saveError'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const colorPresets = [
    { color: '#00C853', name: 'سبز' },
    { color: '#2196F3', name: 'آبی' },
    { color: '#9C27B0', name: 'بنفش' },
    { color: '#FF5722', name: 'نارنجی' },
    { color: '#607D8B', name: 'خاکستری' },
    { color: '#E91E63', name: 'صورتی' },
    { color: '#795548', name: 'قهوه‌ای' },
    { color: '#000000', name: 'مشکی' },
  ];

  const fontFamilies = [
    { value: 'Vazirmatn', label: 'وزیر متن' },
    { value: 'IRANSans', label: 'ایران سنس' },
    { value: 'Yekan', label: 'یکان' },
    { value: 'Sahel', label: 'ساحل' },
  ];

  const headerStyles = [
    { value: 'minimal', label: t('branding.headerMinimal'), icon: '▢' },
    { value: 'classic', label: t('branding.headerClassic'), icon: '▣' },
    { value: 'modern', label: t('branding.headerModern'), icon: '◈' },
  ];

  if (loading) {
    return (
      <div className="bg-background rounded-2xl border border-border p-6 mb-6">
        <div className="animate-pulse text-muted-foreground text-center py-8">
          {t('settings.loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Logo Section */}
      <div className="bg-background rounded-2xl border border-border p-6">
        <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
          <Palette className="w-5 h-5 text-muted-foreground" />
          {t('branding.title')}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">{t('branding.subtitle')}</p>

        <div className="flex items-start gap-6">
          <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
            ) : (
              <Upload className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-medium hover:brightness-110 transition-all disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {branding.logoUrl ? t('branding.changeLogo') : t('branding.uploadLogo')}
              </button>
              {branding.logoUrl && (
                <button
                  onClick={handleRemoveLogo}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('branding.removeLogo')}
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{t('branding.logoHint')}</p>
          </div>
        </div>
      </div>

      {/* Colors Section */}
      <div className="bg-background rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: branding.primaryColor }} />
          {t('branding.primaryColor')}
        </h3>
        <div className="flex flex-wrap gap-3 mb-4">
          {colorPresets.map((preset) => (
            <button
              key={preset.color}
              onClick={() => setBranding(prev => ({ ...prev, primaryColor: preset.color }))}
              className={`group relative w-12 h-12 rounded-xl transition-all hover:scale-110 ${
                branding.primaryColor === preset.color ? 'ring-2 ring-offset-2 ring-accent' : ''
              }`}
              style={{ backgroundColor: preset.color }}
              title={preset.name}
            >
              {branding.primaryColor === preset.color && (
                <Check className="w-5 h-5 text-white absolute inset-0 m-auto" />
              )}
            </button>
          ))}
          <div className="relative">
            <input
              type="color"
              value={branding.primaryColor}
              onChange={(e) => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
              className="w-12 h-12 rounded-xl cursor-pointer border-2 border-border"
            />
          </div>
        </div>
      </div>

      {/* Font Section */}
      <div className="bg-background rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Type className="w-5 h-5 text-muted-foreground" />
          {t('branding.fontFamily')}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {fontFamilies.map((font) => (
            <button
              key={font.value}
              onClick={() => setBranding(prev => ({ ...prev, fontFamily: font.value }))}
              className={`p-4 rounded-xl border transition-all text-right ${
                branding.fontFamily === font.value
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border hover:bg-muted'
              }`}
              style={{ fontFamily: font.value }}
            >
              <span className="font-medium">{font.label}</span>
              <p className="text-sm text-muted-foreground mt-1">نمونه متن فارسی</p>
            </button>
          ))}
        </div>
      </div>

      {/* Header Style Section */}
      <div className="bg-background rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Layout className="w-5 h-5 text-muted-foreground" />
          {t('branding.headerStyle')}
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {headerStyles.map((style) => (
            <button
              key={style.value}
              onClick={() => setBranding(prev => ({ ...prev, headerStyle: style.value as any }))}
              className={`p-4 rounded-xl border transition-all text-center ${
                branding.headerStyle === style.value
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border hover:bg-muted'
              }`}
            >
              <span className="text-2xl block mb-2">{style.icon}</span>
              <span className="text-sm font-medium">{style.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-background rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Eye className="w-5 h-5 text-muted-foreground" />
            {t('branding.preview')}
          </h3>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm text-accent hover:underline"
          >
            {showPreview ? t('branding.hidePreview') : t('branding.showPreview')}
          </button>
        </div>
        
        {showPreview && (
          <div 
            className="bg-white rounded-lg border border-border p-6 space-y-4"
            style={{ fontFamily: branding.fontFamily }}
          >
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-3">
                {branding.logoUrl ? (
                  <img src={branding.logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-muted" />
                )}
                <div>
                  <h4 className="font-bold" style={{ color: branding.primaryColor }}>
                    نام شرکت
                  </h4>
                  <p className="text-xs text-muted-foreground">قرارداد رسمی</p>
                </div>
              </div>
              <div className="text-left text-sm text-muted-foreground">
                <p>شماره: 1234</p>
                <p>تاریخ: 1403/01/01</p>
              </div>
            </div>
            <div className="space-y-2">
              <h5 className="font-semibold" style={{ color: branding.primaryColor }}>
                قرارداد فروش
              </h5>
              <p className="text-sm text-muted-foreground leading-relaxed">
                این قرارداد فی‌مابین طرفین ذیل منعقد گردید...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-foreground text-background px-6 py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
        {t('branding.save')}
      </button>
    </div>
  );
};

export default AdvancedBrandingSection;
