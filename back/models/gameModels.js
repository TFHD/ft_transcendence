import db from '../database/db.js';

export async function createGame(game_id, game_mode, players, limit) {
    await db.run(`INSERT INTO games (game_id, game_mode, players, players_limit) VALUES (?, ?, ?, ?)`, game_id, game_mode, players, limit);
}

export async function getGameByGameId(game_id) {
    return await db.get(`SELECT * FROM games WHERE game_id = ?`, game_id);
}

export async function getAllGames() {
    return await db.all(`SELECT * FROM games ORDER BY id ASC`);
}

export async function updateGame(game_id, game_mode, players) {
    await db.run(`UPDATE games SET game_mode = ?, players = ? WHERE game_id = ?`, game_mode, players, game_id);
}

export async function deleteGame(game_id) {
    await db.run(`DELETE FROM games WHERE game_id = ?`, game_id);
}