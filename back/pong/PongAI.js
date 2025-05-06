
import { Player, Game } from "./PracticePong.js"

const mssleep = ms => new Promise(r => setTimeout(r, ms));

//Updates aiBallY every second so the AI has access to it, pretty much its the AI's view of the game
//Ai also has access to the enemy player's position so it can do things with it later on fr fr

// this.aiBallY				= 0;
// this.aiBallX				= 0;

// this.aiPrevBallY			= 0;
// this.aiPrevBallX			= 0;

// this.aiPlayerY				= 0;

function Vector3(x = 0, y = 0, z = 0) {
    return { x, y, z };
}

function addInPlace(v1, v2) {
    v1.x += v2.x;
    v1.y += v2.y;
    v1.z += v2.z;
}

function length(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function copyFrom(target, source) {
    target.x = source.x;
    target.y = source.y;
    target.z = source.z;
}

const SPEED_MULTIPLIER = 1.1;
const MAX_BALL_Y = 10;
const MIN_BALL_Y = -10;
const MAX_BALL_X = 20;
const MIN_BALL_X = -20;
const INIT_SPEED_BALL_X = 0.2;
const INIT_SPEED_BALL_Y = 0;

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

let hitpos = 0;

//Trying to predict collisions to find where its gonna hit on the right side but the maths aint mathing
function updateBall(currentGame)
{
	let previousBallPosition = currentGame.previousBallPosition;
	let ballVelocity = currentGame.ballVelocity;
	let ball = currentGame.ball;
	currentGame.previousBallPosition.position.x = ball.position.x;
	currentGame.previousBallPosition.position.y = ball.position.y;

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
		currentGame.previousBallPosition = previousBallPosition;
		currentGame.ballVelocity = ballVelocity;
		currentGame.ball = ball;
		hitpos = ball.position.y;
		return (true);
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
		{
			currentGame.previousBallPosition = previousBallPosition;
			currentGame.ballVelocity = ballVelocity;
			currentGame.ball = ball;
			hitpos = ball.position.y;
            return (true);
		}
		else if (ball.position.x < MIN_BALL_X)
            currentGame.player2.score++;
    }
	currentGame.previousBallPosition = previousBallPosition;
	currentGame.ballVelocity = ballVelocity;
	currentGame.ball = ball;
	return (false);
}

function	calcBallHit(currentGame)
{
	let	tempGame = new Game();

	tempGame.ball.position.x = currentGame.aiBallX;
	tempGame.ball.position.y = currentGame.aiBallY;
	tempGame.previousBallPosition.position.x = currentGame.aiPrevBallX;
	tempGame.previousBallPosition.position.y = currentGame.aiPrevBallY;
	tempGame.player1.y = currentGame.aiPlayerY;

	hitpos = 0;

	while (updateBall(tempGame) === false)
		;
	return (tempGame.ball.position.y);
}

async function UpdateAI(currentGame)
{
	while (!currentGame.shouldStop)
	{

		currentGame.aiBallX = currentGame.ball.position.x;
		currentGame.aiBallY = currentGame.ball.position.y;

		currentGame.aiPrevBallX = currentGame.previousBallPosition.position.x;
		currentGame.aiPrevBallY = currentGame.previousBallPosition.position.y;

		currentGame.aiPlayerY = currentGame.player1.y;

		currentGame.AITargetY = hitpos;
		calcBallHit(currentGame);
		console.log(currentGame.AITargetY);

		await mssleep(10);
	}

	console.log('Stopped AI ballpos checker');
}

//Function to calculate the ball's direction and where it is gonna hit so the AI's paddle can adjust
// function	calcBallDir()
// {

// }

/**
 * The AI should be able to guess the direction the ball is going to take in the next 1 second before it gets
 * its positions updated. This way it adapts every second to the current scene.
 * 
 * For example if it sees the ball is going to bounce on the player it is gonna go in front of where it should go
 * even if the player mooves because it might be during its blindness of 1 second
 * 
 * Basically the AI blinks for 1 second every second with a tick of being able to see
 * So it has to guess everything
 * 
 * To make it difficult to fight against the AI we could make it so if the player is above the AI the AI
 * tries to bounce the ball towards the bottom of the thingy I dont have the word.
 */

export async function AILogic(currentGame)
{
	UpdateAI(currentGame); //Updates AI's infos on the game every second (async)

	while (!currentGame.shouldStop)
	{
		//Handle movement
		//Should calculate ball's theorical position
		if (currentGame.player2.y < currentGame.AITargetY)
		{
			currentGame.player2.DownInput = false;
			currentGame.player2.UpInput = true;
		}

		if (currentGame.player2.y >= currentGame.AITargetY)
		{
			currentGame.player2.UpInput = false;
			currentGame.player2.DownInput = true;
		}

		//Small sleep cuz why not IG
		await mssleep(16);
	}

	console.log('Stopped ai');
}
