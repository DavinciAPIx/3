
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/DatePicker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type DocumentType = Database['public']['Enums']['document_type'];
type VerificationCategory = Database['public']['Enums']['verification_category'];

interface DocumentRequirement {
  document_type: DocumentType;
  is_mandatory: boolean;
  verification_category: VerificationCategory;
  description: string;
}

interface DocumentUploadFormProps {
  requirements: DocumentRequirement[];
  userId: string;
}

const DocumentUploadForm = ({ requirements, userId }: DocumentUploadFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    documentType: '' as DocumentType | '',
    fullName: '',
    documentNumber: '',
    dateOfBirth: undefined as Date | undefined,
    nationality: '',
    expiryDate: undefined as Date | undefined,
    issuingAuthority: '',
    vehicleId: undefined as number | undefined,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !selectedFile || !formData.documentType) {
        throw new Error('Missing user, file, or document type');
      }
      
      // Create a unique file path: userId/timestamp-filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      console.log('Uploading file to Supabase Storage:', fileName);
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully:', uploadData);

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('user-documents')
        .getPublicUrl(fileName);

      if (!urlData.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
      }

      console.log('Public URL generated:', urlData.publicUrl);

      // Get verification category for the selected document type
      const requirement = requirements.find(req => req.document_type === formData.documentType);
      
      // Save document record to database
      const { error: dbError } = await supabase
        .from('user_documents')
        .insert({
          user_id: userId,
          document_type: formData.documentType,
          document_url: urlData.publicUrl,
          full_name: formData.fullName,
          document_number: formData.documentNumber,
          date_of_birth: formData.dateOfBirth?.toISOString().split('T')[0] || null,
          nationality: formData.nationality || null,
          expiry_date: formData.expiryDate?.toISOString().split('T')[0] || null,
          issuing_authority: formData.issuingAuthority || null,
          vehicle_id: formData.vehicleId || null,
          is_mandatory: requirement?.is_mandatory || true,
          verification_category: requirement?.verification_category || 'personal_identification',
        });
      
      if (dbError) {
        console.error('Database insert error:', dbError);
        throw dbError;
      }

      console.log('Document record saved to database');
    },
    onSuccess: () => {
      toast({
        title: "Document Uploaded",
        description: "Your document has been submitted for verification.",
      });
      // Reset form
      setFormData({
        documentType: '',
        fullName: '',
        documentNumber: '',
        dateOfBirth: undefined,
        nationality: '',
        expiryDate: undefined,
        issuingAuthority: '',
        vehicleId: undefined,
      });
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('document-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      queryClient.invalidateQueries({ queryKey: ['userDocuments'] });
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "File Required",
        description: "Please select a document to upload.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.documentType || !formData.fullName || !formData.documentNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }
    
    uploadMutation.mutate();
  };

  const handleDocumentTypeChange = (value: string) => {
    setFormData({...formData, documentType: value as DocumentType});
  };

  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const selectedRequirement = requirements.find(req => req.document_type === formData.documentType);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Verification Document</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="document-type">Document Type *</Label>
            <Select 
              value={formData.documentType} 
              onValueChange={handleDocumentTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {requirements.map((req) => (
                  <SelectItem key={req.document_type} value={req.document_type}>
                    <div className="flex items-center gap-2">
                      {formatDocumentType(req.document_type)}
                      {req.is_mandatory && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRequirement && (
              <p className="text-sm text-gray-600 mt-1">{selectedRequirement.description}</p>
            )}
          </div>

          <div>
            <Label htmlFor="full-name">Full Name *</Label>
            <Input
              id="full-name"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              placeholder="Full name as shown on document"
              required
            />
          </div>

          <div>
            <Label htmlFor="document-number">Document Number *</Label>
            <Input
              id="document-number"
              value={formData.documentNumber}
              onChange={(e) => setFormData({...formData, documentNumber: e.target.value})}
              placeholder="Document number"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Date of Birth</Label>
              <DatePicker
                date={formData.dateOfBirth}
                onSelect={(date) => setFormData({...formData, dateOfBirth: date})}
                placeholder="Select date of birth"
              />
            </div>

            <div>
              <Label>Expiry Date</Label>
              <DatePicker
                date={formData.expiryDate}
                onSelect={(date) => setFormData({...formData, expiryDate: date})}
                placeholder="Select expiry date"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                placeholder="Nationality"
              />
            </div>

            <div>
              <Label htmlFor="issuing-authority">Issuing Authority</Label>
              <Input
                id="issuing-authority"
                value={formData.issuingAuthority}
                onChange={(e) => setFormData({...formData, issuingAuthority: e.target.value})}
                placeholder="Issuing authority"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="document-file">Document Image *</Label>
            <Input
              id="document-file"
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              required
            />
            {selectedFile && (
              <div className="text-sm text-gray-600 mt-1">
                <p>Selected: {selectedFile.name}</p>
                <p>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={uploadMutation.isPending}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Document'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DocumentUploadForm;
