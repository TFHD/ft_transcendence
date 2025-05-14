import { parseJSON, mssleep, Vector3, addInPlace, length, copyFrom, isPowerOfTwo } from "./Utils.js"
import { createGame, getGameByGameId, updateGame, deleteGame } from "../models/gameModels.js"
import { createMatch, setMatchWinner, getMatchByMatchRound, changeNextvalue } from "../models/tournamentModel.js"

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

function IsPowerOfTwo(x)
{
    return (x != 0) && ((x & (x - 1)) == 0);
}

function calcTournamentRounds(currentTournament)
{
	currentTournament.playerCount = currentTournament.users.size;
	currentTournament.roomCount = currentTournament.playerCount / 2;

	if (!IsPowerOfTwo(currentTournament.roomCount))
	{
		console.log('Invalid amount of player, needs to be a power of 2');
		return (0);
	}

	let tempRoomCount = currentTournament.roomCount;
	while (Math.floor(tempRoomCount) > 0)
	{
		tempRoomCount /= 2;
		if (Math.floor(tempRoomCount) > 0)
			currentTournament.rounds++;
	}
	console.log(currentTournament.rounds);
	
	return (1);
}

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
            const nextMatch = Math.ciel(match_search.match / 2);
            const nextRound = match_search.round + 1;
            await setNextInfosIntoDB(tournamentID, match, round, nextMatch, nextRound)
        }
    }
    catch (e) 
    {
        console.log(e);
    }
}


function generateMatches(currentTournament)
{
    /*

    Dans l'idee il faut generer tous les matchs, les premiers sont generes avec les joueurs repartis au hasard
    et les matchs d'apres ont leur joueurs set a null.
    Comme ca, le front peut tout recuperer et afficher l'arbre en entier pour pouvoir afficher les fights a venir (le sujet qui demande)
    Seul truc c'est que jsp comment m'y prendre pour generer tt les matchs.

    D'abord il faut generer la premier ligne et diviser par 2 a chaque fois

    -------------------
    Reponse :
    dans ton code tu dois avoir une variable "round" (genre t'as 4 joueurs et bah les 2 premieres rencontre c'est le 1er round et la finale le 2eme round)
    grace a ces rounds tu va pouvoir générer tes matchs. Ta variable round va s'incrementer une fois un round fini.

    Si t'as 16 joueurs, le 1er round tu auras 8 matchs, le 2eme round tu auras tu as 4 matchs, le 3eme round tu as 2 match et 4eme round 1 match (la finale)
    donc t'as un truc du style nombre_matchs = nombres_joueurs / (round * 2)
    aussi le nombre de match max dans une partie = nombre_joueurs - 1 ; 16 joueurs = 15 match ; 2 joueurs = 1 match ; 4 joueurs = 3 matchs....
    
    Donc, a chaque round tu vas generer nombre_match, mais comment ? :

    Dans la db tu as des infos : { id_game | p1_displayname | p2_displayname | id_match | id_round | id_winner | id_next_match | id_next_round }
    Lors du premier round bah t'as pas de vainqueur donc tu vas générer aleatoirement les premiers nombre_matchs.

    Lors des tours suivants dans la db il y aura un truc du style :

    { id_game | p1_displayname | p2_displayname | id_match | id_round | id_winner | id_next_match | id_next_round }
    {-------------------------------------------------------------------------------------------------------------}
    { caca    |     joueur1    |     joueur2    |     1    |     1    |  joueur1  |       1       |        2      }
    { caca    |     joueur3    |     joueur4    |     2    |     1    |  joueur4  |       1       |        2      }

    bon en gros ce qui est interéssant ce sont : id_match , id_round, id_winner, id_next_match, id_next_round

    (id_match et id_round) c'est le match que p1 et p2 ont joué, et (id_next_match et id_next_round) c'est où va le prochain joueur.
    donc admettons tu pars sur un tounois a 4 joueurs tu veux générer le ou les plusieurs match apres.
    Dans ce cas ici il y aura un nombre_matchs (nombre_matchs = 4 / 2 * 2 = 1)
    Donc on genere le match 1 du round 2, tu regardes qui a id_next_round = 1 et id_next_round = 2 et tu les fout dans le meme match.
    (boucle for qui va jusqu'a nombre_matchs, donc tu génère match 1, match 2, match 3 ..... du round X)

    { id_game | p1_displayname | p2_displayname | id_match | id_round | id_winner | id_next_match | id_next_round }
    {-------------------------------------------------------------------------------------------------------------}
    { caca    |     joueur1    |     joueur2    |     1    |     1    |  joueur1  |       1       |        2      }
    { caca    |     joueur3    |     joueur4    |     2    |     1    |  joueur4  |       1       |        2      }
    { caca    |     joueur1    |     joueur4    |     1    |     2    |  .......  |       .       |        .      } <-- match généré

    alors petit truc en plus sur comment tu sais que le joueur 1 va dans le id_next_match 1 et le joueurs 4 aussi

    id_next_match est calculé en fonction de l'id de ton match, genre la formule c'est id_next_match = Math.ciel(id_match / 2);

    Round 1
    id_match 1 -> id_next_match = math.ciel(1 / 2) = 1
    id_match 2 -> id_next_match = math.ciel(2 / 2) = 1
    id_match 3 -> id_next_match = math.ciel(3 / 2) = 2
    id_match 4 -> id_next_match = math.ciel(4 / 2) = 2

    Round2
    id_match 1 -> id_next_match = math.ciel(1 / 2) = 1
    id_match 2 -> id_next_match = math.ciel(2 / 2) = 1

    Round3 (finale)
    id_match 1 -> id_next_match = math.ciel(1 / 2) = 1 (VICTOIRE)
    */
}

function finishMatch(game)
{
    /*
    
    Ici il faut update la db pour dire que le match est fini et mettre le joueur gagnant dans son prochain match.
    
    Le perdant doit recevoir un packet pour lui dire qu'il a perd et donc il peut seulement voir l'arbre des matchs
    dans l'idee il peut meme se faire free du tournoi. il faut juste garder le socket ouvert pour qu'il recoive + d'info sauf si
    on le fait juste regarder la DB en boucle?
    
    Aussi supprimer le match du tournoi car inutile meme si en sois osef.

    */
}

/* CHECKS A FAIRE QUAND UN JOUEUR PARS

    Ici une liste de checks a faire quand un joueur pars comme ca on a pas de problemes

    - Si il est dans un tournoi pas lance juste le sortir du tournoi.

    - Si le tournoi est lance, check si

       Il est dans une game -> sortir de la game -> sortir du tournoi

       Il est en attente d'un autre game -> mettre en avance qu'il a perdu la game pour laquelle il attendait -> sortir du tournoi

    - Si il est a l'ecran de fin (winner affiche) juste le degager car logiquement tournoi fini.

*/

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
            if (packet.start && getOperator(tournamentID) == socket)
                console.log('Start game');
            else
                console.log('User is not operator');

            if (packet.key)
                handleKeyInput(packet, currentUser, currentTournament);

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
