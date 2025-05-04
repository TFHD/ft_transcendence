import React from 'react';
import { useEffect, useRef } from "react";
import BABYLON from '../components/babylonImports';

let ws:WebSocket | null = null;

const BabylonScene = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef(null);
	const host = import.meta.env.VITE_ADRESS;

  useEffect(() => {
    if (!canvasRef.current) return;

    //toutes les valeurs const du jeu
    const INIT_SPEED_BALL_X = 0.2;
    const INIT_SPEED_BALL_Y = 0.2;
    const PADDLE_MIN_Y = -8;
    const PADDLE_MAX_Y = 8;
    const SPEED_MULTIPLIER = 1.05;
    const WALL_THICKNESS = 1;
    const WALL_HEIGHT = 1;
    const WALL_DEPTH = 40;
    const SPEED = 0.5;
    const MAX_BALL_X = 20;
    const MIN_BALL_X = -20;
    const MAX_BALL_Y = 10;
    const MIN_BALL_Y = -10;

    var ScorePlayer1 = 0;
    var ScorePlayer2 = 0;

    const ENUM_STATUS = {
      pause : "pause",
      InGame : "InGame"
    }

    var Status = ENUM_STATUS.InGame;

    //struct de mes Key un peu comme sur Cub3D hein Sato pour gerer les touches dynamiquement et de maniere fluide
    const keyState = {
      ArrowUp: false,
      ArrowDown: false,
      w: false,
      s: false
    };

    //   #######################################################################################################################
    //   ####################################################   FONCTIONS   ####################################################
    //   #######################################################################################################################

    //Fonction qui permet de creer les murs prcq la flm d'ecrire 10x la mm chose :)
    const createWall = (name: string, size: BABYLON.Vector3, position: BABYLON.Vector3, color : BABYLON.Color3) => {
      const wall = BABYLON.MeshBuilder.CreateBox(name, size, scene);
      wall.position = position;
      const wallMaterial = new BABYLON.StandardMaterial(name + "Mat", scene);
      wallMaterial.diffuseColor = color;
      wall.material = wallMaterial;
      return wall;
    };

    const createBackgroundBox = (
      width: string,
      height: string,
      backgroundColor: string,
      thickness: number,
      cornerRadius: number,
      display: boolean
    ) => {
      const rect = new BABYLON.Rectangle();
      rect.width = width;
      rect.height = height;
      rect.alpha = 0.4;
      rect.cornerRadius = cornerRadius;
      rect.color = "white";
      rect.thickness = thickness;
      rect.background = backgroundColor;
      rect.horizontalAlignment = BABYLON.Control.HORIZONTAL_ALIGNMENT_CENTER;
      rect.verticalAlignment = BABYLON.Control.VERTICAL_ALIGNMENT_CENTER;
      if (display)
        gui.addControl(rect);
      return rect;
    };

    //Fonction qui permet de creer des TextBoxs (meme utilité que createWall)
    const createTextBox = (
      name: string,
      fontSize: number,
      verticalPos: number,
      horizontalPos: number,
      color : string,
      HorizonAlignment : number,
      VerticalAlignment : number,
      display : boolean
    ) => {
      const label = new BABYLON.TextBlock(name);
      label.text = name;
      label.color = color;
      label.fontSize = fontSize;
      label.top = verticalPos + "px";
      label.left = horizontalPos + "px";
      label.textHorizontalAlignment = HorizonAlignment;
      label.textVerticalAlignment = VerticalAlignment;
      if (display)
        gui.addControl(label);
      return label;
    };

    //Fonction qui update la position de la balle et gère aussi son angle en fonction du Y de la raquette
    //sur laquelle elle est frappée
    // const updateAnglePosBall = (ball: BABYLON.Mesh, paddle: BABYLON.Mesh) =>
	// {
    // 	const paddleHalfHeight = 2.5; // 2.5 car 5 / 2 = 2.5 :)
    // 	const withinXRange = Math.abs(ball.position.x - paddle.position.x) <= 0.5;
    // 	const withinYRange = Math.abs(ball.position.y - paddle.position.y) <= paddleHalfHeight;
    
    // 	if (withinXRange && withinYRange)
	// 	{
    //     	const relativeIntersectY = ball.position.y - paddle.position.y;
    //     	const normalizedRelativeY = relativeIntersectY / paddleHalfHeight;
    //     	const bounceAngle = normalizedRelativeY * Math.PI / 4;
    //     	const direction = ballVelocity.x > 0 ? -1 : 1;
    //     	var speed = ballVelocity.length() * SPEED_MULTIPLIER;
    //     	if (speed > 1.5)
    //     		speed = 1.5;
    //     	ballVelocity.x = direction * speed * Math.cos(bounceAngle);
    //     	ballVelocity.y = speed * Math.sin(bounceAngle);
    // 	}
    // };

    // const updateBall = () =>
	// {

    // 	previousBallPosition.copyFrom(ball.position);
    // 	ball.position.addInPlace(ballVelocity);
    // 	const direction = ballVelocity.clone().normalize();
    // 	const rayLength = ballVelocity.length();
    // 	const ray = new BABYLON.Ray(previousBallPosition, direction, rayLength);
    //   //J'utilise un Ray (quand la balle va trop vite) genre je fais un rayon de mon ancienne pos de balle avec la nouvelle
    //   //et je regarde si le rayon passe par un paddle et si c'est le cas je TP la balle sur la position du paddle
    //   //visuellement ça va tlm vite qu'on voit que dalle
    //   //
    //   //                    O (ancienne pos de Balle)
    //   //                     \  |
    //   //                      \ |
    //   //Elle va etre TP ici> (O)| (Paddle)
    //   //                        |\
    //   //                        | \
    //   //                        |  O (Nouvelle pos de Balle)
    //   //
    // 	const hitLeft = ray.intersectsMesh(leftPaddle, false);
    // 	const hitRight = ray.intersectsMesh(rightPaddle, false);
    // 	if (hitLeft.hit)
	// 	{
    // 		updateAnglePosBall(ball, leftPaddle);
    // 		ball.position = new BABYLON.Vector3(leftPaddle.position.x + 1, previousBallPosition.y, leftPaddle.position.z);
    //  }
    // 	if (hitRight.hit)
	// 	{
    // 		updateAnglePosBall(ball, rightPaddle);
    // 		ball.position = new BABYLON.Vector3(rightPaddle.position.x - 1, previousBallPosition.y, rightPaddle.position.z);
    // 	}
    //   	createExplosion(ball.position);
    //   	if (ball.position.y > MAX_BALL_Y || ball.position.y < MIN_BALL_Y)
	// 	{
    //   		ballVelocity.y = -ballVelocity.y;
    //   	}
    // 	updateAnglePosBall(ball, leftPaddle);
    // 	updateAnglePosBall(ball, rightPaddle);
    // 	if (ball.position.x > MAX_BALL_X || ball.position.x < MIN_BALL_X)
	// 	{
    //     	if (ball.position.x > MAX_BALL_X)
	// 		{
    //     		ScorePlayer1++;
    //     		Player1Score.text = ScorePlayer1 + "";
    //     	}
    //     	if (ball.position.x < MAX_BALL_X)
	// 		{
    //     		ScorePlayer2++;
    //     		Player2Score.text = ScorePlayer2 + "";
    //     	}
		
    //     	ball.position = new BABYLON.Vector3(0, 0, 0);
    //     	ballVelocity = new BABYLON.Vector3(INIT_SPEED_BALL_X, INIT_SPEED_BALL_Y, 0);
    // 	}
    // };

    //Fonctions movePaddle + smoothMovePaddles permettent de moove les raquettes en changeant leurs positions Y
    // const movePaddle = (direction: number, bool : number) =>
	// {
	// 	if (bool == 1)
	// 	{
    //     	let newTarget = leftPaddle.position.y + SPEED * direction;
    //     	if (newTarget >= PADDLE_MIN_Y && newTarget <= PADDLE_MAX_Y)
    //     		leftPaddle.position.y = newTarget;
	// 	}
    // 	else
	// 	{
    //     	let newTarget = rightPaddle.position.y + SPEED * direction;
    //     	if (newTarget >= PADDLE_MIN_Y && newTarget <= PADDLE_MAX_Y)
	// 			rightPaddle.position.y = newTarget;
	// 	}
    // };

    // const smoothMovePaddles = () =>
	// {
    // 	if (keyState.ArrowUp)
	// 		movePaddle(1, 0);
    // 	if (keyState.ArrowDown)
	// 		movePaddle(-1, 0);
    // 	if (keyState.w)
	// 		movePaddle(1, 1);
    // 	if (keyState.s)
	// 		movePaddle(-1, 1);
    // };

    //Fonction pour les touches qui sont préssées
    const handleKeyDown = (event: KeyboardEvent) =>
	{
		if (event.key === "Escape")
		{
        	if (Status == ENUM_STATUS.InGame)
			{
          		Status = ENUM_STATUS.pause;
        		gui.addControl(PauseBackgroundBox);
        		gui.addControl(PauseTextBox);
        	}
			else
			{
        		Status = ENUM_STATUS.InGame;
        		gui.removeControl(PauseBackgroundBox);
        		gui.removeControl(PauseTextBox);
        	}
        	console.log(Status);
		}
      	else if (event.key in keyState)
		{
			ws?.send(JSON.stringify({ key: event.key, state: true }));
        	keyState[event.key] = true;
		}
    };
    //Fonction pour les touches qui ne sont plus préssées
    const handleKeyUp = (event: KeyboardEvent) =>
	{
    	if (event.key in keyState)
		{
        	keyState[event.key] = false;
			ws?.send(JSON.stringify({ key: event.key, state: false }));
		}
    };

    // const createExplosion = (position: BABYLON.Vector3) => {
    //   const particleSystem = new BABYLON.ParticleSystem("particles", 200, scene);
    //   particleSystem.particleTexture = new BABYLON.Texture("https://playground.babylonjs.com/textures/flare.png", scene);
      
    //   particleSystem.emitter = position.clone(); // position de l'explosion
    //   particleSystem.minEmitBox = new BABYLON.Vector3(-0.5, -0.5, -0.5); 
    //   particleSystem.maxEmitBox = new BABYLON.Vector3(0.5, 0.5, 0.5); 
    
    //   particleSystem.color1 = new BABYLON.Color4(0, 1, 0, 1.0);  // orange
    //   particleSystem.color2 = new BABYLON.Color4(0, 0.2, 0, 1.0);    // rouge
    //   particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
    
    //   particleSystem.minSize = 0.1;
    //   particleSystem.maxSize = 0.3;
    //   particleSystem.minLifeTime = 0.2;
    //   particleSystem.maxLifeTime = 0.4;
    
    //   particleSystem.emitRate = 1000;
    //   particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
    
    //   particleSystem.direction1 = new BABYLON.Vector3(-1, 1, 1);
    //   particleSystem.direction2 = new BABYLON.Vector3(1, 1, -1);
    
    //   particleSystem.minAngularSpeed = 0;
    //   particleSystem.maxAngularSpeed = Math.PI;
    
    //   particleSystem.minEmitPower = 0.5;
    //   particleSystem.maxEmitPower = 2;
    //   particleSystem.updateSpeed = 0.01;
    
    //   particleSystem.start();
    
    //   setTimeout(() => {
    //     particleSystem.stop();
    //     particleSystem.dispose();
    //   }, 500);
    // };

    //   #######################################################################################################################
    //   ###################################################   SETUP SCÈNE   ###################################################
    //   #######################################################################################################################


    //Creation Engine + Scene + Camera
    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      Math.PI / 2, Math.PI / 2, 500,
      new BABYLON.Vector3(0, 0, 0), scene
    );
    camera.setPosition(new BABYLON.Vector3(0, 25, -25));
    camera.setTarget(new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvasRef.current, true);
    camera.beta = Math.PI / 2;

    const gui = BABYLON.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    createTextBox("Player1", 32, 25, 25, "white", BABYLON.Control.HORIZONTAL_ALIGNMENT_LEFT, BABYLON.Control.VERTICAL_ALIGNMENT_TOP, true);
    createTextBox("Player2", 32, 25, -25, "white", BABYLON.Control.HORIZONTAL_ALIGNMENT_RIGHT, BABYLON.Control.VERTICAL_ALIGNMENT_TOP, true);
    const Player1Score = createTextBox("0", 29, 55, 25, "red", BABYLON.Control.HORIZONTAL_ALIGNMENT_LEFT, BABYLON.Control.VERTICAL_ALIGNMENT_TOP, true);
    const Player2Score = createTextBox("0", 29, 55, -25, "red", BABYLON.Control.HORIZONTAL_ALIGNMENT_RIGHT, BABYLON.Control.VERTICAL_ALIGNMENT_TOP, true);
    const PauseTextBox = createTextBox("Pause", 70, 0, 0, "white", BABYLON.Control.HORIZONTAL_ALIGNMENT_CENTER, BABYLON.Control.VERTICAL_ALIGNMENT_CENTER, false);
    const PauseBackgroundBox = createBackgroundBox("300px", "120px", "gray", 2, 20, false);

    //En gros ça me clc dès que je click sur le canvas bah je peux rotate avec les touches du clavier
    //dcp je les enleve (et c'est chiant)
    camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
    const customKeyboardInput = new BABYLON.ArcRotateCameraKeyboardMoveInput();
    customKeyboardInput.keysUp = [];    // Désactive la touche haut
    customKeyboardInput.keysDown = [];  // ...
    customKeyboardInput.keysLeft = [];  // ...
    customKeyboardInput.keysRight = []; // ...
    camera.inputs.add(customKeyboardInput);

    canvasRef.current.addEventListener("click", () => {
      camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
      
      if (customKeyboardInput) {
        camera.inputs.add(customKeyboardInput);
      }
    });


    //Creation d'une lumiere sinon on voit rien :(
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 1), scene);
    light.intensity = 4;

    //Creation des Paddles
    const paddleMaterial = new BABYLON.StandardMaterial("paddleMat", scene);
    paddleMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);

    const leftPaddle = BABYLON.MeshBuilder.CreateBox("leftPaddle", { width: 1, height: 5, depth: 1 }, scene);
    leftPaddle.position = new BABYLON.Vector3(-20, 0, 0);
    leftPaddle.material = paddleMaterial;

    const rightPaddle = BABYLON.MeshBuilder.CreateBox("rightPaddle", { width: 1, height: 5, depth: 1 }, scene);
    rightPaddle.position = new BABYLON.Vector3(20, 0, 0);
    rightPaddle.material = paddleMaterial;

    //Creation de la Mesh ball
    const ballMaterial = new BABYLON.StandardMaterial("ballMat", scene);
    ballMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);

    const ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1 }, scene);
    ball.position = new BABYLON.Vector3(0, 0, 0);
    ball.material = ballMaterial;
    let ballVelocity = new BABYLON.Vector3(INIT_SPEED_BALL_X, INIT_SPEED_BALL_Y, 0);
    let previousBallPosition = ball.position.clone();

    createWall("topWall", {width: 45, height : WALL_HEIGHT, depth: WALL_DEPTH}, new BABYLON.Vector3(0, 11, 0), new BABYLON.Color3(0.5, 0.5, 0.5));
    createWall("bottomWall", {width: 45, height: WALL_HEIGHT, depth: WALL_DEPTH}, new BABYLON.Vector3(0, -11, 0), new BABYLON.Color3(0.5, 0.5, 0.5));

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    //Je créer une loop render un peu comme la Macro genre add_loop_hook()
    engine.runRenderLoop(() =>
	{
    	if (Status == ENUM_STATUS.InGame)
		{
        	// updateBall();
        	// smoothMovePaddles();
    	}
      	scene.render();
    });

    const handleResize = () =>
	{
		engine.resize();
	};
    window.addEventListener("resize", handleResize);

	if (!ws)
	{
    	ws = new WebSocket(`ws://${host}:8000/api/pong/solo`);
    	wsRef.current = ws;
	}
    ws.onopen = () =>
	{
    	console.log('Successfully connected to server');
    };
    ws.onmessage = (message) =>
	{
		const server_packet = JSON.parse(message.data);

		console.log(server_packet.msg);
		rightPaddle.position.y = server_packet.player2Y;
		leftPaddle.position.y = server_packet.player1Y;
		ball.position.x = server_packet.ballX;
		ball.position.y = server_packet.ballY;
		Player1Score.text = server_packet.player1Score + "";
		Player2Score.text = server_packet.player2Score + "";
	};
    ws.onclose = (event) =>
	{
		console.log('Disconnected from server', event.code, event.reason);
		ws = null;
	};
    ws.onerror = (e) =>
	{
		console.log('Connection error', e);
	};

    return () =>
	{
    	engine.dispose();
    	window.removeEventListener("resize", handleResize);
    	window.removeEventListener("keydown", handleKeyDown);
    	window.removeEventListener("keyup", handleKeyUp);
    	console.log('Fermeture WebSocket');
    };
  }, []);

  return (
    //style={{ overflow: "hidden" }} c'est pour cacher le surplus de la page
    <div className="bg-white flex items-center justify-center min-h-screen pt-[0px]" style={{ overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        // outiline "none" c'est pour desactiver le contour blanc pas beau du canvas quand on clique dessus hein Remi :)
        style={{ width: "100%", height: "100vh", outline: "none"}}
      />
    </div>
  );
};

export default BabylonScene;