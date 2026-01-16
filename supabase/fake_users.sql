-- Seed Data for Female Profiles (USA & Turkey Mix)
-- Corrected: Using 'updated_at' instead of 'created_at' to match schema

-- 1. Emily (USA - NYC)
INSERT INTO profiles (id, full_name, bio, gender, looking_for, birth_date, location, avatar_url, interests, updated_at)
VALUES (
    gen_random_uuid(),
    'Emily Cooper',
    'Marketing executive living in NYC 🍎 looking for someone to explore the city with. Love fashion, good wine, and rooftop bars.',
    'female',
    'male',
    '1998-05-15',
    'New York, USA',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1000&auto=format&fit=crop',
    ARRAY['Fashion', 'Travel', 'Wine', 'Art'],
    NOW() - INTERVAL '2 days'
);

-- 2. Zeynep Yılmaz (Turkey - Istanbul)
INSERT INTO profiles (id, full_name, bio, gender, looking_for, birth_date, location, avatar_url, interests, updated_at)
VALUES (
    gen_random_uuid(),
    'Zeynep Yılmaz',
    'İstanbul''da grafik tasarımcıyım. 🎨 Hafta sonları Belgrad ormanında koşmayı ve Karaköy''de kahve içmeyi severim.',
    'female',
    'male',
    '1996-08-20',
    'Istanbul, TR',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop',
    ARRAY['Design', 'Running', 'Coffee', 'Photography'],
    NOW() - INTERVAL '5 days'
);

-- 3. Sarah Miller (USA - LA)
INSERT INTO profiles (id, full_name, bio, gender, looking_for, birth_date, location, avatar_url, interests, updated_at)
VALUES (
    gen_random_uuid(),
    'Sarah Miller',
    'California girl ☀️ Yoga instructor and vegan foodie. Let''s catch a sunset in Santa Monica.',
    'female',
    'male',
    '1999-03-10',
    'Los Angeles, USA',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop',
    ARRAY['Yoga', 'Vegan', 'Beach', 'Hiking'],
    NOW() - INTERVAL '1 day'
);

-- 4. Elif Demir (Turkey - Izmir)
INSERT INTO profiles (id, full_name, bio, gender, looking_for, birth_date, location, avatar_url, interests, updated_at)
VALUES (
    gen_random_uuid(),
    'Elif Demir',
    'İzmir''in havası gibi biraz dengesizim ama eğlenceliyimdir 😉 Deniz, kum, güneş ve rakı-balık vazgeçilmezim.',
    'female',
    'male',
    '1997-11-05',
    'Izmir, TR',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop',
    ARRAY['Sea', 'Music', 'Food', 'Travel'],
    NOW() - INTERVAL '3 days'
);

-- 5. Jessica Smith (USA - Chicago)
INSERT INTO profiles (id, full_name, bio, gender, looking_for, birth_date, location, avatar_url, interests, updated_at)
VALUES (
    gen_random_uuid(),
    'Jessica Smith',
    'Architect in the windy city 🏙️ Love classic jazz, deep dish pizza, and architecture tours. Looking for a gentleman.',
    'female',
    'male',
    '1995-02-28',
    'Chicago, USA',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1000&auto=format&fit=crop',
    ARRAY['Architecture', 'Jazz', 'Pizza', 'Reading'],
    NOW() - INTERVAL '6 days'
);

-- 6. Ayşe Kaya (Turkey - Ankara)
INSERT INTO profiles (id, full_name, bio, gender, looking_for, birth_date, location, avatar_url, interests, updated_at)
VALUES (
    gen_random_uuid(),
    'Ayşe Kaya',
    'ODTÜ mezunu mühendis. 🤓 Kitap kurduyum ve kedileri çok severim. Ciddi bir ilişki arıyorum.',
    'female',
    'male',
    '1994-07-15',
    'Ankara, TR',
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1000&auto=format&fit=crop',
    ARRAY['Books', 'Cats', 'Engineering', 'Movies'],
    NOW() - INTERVAL '4 days'
);

-- 7. Olivia Brown (USA - Miami)
INSERT INTO profiles (id, full_name, bio, gender, looking_for, birth_date, location, avatar_url, interests, updated_at)
VALUES (
    gen_random_uuid(),
    'Olivia Brown',
    'Miami vibes 🌴 Party planner by day, salsa dancer by night. Looking for a partner in crime.',
    'female',
    'male',
    '2000-09-01',
    'Miami, USA',
    'https://images.unsplash.com/photo-1503185912284-5271ff81b9a8?q=80&w=1000&auto=format&fit=crop',
    ARRAY['Dancing', 'Party', 'Beach', 'Cocktails'],
    NOW() - INTERVAL '1 week'
);

-- 8. Selin Öztürk (Turkey - Antalya)
INSERT INTO profiles (id, full_name, bio, gender, looking_for, birth_date, location, avatar_url, interests, updated_at)
VALUES (
    gen_random_uuid(),
    'Selin Öztürk',
    'Antalya''da yaşıyorum. Turizmciyim. ☀️ Yüzmeyi, dalış yapmayı ve yeni kültürler tanımayı severim.',
    'female',
    'male',
    '1996-04-12',
    'Antalya, TR',
    'https://images.unsplash.com/photo-1512288094938-363287817259?q=80&w=1000&auto=format&fit=crop',
    ARRAY['Swimming', 'Diving', 'Travel', 'Languages'],
    NOW() - INTERVAL '12 hours'
);

-- 9. Emma Wilson (USA - Austin)
INSERT INTO profiles (id, full_name, bio, gender, looking_for, birth_date, location, avatar_url, interests, updated_at)
VALUES (
    gen_random_uuid(),
    'Emma Wilson',
    'Country music lover living in Austin 🎸 Playing guitar and coding are my passions. Let''s go to a gig!',
    'female',
    'male',
    '1997-12-25',
    'Austin, USA',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=1000&auto=format&fit=crop',
    ARRAY['Music', 'Coding', 'Guitar', 'Concerts'],
    NOW() - INTERVAL '8 hours'
);

-- 10. Merve Çelik (Turkey - Istanbul)
INSERT INTO profiles (id, full_name, bio, gender, looking_for, birth_date, location, avatar_url, interests, updated_at)
VALUES (
    gen_random_uuid(),
    'Merve Çelik',
    'Moda tasarımcısıyım. 👗 Alışveriş, sanat galerileri ve Nişantaşı sokakları... Stil sahibi beyler yazsın.',
    'female',
    'male',
    '1995-06-30',
    'Istanbul, TR',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000&auto=format&fit=crop',
    ARRAY['Fashion', 'Art', 'Shopping', 'Style'],
    NOW() - INTERVAL '2 days'
);

-- 11. Chloe Davis (USA - Seattle)
INSERT INTO profiles (id, full_name, bio, gender, looking_for, birth_date, location, avatar_url, interests, updated_at)
VALUES (
    gen_random_uuid(),
    'Chloe Davis',
    'Coffee and rain ☕ Tech worker in Seattle. Hiker on weekends. Seeking a genuine connection.',
    'female',
    'male',
    '1993-10-10',
    'Seattle, USA',
    'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?q=80&w=1000&auto=format&fit=crop',
    ARRAY['Tech', 'Coffee', 'Hiking', 'Nature'],
    NOW() - INTERVAL '3 days'
);

-- 12. Aslı Kara (Turkey - Bursa)
INSERT INTO profiles (id, full_name, bio, gender, looking_for, birth_date, location, avatar_url, interests, updated_at)
VALUES (
    gen_random_uuid(),
    'Aslı Kara',
    'Uludağ Üniversitesi öğrencisi. 🎓 Kışın kayak yapmayı, yazın kamp yapmayı severim. Doğayı seven biri olmalı.',
    'female',
    'male',
    '2001-01-15',
    'Bursa, TR',
    'https://images.unsplash.com/photo-1485230405346-71acb9518d9c?q=80&w=1000&auto=format&fit=crop',
    ARRAY['Skiing', 'Camping', 'Nature', 'Student'],
    NOW() - INTERVAL '1 day'
);

-- 13. Sophia Martinez (USA - San Diego)
INSERT INTO profiles (id, full_name, bio, gender, looking_for, birth_date, location, avatar_url, interests, updated_at)
VALUES (
    gen_random_uuid(),
    'Sophia Martinez',
    'Surfer girl 🏄‍♀️ Life is better in a bikini. Looking for someone who can keep up with my waves.',
    'female',
    'male',
    '1998-08-05',
    'San Diego, USA',
    'https://images.unsplash.com/photo-1485893086445-ed75865251f5?q=80&w=1000&auto=format&fit=crop',
    ARRAY['Surfing', 'Beach', 'Fitness', 'Travel'],
    NOW() - INTERVAL '4 days'
);

-- 14. Ceren Yıldız (Turkey - Istanbul)
INSERT INTO profiles (id, full_name, bio, gender, looking_for, birth_date, location, avatar_url, interests, updated_at)
VALUES (
    gen_random_uuid(),
    'Ceren Yıldız',
    'Bankacıyım ama ruhum sanatçı. 🎭 Tiyatroya gitmeyi ve piyano çalmayı severim. Klasik müzik aşığayım.',
    'female',
    'male',
    '1994-03-22',
    'Istanbul, TR',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop',
    ARRAY['Theater', 'Piano', 'Music', 'Art'],
    NOW() - INTERVAL '5 days'
);

-- 15. Ava Anderson (USA - Boston)
INSERT INTO profiles (id, full_name, bio, gender, looking_for, birth_date, location, avatar_url, interests, updated_at)
VALUES (
    gen_random_uuid(),
    'Ava Anderson',
    'Harvard grad student 📚 History buff and museum hopper. Looking for intellectual conversations over coffee.',
    'female',
    'male',
    '1996-11-12',
    'Boston, USA',
    'https://images.unsplash.com/photo-1530785602389-07594beb8b73?q=80&w=1000&auto=format&fit=crop',
    ARRAY['History', 'Museums', 'Books', 'Coffee'],
    NOW() - INTERVAL '2 days'
);
