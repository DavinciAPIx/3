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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Users, RefreshCw, FileText, Car, Shield, UserPlus, UserMinus } from 'lucide-react';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  full_name: string | null;
  user_type: 'car_owner' | 'car_renter';
  phone: string | null;
  created_at: string;
}

interface UserDocument {
  id: string;
  document_type: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  full_name: string;
}

interface UserCar {
  id: number;
  title: string;
  price_per_day: number;
  is_available: boolean;
  created_at: string;
}

interface UserRole {
  role: 'admin' | 'user';
}

interface UserWithDetails extends UserProfile {
  documents: UserDocument[];
  cars: UserCar[];
  roles: UserRole[];
}

const AdminUserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');

  // Fetch all users with their related data
  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['adminUsersWithDetails'],
    queryFn: async () => {
      console.log('Fetching all users with details...');
      
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Fetch documents for all users
      const { data: documents, error: documentsError } = await supabase
        .from('user_documents')
        .select('id, user_id, document_type, status, created_at, full_name');
      
      if (documentsError) {
        console.error('Error fetching documents:', documentsError);
        throw documentsError;
      }

      // Fetch cars for all users
      const { data: cars, error: carsError } = await supabase
        .from('cars')
        .select('id, owner_id, title, price_per_day, is_available, created_at');
      
      if (carsError) {
        console.error('Error fetching cars:', carsError);
        throw carsError;
      }

      // Fetch roles for all users
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        throw rolesError;
      }

      // Combine all data
      const usersWithDetails: UserWithDetails[] = profiles.map((profile) => ({
        ...profile,
        documents: documents.filter(doc => doc.user_id === profile.id),
        cars: cars.filter(car => car.owner_id === profile.id),
        roles: roles.filter(role => role.user_id === profile.id),
      }));

      console.log('Users with details:', usersWithDetails);
      return usersWithDetails;
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.rpc('admin_delete_user', {
        target_user_id: userId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsersWithDetails'] });
      toast({
        title: "User Deleted",
        description: "User and all their data have been successfully deleted.",
      });
      setSelectedUser(null);
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    },
  });

  // Add role mutation
  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'user' }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsersWithDetails'] });
      toast({
        title: "Role Added",
        description: "Role has been successfully assigned to the user.",
      });
    },
    onError: (error) => {
      console.error('Error adding role:', error);
      toast({
        title: "Error",
        description: "Failed to add role. User may already have this role.",
        variant: "destructive",
      });
    },
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'user' }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsersWithDetails'] });
      toast({
        title: "Role Removed",
        description: "Role has been successfully removed from the user.",
      });
    },
    onError: (error) => {
      console.error('Error removing role:', error);
      toast({
        title: "Error",
        description: "Failed to remove role.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteUser = (userId: string, userName: string | null) => {
    const displayName = userName || 'this user';
    if (window.confirm(`Are you sure you want to delete "${displayName}"? This action cannot be undone and will remove all their data including documents and cars.`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "User data has been refreshed.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleAddRole = (userId: string) => {
    addRoleMutation.mutate({ userId, role: newRole });
  };

  const handleRemoveRole = (userId: string, role: 'admin' | 'user') => {
    if (window.confirm(`Are you sure you want to remove the "${role}" role from this user?`)) {
      removeRoleMutation.mutate({ userId, role });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </h2>
        </div>
        <div className="text-center py-8">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </h2>
        </div>
        <div className="text-center py-8 text-red-600">
          Error loading users: {error.message}
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

  const selectedUserData = users?.find(user => user.id === selectedUser);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Comprehensive user management including profiles, documents, cars, and roles ({users?.length || 0} total users)
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>User Type</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Cars</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow 
                key={user.id}
                className={selectedUser === user.id ? 'bg-blue-50' : ''}
              >
                <TableCell className="font-medium">
                  {user.full_name || 'No name provided'}
                </TableCell>
                <TableCell>
                  <Badge variant={user.user_type === 'car_owner' ? 'default' : 'secondary'}>
                    {user.user_type === 'car_owner' ? 'Car Owner' : 'Car Renter'}
                  </Badge>
                </TableCell>
                <TableCell>{user.phone || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {user.documents.map((doc) => (
                      <Badge 
                        key={doc.id} 
                        variant={getStatusColor(doc.status)}
                        className="text-xs"
                      >
                        {doc.status}
                      </Badge>
                    ))}
                    {user.documents.length === 0 && (
                      <span className="text-gray-400 text-sm">None</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {user.cars.length} car{user.cars.length !== 1 ? 's' : ''}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {user.roles.map((role, index) => (
                      <Badge 
                        key={index}
                        variant={role.role === 'admin' ? 'destructive' : 'outline'}
                        className="text-xs"
                      >
                        {role.role}
                      </Badge>
                    ))}
                    {user.roles.length === 0 && (
                      <Badge variant="outline" className="text-xs">user</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(user.created_at), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                    >
                      {selectedUser === user.id ? 'Hide' : 'View'} Details
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id, user.full_name)}
                      disabled={deleteUserMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {users?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found
          </div>
        )}
      </div>

      {/* User Details Panel */}
      {selectedUserData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Details for {selectedUserData.full_name || 'Unnamed User'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="documents" className="w-full">
              <TabsList>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents ({selectedUserData.documents.length})
                </TabsTrigger>
                <TabsTrigger value="cars" className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Cars ({selectedUserData.cars.length})
                </TabsTrigger>
                <TabsTrigger value="roles" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Roles & Permissions
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="documents" className="mt-4">
                {selectedUserData.documents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUserData.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{doc.document_type.replace(/_/g, ' ').toUpperCase()}</p>
                          <p className="text-sm text-gray-600">Name: {doc.full_name}</p>
                          <p className="text-sm text-gray-600">Uploaded: {format(new Date(doc.created_at), 'MMM dd, yyyy')}</p>
                        </div>
                        <Badge variant={getStatusColor(doc.status)}>
                          {doc.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 py-4">No documents uploaded</p>
                )}
              </TabsContent>
              
              <TabsContent value="cars" className="mt-4">
                {selectedUserData.cars.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUserData.cars.map((car) => (
                      <div key={car.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{car.title}</p>
                          <p className="text-sm text-gray-600">Price: ${car.price_per_day}/day</p>
                          <p className="text-sm text-gray-600">Listed: {format(new Date(car.created_at), 'MMM dd, yyyy')}</p>
                        </div>
                        <Badge variant={car.is_available ? 'default' : 'secondary'}>
                          {car.is_available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 py-4">No cars listed</p>
                )}
              </TabsContent>
              
              <TabsContent value="roles" className="mt-4">
                <div className="space-y-4">
                  <div className="p-3 border rounded">
                    <p className="font-medium mb-2">Current Roles:</p>
                    <div className="flex gap-2 mb-3">
                      {selectedUserData.roles.length > 0 ? (
                        selectedUserData.roles.map((role, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Badge 
                              variant={role.role === 'admin' ? 'destructive' : 'outline'}
                            >
                              {role.role}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveRole(selectedUserData.id, role.role)}
                              disabled={removeRoleMutation.isPending}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <UserMinus className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <Badge variant="outline">user (default)</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded bg-gray-50">
                    <p className="font-medium mb-3">Add Role:</p>
                    <div className="flex gap-2 items-center">
                      <Select value={newRole} onValueChange={(value: 'admin' | 'user') => setNewRole(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => handleAddRole(selectedUserData.id)}
                        disabled={addRoleMutation.isPending}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        Add Role
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded bg-blue-50">
                    <p className="text-sm text-blue-700">
                      <strong>Role Permissions:</strong><br />
                      • <strong>User:</strong> Default role with basic permissions<br />
                      • <strong>Admin:</strong> Full access to admin panel, can manage users, documents, and cars
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminUserManagement;
