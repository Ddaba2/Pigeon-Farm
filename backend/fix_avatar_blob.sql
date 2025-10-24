-- Change avatar_url from LONGTEXT to LONGBLOB for binary image storage
ALTER TABLE users MODIFY COLUMN avatar_url LONGBLOB NULL;

