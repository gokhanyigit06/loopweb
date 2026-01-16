-- Enhanced schema with likes and messages tables

-- Create a table for public profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone default now(),
  full_name text,
  avatar_url text,
  bio text,
  gender text,
  looking_for text,
  birth_date date,
  interests text[],
  location text,
  
  constraint bio_length check (char_length(bio) <= 500)
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile." ON profiles;
CREATE POLICY "Users can update their own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create likes table (one-way likes)
CREATE TABLE IF NOT EXISTS likes (
  id uuid default gen_random_uuid() primary key,
  liker_id uuid references profiles(id) on delete cascade not null,
  liked_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  
  unique(liker_id, liked_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own likes." ON likes;
CREATE POLICY "Users can view their own likes." ON likes
  FOR SELECT USING (auth.uid() = liker_id OR auth.uid() = liked_id);

DROP POLICY IF EXISTS "Users can create their own likes." ON likes;
CREATE POLICY "Users can create their own likes." ON likes
  FOR INSERT WITH CHECK (auth.uid() = liker_id);

DROP POLICY IF EXISTS "Users can delete their own likes." ON likes;
CREATE POLICY "Users can delete their own likes." ON likes
  FOR DELETE USING (auth.uid() = liker_id);

-- Create matches table (mutual likes)
CREATE TABLE IF NOT EXISTS matches (
  id uuid default gen_random_uuid() primary key,
  user_1 uuid references profiles(id) on delete cascade not null,
  user_2 uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  
  unique(user_1, user_2),
  constraint different_users check (user_1 != user_2)
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own matches." ON matches;
CREATE POLICY "Users can view their own matches." ON matches
  FOR SELECT USING (auth.uid() = user_1 OR auth.uid() = user_2);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references matches(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default now(),
  read boolean default false,
  
  constraint content_length check (char_length(content) > 0 AND char_length(content) <= 1000)
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their matches." ON messages;
CREATE POLICY "Users can view messages in their matches." ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user_1 = auth.uid() OR matches.user_2 = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can send messages in their matches." ON messages;
CREATE POLICY "Users can send messages in their matches." ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = match_id 
      AND (matches.user_1 = auth.uid() OR matches.user_2 = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update their own messages." ON messages;
CREATE POLICY "Users can update their own messages." ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user_1 = auth.uid() OR matches.user_2 = auth.uid())
    )
  );

-- Function to create a match when there's mutual like
CREATE OR REPLACE FUNCTION create_match_on_mutual_like()
RETURNS TRIGGER AS $$
DECLARE
  existing_like uuid;
  new_match_id uuid;
BEGIN
  -- Check if the liked user has already liked the liker
  SELECT id INTO existing_like
  FROM likes
  WHERE liker_id = NEW.liked_id AND liked_id = NEW.liker_id;
  
  -- If mutual like exists, create a match
  IF existing_like IS NOT NULL THEN
    -- Ensure user_1 < user_2 for consistency (avoid duplicates)
    IF NEW.liker_id < NEW.liked_id THEN
      INSERT INTO matches (user_1, user_2)
      VALUES (NEW.liker_id, NEW.liked_id)
      ON CONFLICT (user_1, user_2) DO NOTHING
      RETURNING id INTO new_match_id;
    ELSE
      INSERT INTO matches (user_1, user_2)
      VALUES (NEW.liked_id, NEW.liker_id)
      ON CONFLICT (user_1, user_2) DO NOTHING
      RETURNING id INTO new_match_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create match on mutual like
DROP TRIGGER IF EXISTS on_mutual_like ON likes;
CREATE TRIGGER on_mutual_like
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION create_match_on_mutual_like();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
