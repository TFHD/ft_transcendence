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
		email_hash TEXT NOT NULL UNIQUE,
		avatar_url TEXT DEFAULT NULL,
		multiplayer_win INT DEFAULT 0,
		multiplayer_loose INT DEFAULT 0,
		singleplayer_win INT DEFAULT 0,
		singleplayer_loose INT DEFAULT 0,
		practice_win INT DEFAULT 0,
		practice_loose INT DEFAULT 0,
		last_opponent TEXT DEFAULT NULL,
		twofa_enabled BOOLEAN DEFAULT FALSE,
		twofa_secret TEXT DEFAULT NULL,
		google_id TEXT DEFAULT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
`);

await db.exec(`
	CREATE TABLE IF NOT EXISTS history (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		winner_id INTEGER NOT NULL,
		looser_id INTEGER NOT NULL,
		winner_username TEXT NOT NULL,
		looser_username TEXT NOT NULL,
		winner_score INTEGER DEFAULT 0,
		looser_score INTEGER DEFAULT 0,
		equality INTEGER DEFAULT 0,
		game_mode TEXT DEFAULT NULL,
		time TEXT DEFAULT NULL
	);
`);

await db.exec(`
	CREATE TABLE IF NOT EXISTS friends (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user1_id INTEGER NOT NULL,
		user2_id INTEGER NOT NULL,
		status TEXT NOT NULL,
		initiator_id INTEGER NOT NULL
	);
	CREATE UNIQUE INDEX IF NOT EXISTS idx_friends_pair ON friends(user1_id, user2_id);
`);

await db.exec(`
	CREATE TABLE IF NOT EXISTS tournament (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		game_id TEXT NOT NULL,
		p1_displayname TEXT NOT NULL,
		p2_displayname TEXT NOT NULL,
		p1_score INTEGER DEFAULT 0,
		p2_score INTEGER DEFAULT 0,
		match INTEGER NOT NULL,
		round INTEGER NOT NULL,
		winner_id INTEGER NOT NULL,
		next_match INTEGER NOT NULL,
		next_round INTEGER NOT NULL
	);
`);

await db.exec(`
	CREATE TABLE IF NOT EXISTS games (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		game_id TEXT NOT NULL UNIQUE,
		game_mode TEXT NOT NULL,
		players INTEGER NOT NULL,
		players_limit NOT NULL
	);
`);

await db.exec(`
	CREATE TABLE IF NOT EXISTS sessions (
		user_id INTEGER PRIMARY KEY NOT NULL UNIQUE,
		token TEXT NOT NULL UNIQUE,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
	);
`);

await db.exec(`
	CREATE TABLE IF NOT EXISTS messages (
		message_id INTEGER PRIMARY KEY NOT NULL UNIQUE,
		sender_id INTEGER NOT NULL,
		receiver_id INTEGER NOT NULL,
		content TEXT NOT NULL,
		timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
		FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE CASCADE
	);
`);

export default db;