-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  username TEXT,
  phone_number TEXT,
  dob DATE,
  profile_picture TEXT,
  created_at TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0)

);


-- Create document folders table
CREATE TABLE IF NOT EXISTS document_folders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name TEXT NOT NULL,
  created_at TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0)
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  folder_id INTEGER REFERENCES document_folders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0)
);


-- Create albums table
CREATE TABLE IF NOT EXISTS albums (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name TEXT NOT NULL,
  created_at TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0)
);

-- Create images table (updated with album_id)
CREATE TABLE IF NOT EXISTS images (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  album_id INTEGER REFERENCES albums(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0)
);

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  card_holder_name TEXT NOT NULL,
  card_number TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  cvv TEXT NOT NULL,
  card_type TEXT NOT NULL,
  bank_name TEXT,
  card_color TEXT,
  created_at TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0)
);

-- Disable RLS for now (as used in development)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;



-- DROP TABLE IF EXISTS public.users;


-- Create personal_information table
CREATE TABLE IF NOT EXISTS personal_information (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title TEXT NOT NULL,
  file_path TEXT,
  created_at TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0)
);

-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_type = 'BASE TABLE'
-- ORDER BY table_name;