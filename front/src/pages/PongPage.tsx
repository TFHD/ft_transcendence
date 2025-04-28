import React, { useRef, useEffect, useState } from 'react';

const PongPage: React.FC = () => {
	
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const player1Y = useRef(150);
	const player2Y = useRef(150);

	const player2Score = useRef(0);
	const player1Score = useRef(0);

	const keysPressed = useRef<{[key: string]: boolean}>({});

	const ballSpeed = useRef(3);
	const ballRef = useRef({ x: 300, y: 200, vx: ballSpeed.current, vy: ballSpeed.current });

	const paddleHeight = 100;
	const paddleWidth = 10;
	const canvasWidth = 600;
	const canvasHeight = 400;

	const moveSpeed = 10;

  	useEffect(() =>
	{
		const canvas = canvasRef.current;
		const context = canvas?.getContext('2d');

    	const handleKeyDown = (e: KeyboardEvent) =>
		{
			keysPressed.current[e.key] = true;
		};

		const handleKeyUp = (e: KeyboardEvent) =>
		{
			keysPressed.current[e.key] = false;
		};

	//Equivalent a mlx_key_hook
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animationFrameId: number;

	const draw_elements = () =>
	{
		context.clearRect(0, 0, canvasWidth, canvasHeight);

		context.fillStyle = 'black';
		context.fillRect(10, player1Y.current, paddleWidth, paddleHeight); // Player 1
		context.fillRect(canvasWidth - 20, player2Y.current, paddleWidth, paddleHeight); // Player 2

		context.beginPath();
		context.arc(ballRef.current.x, ballRef.current.y, 8, 0, Math.PI * 2);
		context.fill();
	}

	const check_keys = () =>
	{
		if (keysPressed.current['w'])
			player1Y.current = Math.max(0, player1Y.current - moveSpeed);
		if (keysPressed.current['s'])
			player1Y.current = Math.min(canvasHeight - paddleHeight, player1Y.current + moveSpeed);
		if (keysPressed.current['ArrowUp'])
			player2Y.current = Math.max(0, player2Y.current - moveSpeed);
		if (keysPressed.current['ArrowDown'])
			player2Y.current = Math.min(canvasHeight - paddleHeight, player2Y.current + moveSpeed);
	}

	const check_ball_collisions = () =>
	{
		// Bounce on top/bottom walls
		if (ballRef.current.y <= 0 || ballRef.current.y >= canvasHeight)
		{
			ballRef.current.vy *= -1;
		}

		// Bounce on paddles
		if ((ballRef.current.x <= 20 && ballRef.current.y > player1Y.current && ballRef.current.y < player1Y.current + paddleHeight))
		{
			ballRef.current.x = 20;
			ballRef.current.vx *= -1;
		}
		if ((ballRef.current.x >= canvasWidth - 20 && ballRef.current.y > player2Y.current && ballRef.current.y < player2Y.current + paddleHeight))
		{
			ballRef.current.x = canvasWidth - 20;
			ballRef.current.vx *= -1;
		}
	}

	const reset_ball = () =>
	{
		ballRef.current.x = canvasWidth / 2;
		ballRef.current.y = canvasHeight / 2;
		ballSpeed.current = 3;
		ballRef.current.vx = ballSpeed.current * (Math.random() > 0.5 ? 1 : -1);
		ballRef.current.vy = ballSpeed.current * (Math.random() > 0.5 ? 1 : -1);
	}

    const loop_hook = () =>
	{
    	if (!context)
			return ;

		check_keys();

		draw_elements();

		// Update la position de la balle
		ballRef.current.x += ballRef.current.vx;
		ballRef.current.y += ballRef.current.vy;

		check_ball_collisions();
		
		//check si la balle sort sur les cotes
		if (ballRef.current.x < 0)
		{
			console.log('Hit left player');
			player2Score.current++;
			reset_ball();
		}
		if (ballRef.current.x > canvasWidth)
		{
			console.log('Hit rights player');
			player1Score.current++;
			reset_ball();
		}

		context.fillText(`Player 1 Score: ${player1Score.current}`, 40, player1Y.current + 50);
		context.fillText(`Player 2 Score: ${player2Score.current}`, canvasWidth - 120, player2Y.current + 50);

		//Rappelle la fonction loop_hook a la frame d'apres
		animationFrameId = requestAnimationFrame(loop_hook);
	};

    loop_hook();

    return () =>
	{
    	window.removeEventListener('keydown', handleKeyDown);
    	window.removeEventListener('keyup', handleKeyUp);
    	cancelAnimationFrame(animationFrameId);
    };
	}, [player1Y, player2Y]);

	return (
		<div>
			<canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} style={{ border: '2px solid black' }} />
		</div>
	);
};

export default PongPage;