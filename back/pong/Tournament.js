import { parseJSON, mssleep, Vector3, addInPlace, length, copyFrom, isPowerOfTwo } from "./Utils.js"
import { createGame, getGameByGameId, updateGame, deleteGame } from "../models/gameModels.js"
import { createMatch, setMatchWinner, getMatchByMatchRound, changeNextvalue, getMatchByNextMatchRound, getMatchesByRound } from "../models/tournamentModel.js"

/*

TOURNAMENT

Les joueurs arrivent sur une page, creer tournament et rejoindre tournament

GAME-MASTER------------
Quand un utilisateur cree un tournament il arrive sur une page avec la liste des joueurs
dans le tournament, peut etre bouton pour kick/ban du tournament??
Il y a aussi un bouton pour start le tournament
-----------------------

CLIENT-----------------
Quand un utilisateur veux rejoindre un tournament il peut voir une liste des tournaments en attente
Il peut rejoindre les tournaments et ca le rajoute dans la liste de joueurs du tournament
-----------------------

Lorsque le game master commence le tournament appuie sur commencer les games se lancent par paire
et au hasard.

Une fois que les joueurs ont finis leur partie, ils arrivent sur une fenetre avec les resultats
de la manche du tournoi dans ce style:


Player1 ---|
           |-----Player2 ---|
Player2 ---|                |
                            |---Winner
Player3 ---|                |
           |-----Player3 ---|
Player4 ---|


Si un joueur est seul, il est considere gagnant
Si le nombre de paires est impair, le tournoi ne peut pas commencer

*/

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
        console.log('created new tournament room')
        this.users = new Map();
        this.games = new Map();
        this.ready_to_play = new Map();
        this.finish_match = new Map();
        this.match = 1;
        this.round = 1;
        this.state = "En attente";
    }
}

const   tournamentRooms = new Map();

const	userInfos = new Map();

async function joinTournament(socket, tournamentID)
{
    const   currentUser = userInfos.get(socket);
    let     currentTournament = tournamentRooms.get(currentUser.tournamentID);

    if (currentTournament)
    {
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
        sendInformations(tournamentID);
    }
    else
        console.log('What happened there bro');
    console.log("--------------------------")
}

async function deleteTournament(tournamentID) 
{
    await deleteGame(tournamentID);
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
    catch (e)
    {
        console.log(e);
    }
}

function getSocketByUserName(tournamentID, username)
{

    let currentTournament = tournamentRooms.get(tournamentID);

    if (currentTournament)
    {
        for (const [socket, user] of currentTournament.users)
            if (user.username === username)
                return socket;
    }
    return null;
}

async function sendInformations(tournamentID)
{
    let currentTournament = tournamentRooms.get(tournamentID);
    let game = await getGameByGameId(tournamentID);
    while (currentTournament.state != "Finish" && game && currentTournament)
    {
        sendAll(tournamentID, {
            id : tournamentID,
            mode : "tournament",
            players : game.players,
            limit : game.players_limit,
            state : currentTournament.state,
        });
        currentTournament = tournamentRooms.get(tournamentID);
        game = await getGameByGameId(tournamentID);
        await mssleep(300);
    }
}

// function calcTournamentRounds(currentTournament)
// {
// 	currentTournament.playerCount = currentTournament.users.size;
// 	currentTournament.roomCount = currentTournament.playerCount / 2;

// 	if (!IsPowerOfTwo(currentTournament.roomCount))
// 	{
// 		console.log('Invalid amount of player, needs to be a power of 2');
// 		return (0);
// 	}

// 	let tempRoomCount = currentTournament.roomCount;
// 	while (Math.floor(tempRoomCount) > 0)
// 	{
// 		tempRoomCount /= 2;
// 		if (Math.floor(tempRoomCount) > 0)
// 			currentTournament.rounds++;
// 	}
// 	console.log(currentTournament.rounds);
	
// 	return (1);
// }

async function addMatchIntoDB(tournamentID, p1_displayname, p2_displayname, p1_score, p2_score, match, round, winner_id, next_match, next_round)
{
    try { await createMatch(tournamentID, p1_displayname, p2_displayname, p1_score, p2_score, match, round, winner_id, next_match, next_round); }
    catch (e) { console.log(e); }
}

async function setNextInfosIntoDB(tournamentID, match, round, next_match, next_round)
{
    try { await changeNextvalue(tournamentID, match, round, next_match, next_round); }
    catch (e) { console.log(e); }
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
    catch (e) { console.log(e); }
}


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
                console.log(matchs);
                let user1 = null;
                let user2 = null;
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
    catch (e) { console.log(e); }
}

async function finishMatch(tournamentID, matchPlayed)
{
    const currentTournament = tournamentRooms.get(tournamentID);

    const match_number = currentTournament.users.size / (2 ** currentTournament.round);
    await setNextMatch(tournamentID, matchPlayed, currentTournament.round);
    currentTournament.match++;
    if (currentTournament.match > match_number)
    {
        currentTournament.round++;
        currentTournament.match = 1;
        if (currentTournament.round > Math.sqrt(currentTournament.users.size))
        {
            console.log("Finish !");
            currentTournament.state = "Finish";
        }
        else
        {
            await generateMatches(tournamentID);
            LetsPlay(tournamentID);
        }
    }
}

/* CHECKS A FAIRE QUAND UN JOUEUR PARS

    Ici une liste de checks a faire quand un joueur pars comme ca on a pas de problemes

    - Si il est dans un tournoi pas lance juste le sortir du tournoi.

    - Si le tournoi est lance, check si

       Il est dans une game -> sortir de la game -> sortir du tournoi

       Il est en attente d'un autre game -> mettre en avance qu'il a perdu la game pour laquelle il attendait -> sortir du tournoi

    - Si il est a l'ecran de fin (winner affiche) juste le degager car logiquement tournoi fini.

*/

async function LetsPlay(tournamentID)
{
    const currentTournament = tournamentRooms.get(tournamentID);
    let match = null;
    let user1 = null;
    let user2 = null;
    sendAll(tournamentID, {canPlay : false});
    const match_number = currentTournament.users.size / (2 ** currentTournament.round);
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
                getSocketByUserName(tournamentID, user1).send(JSON.stringify(data));
                getSocketByUserName(tournamentID, user2).send(JSON.stringify(data));
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
                getSocketByUserName(tournamentID, user1).send(JSON.stringify(data));
                getSocketByUserName(tournamentID, user2).send(JSON.stringify(data));
            }
        }
    }
}

function handleKeyInput(packet, currentUser, currentTournament)
{
    const currentGame = getGame(currentUser, currentTournament);

    if (currentGame && currentGame.started)
    {
        let player = null;
        if (currentUser == currentGame.player1)
            player = currentGame.player1;
        else
            player = currentGame.player2;

        if (packet.key == 'w')
            player.UpInput = packet.state;
        if (packet.key == 's')
            player.DownInput = packet.state;
    }
}

async function checkCanPlay(tournamentID, socket)
{
    const user = userInfos.get(socket);
    const currentTournament = tournamentRooms.get(tournamentID);
    
    const matchs = await getMatchesByRound(tournamentID, currentTournament.round);
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
    if (!currentTournament.finish_match.has("" + matchPlayed + round))
    {
        currentTournament.finish_match.set("" + matchPlayed + round, socket);
        return false;
    }
    else if (currentTournament.finish_match.has("" + matchPlayed + round) && currentTournament.finish_match.get("" + matchPlayed + round) != socket)
        return true;
}

export function tournament(connection, req)
{
    const socket = connection;
    const username = req.query?.username;
    const tournamentID = req.query?.tournamentID;
    const typeJoin = req.query?.typeJoin;
    console.log("--------------------------\n");
    if (!userInfos.has(socket))
    {
        console.log('Adding new user to set');
        userInfos.set(socket, new PlayerInfo(username, tournamentID));
        joinTournament(socket, tournamentID);
    }

    socket.on('message', message =>
    {
        let packet = parseJSON(message);
        let currentUser = userInfos.get(socket);
        let currentTournament = tournamentRooms.get(currentUser.tournamentID);

        if (!currentUser.valid)
            console.log("Invalid user");
        else if (packet)
        {
            if (packet.start && getOperator(tournamentID) == socket)
            {
                console.log('Start game');
                currentTournament.state = "En cours";
                generateMatches(tournamentID);
                LetsPlay(tournamentID);
            }
            if (packet.key)
                handleKeyInput(packet, currentUser, currentTournament);
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
                        console.log("je suis ici");
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
            console.log(packet);
        }
    })

    socket.on('close', () =>
    {
        let currentUser = userInfos.get(socket);
        let currentTournament = tournamentRooms.get(currentUser.tournamentID);
        if (currentTournament.state != "En cours")
        {
            console.log("--------------------------");
            if (currentTournament)
            {
                currentTournament.users.delete(socket);
                updatePlayer(currentUser.tournamentID, -1);
                console.log('client leave the room');
            }
            if (currentTournament.users.size === 0)
            {
                tournamentRooms.delete(currentUser.tournamentID);
                deleteTournament(currentUser.tournamentID);
                console.log('Plus personne dans la room, elle est détruite');
            }
            else
            {
                const [socket, user] = currentTournament.users.entries().next().value;
                if (socket && user)
                    user.isOP = true;
            }
            userInfos.delete(socket);
            console.log('goodbye client');
            console.log("--------------------------");
        }
    })
}
