import React from 'react';
import { useEffect, useRef } from "react";
import BABYLON from '../components/babylonImports';

let ws:WebSocket | null = null;

const BabylonPage = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef(null);
	const host = import.meta.env.VITE_ADRESS;

  useEffect(() => {
    if (!canvasRef.current) return;

    //toutes les valeurs const du jeu
    const WALL_HEIGHT = 1;
    const WALL_DEPTH = 40;

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

export default BabylonPage;