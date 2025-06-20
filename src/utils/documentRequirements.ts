
import type { Database } from '@/integrations/supabase/types';

type DocumentType = Database['public']['Enums']['document_type'];
type VerificationCategory = Database['public']['Enums']['verification_category'];

export interface DocumentRequirement {
  document_type: DocumentType;
  is_mandatory: boolean;
  verification_category: VerificationCategory;
  description: string;
}

export const getDocumentRequirements = (userType: 'car_owner' | 'car_renter' | null): DocumentRequirement[] => {
  if (!userType) return [];
  
  const requirements: DocumentRequirement[] = [];
  
  if (userType === 'car_owner') {
    requirements.push(
      // Personal Identification
      { document_type: 'national_id', is_mandatory: true, verification_category: 'personal_identification', description: 'National ID for Saudi nationals' },
      { document_type: 'iqama', is_mandatory: true, verification_category: 'personal_identification', description: 'Iqama for expats' },
      { document_type: 'drivers_license', is_mandatory: true, verification_category: 'personal_identification', description: 'Valid driver license' },
      { document_type: 'passport', is_mandatory: false, verification_category: 'personal_identification', description: 'Passport (optional for expats)' },
      
      // Vehicle Documents
      { document_type: 'car_registration', is_mandatory: true, verification_category: 'vehicle_documents', description: 'Car registration (Istimara)' },
      { document_type: 'insurance_certificate', is_mandatory: true, verification_category: 'vehicle_documents', description: 'Valid insurance certificate' },
      { document_type: 'vehicle_inspection', is_mandatory: false, verification_category: 'vehicle_documents', description: 'Vehicle inspection certificate' },
      
      // Additional Verification
      { document_type: 'selfie_with_id', is_mandatory: false, verification_category: 'additional_verification', description: 'Selfie with ID for liveness check' },
      
      // Payment Verification
      { document_type: 'bank_account_info', is_mandatory: true, verification_category: 'payment_verification', description: 'Bank account for payouts' }
    );
  } else if (userType === 'car_renter') {
    requirements.push(
      // Personal Identification
      { document_type: 'national_id', is_mandatory: true, verification_category: 'personal_identification', description: 'National ID for Saudi nationals' },
      { document_type: 'iqama', is_mandatory: true, verification_category: 'personal_identification', description: 'Iqama for expats' },
      { document_type: 'drivers_license', is_mandatory: true, verification_category: 'personal_identification', description: 'Valid driver license' },
      { document_type: 'passport', is_mandatory: false, verification_category: 'personal_identification', description: 'Passport (required for tourists)' },
      { document_type: 'international_drivers_permit', is_mandatory: false, verification_category: 'personal_identification', description: 'IDP for tourists' },
      { document_type: 'visa', is_mandatory: false, verification_category: 'personal_identification', description: 'Visa for tourists' },
      
      // Additional Verification
      { document_type: 'selfie_with_id', is_mandatory: false, verification_category: 'additional_verification', description: 'Selfie with ID for anti-fraud' }
    );
  }
  
  return requirements;
};
