
import { parseJSON, mssleep, Vector3, addInPlace, length, copyFrom } from "./Utils.js"
import { findUserByUsername, updateUser, updateMultiplayerStats } from "../models/userModel.js";
import { createHistory } from "../models/historyModel.js";

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

async function setWinner(room)
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
	const user_win = await findUserByUsername(currentGame.winner);
	const user_loose = await findUserByUsername(currentGame.looser);
	await updateUser(user_win.user_id, {last_opponent: user_loose.username});
	await updateUser(user_loose.user_id, {last_opponent: user_win.username});
	await createHistory(user_win.username, user_loose.username, winner.score, looser.score, "duo", 0);
	await updateMultiplayerStats(user_win.username);
	await updateMultiplayerStats(user_loose.username);
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

		if (room.player1socket)
			room.player1socket.send(JSON.stringify({
				explosionX: currentGame.ball.position.x,
				explosionY: currentGame.ball.position.y
			}));
		if (room.player2socket)
			room.player2socket.send(JSON.stringify({
				explosionX: currentGame.ball.position.x,
				explosionY: currentGame.ball.position.y
			}));

        currentGame.ball.position = Vector3(0, 0, 0);
        currentGame.ballVelocity = Vector3(INIT_SPEED_BALL_X, INIT_SPEED_BALL_Y, 0);
    }
}

const	userInfos = new Map();
//Stores socket -> PlayerInfo

const	rooms = new Map();

async function startRoom(roomID)
{
	let	room = rooms.get(roomID);
	let currentGame = room.game;

	console.log('Starting duo pong game');
	while (!currentGame.shouldStop)
	{
		updatePaddlePos(currentGame);

		updateBall(currentGame, room);

		if (!currentGame.shouldStop)
		{
			room.player1socket.send(JSON.stringify({
				player1Y: currentGame.player1.y,
				player2Y: currentGame.player2.y,

				player1Score: currentGame.player1.score,
				player2Score: currentGame.player2.score,

				ballX: currentGame.ball.position.x,
				ballY: currentGame.ball.position.y,

				player1Name: userInfos.get(room.player1socket).username,
				player2Name: userInfos.get(room.player2socket).username
			}))
			
			room.player2socket.send(JSON.stringify({
				player1Y: currentGame.player1.y,
				player2Y: currentGame.player2.y,

				player1Score: currentGame.player1.score,
				player2Score: currentGame.player2.score,

				ballX: currentGame.ball.position.x,
				ballY: currentGame.ball.position.y,

				player1Name: userInfos.get(room.player1socket).username,
				player2Name: userInfos.get(room.player2socket).username
			}))
			await mssleep(16);
		}
	}
	setWinner(room);
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
		if (username)
		{
			userInfos.set(socket, new PlayerInfo());
			userInfos.get(socket).username = username;
			console.log(`USER USERNAME: ${userInfos.get(socket).username}`);
		}
	}
	else
		console.log('Old user, doing nothing');	
}

function addUserToRoom(socket, roomID, username)
{
	let	player = userInfos.get(socket);
	let	room = rooms.get(roomID);

	player.roomID = roomID;
	if (room)
	{
		if (room.player1socket == null)
			room.player1socket = socket;
		else if (room.player2socket == null)
		{
			console.log('added user2 in the room');
			room.player2socket = socket;
			room.game.player2.username = username;
			startRoom(roomID);
		}
		else
			console.log('erm, room is full boi');
	}
	else
	{
		rooms.set(roomID, new Room());
		room = rooms.get(roomID);
		console.log('added user1 in the room');
		room.player1socket = socket;
		room.game.player1.username = username;
	}
}

export function	duoPong(connection, req)
{
	const	socket = connection;
	const username = req.query?.username;

	register_user(socket, username);
	
	let	currentRoom = null;
	let	currentPlayerInfo = null;
	const roomID = req.query?.roomID;
	if (roomID != "undefined" && roomID != null)
	{
		console.log(roomID);
		addUserToRoom(socket, roomID, username);
	}
	currentPlayerInfo = userInfos.get(socket);
	currentRoom = rooms.get(currentPlayerInfo.roomID);
	if (!currentRoom)
		console.log('User hasn\'t given a roomID yet');

	socket.on('message', message =>
	{
		let packet = parseJSON(message);
		
		if (packet && currentPlayerInfo.roomID)
		{
			currentRoom = rooms.get(currentPlayerInfo.roomID);
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
		currentRoom = rooms.get(currentPlayerInfo.roomID);
		if (currentRoom)
		{
			if (currentRoom.player1socket == socket)
				currentRoom.player1socket = null;
			if (currentRoom.player2socket == socket)
				currentRoom.player2socket = null;
			currentRoom.game.shouldStop = true;
		}
		userInfos.delete(socket);
		console.log('goodbye client');
	})
}
