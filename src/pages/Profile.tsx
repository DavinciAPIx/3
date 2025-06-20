import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import DocumentUpload from "@/components/DocumentUpload";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, FileCheck, Car, Mail, Phone, Calendar, Edit, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, refetch } = useProfile();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // Fetch user's cars
  const { data: userCars, isLoading: carsLoading } = useQuery({
    queryKey: ['userCars', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching cars for user:', user.id);
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user cars:', error);
        return [];
      }
      
      console.log('Fetched user cars:', data);
      return data || [];
    },
    enabled: !!user?.id && profile?.user_type === 'car_owner',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  const handlePhotoUpdate = (photoUrl: string) => {
    setAvatarUrl(photoUrl);
    refetch();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="space-y-4 text-center">
            <div className="skeleton h-8 w-32 mx-auto"></div>
            <div className="skeleton h-4 w-48 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="modern-card">
            <CardContent className="pt-6 text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground">Please log in to view your profile.</p>
              <Button onClick={() => navigate("/auth")} className="mt-4">
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="mb-12 fade-in-up">
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
            <Avatar className="w-24 h-24 rounded-2xl shadow-elegant-lg">
              <AvatarImage src={avatarUrl} alt={profile.full_name || 'Profile'} />
              <AvatarFallback className="w-24 h-24 rounded-2xl gradient-primary text-white text-3xl font-bold">
                {(profile.full_name || user.email || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-foreground">
                  {profile.full_name || 'Welcome!'}
                </h1>
                <Badge variant={profile.user_type === 'car_owner' ? 'default' : 'secondary'} className="text-xs">
                  {profile.user_type === 'car_owner' ? 'Car Owner' : 'Car Renter'}
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground">
                Manage your account, documents, and {profile.user_type === 'car_owner' ? 'car listings' : 'rental history'}
              </p>
            </div>
            <Button variant="outline" className="btn-modern">
              <Edit size={16} className="mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-8 fade-in-up delay-200">
          <TabsList className="grid w-full grid-cols-3 h-14 p-1 bg-muted/50 rounded-xl">
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">
              <User className="w-4 h-4" />
              Profile Info
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">
              <FileCheck className="w-4 h-4" />
              Verification
            </TabsTrigger>
            {profile.user_type === 'car_owner' && (
              <TabsTrigger value="cars" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">
                <Car className="w-4 h-4" />
                My Cars
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ProfilePhotoUpload 
                  currentPhotoUrl={avatarUrl}
                  userName={profile.full_name || user.email || 'User'}
                  onPhotoUpdate={handlePhotoUpdate}
                />
              </div>
              
              <div className="lg:col-span-2">
                <Card className="modern-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                          <User className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                            <p className="text-base font-medium">{profile.full_name || 'Not provided'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                            <p className="text-base font-medium">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                          <Phone className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                            <p className="text-base font-medium">{profile.phone || 'Not provided'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                            <p className="text-base font-medium">
                              {new Date(profile.created_at).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <DocumentUpload />
          </TabsContent>

          {profile.user_type === 'car_owner' && (
            <TabsContent value="cars">
              <Card className="modern-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                        <Car className="w-5 h-5 text-white" />
                      </div>
                      My Listed Cars
                    </div>
                    <Button onClick={() => navigate("/list-car")} className="btn-modern gradient-primary text-white">
                      <Car className="w-4 h-4 mr-2" />
                      List New Car
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {carsLoading ? (
                    <div className="text-center py-8">
                      <div className="text-lg">Loading your cars...</div>
                    </div>
                  ) : userCars && userCars.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userCars.map((car) => (
                        <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="aspect-video bg-muted/50 flex items-center justify-center">
                            {car.image_url ? (
                              <img 
                                src={car.image_url} 
                                alt={car.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Car className="w-12 h-12 text-muted-foreground/50" />
                            )}
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-lg truncate">{car.title}</h3>
                              {getStatusBadge(car.approval_status)}
                            </div>
                            
                            <div className="space-y-2 text-sm text-muted-foreground">
                              {car.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{car.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                <span>{car.price_per_day} SAR/day</span>
                              </div>
                              <div className="text-xs">
                                Listed: {new Date(car.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            
                            {car.approval_status === 'rejected' && car.admin_notes && (
                              <div className="mt-3 p-2 bg-red-50 rounded text-sm text-red-800">
                                <strong>Admin Notes:</strong> {car.admin_notes}
                              </div>
                            )}
                            
                            <div className="mt-4 flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => navigate(`/car/${car.id}`)}
                                className="flex-1"
                              >
                                View
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                disabled={car.approval_status === 'approved'}
                              >
                                Edit
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-muted/50 flex items-center justify-center">
                        <Car className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No cars listed yet</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Start earning by listing your first car! It only takes a few minutes to get started.
                      </p>
                      <Button onClick={() => navigate("/list-car")} className="btn-modern gradient-primary text-white">
                        List Your First Car
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
