import db from '../database/db.js';

export async function createMatch(game_id, p1_displayname, p2_displayname, p1_score, p2_score, match, round, winner_id, next_match, next_round) {
    await db.run(`INSERT INTO tournament (game_id, p1_displayname, p2_displayname, p1_score, p2_score, match, round, winner_id, next_match, next_round) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        game_id, p1_displayname, p2_displayname, p1_score, p2_score, match, round, winner_id, next_match, next_round);
}
  
export async function getMatchByMatchRound(game_id, match, round) {
    return await db.get(`SELECT * FROM tournament WHERE game_id = ? AND match = ? AND round = ?`, game_id, match, round);
}
  
export async function getMatchesByGameId(game_id) {
    return await db.all(`SELECT * FROM tournament WHERE game_id = ? ORDER BY round ASC, match ASC`, game_id);
}
  
export async function setMatchWinner(game_id, match, round, winnerDisplayName) {
    await db.run(`UPDATE tournament SET winner_id = ? WHERE game_id = ? AND match = ? AND round = ?`, winnerDisplayName, game_id, match, round);
}
  
export async function getMatchesByRound(game_id, round) {
    return await db.all(`SELECT * FROM tournament WHERE game_id = ? AND round = ? ORDER BY match ASC`, game_id, round);
}

export async function setScoreByMatchRound(game_id, match, round, score1, score2) {
    return await db.all(`UPDATE tournament SET p1_score = ? AND p2_score = ? WHERE game_id = ? AND match = ? AND round = ?`, score1, score2, game_id, match, round);
}
  
export async function deleteTournamentMatches(game_id) {
    await db.run(`DELETE FROM tournament WHERE game_id = ?`, game_id);
}

export async function changeNextvalue(game_id, match, round, n_match, n_round) {
    await db.run(`UPDATE tournament SET next_match = ? AND next_round = ? WHERE game_id = ? AND match = ? and round = ?`,
        n_match, n_round, game_id, match, round
    );
}
