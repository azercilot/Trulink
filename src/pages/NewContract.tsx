import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FileText, ArrowLeft, ArrowRight, Check, 
  Upload, X, Loader2, Building, Car, Home, Users, Briefcase,
  Shield, Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AIAssistButton from '@/components/ai/AIAssistButton';
import KYCVerificationForm from '@/components/kyc/KYCVerificationForm';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'خودرو': Car,
  'ملک': Home,
  'تجاری': Building,
  'منابع انسانی': Users,
};

const NewContract = () => {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  
  const [step, setStep] = useState(1);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tempContractId] = useState<string | null>(null);
  const [kycVerified, setKycVerified] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contract_type: '',
    party_name: '',
    party_email: '',
    party_phone: '',
    party_national_id: '',
    party_birth_date: '',
    total_amount: '',
  });

  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('contract_templates')
        .select('id, name, description, category')
        .eq('is_public', true);

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template.id);
    setFormData(prev => ({
      ...prev,
      contract_type: template.category,
      title: template.name,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setSubmitting(true);
    try {
      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          contract_type: formData.contract_type,
          party_name: formData.party_name || null,
          party_email: formData.party_email || null,
          party_phone: formData.party_phone || null,
          party_national_id: formData.party_national_id || null,
          total_amount: formData.total_amount ? parseFloat(formData.total_amount.replace(/,/g, '')) : null,
          status: 'draft',
        })
        .select()
        .single();

      if (contractError) throw contractError;

      if (files.length > 0 && contract) {
        for (const file of files) {
          const filePath = `${user.id}/${contract.id}/${file.name}`;
          
          const { error: uploadError } = await supabase.storage
            .from('contract-files')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Error uploading file:', uploadError);
            continue;
          }

          await supabase.from('contract_files').insert({
            contract_id: contract.id,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            file_type: file.type,
          });
        }
      }

      toast({
        title: t('newContract.success'),
        description: t('newContract.successDesc'),
      });

      navigate(`/contracts/${contract.id}`);
    } catch (error) {
      console.error('Error creating contract:', error);
      toast({
        title: t('newContract.error'),
        description: t('newContract.errorDesc'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="animate-pulse text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: t('newContract.step1') },
    { number: 2, title: t('newContract.step2') },
    { number: 3, title: t('newContract.step3') },
    { number: 4, title: t('newContract.step4') },
    { number: 5, title: t('newContract.step5') },
  ];

  return (
    <div className="min-h-screen bg-muted/30" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container-narrow flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-muted rounded-lg transition-colors">
              {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            </Link>
            <h1 className="font-semibold">{t('newContract.title')}</h1>
          </div>
        </div>
      </header>

      <div className="container-narrow py-8">
        {/* Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center">
              <div className={`flex items-center gap-2 ${step >= s.number ? 'text-foreground' : 'text-muted-foreground'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  step > s.number 
                    ? 'bg-foreground text-background' 
                    : step === s.number 
                    ? 'bg-foreground text-background' 
                    : 'bg-muted'
                }`}>
                  {step > s.number ? <Check className="w-5 h-5" /> : s.number}
                </div>
                <span className="hidden sm:inline text-sm font-medium">{s.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 sm:w-24 h-px mx-4 ${step > s.number ? 'bg-foreground' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-background rounded-2xl border border-border p-8">
          {/* Step 1: Select Template */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">{t('newContract.selectTemplate')}</h2>
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">{t('common.loading')}</div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => {
                    const Icon = categoryIcons[template.category] || Briefcase;
                    return (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className={`p-6 rounded-xl border text-right transition-all ${
                          selectedTemplate === template.id
                            ? 'border-foreground bg-muted'
                            : 'border-border hover:border-gray-400'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                          <Icon className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium mb-1">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Contract Details with AI */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">{t('newContract.contractDetails')}</h2>
              <div className="space-y-6 max-w-xl">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium">{t('newContract.contractTitle')}</label>
                    <AIAssistButton
                      type="suggest_title"
                      context={{ contractType: formData.contract_type, partyName: formData.party_name }}
                      onSuggestion={(suggestion) => setFormData(prev => ({ ...prev, title: suggestion }))}
                      variant="inline"
                    />
                  </div>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder={t('newContract.titlePlaceholder')}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium">{t('newContract.description')}</label>
                    <AIAssistButton
                      type="suggest_description"
                      context={{ contractType: formData.contract_type, amount: formData.total_amount }}
                      onSuggestion={(suggestion) => setFormData(prev => ({ ...prev, description: suggestion }))}
                      variant="inline"
                    />
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder={t('newContract.descriptionPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('newContract.amount')}</label>
                  <input
                    type="text"
                    name="total_amount"
                    value={formData.total_amount}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder={t('newContract.amountPlaceholder')}
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Party Details with KYC */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">{t('newContract.partyDetails')}</h2>
              <div className="space-y-6 max-w-xl">
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('newContract.partyName')}</label>
                  <input
                    type="text"
                    name="party_name"
                    value={formData.party_name}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder={t('newContract.partyNamePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('newContract.partyEmail')}</label>
                  <input
                    type="email"
                    name="party_email"
                    value={formData.party_email}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="example@email.com"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('newContract.partyPhone')}</label>
                  <input
                    type="tel"
                    name="party_phone"
                    value={formData.party_phone}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="09123456789"
                    dir="ltr"
                  />
                </div>
                
                {/* KYC Fields */}
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800">{t('kyc.sectionTitle')}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">{t('kyc.nationalId')}</label>
                      <input
                        type="text"
                        name="party_national_id"
                        value={formData.party_national_id}
                        onChange={handleChange}
                        className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="0123456789"
                        dir="ltr"
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">{t('kyc.birthDate')}</label>
                      <div className="relative">
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="date"
                          name="party_birth_date"
                          value={formData.party_birth_date}
                          onChange={handleChange}
                          className="w-full h-11 px-4 pr-11 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Attachments */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">{t('newContract.attachments')}</h2>
              <div className="max-w-xl">
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-medium mb-1">{t('newContract.dropFiles')}</p>
                    <p className="text-sm text-muted-foreground">{t('newContract.orClick')}</p>
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="mt-6 space-y-3">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-xl">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: KYC Verification */}
          {step === 5 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">{t('kyc.verifyIdentity')}</h2>
              <div className="max-w-xl">
                {formData.party_national_id && formData.party_birth_date ? (
                  <KYCVerificationForm
                    contractId={tempContractId || 'temp'}
                    initialData={{
                      nationalId: formData.party_national_id,
                      birthDate: formData.party_birth_date,
                      fullName: formData.party_name,
                    }}
                    onVerificationComplete={(result) => {
                      setKycVerified(result.success);
                    }}
                  />
                ) : (
                  <div className="p-6 rounded-xl bg-yellow-50 border border-yellow-200 text-center">
                    <Shield className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="font-medium text-yellow-800 mb-2">{t('kyc.missingInfo')}</h3>
                    <p className="text-sm text-yellow-600">{t('kyc.missingInfoDesc')}</p>
                  </div>
                )}

                {kycVerified && (
                  <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-200">
                    <div className="flex items-center gap-2 text-green-700">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">{t('kyc.identityVerified')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-8 border-t border-border">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              {t('newContract.previous')}
            </button>
            
            {step < 5 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !selectedTemplate}
                className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                {t('newContract.next')}
                {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || !formData.title}
                className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                {t('newContract.create')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewContract;
