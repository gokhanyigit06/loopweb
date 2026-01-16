-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
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
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile." on profiles
  for update using (auth.uid() = id);

-- Create matches table
create table matches (
  id uuid default gen_random_uuid() primary key,
  user_1 uuid references profiles(id) on delete cascade not null,
  user_2 uuid references profiles(id) on delete cascade not null,
  status text default 'pending', -- 'pending', 'matched', 'rejected'
  created_at timestamp with time zone default now(),
  
  unique(user_1, user_2)
);

alter table matches enable row level security;

create policy "Users can view their own matches." on matches
  for select using (auth.uid() = user_1 or auth.uid() = user_2);

create policy "Users can create their own matches." on matches
  for insert with check (auth.uid() = user_1);

-- Function to handle new user signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
