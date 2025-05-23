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

export async function updateLastSeen(user_id, paddedLastSeen) {
    if (paddedLastSeen) {
        await db.run(
            `UPDATE users SET last_seen = ? WHERE user_id = ?`,
            [paddedLastSeen, user_id]
        );
    } else {
        await db.run(
            `UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE user_id = ?`,
            [user_id]
        );
    }
}
