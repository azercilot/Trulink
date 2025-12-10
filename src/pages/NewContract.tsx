import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, ArrowLeft, ArrowRight, Check, 
  Upload, X, Loader2, Building, Car, Home, Users, Briefcase
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contract_type: '',
    party_name: '',
    party_email: '',
    party_phone: '',
    party_national_id: '',
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
      // Create contract
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

      // Upload files if any
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
        title: 'موفق!',
        description: 'قرارداد با موفقیت ایجاد شد',
      });

      navigate(`/contracts/${contract.id}`);
    } catch (error) {
      console.error('Error creating contract:', error);
      toast({
        title: 'خطا',
        description: 'در ایجاد قرارداد مشکلی پیش آمد',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="animate-pulse text-muted-foreground">در حال بارگذاری...</div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'انتخاب قالب' },
    { number: 2, title: 'اطلاعات قرارداد' },
    { number: 3, title: 'اطلاعات طرف مقابل' },
    { number: 4, title: 'پیوست‌ها' },
  ];

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container-narrow flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ArrowRight className="w-5 h-5" />
            </Link>
            <h1 className="font-semibold">ایجاد قرارداد جدید</h1>
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
              <h2 className="text-xl font-semibold mb-6">انتخاب قالب قرارداد</h2>
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">در حال بارگذاری...</div>
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

          {/* Step 2: Contract Details */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">اطلاعات قرارداد</h2>
              <div className="space-y-6 max-w-xl">
                <div>
                  <label className="block text-sm font-medium mb-1.5">عنوان قرارداد</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="مثال: قرارداد فروش خودرو پژو 206"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">توضیحات</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder="توضیحات تکمیلی درباره قرارداد..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">مبلغ کل (تومان)</label>
                  <input
                    type="text"
                    name="total_amount"
                    value={formData.total_amount}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="مثال: 500,000,000"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Party Details */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">اطلاعات طرف مقابل</h2>
              <div className="space-y-6 max-w-xl">
                <div>
                  <label className="block text-sm font-medium mb-1.5">نام و نام خانوادگی</label>
                  <input
                    type="text"
                    name="party_name"
                    value={formData.party_name}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="نام کامل طرف قرارداد"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">ایمیل</label>
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
                  <label className="block text-sm font-medium mb-1.5">شماره تماس</label>
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
                <div>
                  <label className="block text-sm font-medium mb-1.5">کد ملی</label>
                  <input
                    type="text"
                    name="party_national_id"
                    value={formData.party_national_id}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="0123456789"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Attachments */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">پیوست‌ها</h2>
              <div className="max-w-xl">
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer"
                  >
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-medium mb-1">فایل‌های خود را اینجا رها کنید</p>
                    <p className="text-sm text-muted-foreground">یا کلیک کنید برای انتخاب</p>
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

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-8 border-t border-border">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <ArrowRight className="w-5 h-5" />
              قبلی
            </button>
            
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !selectedTemplate}
                className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                بعدی
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || !formData.title}
                className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                ایجاد قرارداد
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewContract;
