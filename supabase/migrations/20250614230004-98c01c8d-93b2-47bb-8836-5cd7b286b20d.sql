
-- First, let's check and fix the RLS policies for conversations and messages tables

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations as renter" ON public.conversations;
DROP POLICY IF EXISTS "Users can update conversations they participate in" ON public.conversations;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

-- Create proper RLS policies for conversations
CREATE POLICY "Users can view conversations they participate in" 
  ON public.conversations 
  FOR SELECT 
  USING (auth.uid() = renter_id OR auth.uid() = owner_id);

CREATE POLICY "Users can create conversations as renter" 
  ON public.conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Users can update conversations they participate in" 
  ON public.conversations 
  FOR UPDATE 
  USING (auth.uid() = renter_id OR auth.uid() = owner_id);

-- Create proper RLS policies for messages
CREATE POLICY "Users can view messages in their conversations" 
  ON public.messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (auth.uid() = conversations.renter_id OR auth.uid() = conversations.owner_id)
    )
  );

CREATE POLICY "Users can create messages in their conversations" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (auth.uid() = conversations.renter_id OR auth.uid() = conversations.owner_id)
    )
  );

CREATE POLICY "Users can update messages for read status" 
  ON public.messages 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (auth.uid() = conversations.renter_id OR auth.uid() = conversations.owner_id)
    )
  );
