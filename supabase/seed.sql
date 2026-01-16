-- Seed data for testing
-- First, let's create some test users in the profiles table
-- Note: You'll need to create auth users manually in Supabase Auth UI first, then use their UUIDs here

-- Insert test profiles (replace UUIDs with actual auth user IDs from Supabase)
INSERT INTO profiles (id, full_name, avatar_url, bio, gender, looking_for, birth_date, interests, location) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Selen Yılmaz', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800', 'Coffee lover ☕ | Travel enthusiast 🌍 | Let''s explore Istanbul together!', 'female', 'male', '1999-03-15', ARRAY['travel', 'coffee', 'photography', 'music'], 'Istanbul, Beşiktaş', true),
  ('00000000-0000-0000-0000-000000000002', 'Can Demir', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800', 'Music producer 🎸 | Jazz & Rock | Looking for concert buddies', 'male', 'female', '1996-07-22', ARRAY['music', 'concerts', 'guitar', 'art'], 'Ankara, Çankaya', true),
  ('00000000-0000-0000-0000-000000000003', 'Melis Kaya', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800', 'Art student 🎨 | Painting my way through life | Gallery hopper', 'female', 'male', '2001-11-08', ARRAY['art', 'painting', 'museums', 'yoga'], 'Izmir, Alsancak', true),
  ('00000000-0000-0000-0000-000000000004', 'Ege Arslan', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', 'Software engineer 💻 | Gym rat 💪 | Foodie | Let''s grab brunch!', 'male', 'female', '1997-05-12', ARRAY['tech', 'fitness', 'food', 'hiking'], 'Istanbul, Kadıköy', true),
  ('00000000-0000-0000-0000-000000000005', 'Ayşe Şahin', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800', 'Yoga instructor 🧘‍♀️ | Plant mom 🌱 | Seeking mindful connections', 'female', 'male', '1998-09-25', ARRAY['yoga', 'meditation', 'plants', 'wellness'], 'Antalya, Lara', true),
  ('00000000-0000-0000-0000-000000000006', 'Berk Öztürk', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800', 'Entrepreneur 🚀 | Startup life | Coffee & deep conversations', 'male', 'female', '1995-02-18', ARRAY['business', 'startups', 'books', 'travel'], 'Istanbul, Levent', true),
  ('00000000-0000-0000-0000-000000000007', 'Deniz Aydın', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800', 'Fashion designer 👗 | Vintage lover | Weekend market explorer', 'female', 'male', '2000-06-30', ARRAY['fashion', 'design', 'vintage', 'shopping'], 'Istanbul, Nişantaşı', true),
  ('00000000-0000-0000-0000-000000000008', 'Kaan Yıldız', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800', 'Photographer 📷 | Adventure seeker | Drone pilot | Let''s capture moments', 'male', 'female', '1994-12-05', ARRAY['photography', 'travel', 'adventure', 'drones'], 'Bodrum, Merkez', true),
  ('00000000-0000-0000-0000-000000000009', 'Elif Çelik', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800', 'Architect 🏛️ | Design enthusiast | Loves good wine & architecture tours', 'female', 'male', '1997-04-20', ARRAY['architecture', 'design', 'wine', 'culture'], 'Ankara, Çayyolu', true),
  ('00000000-0000-0000-0000-000000000010', 'Mert Koç', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800', 'Chef 👨‍🍳 | Foodie | Cooking is my love language | Let''s cook together!', 'male', 'female', '1996-08-14', ARRAY['cooking', 'food', 'wine', 'restaurants'], 'Istanbul, Etiler', true)
ON CONFLICT (id) DO NOTHING;

-- Update timestamps
UPDATE profiles SET updated_at = NOW();
