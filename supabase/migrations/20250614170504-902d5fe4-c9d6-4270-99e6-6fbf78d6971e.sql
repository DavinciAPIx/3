
-- Insert mock cars into the database to fix the missing car details
INSERT INTO public.cars (id, title, description, price_per_day, location, image_url, owner_id, is_available, approval_status, approved_at) VALUES
(1, 'Toyota Land Cruiser', 'Perfect for family trips and desert adventures. This spacious Land Cruiser offers comfort and reliability for your Saudi Arabia journey.', 300, 'Riyadh', 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80', '0c97a686-47f1-4cfb-a68c-16fc68c912c2', true, 'approved', now()),
(2, 'BMW 5 Series', 'Luxury sedan perfect for business trips and city driving. Features premium interior and advanced safety systems.', 450, 'Jeddah', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80', '0c97a686-47f1-4cfb-a68c-16fc68c912c2', true, 'approved', now()),
(3, 'Chevrolet Tahoe', 'Spacious SUV ideal for large families and group travel. Comfortable seating for up to 7 passengers.', 400, 'Khobar', 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80', '0c97a686-47f1-4cfb-a68c-16fc68c912c2', true, 'approved', now()),
(4, 'Mercedes-Benz E-Class', 'Premium luxury sedan with cutting-edge technology and exceptional comfort for discerning travelers.', 550, 'Riyadh', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80', '0c97a686-47f1-4cfb-a68c-16fc68c912c2', true, 'approved', now()),
(5, 'Kia Rio', 'Economical and reliable compact car perfect for city driving and daily commutes.', 150, 'Jeddah', 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?auto=format&fit=crop&w=800&q=80', '0c97a686-47f1-4cfb-a68c-16fc68c912c2', true, 'approved', now()),
(6, 'Porsche 911', 'High-performance sports car for those who appreciate speed and luxury. An unforgettable driving experience.', 960, 'Riyadh', 'https://images.unsplash.com/photo-1544829099-b9a0c5303bea?auto=format&fit=crop&w=800&q=80', '0c97a686-47f1-4cfb-a68c-16fc68c912c2', true, 'approved', now())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price_per_day = EXCLUDED.price_per_day,
  location = EXCLUDED.location,
  image_url = EXCLUDED.image_url,
  is_available = EXCLUDED.is_available,
  approval_status = EXCLUDED.approval_status,
  approved_at = EXCLUDED.approved_at;
