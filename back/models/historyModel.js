import db from '../database/db.js';

export async function createHistory(w_id, l_id, w_username, l_username, w_score, l_score, equality, game_mode, time) {
	await db.run(
		'INSERT INTO history (winner_id, looser_id, winner_username, looser_username, winner_score, looser_score, equality, game_mode, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
		w_id,
		l_id,
		w_username,
		l_username,
        w_score,
        l_score,
		equality,
        game_mode,
        time
	);
};

export async function deleteHistory(id) {
	await db.run('DELETE FROM history WHERE id = ?', id);
};

export async function getHistoryByUsername(username) {
	return await db.all('SELECT * FROM history WHERE winner_username = ? OR looser_username = ?', username, username);
};