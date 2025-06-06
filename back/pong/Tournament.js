import { parseJSON, mssleep, Vector3, addInPlace, length, copyFrom, isPowerOfTwo } from "./Utils.js"
import { createGame, getGameByGameId, updateGame, deleteGame } from "../models/gameModels.js"
import { createMatch, getMatchByMatchRound, changeNextvalue, getMatchByNextMatchRound, getMatchesByRound, deleteTournamentMatches } from "../models/tournamentModel.js"
import { authSocketMiddleware } from "../middlewares/wsMiddleware.js";

class   PlayerInfo
{
    constructor(username, tournamentID)
    {
        this.valid = true;
        if (!username || !tournamentID)
            this.valid = false;
        this.username = username;
        this.tournamentID = tournamentID;
        this.isOP = false;
        this.gameID = -1;
    }
}

class   TournamentRoom
{
    constructor()
    {
        this.users = new Map();
        this.games = new Map();
        this.ready_to_play = new Map();
        this.finish_match = new Map();
        this.match = 1;
        this.round = 1;
        this.winner = "";
        this.state = "En attente";
        this.nuked = false;
    }
}

const   tournamentRooms = new Map();

const	userInfos = new Map();

//=========================================================   Some utils functions ====================================================================

async function addMatchIntoDB(tournamentID, p1_displayname, p2_displayname, p1_score, p2_score, match, round, winner_id, next_match, next_round)
{
    try { await createMatch(tournamentID, p1_displayname, p2_displayname, p1_score, p2_score, match, round, winner_id, next_match, next_round); }
    catch (e) { }
}

async function setNextInfosIntoDB(tournamentID, match, round, next_match, next_round)
{
    try { await changeNextvalue(tournamentID, match, round, next_match, next_round); }
    catch (e) { }
}

async function deleteTournament(tournamentID)
{
    try { await deleteGame(tournamentID); await deleteTournamentMatches(tournamentID); }
    catch (e) { } 
}

function getOperator(tournamentID)
{
    let     currentTournament = tournamentRooms.get(tournamentID);
    if (currentTournament)
    {
        for (const [socket, user] of currentTournament.users)
            if (user.isOP === true)
                return socket;
    }
    return null;
}

function sendAll(tournamentID, data)
{
    let     currentTournament = tournamentRooms.get(tournamentID);
    if (currentTournament)
    {
        for (const [socket, value] of currentTournament.users)
            socket.send(JSON.stringify(data));
    }
}

function getSocketByUserName(tournamentID, username)
{
    let currentTournament = tournamentRooms.get(tournamentID);
    if (currentTournament)
    {
        for (const [socket, user] of currentTournament.users)
            if (user.username == username)
                return socket;
    }
    return null;
}

async function updatePlayer(tournamentID, number)
{
    try
    {
        const game = await getGameByGameId(tournamentID);
        if (game)
        {
            await updateGame(game.game_id, game.game_mode, game.players + number);
            const operator = getOperator(tournamentID);
            const canStart = isPowerOfTwo(game.players + number);
            if (operator)
                operator.send(JSON.stringify({canStart : canStart}));
        }
        else
            await createGame(tournamentID, "tournament", 1, 4);
    }
    catch (e) { }
}

async function sendInformations(tournamentID)
{
    let currentTournament   = tournamentRooms.get(tournamentID);
    let game                = await getGameByGameId(tournamentID);
    while (game && currentTournament && currentTournament.state != "Finish")
    {
        const usernames = Array.from(currentTournament.users.values()).map(user => user.username);
        sendAll(tournamentID, {
            id : tournamentID,
            mode : "tournament",
            players : game.players,
            limit : game.players_limit,
            state : currentTournament.state,
            users : usernames
        });
        currentTournament = tournamentRooms.get(tournamentID);
        game = await getGameByGameId(tournamentID);
        await mssleep(100);
    }
    if (currentTournament && currentTournament.state == "Finish") {
        const usernames = Array.from(currentTournament.users.values()).map(user => user.username);
        sendAll(tournamentID, {
            id : tournamentID,
            mode : "tournament",
            players : game.players,
            limit : game.players_limit,
            state : currentTournament.state,
            winner : currentTournament.winner,
            users : usernames
        });
    }
}

async function setNextMatch(tournamentID, match, round)
{
    try {
        const match_search = await getMatchByMatchRound(tournamentID, match, round);
        if (match_search)
        {
            const nextMatch = Math.ceil(match_search.match / 2);
            const nextRound = match_search.round + 1;
            await setNextInfosIntoDB(tournamentID, match, round, nextMatch, nextRound)
        }
    }
    catch (e) { }
}

//=====================================================================================================================================================

async function generateMatches(tournamentID)
{
    const currentTournament = tournamentRooms.get(tournamentID);
    try
    {
        let j = 1;
        if (currentTournament.round === 1)
        {
            const entriesArray = Array.from(currentTournament.users.entries());
            for (let i = 0; i < entriesArray.length; i += 2)
            {
                const [socket1, user1] = entriesArray[i];
                const [socket2, user2] = entriesArray[i + 1] || [];
                if (user1 && user2) { await addMatchIntoDB(tournamentID, user1.username, user2.username, 0, 0, j, 1, 0, 0, 0); }
                j++;
            }
        }
        else
        {
            let match_number = currentTournament.users.size / (2 ** currentTournament.round);
            for (let i = 1; i <= match_number; i += 1)
            {
                const matchs = await getMatchByNextMatchRound(tournamentID, i, currentTournament.round);
                let user1, user2 = null;
                for (const match of matchs)
                {
                    if (!user1) user1 = match.winner_id;
                    else user2 = match.winner_id;
                }
                if (user1 && user2)
                    await addMatchIntoDB(tournamentID, user1, user2, 0, 0, i, currentTournament.round, 0, 0, 0);
            }
        }
    }
    catch (e) { }
}

async function generateWinnersByRound(tournamentID, maxRounds) {
    const winnersByRound = {};
    for (let round = 1; round <= maxRounds; round++) {
        const matches = await getMatchesByRound(tournamentID, round);
        winnersByRound[round] = {};
        matches.forEach(match => {
            if (match.winner_id) {
                winnersByRound[round][match.match] = match.winner_id;
            }
        });
        if (Object.keys(winnersByRound[round]).length === 0) {
            delete winnersByRound[round];
        }
    }
    return winnersByRound;
}

async function finishMatch(tournamentID, matchPlayed)
{
    const currentTournament = tournamentRooms.get(tournamentID);
    try
    {
        const match_number = currentTournament.users.size / (2 ** currentTournament.round);
        await setNextMatch(tournamentID, matchPlayed, currentTournament.round);
        currentTournament.match++;
        if (currentTournament.match > match_number)
        {
            currentTournament.round++;
            currentTournament.match = 1;
            if (currentTournament.round > Math.sqrt(currentTournament.users.size))
            {
                const this_match = await getMatchByMatchRound(tournamentID, matchPlayed, currentTournament.round - 1);
                if (this_match)
                    currentTournament.winner = this_match.winner_id;
                currentTournament.state = "Finish";
            }
            else
            {
                const winnersByRound = await generateWinnersByRound(tournamentID, match_number);
                sendAll(tournamentID, {winnersByRound});
                await generateMatches(tournamentID);
                LetsPlay(tournamentID);
            }
        }
    }
    catch (e) { };
}

async function LetsPlay(tournamentID)
{
    const currentTournament = tournamentRooms.get(tournamentID);
    let match, user1, user2 = null;
    const match_number      = currentTournament.users.size / (2 ** currentTournament.round);

    sendAll(tournamentID, {canPlay : false});
    if (currentTournament.round === 1)
    {
        for (let i = 0; i < match_number; i++)
        {
            const data = {canPlay : true, matchToPlay : currentTournament.match + i, roundToPlay : currentTournament.round};
            match = await getMatchByMatchRound(tournamentID, currentTournament.match + i, currentTournament.round);
            if (match)
            {
                user1 = match.p1_displayname;
                user2 = match.p2_displayname;
                if (user1 && user2) {
                    const socket1 = getSocketByUserName(tournamentID, user1);
                    if (socket1)
                        socket1.send(JSON.stringify(data));
                    const socket2 = getSocketByUserName(tournamentID, user2);
                    if (socket2)
                        socket2.send(JSON.stringify(data));
                }
            }
        }
    }
    else
    {
        for (let i = 0; i < match_number; i++)
        {
            const data = {canPlay : true, matchToPlay : currentTournament.match + i, roundToPlay : currentTournament.round};
            match = await getMatchByNextMatchRound(tournamentID, currentTournament.match + i, currentTournament.round);
            if (match)
            {
                for (const the_match of match)
                {
                    if (!user1) user1 = the_match.winner_id;
                    else user2 = the_match.winner_id;
                }
                if (user1 && user2) {
                    const socket1 = getSocketByUserName(tournamentID, user1);
                    const socket2 = getSocketByUserName(tournamentID, user2);
                    if (socket1)
                        socket1.send(JSON.stringify(data));
                    if (socket2)
                        socket2.send(JSON.stringify(data));
                }
            }
        }
    }
}

async function checkCanPlay(tournamentID, socket)
{
    const user              = userInfos.get(socket);
    const currentTournament = tournamentRooms.get(tournamentID);    
    const matchs            = await getMatchesByRound(tournamentID, currentTournament.round);

    for (const match of matchs)
    {
         if (match.p1_displayname === user.username || match.p2_displayname === user.username)
         {
             if (!currentTournament.ready_to_play.has("" + match.match + match.round))
             {
                 currentTournament.ready_to_play.set("" + match.match + match.round, socket);
                 return false;
             }
             else if (currentTournament.ready_to_play.has("" + match.match + match.round) && currentTournament.ready_to_play.get("" + match.match + match.round) != socket)
                 return ({socket : currentTournament.ready_to_play.get("" + match.match + match.round), matchToPlay : match.match});
         }
    }
    return false;
}

async function canFinish(tournamentID, matchPlayed, round, socket)
{
    const currentTournament = tournamentRooms.get(tournamentID);
    const currentMatch = await getMatchByMatchRound(tournamentID, matchPlayed, round);

    if (currentTournament.finish_match.get(round + matchPlayed + "")) {
        return true;
    }
    else {
        currentTournament.finish_match.set(round + matchPlayed + "", socket);
        return false;
    }
}

async function joinTournament(socket, tournamentID)
{
    const   currentUser         = userInfos.get(socket);
    let     currentTournament   = tournamentRooms.get(currentUser.tournamentID);

    if (currentUser.username == "0" || currentUser.username == 0)
    {
        socket.send(JSON.stringify({alreadyInUse : true}));
        return ;
    }
    if (currentTournament)
    {
        for (const [socket_while, user] of currentTournament.users)
            if (user.username == currentUser.username)
            {
                socket.send(JSON.stringify({alreadyInUse: true}));
            }
        currentTournament.users.set(socket, currentUser);
        await updatePlayer(tournamentID, 1);         
    }
    else if (currentUser.tournamentID)
    {
        tournamentRooms.set(currentUser.tournamentID, new TournamentRoom());
        currentTournament = tournamentRooms.get(currentUser.tournamentID);
        currentUser.isOP = true;
        await updatePlayer(tournamentID, 0);
        currentTournament.users.set(socket, currentUser);
        await sendInformations(tournamentID);
    }
}

export async function tournament(connection, req)
{
	const sessionData = await authSocketMiddleware(req);
	if (!sessionData) {
		socket.close(1008, "Unauthorized");
		return ;
	}

    const socket        = connection;
    const username      = req.query?.username;
    const tournamentID  = req.query?.tournamentID;

    if (!userInfos.has(socket))
    {
        userInfos.set(socket, new PlayerInfo(username, tournamentID));
        joinTournament(socket, tournamentID);
    }

    socket.on('message', message =>
    {
        let packet = parseJSON(message);
        let currentUser = userInfos.get(socket);
        let currentTournament = tournamentRooms.get(currentUser.tournamentID);

        if (currentUser.valid && packet)
        {
            if (packet.start && getOperator(tournamentID) == socket)
            {
                currentTournament.state = "En cours";
                generateMatches(tournamentID);
                LetsPlay(tournamentID);
            }
            if (packet.finish)
            {
                canFinish(tournamentID, packet.matchPlayed, packet.roundPlayed, socket).then(res => {
                    if (res)
                        finishMatch(tournamentID, packet.matchPlayed);
                });
            }
            if (packet.canPlay)
            {
                let dataRecieved = null;
                checkCanPlay(tournamentID, socket).then(res => {
                    dataRecieved = res;
                    if (dataRecieved)
                    {
                        const data = {
                            goPlay : true,
                            game_id : tournamentID,
                            roomID : tournamentID + dataRecieved.matchToPlay + currentTournament.round
                        }
                        dataRecieved.socket.send(JSON.stringify(data));
                        socket.send(JSON.stringify(data));
                    }
                });
            }
        }
    })

    socket.on('close', () =>
    {
        let currentUser = userInfos.get(socket);
        let currentTournament = tournamentRooms.get(currentUser.tournamentID);
        if (currentTournament != undefined)
        {
            if (currentTournament.state == "En cours" && !currentTournament.nuked)
            {
                sendAll(currentUser.tournamentID, { stop : true });
                currentTournament.nuked = true;
            } 
            if (currentTournament.users.delete(socket))
                updatePlayer(currentUser.tournamentID, -1);
            if (currentTournament.users.size === 0)
            {
                tournamentRooms.delete(currentUser.tournamentID);
                deleteTournament(currentUser.tournamentID);
            }
            else
            {
                const [socket, user] = currentTournament.users.entries().next().value;
                if (socket && user)
                    user.isOP = true;
            }
        }
        userInfos.delete(socket);
    })
}
