import db from '../database/db.js';

export async function createMatch(game_id, player1_id, player2_id, match, round, winner_id, next_match, next_round) {
    await db.run(`INSERT INTO tournament (game_id, player1_id, player2_id, match, round, winner_id, next_match, next_round) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, game_id, player1_id, player2_id, match, round, winner_id, next_match, next_round);
}
  
export async function getMatchByMatchRound(game_id, match, round) {
    return await db.get(`SELECT * FROM tournament WHERE game_id = ? AND match = ? AND round = ?`, game_id, match, round);
}
  
export async function getMatchesByGameId(game_id) {
    return await db.all(`SELECT * FROM tournament WHERE game_id = ? ORDER BY round ASC, match ASC`, game_id);
}
  
export async function setMatchWinner(game_id, match, round, winnerId) {
    await db.run(`UPDATE tournament SET winner_id = ? WHERE game_id = ? AND match = ? AND round = ?`, winnerId, game_id, match, round);
}
  
export async function getMatchesByRound(game_id, round) {
    return await db.all(`SELECT * FROM tournament WHERE game_id = ? AND round = ? ORDER BY match ASC`, game_id, round);
}
  
export async function deleteTournamentMatches(game_id) {
    await db.run(`DELETE FROM tournament WHERE game_id = ?`, game_id);
}
