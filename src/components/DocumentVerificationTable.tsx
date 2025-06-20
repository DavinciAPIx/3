
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Eye, Check, X, Filter } from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserDocument {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  full_name: string;
  document_number: string;
  date_of_birth: string | null;
  nationality: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  verification_category: string | null;
  is_mandatory: boolean | null;
  expiry_date: string | null;
  issuing_authority: string | null;
  vehicle_id: number | null;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';
type CategoryFilter = 'all' | 'personal_identification' | 'vehicle_documents' | 'additional_verification' | 'payment_verification';

const DocumentVerificationTable = () => {
  const [selectedDocument, setSelectedDocument] = useState<UserDocument | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all documents with filters
  const { data: documents, isLoading } = useQuery({
    queryKey: ['userDocuments', statusFilter, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from('user_documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      if (categoryFilter !== 'all') {
        query = query.eq('verification_category', categoryFilter);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }
      
      return data as UserDocument[];
    },
  });

  // Update document status mutation
  const updateDocumentMutation = useMutation({
    mutationFn: async ({ 
      documentId, 
      status, 
      notes 
    }: { 
      documentId: string; 
      status: 'approved' | 'rejected'; 
      notes: string;
    }) => {
      const { error } = await supabase
        .from('user_documents')
        .update({
          status,
          admin_notes: notes,
          verified_at: new Date().toISOString(),
        })
        .eq('id', documentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userDocuments'] });
      setSelectedDocument(null);
      setAdminNotes('');
      toast({
        title: "Document Updated",
        description: "Document status has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating document:', error);
      toast({
        title: "Error",
        description: "Failed to update document status.",
        variant: "destructive",
      });
    },
  });

  const handleViewDocument = (document: UserDocument) => {
    setSelectedDocument(document);
    setAdminNotes(document.admin_notes || '');
  };

  const handleStatusUpdate = (status: 'approved' | 'rejected') => {
    if (!selectedDocument) return;
    
    updateDocumentMutation.mutate({
      documentId: selectedDocument.id,
      status,
      notes: adminNotes,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string | null) => {
    if (!category) return <Badge variant="outline">-</Badge>;
    
    const colors: Record<string, string> = {
      'personal_identification': 'bg-blue-500',
      'vehicle_documents': 'bg-green-500',
      'additional_verification': 'bg-purple-500',
      'payment_verification': 'bg-orange-500',
    };
    
    return (
      <Badge className={`text-white ${colors[category] || 'bg-gray-500'}`}>
        {category.replace(/_/g, ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading documents...</div>;
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        {/* Filters */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="status-filter" className="text-sm">Status:</Label>
              <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="category-filter" className="text-sm">Category:</Label>
              <Select value={categoryFilter} onValueChange={(value: CategoryFilter) => setCategoryFilter(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="personal_identification">Personal ID</SelectItem>
                  <SelectItem value="vehicle_documents">Vehicle Docs</SelectItem>
                  <SelectItem value="additional_verification">Additional</SelectItem>
                  <SelectItem value="payment_verification">Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Submitted</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Document Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Document Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents?.map((document) => (
              <TableRow key={document.id}>
                <TableCell>
                  {format(new Date(document.created_at), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="font-medium">{document.full_name}</TableCell>
                <TableCell>{formatDocumentType(document.document_type)}</TableCell>
                <TableCell>{getCategoryBadge(document.verification_category)}</TableCell>
                <TableCell>
                  <Badge variant={document.is_mandatory ? "destructive" : "secondary"}>
                    {document.is_mandatory ? "Required" : "Optional"}
                  </Badge>
                </TableCell>
                <TableCell>{document.document_number}</TableCell>
                <TableCell>{getStatusBadge(document.status)}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDocument(document)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {documents?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No documents found matching the selected filters
          </div>
        )}
      </div>

      {/* Document Review Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Document Review</DialogTitle>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-6">
              {/* Document Image */}
              <div className="space-y-2">
                <Label>Document Image</Label>
                <div className="border rounded-lg p-4">
                  <img
                    src={selectedDocument.document_url}
                    alt="Document"
                    className="max-w-full h-auto rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling!.textContent = 'Failed to load image';
                    }}
                  />
                  <p className="text-sm text-gray-500 mt-2 hidden">Failed to load image</p>
                </div>
              </div>

              {/* Document Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <p className="text-sm font-medium">{selectedDocument.full_name}</p>
                </div>
                <div>
                  <Label>Document Type</Label>
                  <p className="text-sm">{formatDocumentType(selectedDocument.document_type)}</p>
                </div>
                <div>
                  <Label>Verification Category</Label>
                  <div className="mt-1">{getCategoryBadge(selectedDocument.verification_category)}</div>
                </div>
                <div>
                  <Label>Priority</Label>
                  <div className="mt-1">
                    <Badge variant={selectedDocument.is_mandatory ? "destructive" : "secondary"}>
                      {selectedDocument.is_mandatory ? "Required" : "Optional"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Document Number</Label>
                  <p className="text-sm">{selectedDocument.document_number}</p>
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <p className="text-sm">
                    {selectedDocument.date_of_birth 
                      ? format(new Date(selectedDocument.date_of_birth), 'MMM dd, yyyy')
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <Label>Nationality</Label>
                  <p className="text-sm">{selectedDocument.nationality || 'N/A'}</p>
                </div>
                <div>
                  <Label>Issuing Authority</Label>
                  <p className="text-sm">{selectedDocument.issuing_authority || 'N/A'}</p>
                </div>
                <div>
                  <Label>Expiry Date</Label>
                  <p className="text-sm">
                    {selectedDocument.expiry_date 
                      ? format(new Date(selectedDocument.expiry_date), 'MMM dd, yyyy')
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <Label>Current Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedDocument.status)}</div>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label htmlFor="admin-notes">Admin Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add verification notes..."
                  className="h-24"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedDocument(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={updateDocumentMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleStatusUpdate('approved')}
                  disabled={updateDocumentMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentVerificationTable;
