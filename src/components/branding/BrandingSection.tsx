import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Palette, Upload, Loader2, Trash2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BrandingSectionProps {
  userId: string;
}

const BrandingSection = ({ userId }: BrandingSectionProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#00C853');

  useEffect(() => {
    if (userId) {
      fetchBranding();
    }
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
        setLogoUrl(data.logo_url);
        setPrimaryColor(data.primary_color || '#00C853');
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
      toast({
        title: t('branding.invalidFileType'),
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: t('branding.fileTooLarge'),
        variant: 'destructive',
      });
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

      setLogoUrl(publicUrl + '?t=' + Date.now());

      toast({
        title: t('branding.logoUploaded'),
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: t('branding.uploadError'),
        variant: 'destructive',
      });
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

      setLogoUrl(null);
      toast({
        title: t('branding.logoRemoved'),
      });
    } catch (error) {
      console.error('Error removing logo:', error);
      toast({
        title: t('branding.removeError'),
        variant: 'destructive',
      });
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

      if (existing) {
        const { error } = await supabase
          .from('user_branding')
          .update({
            logo_url: logoUrl,
            primary_color: primaryColor,
          })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_branding')
          .insert({
            user_id: userId,
            logo_url: logoUrl,
            primary_color: primaryColor,
          });

        if (error) throw error;
      }

      toast({
        title: t('branding.saved'),
      });
    } catch (error) {
      console.error('Error saving branding:', error);
      toast({
        title: t('branding.saveError'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const colorPresets = [
    '#00C853', // Green
    '#2196F3', // Blue
    '#9C27B0', // Purple
    '#FF5722', // Deep Orange
    '#607D8B', // Blue Grey
    '#000000', // Black
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
    <div className="bg-background rounded-2xl border border-border p-6 mb-6">
      <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
        <Palette className="w-5 h-5 text-muted-foreground" />
        {t('branding.title')}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">{t('branding.subtitle')}</p>

      {/* Logo Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">{t('branding.logo')}</label>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground font-medium hover:brightness-110 transition-all disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {logoUrl ? t('branding.changeLogo') : t('branding.uploadLogo')}
            </button>
            {logoUrl && (
              <button
                onClick={handleRemoveLogo}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {t('branding.removeLogo')}
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{t('branding.logoHint')}</p>
      </div>

      {/* Color Picker */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">{t('branding.primaryColor')}</label>
        <div className="flex flex-wrap gap-3">
          {colorPresets.map((color) => (
            <button
              key={color}
              onClick={() => setPrimaryColor(color)}
              className={`w-10 h-10 rounded-xl transition-all ${
                primaryColor === color ? 'ring-2 ring-offset-2 ring-accent' : ''
              }`}
              style={{ backgroundColor: color }}
            >
              {primaryColor === color && (
                <Check className="w-5 h-5 text-white mx-auto" />
              )}
            </button>
          ))}
          <div className="relative">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-10 h-10 rounded-xl cursor-pointer border-2 border-border"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6 p-4 rounded-xl border border-border bg-muted/50">
        <p className="text-sm font-medium mb-3">{t('branding.preview')}</p>
        <div className="bg-background rounded-lg p-4 border border-border">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Preview" className="w-10 h-10 object-contain" />
            ) : (
              <div className="w-10 h-10 rounded bg-muted" />
            )}
            <div>
              <p className="font-semibold" style={{ color: primaryColor }}>
                {t('branding.companyName')}
              </p>
              <p className="text-xs text-muted-foreground">{t('branding.documentHeader')}</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
        {t('branding.save')}
      </button>
    </div>
  );
};

export default BrandingSection;