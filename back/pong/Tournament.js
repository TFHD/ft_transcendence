import { parseJSON, mssleep, Vector3, addInPlace, length, copyFrom, isPowerOfTwo } from "./Utils.js"
import { createGame, getGameByGameId, updateGame, deleteGame } from "../models/gameModels.js"

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
    }
}

class   TournamentRoom
{
    constructor()
    {
        console.log('created new tournament room')
        this.users = new Map();
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
        try
        {
            updatePlayer(tournamentID, 1);         
        }
        catch (e)
        {
            console.log(e);
        }
    }
    else if (currentUser.tournamentID)
    {
        tournamentRooms.set(currentUser.tournamentID, new TournamentRoom());
        currentTournament = tournamentRooms.get(currentUser.tournamentID);
        currentUser.isOP = true;
        updatePlayer(tournamentID, 0);
        currentTournament.users.set(socket, currentUser);
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
        {
            if (user.isOP === true)
                return socket;
        }
    }
    return null;
}

function sendAll(tournamentID, data)
{
    let     currentTournament = tournamentRooms.get(tournamentID);

    if (currentTournament)
    {
        for (const [socket, value] of currentTournament.users)
        {
            socket.send(JSON.stringify(data));
        }
    }
}

async function updatePlayer(tournamentID, number)
{
    try
    {
        let game = await getGameByGameId(tournamentID);
        if (game)
        {
            await updateGame(game.game_id, game.game_mode, game.players + number);
            const operator = getOperator(tournamentID);
            const canStart = isPowerOfTwo(game.players + number);
            if (operator)
                operator.send(JSON.stringify({canStart : canStart}));
        }
        else
        {
            await createGame(tournamentID, "tournament", 1, 4);
            game = await getGameByGameId(tournamentID);
        }
        sendAll(tournamentID, {
            id: tournamentID,
            mode: "tournament",
            players : game.players + number,
            limit : game.players_limit
        });
    }
    catch (e)
    {
        console.log(e);
    }
}

export function	tournament(connection, req)
{
    const socket = connection;
    const username = req.query?.username;
    const tournamentID = req.query?.tournamentID;
    const typeJoin = req.query?.typeJoin;
    console.log("--------------------------\n" + typeJoin);
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
            console.log(packet);
        }
    })

    socket.on('close', () =>
    {
        let currentUser = userInfos.get(socket);
        let currentTournament = tournamentRooms.get(currentUser.tournamentID);
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
        userInfos.delete(socket);
        console.log('goodbye client');
        console.log("--------------------------");
    })
}
