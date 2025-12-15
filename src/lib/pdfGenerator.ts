import jsPDF from 'jspdf';

interface BrandingData {
  logoUrl: string | null;
  primaryColor: string;
  companyName: string;
}

interface ContractData {
  title: string;
  description: string | null;
  contractType: string;
  status: string;
  totalAmount: number | null;
  currency: string;
  createdAt: string;
  version: number | null;
  partyName: string | null;
  partyEmail: string | null;
  partyPhone: string | null;
  partyNationalId: string | null;
  aiSummary: string | null;
}

// Convert hex color to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

// Load image as base64
const loadImageAsBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export const generateContractPDF = async (
  contract: ContractData,
  branding: BrandingData
): Promise<Blob> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  const primaryRgb = hexToRgb(branding.primaryColor);

  // Header Background
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Logo
  if (branding.logoUrl) {
    try {
      const logoBase64 = await loadImageAsBase64(branding.logoUrl);
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', pageWidth - margin - 25, 5, 25, 25);
      }
    } catch (e) {
      console.error('Error loading logo:', e);
    }
  }

  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(branding.companyName || 'TruLink', pageWidth - margin - 35, 20, { align: 'right' });

  // Document info
  doc.setFontSize(10);
  doc.text(`تاریخ: ${new Date(contract.createdAt).toLocaleDateString('fa-IR')}`, margin, 15);
  doc.text(`نسخه: ${contract.version || 1}`, margin, 22);
  doc.text(`شماره: ${Date.now().toString().slice(-8)}`, margin, 29);

  yPosition = 50;

  // Contract Title
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.setFontSize(18);
  doc.text(contract.title, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Divider line
  doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  // Contract Details Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);

  const addField = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', pageWidth - margin, yPosition, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(value || '-', pageWidth - margin - 40, yPosition, { align: 'right' });
    yPosition += 10;
  };

  addField('نوع قرارداد', contract.contractType);
  addField('وضعیت', contract.status === 'draft' ? 'پیش‌نویس' : contract.status === 'pending' ? 'در انتظار امضا' : contract.status === 'signed' ? 'امضا شده' : contract.status);
  
  if (contract.totalAmount) {
    addField('مبلغ کل', `${contract.totalAmount.toLocaleString('fa-IR')} ${contract.currency}`);
  }

  yPosition += 5;

  // Party Information Section
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text('اطلاعات طرف قرارداد', pageWidth - margin - 5, yPosition + 6, { align: 'right' });
  yPosition += 15;

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  if (contract.partyName) addField('نام', contract.partyName);
  if (contract.partyEmail) addField('ایمیل', contract.partyEmail);
  if (contract.partyPhone) addField('تلفن', contract.partyPhone);
  if (contract.partyNationalId) addField('کد ملی', contract.partyNationalId);

  yPosition += 10;

  // Description Section
  if (contract.description) {
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text('شرح قرارداد', pageWidth - margin - 5, yPosition + 6, { align: 'right' });
    yPosition += 15;

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    const descriptionLines = doc.splitTextToSize(contract.description, pageWidth - 2 * margin);
    doc.text(descriptionLines, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += descriptionLines.length * 7 + 10;
  }

  // AI Summary Section
  if (contract.aiSummary) {
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('خلاصه هوشمند قرارداد', pageWidth - margin - 5, yPosition + 6, { align: 'right' });
    yPosition += 15;

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const summaryLines = doc.splitTextToSize(contract.aiSummary, pageWidth - 2 * margin);
    doc.text(summaryLines, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += summaryLines.length * 6 + 15;
  }

  // Signature Section
  if (yPosition > pageHeight - 50) {
    doc.addPage();
    yPosition = margin;
  }

  yPosition = pageHeight - 50;
  
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Two signature boxes
  const boxWidth = (pageWidth - 3 * margin) / 2;
  
  doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPosition, boxWidth, 30);
  doc.rect(margin + boxWidth + margin, yPosition, boxWidth, 30);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('امضای طرف اول', margin + boxWidth / 2, yPosition + 25, { align: 'center' });
  doc.text('امضای طرف دوم', margin + boxWidth + margin + boxWidth / 2, yPosition + 25, { align: 'center' });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('این سند توسط پلتفرم TruLink تولید شده است', pageWidth / 2, pageHeight - 10, { align: 'center' });

  return doc.output('blob');
};
