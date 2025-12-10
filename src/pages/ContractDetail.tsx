import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  FileText, ArrowRight, Edit, Trash2, Send, Check, 
  Clock, User, Mail, Phone, CreditCard, Download, Upload, X, Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Contract {
  id: string;
  title: string;
  description: string | null;
  contract_type: string;
  status: string;
  party_name: string | null;
  party_email: string | null;
  party_phone: string | null;
  party_national_id: string | null;
  total_amount: number | null;
  currency: string;
  signed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ContractFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  uploaded_at: string;
}

const statusConfig: Record<string, { bg: string; text: string; label: string; icon: React.ComponentType<{ className?: string }> }> = {
  draft: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'پیش‌نویس', icon: Edit },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'در انتظار امضا', icon: Clock },
  signed: { bg: 'bg-green-100', text: 'text-green-800', label: 'امضا شده', icon: Check },
  expired: { bg: 'bg-red-100', text: 'text-red-800', label: 'منقضی شده', icon: Clock },
};

const ContractDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [contract, setContract] = useState<Contract | null>(null);
  const [files, setFiles] = useState<ContractFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchContract();
      fetchFiles();
    }
  }, [user, id]);

  const fetchContract = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast({
          title: 'خطا',
          description: 'قرارداد یافت نشد',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }
      setContract(data);
    } catch (error) {
      console.error('Error fetching contract:', error);
      toast({
        title: 'خطا',
        description: 'در دریافت قرارداد مشکلی پیش آمد',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('contract_files')
        .select('*')
        .eq('contract_id', id);

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleDelete = async () => {
    if (!contract) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', contract.id);

      if (error) throw error;

      toast({
        title: 'حذف شد',
        description: 'قرارداد با موفقیت حذف شد',
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast({
        title: 'خطا',
        description: 'در حذف قرارداد مشکلی پیش آمد',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSendForSignature = async () => {
    if (!contract) return;

    try {
      const { error } = await supabase
        .from('contracts')
        .update({ status: 'pending' })
        .eq('id', contract.id);

      if (error) throw error;

      setContract({ ...contract, status: 'pending' });
      toast({
        title: 'ارسال شد',
        description: 'قرارداد برای امضا ارسال شد',
      });
    } catch (error) {
      console.error('Error sending contract:', error);
      toast({
        title: 'خطا',
        description: 'در ارسال قرارداد مشکلی پیش آمد',
        variant: 'destructive',
      });
    }
  };

  const downloadFile = async (file: ContractFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('contract-files')
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'خطا',
        description: 'در دانلود فایل مشکلی پیش آمد',
        variant: 'destructive',
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="animate-pulse text-muted-foreground">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!contract) {
    return null;
  }

  const StatusIcon = statusConfig[contract.status]?.icon || Clock;

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container-narrow flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ArrowRight className="w-5 h-5" />
            </Link>
            <h1 className="font-semibold">جزئیات قرارداد</h1>
          </div>
          <div className="flex items-center gap-2">
            {contract.status === 'draft' && (
              <>
                <button
                  onClick={handleSendForSignature}
                  className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  ارسال برای امضا
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-destructive hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="container-narrow py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contract Info */}
            <div className="bg-background rounded-2xl border border-border p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{contract.title}</h2>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                    statusConfig[contract.status]?.bg || 'bg-muted'
                  } ${statusConfig[contract.status]?.text || 'text-muted-foreground'}`}>
                    <StatusIcon className="w-4 h-4" />
                    {statusConfig[contract.status]?.label || contract.status}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>

              {contract.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">توضیحات</h3>
                  <p className="text-foreground">{contract.description}</p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">نوع قرارداد</h3>
                  <p className="font-medium">{contract.contract_type}</p>
                </div>
                {contract.total_amount && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">مبلغ کل</h3>
                    <p className="font-medium">
                      {contract.total_amount.toLocaleString('fa-IR')} {contract.currency}
                    </p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">تاریخ ایجاد</h3>
                  <p className="font-medium">
                    {new Date(contract.created_at).toLocaleDateString('fa-IR')}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">آخرین بروزرسانی</h3>
                  <p className="font-medium">
                    {new Date(contract.updated_at).toLocaleDateString('fa-IR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div className="bg-background rounded-2xl border border-border p-6">
              <h3 className="font-semibold mb-4">پیوست‌ها</h3>
              {files.length === 0 ? (
                <p className="text-muted-foreground text-sm">پیوستی وجود ندارد</p>
              ) : (
                <div className="space-y-3">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 bg-muted rounded-xl">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{file.file_name}</p>
                          {file.file_size && (
                            <p className="text-xs text-muted-foreground">
                              {(file.file_size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => downloadFile(file)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Party Info */}
            <div className="bg-background rounded-2xl border border-border p-6">
              <h3 className="font-semibold mb-4">اطلاعات طرف قرارداد</h3>
              {contract.party_name ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{contract.party_name}</p>
                      {contract.party_national_id && (
                        <p className="text-sm text-muted-foreground">کد ملی: {contract.party_national_id}</p>
                      )}
                    </div>
                  </div>
                  {contract.party_email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span dir="ltr">{contract.party_email}</span>
                    </div>
                  )}
                  {contract.party_phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span dir="ltr">{contract.party_phone}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">اطلاعاتی ثبت نشده است</p>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-background rounded-2xl border border-border p-6">
              <h3 className="font-semibold mb-4">تاریخچه</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">ایجاد قرارداد</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(contract.created_at).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                </div>
                {contract.status === 'pending' && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                      <Send className="w-4 h-4 text-yellow-800" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">ارسال برای امضا</p>
                      <p className="text-xs text-muted-foreground">در انتظار امضای طرفین</p>
                    </div>
                  </div>
                )}
                {contract.signed_at && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-green-800" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">امضا شده</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(contract.signed_at).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">حذف قرارداد</h3>
            <p className="text-muted-foreground mb-6">
              آیا مطمئن هستید که می‌خواهید این قرارداد را حذف کنید؟ این عمل قابل بازگشت نیست.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg font-medium hover:bg-muted transition-colors"
              >
                انصراف
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractDetail;
