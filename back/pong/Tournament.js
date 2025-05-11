import { parseJSON, mssleep, Vector3, addInPlace, length, copyFrom } from "./Utils.js"

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

function joinTournament(socket)
{
    const   currentUser = userInfos.get(socket);
    let     currentTournament = tournamentRooms.get(currentUser.tournamentID);

    if (currentTournament)
    {
        currentTournament.users.set(socket, currentUser);
    }
    else if (currentUser.tournamentID) //Create tournament room
    {
        tournamentRooms.set(currentUser.tournamentID, new TournamentRoom());

        currentTournament = tournamentRooms.get(currentUser.tournamentID);
        currentUser.isOP = true;
        currentTournament.users.set(socket, currentUser);
    }
    else
        console.log('What happened there bro');
}

export function	tournament(connection, req)
{
    const socket = connection;
    const username = req.query?.username;
    const tournamentID = req.query?.tournamentID;

    if (!userInfos.has(socket))
    {
        console.log('Adding new user to set');
        userInfos.set(socket, new PlayerInfo(username, tournamentID));
        joinTournament(socket);
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
        userInfos.delete(socket);
        console.log('goodbye client');
    })
}
