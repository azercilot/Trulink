import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateContractPDF } from '@/lib/pdfGenerator';
import { Button } from '@/components/ui/button';

interface PDFDownloadButtonProps {
  contract: {
    id: string;
    title: string;
    description: string | null;
    contract_type: string;
    status: string;
    total_amount: number | null;
    currency: string;
    created_at: string;
    version: number | null;
    ai_summary: string | null;
  };
  party: {
    party_name: string | null;
    party_email: string | null;
    party_phone: string | null;
    party_national_id: string | null;
  } | null;
  userId: string;
}

const PDFDownloadButton = ({ contract, party, userId }: PDFDownloadButtonProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [branding, setBranding] = useState<{
    logoUrl: string | null;
    primaryColor: string;
    companyName: string;
  }>({
    logoUrl: null,
    primaryColor: '#00C853',
    companyName: 'TruLink',
  });

  useEffect(() => {
    fetchBranding();
  }, [userId]);

  const fetchBranding = async () => {
    try {
      // Fetch user branding
      const { data: brandingData } = await supabase
        .from('user_branding')
        .select('logo_url, primary_color')
        .eq('user_id', userId)
        .maybeSingle();

      // Fetch user profile for company name
      const { data: profileData } = await supabase
        .from('profiles')
        .select('company_name, full_name')
        .eq('user_id', userId)
        .maybeSingle();

      setBranding({
        logoUrl: brandingData?.logo_url || null,
        primaryColor: brandingData?.primary_color || '#00C853',
        companyName: profileData?.company_name || profileData?.full_name || 'TruLink',
      });
    } catch (error) {
      console.error('Error fetching branding:', error);
    }
  };

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const contractData = {
        title: contract.title,
        description: contract.description,
        contractType: contract.contract_type,
        status: contract.status,
        totalAmount: contract.total_amount,
        currency: contract.currency,
        createdAt: contract.created_at,
        version: contract.version,
        partyName: party?.party_name || null,
        partyEmail: party?.party_email || null,
        partyPhone: party?.party_phone || null,
        partyNationalId: party?.party_national_id || null,
        aiSummary: contract.ai_summary,
      };

      const pdfBlob = await generateContractPDF(contractData, branding);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${contract.title.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')}_v${contract.version || 1}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: t('pdf.downloadSuccess'),
        description: t('pdf.downloadSuccessDesc'),
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: t('pdf.downloadError'),
        description: t('pdf.downloadErrorDesc'),
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={generating}
      size="sm"
      className="gap-1.5"
    >
      {generating ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
      {t('pdf.download')}
    </Button>
  );
};

export default PDFDownloadButton;
