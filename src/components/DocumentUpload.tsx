
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent } from '@/components/ui/card';
import DocumentRequirementsOverview from '@/components/document-upload/DocumentRequirementsOverview';
import DocumentUploadForm from '@/components/document-upload/DocumentUploadForm';
import { getDocumentRequirements } from '@/utils/documentRequirements';

const DocumentUpload = () => {
  const { user } = useAuth();
  const { profile } = useProfile();

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">
            Please log in to upload verification documents.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">
            Loading profile information...
          </p>
        </CardContent>
      </Card>
    );
  }

  const requirements = getDocumentRequirements(profile.user_type);

  return (
    <div className="space-y-6">
      <DocumentRequirementsOverview 
        requirements={requirements} 
        userType={profile.user_type}
      />
      <DocumentUploadForm 
        requirements={requirements} 
        userId={user.id}
      />
    </div>
  );
};

export default DocumentUpload;
