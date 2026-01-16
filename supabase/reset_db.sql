-- DANGER: This script wipes all data!
-- Clean up all interactions
TRUNCATE TABLE messages RESTART IDENTITY CASCADE;
TRUNCATE TABLE matches RESTART IDENTITY CASCADE;
TRUNCATE TABLE likes RESTART IDENTITY CASCADE;

-- Optional: Delete all profiles except real users (identifying real users might be tricky if not marked)
-- For now, let's keep profiles but clear interactions.
-- If you want to delete fake users, usually checking for specific email domains or metadata helps.
-- Assuming we want a hard reset of interactions only for now to keep test accounts valid.

-- Reset sequences if any
ALTER SEQUENCE IF EXISTS messages_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS matches_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS likes_id_seq RESTART WITH 1;

-- Verify cleanup
SELECT count(*) as messages_count FROM messages;
SELECT count(*) as matches_count FROM matches;
SELECT count(*) as likes_count FROM likes;
