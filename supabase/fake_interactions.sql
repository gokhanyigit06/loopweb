-- SMART FAKE INTERACTIONS SYSTEM

-- 1. Function to just generate INCOMING LIKES (The "Blurry" ones)
CREATE OR REPLACE FUNCTION generate_initial_likes(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    fake_user RECORD;
BEGIN
    FOR fake_user IN 
        SELECT p.id 
        FROM profiles p
        WHERE p.id != target_user_id
        AND NOT EXISTS (
            SELECT 1 FROM likes l 
            WHERE l.liker_id = p.id AND l.liked_id = target_user_id
        )
        ORDER BY random()
        LIMIT 1
    LOOP
        INSERT INTO likes (liker_id, liked_id)
        VALUES (fake_user.id, target_user_id)
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$;


-- 2. Function to FORCE MATCH & MESSAGE when Real User likes a Fake User
CREATE OR REPLACE FUNCTION handle_new_match(
    liker_id uuid, -- The Real User
    liked_id uuid  -- The Fake User
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_fake boolean;
    existing_match uuid;
    fake_location text;
    msg_content text;
    tr_msgs text[] := ARRAY['Selam, naber? 👋', 'Fotoğrafların harika görünüyor! 📸', 'Selam, tanışalım mı?', 'Tarzını çok beğendim 🔥', 'Yakınlardayız sanırım, bir kahve? ☕️'];
    en_msgs text[] := ARRAY['Hi there! 👋', 'Love your profile vibe ✨', 'Hey! How is it going?', 'Cute smile! 😉', 'We matched! Coffee sometime? ☕️'];
BEGIN
    INSERT INTO likes (liker_id, liked_id) VALUES (liker_id, liked_id) ON CONFLICT DO NOTHING;

    SELECT location INTO fake_location FROM profiles WHERE id = liked_id;
    
    INSERT INTO likes (liker_id, liked_id) VALUES (liked_id, liker_id) ON CONFLICT DO NOTHING;

    INSERT INTO matches (user_1, user_2)
    VALUES (least(liker_id, liked_id), greatest(liker_id, liked_id))
    ON CONFLICT (user_1, user_2) DO UPDATE SET created_at = NOW()
    RETURNING id INTO existing_match;

    IF existing_match IS NULL THEN
         SELECT id INTO existing_match FROM matches 
         WHERE (user_1 = liker_id AND user_2 = liked_id) OR (user_1 = liked_id AND user_2 = liker_id);
    END IF;

    IF fake_location ILIKE '%Turkey%' OR fake_location ILIKE '%Istanbul%' OR fake_location ILIKE '%Ankara%' OR fake_location ILIKE '%Izmir%' OR fake_location ILIKE '%Bursa%' OR fake_location ILIKE '%Antalya%' THEN
        msg_content := tr_msgs[floor(random() * array_length(tr_msgs, 1) + 1)];
    ELSE
        msg_content := en_msgs[floor(random() * array_length(en_msgs, 1) + 1)];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM messages WHERE match_id = existing_match) THEN
         INSERT INTO messages (match_id, sender_id, content) VALUES (existing_match, liked_id, msg_content);
    END IF;

    RETURN true;
END;
$$;

-- 3. Function to SEND A MESSAGE AS A BOT (NEW)
-- Used by the frontend 'Bot Brain' to reply to the user using RPC
CREATE OR REPLACE FUNCTION send_bot_message(
    match_id uuid,
    sender_id uuid, -- The Bot's ID
    content text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO messages (match_id, sender_id, content)
    VALUES (match_id, sender_id, content);
END;
$$;
