import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function runMigration() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();

        console.log('Connected to database. Running migration...');

        await client.query('BEGIN');

        // 1. Create document_folders table
        await client.query(`
            CREATE TABLE IF NOT EXISTS document_folders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                name TEXT NOT NULL,
                created_at TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0)
            );
        `);
        console.log('Created document_folders table.');

        // 2. Add folder_id to documents table if it doesn't exist
        // We use a DO block to safely check and add column
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                               WHERE table_name='documents' AND column_name='folder_id') THEN
                    ALTER TABLE documents ADD COLUMN folder_id INTEGER REFERENCES document_folders(id) ON DELETE CASCADE;
                END IF;
            END
            $$;
        `);
        console.log('Updated documents table schema.');

        // 3. Create personal_information table
        await client.query(`
            CREATE TABLE IF NOT EXISTS personal_information (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                title TEXT NOT NULL,
                file_path TEXT,
                created_at TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0)
            );
        `);
        console.log('Created personal_information table.');

        await client.query('COMMIT');
        console.log('Migration completed successfully.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', e);
    } finally {
        await client.end();
    }
}

runMigration();
