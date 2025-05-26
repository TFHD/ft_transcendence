
import { parseJSON, mssleep, Vector3, addInPlace, length, copyFrom } from "./Utils.js"
import { findUserByUsername, updateUser, updateMultiplayerStats, findUserById } from "../models/userModel.js";
import { createHistory } from "../models/historyModel.js";
import { setMatchWinner, getMatchByMatchRound, setScoreByMatchRound } from "../models/tournamentModel.js"
import { authSocketMiddleware } from "../middlewares/wsMiddleware.js";

const SPEED_MULTIPLIER = 1.1;
const MAX_BALL_Y = 10;
const MIN_BALL_Y = -10;
const MAX_BALL_X = 20;
const MIN_BALL_X = -20;
const INIT_SPEED_BALL_X = 0.2;
const INIT_SPEED_BALL_Y = 0;

class	Player
{
	constructor()
	{
		this.UpInput	= false;
		this.DownInput	= false;
		this.y			= 0;
		this.score		= 0;
		this.username	= null;
		this.player_id	= null;
		this.isTerminal = null;
	}
}

class	Game
{
	constructor()
	{
		this.player1				= new Player();
		this.player2				= new Player();
		this.ball 					= { position: Vector3(0, 0, 0) };
		this.ballVelocity			= Vector3(INIT_SPEED_BALL_X, INIT_SPEED_BALL_Y, 0);
		this.previousBallPosition	= { position: Vector3(0, 0, 0) };
		this.shouldStop				= false;
		this.winner					= "";
		this.looser					= "";
	}
}

class	PlayerInfo
{
	constructor()
	{
		this.roomID = null;
	}
}

class	Room
{
	constructor()
	{
		console.log('created a new room');
		this.player1socket = null;
		this.player2socket = null;
		this.game = new Game();
	}
}

const movePaddle = (player, direction) =>
{
    let newTarget = player.y + 0.2 * direction;
    if (newTarget >= -8 && newTarget <= 8)
    	player.y = newTarget;
};

const	updatePaddlePos = (currentGame) =>
{
	const	player1 = currentGame.player1;
	const	player2 = currentGame.player2;

	if (player1.UpInput)
		movePaddle(player1, 1);
	if (player1.DownInput)
		movePaddle(player1, -1);
	if (player2.UpInput)
		movePaddle(player2, 1);
	if (player2.DownInput)
		movePaddle(player2, -1);
}

let leftPaddle = { position: Vector3(-20, 0, 0) };
let rightPaddle = { position: Vector3(20, 0, 0) };

async function setWinner(room, dataTournament)
{
	let equality = 0;
	let user_win = null;
	let user_loose = null;
	try
	{
		let currentGame = room.game;
		let winner = null;
		let looser = null;

		if (currentGame.player1.score > currentGame.player2.score)
		{
			currentGame.winner = currentGame.player1.username;
			currentGame.looser = currentGame.player2.username;
			winner = currentGame.player1;
			looser = currentGame.player2;
		}
		else
		{
			currentGame.winner = currentGame.player2.username;
			currentGame.looser = currentGame.player1.username;
			winner = currentGame.player2;
			looser = currentGame.player1;
		}
		if (currentGame.player1.score === currentGame.player2.score)
			equality = 1;
		console.log("tournament : " + dataTournament.isTournament);
		if (dataTournament.isTournament != undefined && dataTournament.isTournament != "undefined")
		{
			const match = await getMatchByMatchRound(dataTournament.game_id, dataTournament.match, dataTournament.round);
			if (match)
			{
				await setMatchWinner(match.game_id, match.match, match.round, currentGame.winner);
				if (match.p1_displayname == currentGame.player1.username)
					await setScoreByMatchRound(match.game_id, match.match, match.round, currentGame.player1.score, currentGame.player2.score);
				else
					await setScoreByMatchRound(match.game_id, match.match, match.round, currentGame.player2.score, currentGame.player1.score);
			}
				user_win = await findUserById(winner.player_id);
				user_loose = await findUserById(looser.player_id);
				await updateUser(user_win.user_id, {last_opponent: looser.username});
				await updateUser(user_loose.user_id, {last_opponent: winner.username});
				await createHistory(user_win.user_id, user_loose.user_id, user_win.username, user_loose.username, winner.score, looser.score, equality, "tournament", 0);
		}
		else
		{
			user_win = await findUserByUsername(currentGame.winner);
			user_loose = await findUserByUsername(currentGame.looser);
			await updateUser(user_win.user_id, {last_opponent: user_loose.username});
			await updateUser(user_loose.user_id, {last_opponent: user_win.username});
			await createHistory(user_win.user_id, user_loose.user_id, user_win.username, user_loose.username, winner.score, looser.score, equality, "duo", 0);
		}
		await updateMultiplayerStats(user_win.username);
		await updateMultiplayerStats(user_loose.username);
	}
	catch (e)
	{
		console.log(e);
	}
};

function updateAnglePosBall(ball, paddle, player, ballVelocity)
{
    const paddleHalfHeight = 2.5;
    const withinXRange = Math.abs(ball.position.x - paddle.position.x) <= 0.5;
    const withinYRange = Math.abs(ball.position.y - player.y) <= paddleHalfHeight;
    if (withinXRange && withinYRange)
	{
        const relativeIntersectY = ball.position.y - player.y;
        const normalizedRelativeY = relativeIntersectY / paddleHalfHeight;
        const bounceAngle = normalizedRelativeY * Math.PI / 4;
        const direction = ballVelocity.x > 0 ? -1 : 1;
        let speed = length(ballVelocity) * SPEED_MULTIPLIER;
        if (speed > 1.5)
			speed = 1.5;
        ballVelocity.x = direction * speed * Math.cos(bounceAngle);
        ballVelocity.y = speed * Math.sin(bounceAngle);
    }
}

function updateBall(currentGame, room)
{
	let previousBallPosition = currentGame.previousBallPosition;
	let ballVelocity = currentGame.ballVelocity;
	let ball = currentGame.ball;

    copyFrom(previousBallPosition, ball.position);
    addInPlace(ball.position, ballVelocity);
    const coef = (ball.position.y - previousBallPosition.position.y) / (ball.position.x - previousBallPosition.position.x)
    const p = previousBallPosition.position.y - coef * previousBallPosition.position.x
    let hitLeft = 0;
    let hitRight = 0;
    if (ball.position.x < MIN_BALL_X + 0.5 || ball.position.x > MAX_BALL_X - 0.5)
	{
    	if (ball.position.x < MIN_BALL_X + 0.5)
		{
        	if (currentGame.player1.y - 2.5 < (coef * MIN_BALL_X + p) && (coef * MIN_BALL_X + p) < currentGame.player1.y + 2.5)
            	hitLeft = 1;
		}
    	else
		{
        	if (currentGame.player2.y - 2.5 < (coef * MAX_BALL_X + p) && (coef * MAX_BALL_X + p) < currentGame.player2.y + 2.5)
        		hitRight = 1;
    	}
    }

    if (hitLeft)
	{
        updateAnglePosBall(ball, leftPaddle, currentGame.player1, ballVelocity);
        ball.position.x = MIN_BALL_X + 1;
    }

    if (hitRight)
	{
        updateAnglePosBall(ball, rightPaddle, currentGame.player2, ballVelocity);
        ball.position.x = MAX_BALL_X - 1;
    }
	updateAnglePosBall(ball, leftPaddle, currentGame.player1, ballVelocity);
	updateAnglePosBall(ball, rightPaddle, currentGame.player2, ballVelocity);

    if (ball.position.y > MAX_BALL_Y || ball.position.y < MIN_BALL_Y)
	{
        ballVelocity.y = -ballVelocity.y;
    }
    if (ball.position.x > MAX_BALL_X || ball.position.x < MIN_BALL_X)
	{
        if (ball.position.x > MAX_BALL_X)
            currentGame.player1.score++;
		else if (ball.position.x < MIN_BALL_X)
            currentGame.player2.score++;

		if (room.player1socket && room.game.player1.isTerminal == "false")
			room.player1socket.send(JSON.stringify({
				explosionX: currentGame.ball.position.x,
				explosionY: currentGame.ball.position.y
			}));
		if (room.player2socket && room.game.player2.isTerminal == "false")
			room.player2socket.send(JSON.stringify({
				explosionX: currentGame.ball.position.x,
				explosionY: currentGame.ball.position.y
			}));

		currentGame.ball.position = Vector3(0, 0, 0);
		
		if (Math.floor(Math.random() * 2) === 1)
			currentGame.ballVelocity = Vector3(INIT_SPEED_BALL_X, INIT_SPEED_BALL_Y, 0);
		else
			currentGame.ballVelocity = Vector3(-INIT_SPEED_BALL_X, INIT_SPEED_BALL_Y, 0);

    }
}

const	userInfos = new Map();
//Stores socket -> PlayerInfo

const	rooms = new Map();

const MAXX = 20;
const MINX = -20;

const MAXY = 10;
const MINY = -10;

function normalize(value, min, max) {
	return (value - min) / (max - min);
}

function sendDatas(socket, player, room) {

	let currentGame = room.game;

	let sentBallX = currentGame.ball.position.x;
	let sentBallY = currentGame.ball.position.y;
	let sentPlayer1Y = currentGame.player1.y;
	let sentPlayer2Y = currentGame.player2.y;
	if (player.isTerminal === "true")
	{
		sentBallX = normalize(currentGame.ball.position.x, MINX, MAXX);
		sentBallY = normalize(currentGame.ball.position.y, MINY, MAXY);
		sentPlayer1Y = normalize(currentGame.player1.y, MINY, MAXY);
		sentPlayer2Y = normalize(currentGame.player2.y, MINY, MAXY);
	}
	socket.send(JSON.stringify({
		ballX: sentBallX,
		ballY: sentBallY,
		player1Y: sentPlayer1Y,
		player2Y: sentPlayer2Y,
		player1Score: currentGame.player1.score,
		player2Score: currentGame.player2.score,
		player1Name: userInfos.get(room.player1socket).username,
		player2Name: userInfos.get(room.player2socket).username
	}));
}

async function startRoom(roomID, dataTournament)
{
	let	room = rooms.get(roomID);
	let currentGame = room.game;

	console.log('Starting duo pong game');
	while (!currentGame.shouldStop)
	{
		updatePaddlePos(currentGame);

		updateBall(currentGame, room);
		if (currentGame.player1.score >= 5 || currentGame.player2.score >= 5)
			currentGame.shouldStop = true;
		if (!currentGame.shouldStop)
		{
			sendDatas(room.player1socket, currentGame.player1, room);
			sendDatas(room.player2socket, currentGame.player2, room);
			await mssleep(16);
		}
	}
	setWinner(room, dataTournament);
	if (room.player1socket)
		room.player1socket.send(JSON.stringify({ shouldStop: true}));
	if (room.player2socket)
		room.player2socket.send(JSON.stringify({ shouldStop: true}));
	console.log('Stopped game');
	rooms.delete(roomID);
}

function	register_user(socket, username)
{
	if (!userInfos.has(socket))
	{
		console.log('New user, saving socket info');
		if (username != undefined)
		{
			userInfos.set(socket, new PlayerInfo());
			userInfos.get(socket).username = username;
			console.log(`USER USERNAME: ${userInfos.get(socket).username}`);
		}
	}
	else
		console.log('Old user, doing nothing');	
}

function addUserToRoom(socket, roomID, username, dataTournament, terminal)
{
	let	player = userInfos.get(socket);
	let	room = rooms.get(roomID);

	player.roomID = roomID;
	if (room)
	{
		if (room.player1socket == null)
			room.player1socket = socket;
		else if (room.player2socket == null && userInfos.get(room.player1socket).username != username)
		{
			console.log('added user2 in the room');
			room.player2socket = socket;
			room.game.player2.username = username;
			room.game.player2.isTerminal = terminal;
			if (dataTournament.isTournament != 'undefined')
				room.game.player2.player_id = dataTournament.user_id;
			startRoom(roomID, dataTournament);
		}
		else
			socket?.send(JSON.stringify({ shouldStop: true}));
	}
	else
	{
		rooms.set(roomID, new Room());
		room = rooms.get(roomID);
		console.log('added user1 in the room');
		room.player1socket = socket;
		room.game.player1.username = username;
		room.game.player1.isTerminal = terminal;
		if (dataTournament.isTournament != 'undefined')
			room.game.player1.player_id = dataTournament.user_id;
	}
}

export async function duoPong(connection, req)
{
	const sessionData = await authSocketMiddleware(req);
	if (!sessionData) {
		socket.close(1008, "Unauthorized");
		return ;
	}
	const	socket = connection;
	const username = req.query?.username;
	const dataTournament = {
		match : req.query?.match,
		round : req.query?.round,
		game_id : req.query?.game_id,
		isTournament : req.query?.isTournament,
		user_id : req.query?.user_id
	}

	socket.isAlive = true;
	socket.on('pong', () => {
		socket.isAlive = true;
	});
	
	const interval = setInterval(() => {
		if (socket.isAlive === false) {
			clearInterval(interval);
			socket.terminate();
			userSockets.delete(socket);
			console.log('Disconnected due to inactivity');
			return;
		}
		socket.isAlive = false;
		socket.ping();
	}, 10 * 1000);

	console.log(username);
	register_user(socket, username);
	
	let	currentRoom = null;
	let	currentPlayerInfo = null;
	const roomID = req.query?.roomID;
	if (roomID != "undefined" && roomID != null)
	{
		console.log(roomID);
		addUserToRoom(socket, roomID, username, dataTournament, req.query?.terminal);
	}
	currentPlayerInfo = userInfos.get(socket);
	currentRoom = rooms.get(currentPlayerInfo.roomID);
	if (!currentRoom)
		console.log('User hasn\'t given a roomID yet');

	socket.on('message', message =>
	{
		let packet = parseJSON(message);
		
		console.log(packet);
		console.log(message.toString());
		currentRoom = rooms.get(currentPlayerInfo.roomID);
		if (packet && currentPlayerInfo.roomID)
		{
			if (currentRoom && currentRoom.player2socket)
			{
				let player = null;
				if (socket == currentRoom.player1socket)
					player = currentRoom.game.player1;
				else
					player = currentRoom.game.player2;
				
				if (packet.key == 'w')
					player.UpInput = packet.state;
				if (packet.key == 's')
					player.DownInput = packet.state;
			}
			else if (currentRoom && !currentRoom.player2socket)
				console.log('You are alone in this room');
			else
				console.log('erm... You are not in a room lil bro');
		}
		else
			console.log('erm... You are not in a room lil bro');
	})

	socket.on('close', () =>
	{
		clearInterval(interval);	
		currentRoom = rooms.get(currentPlayerInfo.roomID);
		if (currentRoom)
		{
			if (currentRoom.player1socket == socket)
			{
				currentRoom.player1socket = null;
				currentRoom.player1 = null;
				if (currentRoom.player2socket == null)
				{
					rooms.delete(currentPlayerInfo.roomID);
					console.log('empty room, deleted');
				}
			}
			else if (currentRoom.player2socket == socket)
			{
				currentRoom.player2socket = null;
				currentRoom.player2 = null;
				if (currentRoom.player1socket == null)
				{
					rooms.delete(currentPlayerInfo.roomID);
					console.log('empty room, deleted');
				}
			}
			currentRoom.game.shouldStop = true;
		}
		userInfos.delete(socket);
		console.log('goodbye client');
	})
}
