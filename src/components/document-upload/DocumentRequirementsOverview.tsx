
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type DocumentType = Database['public']['Enums']['document_type'];
type VerificationCategory = Database['public']['Enums']['verification_category'];

interface DocumentRequirement {
  document_type: DocumentType;
  is_mandatory: boolean;
  verification_category: VerificationCategory;
  description: string;
}

interface DocumentRequirementsOverviewProps {
  requirements: DocumentRequirement[];
  userType: 'car_owner' | 'car_renter';
}

const DocumentRequirementsOverview = ({ requirements, userType }: DocumentRequirementsOverviewProps) => {
  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getCategoryColor = (category: VerificationCategory) => {
    switch (category) {
      case 'personal_identification': return 'bg-blue-500';
      case 'vehicle_documents': return 'bg-green-500';
      case 'additional_verification': return 'bg-purple-500';
      case 'payment_verification': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Required Documents for {userType === 'car_owner' ? 'Car Owners (Hosts)' : 'Car Renters (Guests)'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(
            requirements.reduce((acc, req) => {
              if (!acc[req.verification_category]) {
                acc[req.verification_category] = [];
              }
              acc[req.verification_category].push(req);
              return acc;
            }, {} as Record<VerificationCategory, DocumentRequirement[]>)
          ).map(([category, docs]) => (
            <div key={category} className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Badge className={`text-white ${getCategoryColor(category as VerificationCategory)}`}>
                  {category.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                {docs.map((doc) => (
                  <div key={doc.document_type} className="flex items-center gap-2 text-sm">
                    <Badge variant={doc.is_mandatory ? "destructive" : "secondary"} className="text-xs">
                      {doc.is_mandatory ? "Required" : "Optional"}
                    </Badge>
                    <span>{formatDocumentType(doc.document_type)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentRequirementsOverview;
