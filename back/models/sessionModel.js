import db from '../database/db.js';

export async function createSession(userId, token) {
	await db.run(
		'INSERT INTO sessions (user_id, token) VALUES (?, ?)',
		userId,
		token
	);
};

export async function deleteSession(token) {
	await db.run('DELETE FROM sessions WHERE token = ?', token);
};

export async function getSessionByUserId(user_id) {
	return await db.get('SELECT * FROM sessions WHERE user_id = ?', user_id);
};

export async function getSessionByToken(token) {
	return await db.get('SELECT * FROM sessions WHERE token = ?', token);
};

export async function updateLastSeen(token) {
	await db.run('UPDATE sessions SET last_seen = CURRENT_TIMESTAMP WHERE token = ?', token);
};