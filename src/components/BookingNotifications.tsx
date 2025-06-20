
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, X, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ChatWindow from "@/components/ChatWindow";

interface BookingNotification {
  id: string;
  booking_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  bookings: {
    id: string;
    car_id: number;
    renter_id: string;
    renter_name: string;
    renter_mobile: string;
    renter_email: string;
    pickup_date: string;
    return_date: string;
    total_amount: number;
    status: string;
    message_to_owner: string | null;
    cars: {
      title: string;
      image_url: string | null;
    };
  };
}

interface BookingRequest {
  id: string;
  car_id: number;
  renter_id: string;
  renter_name: string;
  renter_mobile: string;
  renter_email: string;
  pickup_date: string;
  return_date: string;
  total_amount: number;
  status: string;
  message_to_owner: string | null;
  created_at: string;
  cars: {
    title: string;
    image_url: string | null;
  };
}

const BookingNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    ownerName: string;
    carTitle?: string;
  } | null>(null);

  // Fetch notifications
  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ['bookingNotifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('booking_notifications')
        .select(`
          *,
          bookings (
            *,
            cars (title, image_url)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BookingNotification[];
    },
    enabled: !!user?.id,
  });

  // Fetch pending booking requests (for owners)
  const { data: bookingRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['bookingRequests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          cars (title, image_url)
        `)
        .eq('owner_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BookingRequest[];
    },
    enabled: !!user?.id,
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('booking_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookingNotifications'] });
    },
  });

  // Update booking status
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: 'confirmed' | 'declined' }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId);
      
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['bookingRequests'] });
      toast({
        title: "Booking Updated",
        description: `Booking has been ${status}`,
      });
    },
  });

  // Create or find conversation for messaging
  const createConversationMutation = useMutation({
    mutationFn: async ({ renterId, carId }: { renterId: string; carId: number }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // First, get the renter's profile name
      const { data: renterProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', renterId)
        .maybeSingle();

      const renterName = renterProfile?.full_name || 'Renter';

      // Check if conversation already exists
      const { data: existingConversation, error: findError } = await supabase
        .from('conversations')
        .select('id')
        .eq('renter_id', renterId)
        .eq('owner_id', user.id)
        .eq('car_id', carId)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        throw findError;
      }

      if (existingConversation) {
        return {
          conversationId: existingConversation.id,
          renterName,
          carId
        };
      }

      // Create new conversation if it doesn't exist
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          renter_id: renterId,
          owner_id: user.id,
          car_id: carId
        })
        .select('id')
        .single();

      if (createError) throw createError;

      return {
        conversationId: newConversation.id,
        renterName,
        carId
      };
    },
    onSuccess: ({ conversationId, renterName, carId }) => {
      // Get car title for better display
      supabase
        .from('cars')
        .select('title')
        .eq('id', carId)
        .maybeSingle()
        .then(({ data: carData }) => {
          setSelectedConversation({
            id: conversationId,
            ownerName: renterName,
            carTitle: carData?.title || `Car ID: ${carId}`
          });
        });
    },
    onError: (error) => {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleMessageRenter = (request: BookingRequest) => {
    createConversationMutation.mutate({
      renterId: request.renter_id,
      carId: request.car_id
    });
  };

  const handleCloseChat = () => {
    setSelectedConversation(null);
  };

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  if (!user) return null;

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Notifications Section */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {notificationsLoading ? (
              <p className="text-center py-4">Loading notifications...</p>
            ) : notifications?.length === 0 ? (
              <p className="text-muted-foreground text-center py-4 text-sm sm:text-base">No notifications yet</p>
            ) : (
              <div className="space-y-3">
                {notifications?.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 sm:p-3 rounded-lg border ${
                      notification.is_read ? 'bg-background' : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-sm">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                        {notification.bookings && (
                          <p className="text-xs text-muted-foreground">
                            Car: {notification.bookings.cars?.title}
                          </p>
                        )}
                      </div>
                      {!notification.is_read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                          className="text-xs px-2 py-1 h-auto flex-shrink-0"
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Booking Requests (for owners) */}
        {bookingRequests && bookingRequests.length > 0 && (
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">Pending Booking Requests</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="space-y-4">
                {bookingRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-3 sm:p-4">
                    <div className="flex justify-between items-start mb-3 gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base truncate">{request.cars?.title}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {new Date(request.pickup_date).toLocaleDateString()} - {new Date(request.return_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">Pending</Badge>
                    </div>
                    
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span>Renter:</span>
                        <span className="font-medium">{request.renter_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mobile:</span>
                        <span>{request.renter_mobile}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Email:</span>
                        <span className="truncate ml-2">{request.renter_email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-semibold">SAR {request.total_amount}</span>
                      </div>
                      {request.message_to_owner && (
                        <div className="mt-2 p-2 bg-muted/50 rounded">
                          <p className="text-xs text-muted-foreground">Message:</p>
                          <p className="text-xs sm:text-sm">{request.message_to_owner}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                      <Button
                        size="sm"
                        onClick={() => updateBookingStatusMutation.mutate({
                          bookingId: request.id,
                          status: 'confirmed'
                        })}
                        disabled={updateBookingStatusMutation.isPending}
                        className="flex-1 sm:flex-none"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateBookingStatusMutation.mutate({
                          bookingId: request.id,
                          status: 'declined'
                        })}
                        disabled={updateBookingStatusMutation.isPending}
                        className="flex-1 sm:flex-none"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMessageRenter(request)}
                        disabled={createConversationMutation.isPending}
                        className="flex-1 sm:flex-none"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {createConversationMutation.isPending ? 'Loading...' : 'Message'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
        </Card>
        )}
      </div>

      {selectedConversation && (
        <ChatWindow
          conversationId={selectedConversation.id}
          ownerName={selectedConversation.ownerName}
          carTitle={selectedConversation.carTitle}
          onClose={handleCloseChat}
          currentUserId={user.id}
        />
      )}
    </>
  );
};

export default BookingNotifications;
