import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const db = await open({
	filename: './database.sqlite',
	driver: sqlite3.Database,
});

await db.exec(`
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL UNIQUE,
		username TEXT NOT NULL UNIQUE,
		password TEXT,
		email TEXT NOT NULL UNIQUE,
		avatar_url TEXT DEFAULT NULL,
		twofa_enabled BOOLEAN DEFAULT FALSE,
		twofa_secret TEXT DEFAULT NULL,
		google_id TEXT DEFAULT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
`);

await db.exec(`
	CREATE TABLE IF NOT EXISTS sessions (
		user_id INTEGER PRIMARY KEY NOT NULL UNIQUE,
		token TEXT NOT NULL UNIQUE,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
	);
`)

export default db;