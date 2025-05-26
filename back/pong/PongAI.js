
import { Player, Game } from "./PracticePong.js"

const mssleep = ms => new Promise(r => setTimeout(r, ms));

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

function updateBall(currentGame, hit)
{
    copyFrom(currentGame.previousBallPosition, currentGame.ball.position);
    addInPlace(currentGame.ball.position, currentGame.ballVelocity);
    const coef = (currentGame.ball.position.y - currentGame.previousBallPosition.position.y) / (currentGame.ball.position.x - currentGame.previousBallPosition.position.x)
    const p = currentGame.previousBallPosition.position.y - coef * currentGame.previousBallPosition.position.x
    let hitLeft = 0;
    let hitRight = 0;
    if (currentGame.ball.position.x < MIN_BALL_X + 0.5 || currentGame.ball.position.x > MAX_BALL_X - 0.5)
    {
        if (currentGame.ball.position.x < MIN_BALL_X + 0.5)
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
        updateAnglePosBall(currentGame.ball, leftPaddle, currentGame.player1, currentGame.ballVelocity);
        currentGame.ball.position.x = MIN_BALL_X + 1;
    }

    if (hitRight)
    {
        hit.state = true;
        return ;
    }
    updateAnglePosBall(currentGame.ball, leftPaddle, currentGame.player1, currentGame.ballVelocity);
    updateAnglePosBall(currentGame.ball, rightPaddle, currentGame.player2, currentGame.ballVelocity);

    if (currentGame.ball.position.y > MAX_BALL_Y || currentGame.ball.position.y < MIN_BALL_Y)
    {
        currentGame.ballVelocity.y = -currentGame.ballVelocity.y;
    }
    if (currentGame.ball.position.x > MAX_BALL_X || currentGame.ball.position.x < MIN_BALL_X)
    {
        if (currentGame.ball.position.x > MAX_BALL_X)
        {
            hit.state = true;
            return ;
        }
        else if (currentGame.ball.position.x < MIN_BALL_X)
        {
            hit.state = true;
            return ;
        }
    }
}

class   Hit
{
    state = false;
}

const   MAX_ITER = 100000;

function	calcBallHit(currentGame)
{
	let	tempGame = new Game();
    let hit = new Hit;
    let iter = 0;

    tempGame.ball.position.x = currentGame.ball.position.x;
    tempGame.ball.position.y = currentGame.ball.position.y;
    tempGame.ball.position.z = currentGame.ball.position.z;

    tempGame.previousBallPosition.position.x = currentGame.previousBallPosition.position.x;
    tempGame.previousBallPosition.position.y = currentGame.previousBallPosition.position.y;
    tempGame.previousBallPosition.position.z = currentGame.previousBallPosition.position.z;
    
    tempGame.ballVelocity.x = currentGame.ballVelocity.x;
    tempGame.ballVelocity.y = currentGame.ballVelocity.y;
    tempGame.ballVelocity.z = currentGame.ballVelocity.z;

    tempGame.player1.y = currentGame.player1.y;
    tempGame.player2.y = currentGame.player2.y;

	while (hit.state === false)
    {
        updateBall(tempGame, hit);
        if (iter++ > MAX_ITER)
            break ;
    }
	return (tempGame.ball.position.y);
}

async function UpdateAI(currentGame, mode)
{
	while (!currentGame.shouldStop)
	{
		currentGame.AITargetY = calcBallHit(currentGame);

        if (currentGame.player1.y < 0)
            currentGame.AITargetY -= 1;
        else
            currentGame.AITargetY += 1;

        if (mode === "false")
		    await mssleep(1000);
        else
		    await mssleep(16);
	}
}

export async function AILogic(currentGame)
{
	UpdateAI(currentGame, currentGame.AIMode);
	while (!currentGame.shouldStop)
	{
        currentGame.player2.UpInput = false;
        currentGame.player2.DownInput = false;
        if (Math.abs(currentGame.player2.y - currentGame.AITargetY) > .1)
        {
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
        }
		await mssleep(16);
	}
}
