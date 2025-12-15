import { useTranslation } from 'react-i18next';
import { Check, X, FileText, AlertCircle } from 'lucide-react';

interface RequiredDocument {
  id: string;
  label: string;
  required: boolean;
  uploaded: boolean;
}

interface DocumentChecklistProps {
  contractType: string;
  uploadedFiles: Array<{ file_label?: string | null }>;
}

const DocumentChecklist = ({ contractType, uploadedFiles }: DocumentChecklistProps) => {
  const { t } = useTranslation();

  // Define required documents based on contract type
  const getRequiredDocuments = (type: string): RequiredDocument[] => {
    const uploadedLabels = uploadedFiles.map(f => f.file_label).filter(Boolean);
    
    const baseDocuments = [
      { id: 'national_id', label: t('kyc.docNationalId'), required: true },
    ];

    const typeSpecificDocs: Record<string, Array<{ id: string; label: string; required: boolean }>> = {
      'خودرو': [
        { id: 'vehicle_doc', label: t('kyc.docVehicle'), required: true },
        { id: 'vehicle_card', label: t('kyc.docVehicleCard'), required: false },
      ],
      'ملک': [
        { id: 'property_deed', label: t('kyc.docPropertyDeed'), required: true },
        { id: 'building_permit', label: t('kyc.docBuildingPermit'), required: false },
      ],
      'تجاری': [
        { id: 'business_license', label: t('kyc.docBusinessLicense'), required: true },
        { id: 'tax_certificate', label: t('kyc.docTaxCertificate'), required: false },
      ],
      'منابع انسانی': [
        { id: 'resume', label: t('kyc.docResume'), required: false },
        { id: 'certificates', label: t('kyc.docCertificates'), required: false },
      ],
    };

    const specificDocs = typeSpecificDocs[type] || [];
    const allDocs = [...baseDocuments, ...specificDocs];

    return allDocs.map(doc => ({
      ...doc,
      uploaded: uploadedLabels.includes(doc.id),
    }));
  };

  const documents = getRequiredDocuments(contractType);
  const requiredDocs = documents.filter(d => d.required);
  const allRequiredUploaded = requiredDocs.every(d => d.uploaded);

  return (
    <div className="bg-background rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{t('kyc.documentChecklist')}</h3>
        {allRequiredUploaded ? (
          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
            <Check className="w-4 h-4" />
            {t('kyc.allDocsUploaded')}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-yellow-600 text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            {t('kyc.missingDocs')}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {documents.map((doc) => (
          <div 
            key={doc.id} 
            className={`flex items-center justify-between p-3 rounded-xl border ${
              doc.uploaded 
                ? 'border-green-200 bg-green-50' 
                : doc.required 
                  ? 'border-red-200 bg-red-50' 
                  : 'border-border bg-muted'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className={`w-5 h-5 ${doc.uploaded ? 'text-green-600' : 'text-muted-foreground'}`} />
              <div>
                <span className="font-medium text-sm">{doc.label}</span>
                {doc.required && (
                  <span className="text-red-500 text-xs mr-1">*</span>
                )}
              </div>
            </div>
            {doc.uploaded ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <X className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {!allRequiredUploaded && (
        <p className="text-sm text-muted-foreground mt-4">
          {t('kyc.pleaseUploadRequired')}
        </p>
      )}
    </div>
  );
};

export default DocumentChecklist;
