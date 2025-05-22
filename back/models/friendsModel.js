import db from '../database/db.js';

export async function findFriendRelation(user1_id, user2_id) {
	const row = await db.get(`
		SELECT * FROM friends
		WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
	`, [user1_id, user2_id, user2_id, user1_id]);
	return row;
}

export async function createFriendRelation(user1_id, user2_id, data) {
	const { status, initiator_id } = data;
	await db.run(`
		INSERT INTO friends (user1_id, user2_id, status, initiator_id)
		VALUES (?, ?, ?, ?)
	`, [user1_id, user2_id, status, initiator_id]);
}

export async function updateFriendRelation(user1_id, user2_id, data) {
	const { status, initiator_id } = data;
	await db.run(`
		UPDATE friends
		SET status = ?, initiator_id = ?
		WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
	`, [status, initiator_id, user1_id, user2_id, user2_id, user1_id]);
}

export async function getAllFriendsById(user_id) {
	const rows = await db.all(`
		SELECT * FROM friends
		WHERE (user1_id = ? OR user2_id = ?)
	`, [user_id, user_id]);
	return rows;
}

export async function deleteFriendRelation(user1_id, user2_id) {
	await db.run(`
		DELETE FROM friends
		WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
	`, [user1_id, user2_id, user2_id, user1_id]);
}
