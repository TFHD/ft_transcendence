import { parseJSON, mssleep, Vector3, addInPlace, length, copyFrom } from "./Utils.js"
import { findUserByUsername, updateUser } from "../models/userModel.js";
import { authSocketMiddleware } from "../middlewares/wsMiddleware.js";

const	userSockets = new Set();
//Saves all sockets to check if they already have their websocket setup

const	userGames = new Map();
//Stores games based on sockets

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

function updateBall(currentGame, socket)
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

		socket.send(JSON.stringify({
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

async function setWinner(currentGame, username)
{
	if (currentGame.player1.score > currentGame.player2.score)
	{
		currentGame.winner = username;
		currentGame.looser = username + "1";
	}
	else
	{
		currentGame.winner = username + "1";
		currentGame.looser = username;
	}
	const user = await findUserByUsername(username);
	
	if (currentGame.winner === username)
		await updateUser(user.user_id, {singleplayer_win : user.singleplayer_win + 1, last_opponent: username + "1"});
	else
		await updateUser(user.user_id, {singleplayer_loose : user.singleplayer_loose + 1, last_opponent: username + "1"});
};

const MAXX = 20;
const MINX = -20;

const MAXY = 10;
const MINY = -10;

function normalize(value, min, max) {
	return 2 * (value - min) / (max - min) - 1;
}

function sendNormalized(socket, currentGame) {
	const normalizedBallX = normalize(currentGame.ball.position.x, MINX, MAXX);
	const normalizedBallY = normalize(currentGame.ball.position.y, MINY, MAXY);
	const normalizedPlayer1Y = normalize(currentGame.player1.y, MINY, MAXY);
	const normalizedPlayer2Y = normalize(currentGame.player2.y, MINY, MAXY);

	if (currentGame.player1.isTerminal === "true")
	{
		socket.send(JSON.stringify({
			ballX: normalizedBallX,
			ballY: normalizedBallY,
			player1Y: normalizedPlayer1Y,
			player2Y: normalizedPlayer2Y,
		}));
	}
}

const	SoloPongGame = async (socket, username) =>
{
	let currentGame = userGames.get(socket);

	console.log('Starting solo pong game');
	while (!currentGame.shouldStop)
	{
		updatePaddlePos(currentGame);

		updateBall(currentGame, socket);

		if (!currentGame.shouldStop)
		{
			socket.send(JSON.stringify({
				player1Y: currentGame.player1.y,
				player2Y: currentGame.player2.y,

				player1Score: currentGame.player1.score,
				player2Score: currentGame.player2.score,

				ballX: currentGame.ball.position.x,
				ballY: currentGame.ball.position.y,

				player1Name: username,
				player2Name: username + "1"
			}))
			sendNormalized(socket, currentGame)
			await mssleep(16);
		}
	}
	setWinner(currentGame, username);
	console.log('Stopped game');
}

export async function	soloPong(connection, req)
{
	const sessionData = await authSocketMiddleware(req);
	if (!sessionData) {
		socket.close(1008, "Unauthorized");
		return ;
	}
	const socket = connection;
	const username = req.query?.username;

	if (!userSockets.has(socket))
	{
		console.log('Adding new user to set');
		userSockets.add(socket);
		userGames.set(socket, new Game());
		userGames.get(socket).player1.isTerminal = req.query?.terminal;
		if (username)
			SoloPongGame(socket, username);
		else
			console.log('No username given');
	}

	const currentGame = userGames.get(socket);

	socket.on('message', message =>
	{
		let packet = parseJSON(message);

		if (packet)
		{
			if (packet.key == 'w')
				currentGame.player1.UpInput = packet.state;
			if (packet.key == 's')
				currentGame.player1.DownInput = packet.state;
			if (packet.key == 'ArrowUp')
				currentGame.player2.UpInput = packet.state;
			if (packet.key == 'ArrowDown')
				currentGame.player2.DownInput = packet.state;
		}
	})

	socket.on('close', () =>
	{
		currentGame.shouldStop = true;
		userSockets.delete(socket);
		userGames.delete(socket);
		console.log('goodbye client');
	})
}
