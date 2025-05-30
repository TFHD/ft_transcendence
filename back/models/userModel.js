import db from '../database/db.js';
import crypto from 'crypto';
import { decrypt } from '../utils/crypto.js';

export const findUserByEmail = async (email) => {
	return await db.get('SELECT * FROM users WHERE email_hash = ?', email);
};

export const findUserByUsername = async (username) => {
	return await db.get('SELECT * FROM users WHERE username = ?', username);
};

export const findUserByUserId = async (userId) => {
	try {
		const user = await db.get('SELECT * FROM users WHERE user_id = ?', userId);
		return user;
	} catch (error) {
		throw error;
	}
};

export const findUserByUsernameOrEmail = async (username, email) => {
	return await db.get(
		'SELECT * FROM users WHERE username = ? OR email_hash = ?',
		username, email
	);
};

export const findUserByGoogleId = async (googleId) => {
	return await db.get('SELECT * FROM users WHERE google_id = ?', googleId);
};

export const findUserById = async (id) => {
	return await db.get('SELECT * FROM users WHERE user_id = ?', id);
};

export function generateRandomUserID() {
	const userId = crypto.randomInt(100000000000, 1000000000000);
	return userId;
};

export function generateRandomMessageID() {
	const messageId = crypto.randomInt(100000000000, 1000000000000);
	return messageId;
}

export function generateRandomUsername() {
	const randomString = crypto.randomBytes(4).toString('hex');
	const username = `user_${randomString}`;
	return username;
}

export const deleteUser = async (userId) => {
	const stmt = await db.prepare('DELETE FROM users WHERE user_id = ?');
	await stmt.run(userId);
}

export const createUser = async (email, email_hash, username, password, google_id) => {
	const userId = generateRandomUserID();

	const stmt = await db.prepare(
		'INSERT INTO users (user_id, email, email_hash, username, password, google_id) VALUES (?, ?, ?, ?, ?, ?)'
	);
	await stmt.run(userId, email, email_hash, username, password, google_id ? google_id : null);
	return { id: userId, email: decrypt(email), username };
};

export const updateUser = async (id, fields) => {
	try {
		const keys = Object.keys(fields);
		const values = Object.values(fields);
	
		const setClause = keys.map((key) => `${key} = ?`).join(', ');
		const stmt = await db.prepare(
			`UPDATE users SET ${setClause} WHERE user_id = ?`
		);
		const result = await stmt.run(...values, id);
		return result;
	} catch (error) {
		throw error;
	}
};

export async function updateMultiplayerStats(username) {
	const winResult = await db.get(
		'SELECT COUNT(*) AS winCount FROM history WHERE winner_username = ? AND equality = 0',
		username
	);

	const loseResult = await db.get(
		'SELECT COUNT(*) AS loseCount FROM history WHERE looser_username = ? AND equality = 0',
		username
	);

	await db.run(
		`UPDATE users
		 SET multiplayer_win = ?, multiplayer_loose = ?
		 WHERE username = ?`,
		winResult.winCount, loseResult.loseCount, username
	);
}

export const findUsersByPartialUsername = async (partial) => {
	return await db.all('SELECT user_id, last_opponent, multiplayer_loose, multiplayer_win, username, avatar_url FROM users WHERE username LIKE ?', "%" + partial + "%");
  };
