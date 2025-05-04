import db from '../database/db.js';
import crypto from 'crypto';

export const findUserByEmail = async (email) => {
	return await db.get('SELECT * FROM users WHERE email = ?', email);
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
		'SELECT * FROM users WHERE username = ? OR email = ?',
		username, email
	);
};

export const findUserById = async (id) => {
	return await db.get('SELECT * FROM users WHERE id = ?', id);
};

export function generateRandomUserID() {
	const userId = crypto.randomInt(100000000000, 1000000000000);
	return userId;
};

export const deleteUser = async (userId) => {
	const stmt = await db.prepare('DELETE FROM users WHERE user_id = ?');
	await stmt.run(userId);
}

export const createUser = async (email, username, password ) => {
	const userId = generateRandomUserID();

	const stmt = await db.prepare(
		'INSERT INTO users (user_id, email, username, password) VALUES (?, ?, ?, ?)'
	);
	await stmt.run(userId, email, username, password);
	return { id: userId, email, username };
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