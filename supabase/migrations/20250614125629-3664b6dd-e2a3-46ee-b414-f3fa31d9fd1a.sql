
-- First, let's update the document_type enum to include all required document types
ALTER TYPE public.document_type ADD VALUE IF NOT EXISTS 'car_registration';
ALTER TYPE public.document_type ADD VALUE IF NOT EXISTS 'insurance_certificate';
ALTER TYPE public.document_type ADD VALUE IF NOT EXISTS 'vehicle_inspection';
ALTER TYPE public.document_type ADD VALUE IF NOT EXISTS 'selfie_with_id';
ALTER TYPE public.document_type ADD VALUE IF NOT EXISTS 'bank_account_info';
ALTER TYPE public.document_type ADD VALUE IF NOT EXISTS 'international_drivers_permit';
ALTER TYPE public.document_type ADD VALUE IF NOT EXISTS 'visa';

-- Create enum for verification categories first
CREATE TYPE public.verification_category AS ENUM (
  'personal_identification',
  'vehicle_documents', 
  'additional_verification',
  'payment_verification'
);

-- Add new columns to user_documents table with proper types
ALTER TABLE public.user_documents 
ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS verification_category verification_category DEFAULT 'personal_identification',
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS issuing_authority TEXT,
ADD COLUMN IF NOT EXISTS vehicle_id INTEGER REFERENCES public.cars(id) ON DELETE CASCADE;

-- Create indexes for better performance on verification queries
CREATE INDEX IF NOT EXISTS idx_user_documents_category ON public.user_documents(verification_category);
CREATE INDEX IF NOT EXISTS idx_user_documents_mandatory ON public.user_documents(is_mandatory);
CREATE INDEX IF NOT EXISTS idx_user_documents_expiry ON public.user_documents(expiry_date);

-- Create view for document requirements by user type
CREATE OR REPLACE VIEW public.document_requirements AS
SELECT 
  ut.user_type,
  dt.document_type,
  dt.is_mandatory,
  dt.verification_category,
  dt.description
FROM (
  VALUES 
    -- Car Owner (Host) Requirements
    ('car_owner', 'national_id', true, 'personal_identification', 'National ID for Saudi nationals'),
    ('car_owner', 'iqama', true, 'personal_identification', 'Iqama for expats'),
    ('car_owner', 'drivers_license', true, 'personal_identification', 'Valid driver license'),
    ('car_owner', 'passport', false, 'personal_identification', 'Passport (optional for expats)'),
    ('car_owner', 'car_registration', true, 'vehicle_documents', 'Car registration (Istimara)'),
    ('car_owner', 'insurance_certificate', true, 'vehicle_documents', 'Valid insurance certificate'),
    ('car_owner', 'vehicle_inspection', false, 'vehicle_documents', 'Vehicle inspection certificate'),
    ('car_owner', 'selfie_with_id', false, 'additional_verification', 'Selfie with ID for liveness check'),
    ('car_owner', 'bank_account_info', true, 'payment_verification', 'Bank account for payouts'),
    
    -- Car Renter (Guest) Requirements  
    ('car_renter', 'national_id', true, 'personal_identification', 'National ID for Saudi nationals'),
    ('car_renter', 'iqama', true, 'personal_identification', 'Iqama for expats'),
    ('car_renter', 'drivers_license', true, 'personal_identification', 'Valid driver license'),
    ('car_renter', 'passport', false, 'personal_identification', 'Passport (required for tourists)'),
    ('car_renter', 'international_drivers_permit', false, 'personal_identification', 'IDP for tourists'),
    ('car_renter', 'visa', false, 'personal_identification', 'Visa for tourists'),
    ('car_renter', 'selfie_with_id', false, 'additional_verification', 'Selfie with ID for anti-fraud')
) AS dt(user_type, document_type, is_mandatory, verification_category, description)
CROSS JOIN (SELECT DISTINCT user_type FROM public.profiles) ut
WHERE ut.user_type::text = dt.user_type;
