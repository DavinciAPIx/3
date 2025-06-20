import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Trash2, Car, RefreshCw, Plus, Edit, Check, X, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { seedFeaturedCars } from '@/utils/seedCars';
import CarForm from './CarForm';

interface CarListing {
  id: number;
  title: string;
  description: string | null;
  price_per_day: number;
  location: string | null;
  image_url: string | null;
  is_available: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string | null;
  approval_status: string;
  admin_notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
}

const AdminCarManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<CarListing | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarListing | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);

  // Fetch all car listings
  const { data: cars, isLoading, error, refetch } = useQuery({
    queryKey: ['adminCars'],
    queryFn: async () => {
      console.log('Fetching all car listings...');
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching cars:', error);
        throw error;
      }
      
      console.log('Fetched cars:', data);
      return data as CarListing[];
    },
  });

  // Approve car mutation
  const approveCarMutation = useMutation({
    mutationFn: async (carId: number) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('cars')
        .update({
          approval_status: 'approved',
          is_available: true,
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          admin_notes: adminNotes || null
        })
        .eq('id', carId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCars'] });
      queryClient.invalidateQueries({ queryKey: ['featuredCars'] });
      toast({
        title: "Car Approved",
        description: "Car listing has been approved and is now available for rent.",
      });
      setShowApprovalDialog(false);
      setSelectedCar(null);
      setAdminNotes('');
      setApprovalAction(null);
    },
    onError: (error) => {
      console.error('Error approving car:', error);
      toast({
        title: "Error",
        description: "Failed to approve car listing.",
        variant: "destructive",
      });
    },
  });

  // Reject car mutation
  const rejectCarMutation = useMutation({
    mutationFn: async (carId: number) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('cars')
        .update({
          approval_status: 'rejected',
          is_available: false,
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          admin_notes: adminNotes || null
        })
        .eq('id', carId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCars'] });
      toast({
        title: "Car Rejected",
        description: "Car listing has been rejected.",
      });
      setShowApprovalDialog(false);
      setSelectedCar(null);
      setAdminNotes('');
      setApprovalAction(null);
    },
    onError: (error) => {
      console.error('Error rejecting car:', error);
      toast({
        title: "Error",
        description: "Failed to reject car listing.",
        variant: "destructive",
      });
    },
  });

  // Delete car mutation
  const deleteCarMutation = useMutation({
    mutationFn: async (carId: number) => {
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', carId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCars'] });
      queryClient.invalidateQueries({ queryKey: ['featuredCars'] });
      toast({
        title: "Car Deleted",
        description: "Car listing has been successfully deleted.",
      });
    },
    onError: (error) => {
      console.error('Error deleting car:', error);
      toast({
        title: "Error",
        description: "Failed to delete car listing.",
        variant: "destructive",
      });
    },
  });

  // Seed cars mutation
  const seedCarsMutation = useMutation({
    mutationFn: seedFeaturedCars,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['adminCars'] });
      queryClient.invalidateQueries({ queryKey: ['featuredCars'] });
      if (result.success) {
        toast({
          title: "Cars Seeded",
          description: "Featured cars have been added to the database.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to seed cars.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Error seeding cars:', error);
      toast({
        title: "Error",
        description: "Failed to seed cars.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteCar = (carId: number, carTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${carTitle}"? This action cannot be undone.`)) {
      deleteCarMutation.mutate(carId);
    }
  };

  const handleEditCar = (car: CarListing) => {
    setEditingCar(car);
    setIsFormOpen(true);
  };

  const handleAddNewCar = () => {
    setEditingCar(null);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingCar(null);
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Car listings have been refreshed.",
    });
  };

  const handleSeedCars = () => {
    seedCarsMutation.mutate();
  };

  const handleApproveReject = (car: CarListing, action: 'approve' | 'reject') => {
    setSelectedCar(car);
    setAdminNotes(car.admin_notes || '');
    setApprovalAction(action);
    setShowApprovalDialog(true);
  };

  const confirmApproveReject = () => {
    if (!selectedCar || !approvalAction) return;
    
    if (approvalAction === 'approve') {
      approveCarMutation.mutate(selectedCar.id);
    } else {
      rejectCarMutation.mutate(selectedCar.id);
    }
  };

  const handleCancelApproval = () => {
    setShowApprovalDialog(false);
    setSelectedCar(null);
    setAdminNotes('');
    setApprovalAction(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Car className="h-5 w-5" />
            Car Listings Management
          </h2>
        </div>
        <div className="text-center py-8">Loading car listings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Car className="h-5 w-5" />
            Car Listings Management
          </h2>
        </div>
        <div className="text-center py-8 text-red-600">
          Error loading car listings: {error.message}
          <div className="mt-4">
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const pendingCars = cars?.filter(car => car.approval_status === 'pending') || [];

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Car className="h-5 w-5" />
              Car Listings Management
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Manage all car listings ({cars?.length || 0} total - {pendingCars.length} pending approval)
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleAddNewCar} 
              variant="default" 
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Car
            </Button>
            <Button 
              onClick={handleSeedCars} 
              variant="outline" 
              size="sm"
              disabled={seedCarsMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              Seed Featured Cars
            </Button>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Price/Day</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Approval</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cars?.map((car) => (
              <TableRow key={car.id}>
                <TableCell>
                  {car.image_url ? (
                    <img 
                      src={car.image_url} 
                      alt={car.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <Car className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{car.title}</TableCell>
                <TableCell>SAR {car.price_per_day}/day</TableCell>
                <TableCell>{car.location || 'N/A'}</TableCell>
                <TableCell>
                  {car.is_available ? (
                    <Badge variant="default" className="bg-green-600">Available</Badge>
                  ) : (
                    <Badge variant="secondary">Unavailable</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(car.approval_status)}
                    {car.admin_notes && (
                      <div className="relative group">
                        <MessageSquare className="h-4 w-4 text-gray-400 cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          {car.admin_notes}
                        </div>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(car.created_at), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 flex-wrap">
                    {car.approval_status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveReject(car, 'approve')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveReject(car, 'reject')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCar(car)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCar(car.id, car.title)}
                      disabled={deleteCarMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {cars?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Car className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No car listings found</p>
            <p className="text-sm text-gray-400 mb-4">Get started by adding some cars</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleAddNewCar}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Car
              </Button>
              <Button 
                onClick={handleSeedCars}
                variant="outline"
                disabled={seedCarsMutation.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Seed Featured Cars
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Car Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <CarForm 
            car={editingCar || undefined} 
            onSuccess={handleFormSuccess} 
          />
        </DialogContent>
      </Dialog>

      {/* Approval/Rejection Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Approve Car' : 'Reject Car'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approvalNotes">Admin Notes (Optional)</Label>
              <Textarea
                id="approvalNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about the approval/rejection..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelApproval}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmApproveReject}
              className={approvalAction === 'approve' ? "bg-green-600 hover:bg-green-700" : ""}
              variant={approvalAction === 'reject' ? "destructive" : "default"}
              disabled={approveCarMutation.isPending || rejectCarMutation.isPending}
            >
              {approvalAction === 'approve' ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminCarManagement;
