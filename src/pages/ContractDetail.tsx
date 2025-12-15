import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FileText, ArrowRight, Edit, Trash2, Send, Check, 
  Clock, User, Mail, Phone, CreditCard, Download, Upload, X, Loader2,
  Lock, Copy, Brain, Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import RiskAnalysisPanel from '@/components/ai/RiskAnalysisPanel';
import ContractSummaryPanel from '@/components/ai/ContractSummaryPanel';
import VerificationStatus from '@/components/kyc/VerificationStatus';
import DocumentChecklist from '@/components/kyc/DocumentChecklist';
import AuditTrail from '@/components/audit/AuditTrail';
import PDFDownloadButton from '@/components/contract/PDFDownloadButton';
import { Button } from '@/components/ui/button';
import { Json } from '@/integrations/supabase/types';

interface ContractParty {
  id: string;
  party_name: string | null;
  party_email: string | null;
  party_phone: string | null;
  party_national_id: string | null;
}

interface Contract {
  id: string;
  title: string;
  description: string | null;
  contract_type: string;
  status: string;
  total_amount: number | null;
  currency: string;
  signed_at: string | null;
  created_at: string;
  updated_at: string;
  ai_summary: string | null;
  ai_risk_analysis: Json | null;
  version: number | null;
  is_locked: boolean | null;
  parent_contract_id: string | null;
}

interface ContractFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  uploaded_at: string;
  file_label: string | null;
}

interface PartyVerification {
  id: string;
  verification_status: 'pending' | 'verified' | 'rejected' | 'not_checked';
  national_id: string;
  verified_at: string | null;
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
  const { t } = useTranslation();
  
  const [contract, setContract] = useState<Contract | null>(null);
  const [contractParty, setContractParty] = useState<ContractParty | null>(null);
  const [files, setFiles] = useState<ContractFile[]>([]);
  const [verification, setVerification] = useState<PartyVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'ai' | 'kyc' | 'audit'>('details');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchContract();
      fetchContractParty();
      fetchFiles();
      fetchVerification();
    }
  }, [user, id]);

  const fetchContract = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('id, title, description, contract_type, status, total_amount, currency, signed_at, created_at, updated_at, ai_summary, ai_risk_analysis, version, is_locked, parent_contract_id')
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

  const fetchContractParty = async () => {
    try {
      const { data, error } = await supabase
        .from('contract_parties')
        .select('*')
        .eq('contract_id', id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setContractParty(data);
    } catch (error) {
      console.error('Error fetching contract party:', error);
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

  const fetchVerification = async () => {
    try {
      const { data, error } = await supabase
        .from('party_verifications')
        .select('*')
        .eq('contract_id', id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setVerification(data as PartyVerification | null);
    } catch (error) {
      console.error('Error fetching verification:', error);
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
      // Lock the contract when sending for signature
      const { error } = await supabase
        .from('contracts')
        .update({ status: 'pending', is_locked: true })
        .eq('id', contract.id);

      if (error) throw error;

      // Log audit
      await supabase.from('contract_audit_logs').insert({
        contract_id: contract.id,
        user_id: user!.id,
        action: 'sent_for_signature',
        details: { status: 'pending' },
      });

      // Send email to party if email exists
      if (contractParty?.party_email) {
        // Get sender's name from profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, company_name')
          .eq('user_id', user!.id)
          .maybeSingle();

        const senderName = profileData?.company_name || profileData?.full_name || 'کاربر TruLink';

        const { error: emailError } = await supabase.functions.invoke('send-signature-email', {
          body: {
            contractId: contract.id,
            contractTitle: contract.title,
            partyName: contractParty.party_name || '',
            partyEmail: contractParty.party_email,
            senderName,
          },
        });

        if (emailError) {
          console.error('Error sending signature email:', emailError);
          // Don't fail the whole operation if email fails
        }
      }

      setContract({ ...contract, status: 'pending', is_locked: true });
      toast({
        title: 'ارسال شد',
        description: contractParty?.party_email 
          ? 'قرارداد برای امضا ارسال و ایمیل به طرف قرارداد ارسال شد'
          : 'قرارداد برای امضا ارسال شد',
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

  const handleCreateNewVersion = async () => {
    if (!contract || !user) return;

    try {
      // Create a new version of the contract
      // Create new contract version
      const { data: newContract, error } = await supabase
        .from('contracts')
        .insert({
          user_id: user.id,
          title: contract.title,
          description: contract.description,
          contract_type: contract.contract_type,
          total_amount: contract.total_amount,
          currency: contract.currency,
          status: 'draft',
          version: (contract.version || 1) + 1,
          parent_contract_id: contract.id,
          is_locked: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Copy party info to new contract
      if (contractParty && newContract) {
        await supabase.from('contract_parties').insert({
          contract_id: newContract.id,
          party_name: contractParty.party_name,
          party_email: contractParty.party_email,
          party_phone: contractParty.party_phone,
          party_national_id: contractParty.party_national_id,
        });
      }

      toast({
        title: t('versioning.newVersionCreated'),
        description: t('versioning.newVersionCreatedDesc'),
      });

      navigate(`/contracts/${newContract.id}`);
    } catch (error) {
      console.error('Error creating new version:', error);
      toast({
        title: 'خطا',
        description: 'در ایجاد نسخه جدید مشکلی پیش آمد',
        variant: 'destructive',
      });
    }
  };

  const handleAnalyzeContract = async () => {
    if (!contract) return;

    setAnalyzing(true);
    try {
      // Build contract text from available metadata
      const contractText = `
عنوان قرارداد: ${contract.title}
نوع قرارداد: ${contract.contract_type}
توضیحات: ${contract.description || 'ندارد'}
نام طرف قرارداد: ${contractParty?.party_name || 'ذکر نشده'}
ایمیل طرف قرارداد: ${contractParty?.party_email || 'ذکر نشده'}
تلفن طرف قرارداد: ${contractParty?.party_phone || 'ذکر نشده'}
کد ملی طرف قرارداد: ${contractParty?.party_national_id || 'ذکر نشده'}
مبلغ کل: ${contract.total_amount ? `${contract.total_amount.toLocaleString('fa-IR')} ${contract.currency}` : 'ذکر نشده'}
تاریخ ایجاد: ${new Date(contract.created_at).toLocaleDateString('fa-IR')}
وضعیت: ${contract.status}
      `.trim();

      const { data, error } = await supabase.functions.invoke('analyze-contract', {
        body: {
          contractText,
          contractType: contract.contract_type,
          analysisType: 'both',
          language: 'fa',
        },
      });

      if (error) throw error;

      // Update contract with AI analysis results
      if (data) {
        await supabase
          .from('contracts')
          .update({
            ai_risk_analysis: data.riskAnalysis,
            ai_summary: data.summary?.simpleSummary || JSON.stringify(data.summary),
          })
          .eq('id', contract.id);
      }

      // Refetch contract to get updated AI data
      await fetchContract();

      toast({
        title: t('ai.analysisComplete'),
        description: t('ai.analysisCompleteDesc'),
      });
    } catch (error) {
      console.error('Error analyzing contract:', error);
      toast({
        title: 'خطا',
        description: 'در تحلیل قرارداد مشکلی پیش آمد',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
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
            {contract.version && contract.version > 1 && (
              <span className="text-xs bg-muted px-2 py-1 rounded-full">
                {t('versioning.version')} {contract.version}
              </span>
            )}
            {contract.is_locked && (
              <Lock className="w-4 h-4 text-yellow-600" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* PDF Download Button - Always visible */}
            {user && (
              <PDFDownloadButton 
                contract={contract} 
                party={contractParty} 
                userId={user.id} 
              />
            )}
            
            {contract.is_locked && (
              <Button
                onClick={handleCreateNewVersion}
                variant="secondary"
                size="sm"
                className="gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                {t('versioning.createNewVersion')}
              </Button>
            )}
            {contract.status === 'draft' && !contract.is_locked && (
              <>
                <Button
                  onClick={handleAnalyzeContract}
                  disabled={analyzing}
                  variant="secondary"
                  size="sm"
                  className="gap-1.5"
                >
                  {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
                  {t('ai.analyzeContract')}
                </Button>
                <Button
                  onClick={handleSendForSignature}
                  size="sm"
                  className="gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  ارسال برای امضا
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-background border-b border-border">
        <div className="container-narrow">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'details', label: 'جزئیات', icon: FileText },
              { id: 'ai', label: t('ai.title'), icon: Brain },
              { id: 'kyc', label: t('kyc.title'), icon: Shield },
              { id: 'audit', label: t('audit.title'), icon: Clock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-narrow py-8">
        {/* Details Tab */}
        {activeTab === 'details' && (
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
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {file.file_size && (
                                <span>{(file.file_size / 1024 / 1024).toFixed(2)} MB</span>
                              )}
                              {file.file_label && (
                                <span className="bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                                  {file.file_label}
                                </span>
                              )}
                            </div>
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">اطلاعات طرف قرارداد</h3>
                  {verification && (
                    <VerificationStatus status={verification.verification_status} compact />
                  )}
                </div>
                {contractParty?.party_name ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{contractParty.party_name}</p>
                        {contractParty.party_national_id && (
                          <p className="text-sm text-muted-foreground">کد ملی: {contractParty.party_national_id}</p>
                        )}
                      </div>
                    </div>
                    {contractParty.party_email && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span dir="ltr">{contractParty.party_email}</span>
                      </div>
                    )}
                    {contractParty.party_phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span dir="ltr">{contractParty.party_phone}</span>
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
        )}

        {/* AI Tab */}
        {activeTab === 'ai' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <ContractSummaryPanel 
              summary={contract.ai_summary} 
              onAnalyze={handleAnalyzeContract}
              analyzing={analyzing}
            />
            <RiskAnalysisPanel 
              riskAnalysis={contract.ai_risk_analysis}
              onAnalyze={handleAnalyzeContract}
              analyzing={analyzing}
            />
          </div>
        )}

        {/* KYC Tab */}
        {activeTab === 'kyc' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-background rounded-2xl border border-border p-6">
              <h3 className="font-semibold mb-4">{t('kyc.verificationStatus')}</h3>
              <VerificationStatus 
                status={verification?.verification_status || 'not_checked'} 
              />
              {!verification && contractParty?.party_national_id && (
                <p className="text-sm text-muted-foreground mt-4">
                  {t('kyc.notVerifiedYet')}
                </p>
              )}
            </div>
            <DocumentChecklist 
              contractType={contract.contract_type}
              uploadedFiles={files}
            />
          </div>
        )}

        {/* Audit Tab */}
        {activeTab === 'audit' && (
          <AuditTrail contractId={contract.id} />
        )}
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