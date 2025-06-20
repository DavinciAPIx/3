
-- Create bookings table to store booking requests
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id INTEGER NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  renter_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  renter_name TEXT NOT NULL,
  renter_mobile TEXT NOT NULL,
  renter_email TEXT NOT NULL,
  message_to_owner TEXT,
  pickup_date DATE NOT NULL,
  return_date DATE NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for bookings
-- Renters can view their own bookings
CREATE POLICY "Renters can view their own bookings" 
  ON public.bookings 
  FOR SELECT 
  USING (auth.uid() = renter_id);

-- Owners can view bookings for their cars
CREATE POLICY "Owners can view bookings for their cars" 
  ON public.bookings 
  FOR SELECT 
  USING (auth.uid() = owner_id);

-- Renters can create bookings
CREATE POLICY "Renters can create bookings" 
  ON public.bookings 
  FOR INSERT 
  WITH CHECK (auth.uid() = renter_id);

-- Owners can update booking status for their cars
CREATE POLICY "Owners can update booking status" 
  ON public.bookings 
  FOR UPDATE 
  USING (auth.uid() = owner_id);

-- Create notifications table for booking updates
CREATE TABLE public.booking_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications table
ALTER TABLE public.booking_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.booking_notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" 
  ON public.booking_notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Function to create notifications when booking status changes
CREATE OR REPLACE FUNCTION public.handle_booking_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only create notification if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Notify renter about status change
    INSERT INTO public.booking_notifications (booking_id, user_id, message)
    VALUES (
      NEW.id,
      NEW.renter_id,
      CASE NEW.status
        WHEN 'confirmed' THEN 'Your booking request has been confirmed!'
        WHEN 'declined' THEN 'Your booking request has been declined.'
        ELSE 'Your booking status has been updated.'
      END
    );
    
    -- If booking is confirmed or declined, also notify owner
    IF NEW.status IN ('confirmed', 'declined') THEN
      INSERT INTO public.booking_notifications (booking_id, user_id, message)
      VALUES (
        NEW.id,
        NEW.owner_id,
        'You have ' || NEW.status || ' a booking request.'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for booking status changes
CREATE TRIGGER on_booking_status_change
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_booking_status_change();

-- Function to notify owner of new booking request
CREATE OR REPLACE FUNCTION public.handle_new_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Notify owner about new booking request
  INSERT INTO public.booking_notifications (booking_id, user_id, message)
  VALUES (
    NEW.id,
    NEW.owner_id,
    'You have a new booking request for your car!'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new bookings
CREATE TRIGGER on_new_booking
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_booking();
