import db from '../database/db.js';
import { generateRandomMessageID } from './userModel.js';

export async function saveMessage(userId, receiverId, message, type, room_id) {
	const messageId = generateRandomMessageID();
	const row = await db.get(`
		INSERT INTO messages (message_id, sender_id, receiver_id, content, type, room_id)
		VALUES (?, ?, ?, ?, ?, ?)
		RETURNING message_id, timestamp
	`, [messageId, userId, receiverId, message, type, room_id]);

	return { messageId: row.message_id, timestamp: row.timestamp };
}

export async function findMessageById(messageId) {
	const message = await db.get(`
		SELECT *
		FROM messages
		WHERE message_id = ?
	`, [messageId]);
	if (!message)
		return null;
	return message;	
}

export async function removeMessage(messageId) {
	await db.run(`
		DELETE FROM messages
		WHERE message_id = ?
	`, [messageId]);
}

export async function getAllMessages(userId, targetId, limit = 50, offset = 0) {
	return await db.all(`
		SELECT * FROM messages
		WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
		ORDER BY timestamp DESC
		LIMIT ? OFFSET ?
	`, [userId, targetId, targetId, userId, limit, offset]);
}

export async function deleteMessagesByUserId(userId) {
	await db.run(`
		DELETE FROM messages
		WHERE sender_id = ? OR receiver_id = ?
	`, [userId, userId]);
}