
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import DocumentVerificationTable from '@/components/DocumentVerificationTable';
import AdminCarManagement from '@/components/AdminCarManagement';
import AdminUserManagement from '@/components/AdminUserManagement';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { FileText, Car, Users } from 'lucide-react';

const AdminVerification = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('documents');

  // Check if user is admin
  const { data: isAdmin, isLoading: isAdminLoading } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!user,
  });

  if (loading || isAdminLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    toast({
      title: "Authentication Required",
      description: "Please log in to access the admin panel.",
      variant: "destructive",
    });
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    toast({
      title: "Access Denied",
      description: "You don't have admin privileges.",
      variant: "destructive",
    });
    return <Navigate to="/" replace />;
  }

  const tabs = [
    { id: 'documents', label: 'Document Verification', icon: FileText },
    { id: 'cars', label: 'Car Management', icon: Car },
    { id: 'users', label: 'User Management', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">Manage documents, cars, and users</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6 border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>
        
        {/* Tab Content */}
        {activeTab === 'documents' && <DocumentVerificationTable />}
        {activeTab === 'cars' && <AdminCarManagement />}
        {activeTab === 'users' && <AdminUserManagement />}
      </div>
    </div>
  );
};

export default AdminVerification;
