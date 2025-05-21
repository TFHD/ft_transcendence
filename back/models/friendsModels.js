import db from '../database/db.js';

//ok
export async function createFriend(sender, ask_to) {
    await db.run(`INSERT INTO friends (user1_id, user2_id, sender, ask_to, is_friend) VALUES (?, ?, ?, ?, ?)`, 0, 0, sender, ask_to, 0);
}

//ok
export async function updateFriendDB(sender, ask_to) {
    await db.run(`
        UPDATE friends SET is_friend = 1, user1_id = ?, user2_id = ?, sender = 0, ask_to = 0
        WHERE (sender = ? AND ask_to = ?) OR (sender = ? AND ask_to = ?)`, sender, ask_to, sender, ask_to, ask_to, sender);
}

//ok
export async function deleteFriendDB(userId1, userId2) {
    const result = await db.run(`DELETE FROM friends WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)`, userId1, userId2, userId2, userId1);
    return result.changes > 0;
}

//ok
export async function deleteFriendRequest(userId1, userId2) {
    const result = await db.run(`DELETE FROM friends WHERE (sender = ? AND ask_to = ?) OR (sender = ? AND ask_to = ?)`, userId1, userId2, userId2, userId1);
    return result.changes > 0;
}

//ok
export async function getSentRequests(userId) {
    return await db.all(`SELECT * FROM friends WHERE (sender = ? OR ask_to = ?) AND is_friend = 0`, userId, userId);
}

//ok
export async function getFriendsList(userId) {
    return await db.all(`SELECT * FROM friends WHERE (user1_id = ? OR user2_id = ?) AND is_friend = 1`, userId, userId);
}