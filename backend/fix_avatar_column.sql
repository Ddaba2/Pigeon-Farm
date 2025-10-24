-- Fix avatar_url column to support long base64 images
ALTER TABLE users MODIFY COLUMN avatar_url LONGTEXT NULL;

