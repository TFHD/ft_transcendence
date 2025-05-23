import React from 'react';
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom'
import {BABYLON, GUI, LOADERS} from '../components/babylonImports'
import { CheckToken, getUsername, getId } from '../components/CheckConnection'
import { connectGateWaySocket, getGatewaySocket} from '../components/GatewaySocket'

let ws:WebSocket | null = null;

const BabylonPage = () => {

  const canvasRef             = useRef<HTMLCanvasElement | null>(null);
  const wsRef                 = useRef<WebSocket | null>(null);
  let [username, setUsername] = useState("default");
	const host                  = window.location.hostname;
  const navigate              = useNavigate();
  const location              = useLocation();
  let fromStartGame           = location.state?.fromStartGame;
  let roomID                  = location.state?.roomID;
  const isTournament          = location.state?.isTournament;
  const mode                  = location.state?.mode;
  const gameMode              = window.location.pathname.split("/")[2];
  let   canAcessgame          = false;
  let   user_id               = undefined;
  let   explosionX            = undefined;
  let   explosionY            = undefined;
  let   endGame               = undefined;
  const dataTournament        = {
		username : location.state?.username,
		match : location.state?.match,
		round : location.state?.round,
    game_id :location.state?.game_id,
	}

  useEffect(() => {
    if (dataTournament.username != undefined)
      setUsername(dataTournament.username);
    else {
      getUsername().then(res => {
        setUsername(res);
      });
    }
    getId().then(res => {user_id = res;});
  }, []);

  useEffect(() => {
    if (username === "default") return;
    CheckToken().then(res => {
    if (!res)
      navigate("/");
    if (!getGatewaySocket()) {
      connectGateWaySocket(`https://${host}:8000/api/gateway`); console.log("conection reussie !");}
    });

    if (gameMode != "solo" && gameMode != "duo" && gameMode != "practice")
      navigate("/lobby");
    else if (gameMode != "solo" && !fromStartGame)
      navigate("/lobby");
    else
      canAcessgame = true;

    if (canAcessgame) {
      if (!canvasRef.current) return;

      const WALL_HEIGHT = 1;
      const WALL_DEPTH = 40;
      const isTerminal = false;

      const ENUM_STATUS = {
        pause : "En attente",
        InGame : "InGame"
      }

      var Status = ENUM_STATUS.pause;

      const keyState = {
        ArrowUp: false,
        ArrowDown: false,
        w: false,
        s: false
      };

      //   #######################################################################################################################
      //   ####################################################   FONCTIONS   ####################################################
      //   #######################################################################################################################

      const createWall = (name: string, size: {width: number, height : number, depth: number}, position: BABYLON.Vector3, color : BABYLON.Color3) => {
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
        const rect = new GUI.Rectangle();
        rect.width = width;
        rect.height = height;
        rect.alpha = 0.4;
        rect.cornerRadius = cornerRadius;
        rect.color = "white";
        rect.thickness = thickness;
        rect.background = backgroundColor;
        rect.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        rect.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        if (display)
          gui.addControl(rect);
        return rect;
      };

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
        const label = new GUI.TextBlock(name);
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
      const changeGameVisual = () => {
        Status = ENUM_STATUS.InGame;
        updateGameElementsVisibility(true);
        gui.removeControl(PauseBackgroundBox);
        gui.removeControl(PauseTextBox);
        camera.setPosition(new BABYLON.Vector3(0, 25, -25));
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(canvasRef.current, true);
        camera.beta = Math.PI / 2;
      };
      const handleKeyDown = (event: KeyboardEvent) =>
      {
        if (event.key in keyState && Status == ENUM_STATUS.InGame)
        {
          ws?.send(JSON.stringify({ key: event.key, state: true }));
          keyState[event.key] = true;
        }
      };
      const handleKeyUp = (event: KeyboardEvent) =>
      {
        if (event.key in keyState && Status == ENUM_STATUS.InGame)
        {
          keyState[event.key] = false;
          ws?.send(JSON.stringify({ key: event.key, state: false}));
        }
      };

      const createExplosion = (position: BABYLON.Vector3, {r1, g1, b1}, {r2, g2, b2}, minEmitPower : number, maxEmitPower : number, minSize : number, maxSize : number, time : number) => {
        const particleSystem = new BABYLON.ParticleSystem("particles", 200, scene);
        particleSystem.particleTexture = new BABYLON.Texture("https://playground.babylonjs.com/textures/flare.png", scene);

        particleSystem.emitter = position.clone();
        particleSystem.minEmitBox = new BABYLON.Vector3(-0.5, -0.5, -0.5); 
        particleSystem.maxEmitBox = new BABYLON.Vector3(0.5, 0.5, 0.5); 
      
        particleSystem.color1 = new BABYLON.Color4(r1, g1, b1, 1.0);
        particleSystem.color2 = new BABYLON.Color4(r2, g2, b2, 1.0);
        particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
      
        particleSystem.minSize = minSize;
        particleSystem.maxSize = maxSize;
        particleSystem.minLifeTime = 0.2;
        particleSystem.maxLifeTime = 0.4;
      
        particleSystem.emitRate = 1000;
        particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
      
        particleSystem.direction1 = new BABYLON.Vector3(-1, 1, 1);
        particleSystem.direction2 = new BABYLON.Vector3(1, 1, -1);
      
        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI;
      
        particleSystem.minEmitPower = minEmitPower;
        particleSystem.maxEmitPower = maxEmitPower;
        particleSystem.updateSpeed = 0.01;
      
        particleSystem.start();
      
        setTimeout(() => {
          particleSystem.stop();
          particleSystem.dispose();
        }, time);
      };

      const updateGameElementsVisibility = (isVisible: boolean) => {
        leftPaddle.setEnabled(isVisible);
        rightPaddle.setEnabled(isVisible);
        ball.setEnabled(isVisible);
        topWall.setEnabled(isVisible);
        bottomWall.setEnabled(isVisible);
      };

      //   #######################################################################################################################
      //   ###################################################   SETUP SCÈNE   ###################################################
      //   #######################################################################################################################

      const engine = new BABYLON.Engine(canvasRef.current, true);
      const scene = new BABYLON.Scene(engine);
      scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

      const camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 2, Math.PI / 2, 30,
        new BABYLON.Vector3(0, 0, 0), scene
      );
      camera.setPosition(new BABYLON.Vector3(0, 25, -25));
      camera.setTarget(BABYLON.Vector3.Zero());
      camera.attachControl(canvasRef.current, true);
      camera.beta = Math.PI / 2;

      const gui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

      const Player1Name = createTextBox("Player1", 32, 25, 25, "white", GUI.Control.HORIZONTAL_ALIGNMENT_LEFT, GUI.Control.VERTICAL_ALIGNMENT_TOP, true);
      const Player2Name = createTextBox("Player2", 32, 25, -25, "white", GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT, GUI.Control.VERTICAL_ALIGNMENT_TOP, true);
      const Player1Score = createTextBox("0", 29, 55, 25, "red", GUI.Control.HORIZONTAL_ALIGNMENT_LEFT, GUI.Control.VERTICAL_ALIGNMENT_TOP, true);
      const Player2Score = createTextBox("0", 29, 55, -25, "red", GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT, GUI.Control.VERTICAL_ALIGNMENT_TOP, true);
      const PauseTextBox = createTextBox(ENUM_STATUS.pause, 70, 0, 0, "white", GUI.Control.HORIZONTAL_ALIGNMENT_CENTER, GUI.Control.VERTICAL_ALIGNMENT_CENTER, false);
      const PauseBackgroundBox = createBackgroundBox("400px", "120px", "gray", 2, 20, false);

      camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
      const customKeyboardInput = new BABYLON.ArcRotateCameraKeyboardMoveInput();
      customKeyboardInput.keysUp = [];
      customKeyboardInput.keysDown = [];
      customKeyboardInput.keysLeft = [];
      customKeyboardInput.keysRight = [];
      camera.inputs.add(customKeyboardInput);

      canvasRef.current.addEventListener("click", () => {
        camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
        
        if (customKeyboardInput) {
          camera.inputs.add(customKeyboardInput);
        }
      });

      const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 1), scene);
      light.intensity = 3;

      var starsParticles = new BABYLON.ParticleSystem("starsParticles", 500, scene);
      starsParticles.particleTexture = new BABYLON.Texture("https://raw.githubusercontent.com/PatrickRyanMS/BabylonJStextures/master/ParticleSystems/Sun/T_Star.png", scene);

      var stars = BABYLON.MeshBuilder.CreateBox("emitter", {size : 0.01, width : 0.01, height: 0.01}, scene);

      var starsEmitter = new BABYLON.SphereParticleEmitter();
      starsEmitter.radius = 150;
      starsEmitter.radiusRange = 0;

      starsParticles.emitter = stars;
      starsParticles.particleEmitterType = starsEmitter;
      starsParticles.color1 = new BABYLON.Color4(0.898, 0.737, 0.718, 1.0);
      starsParticles.color2 = new BABYLON.Color4(0.584, 0.831, 0.894, 1.0);
      starsParticles.minSize = 5;
      starsParticles.maxSize = 12;
      starsParticles.minLifeTime = 99999;
      starsParticles.maxLifeTime = 99999;
      starsParticles.manualEmitCount = 500;
      starsParticles.maxEmitPower = 0.0;
      starsParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
      starsParticles.gravity = new BABYLON.Vector3(0, 0, 0);
      starsParticles.minAngularSpeed = 0.0;
      starsParticles.maxAngularSpeed = 0.0;
      starsParticles.minEmitPower = 0.0;
      starsParticles.maxAngularSpeed = 0.0;
      starsParticles.isBillboardBased = true;
      starsParticles.renderingGroupId = 0;
      starsParticles.start();

      const paddleMaterial = new BABYLON.StandardMaterial("paddleMat", scene);
      paddleMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);

      const leftPaddle = BABYLON.MeshBuilder.CreateBox("leftPaddle", { width: 1, height: 5, depth: 1 }, scene);
      leftPaddle.position = new BABYLON.Vector3(-20, 0, 0);
      leftPaddle.material = paddleMaterial;

      const rightPaddle = BABYLON.MeshBuilder.CreateBox("rightPaddle", { width: 1, height: 5, depth: 1 }, scene);
      rightPaddle.position = new BABYLON.Vector3(20, 0, 0);
      rightPaddle.material = paddleMaterial;

      const ballMaterial = new BABYLON.StandardMaterial("ballMat", scene);
      ballMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);

      const ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1 }, scene);
      ball.position = new BABYLON.Vector3(0, 0, 0);
      ball.material = ballMaterial;

      const topWall = createWall("topWall", {width: 45, height : WALL_HEIGHT, depth: 5}, new BABYLON.Vector3(0, 11, 0), new BABYLON.Color3(0.25, 0.25, 0.25));
      const bottomWall = createWall("bottomWall", {width: 45, height: WALL_HEIGHT, depth: 5}, new BABYLON.Vector3(0, -11, 0), new BABYLON.Color3(0.25, 0.25, 0.25));

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      engine.runRenderLoop(() => { scene.render(); });
      const handleResize = () => { engine.resize(); };
      window.addEventListener("resize", handleResize);
      updateGameElementsVisibility(false);
      gui.addControl(PauseBackgroundBox);
      gui.addControl(PauseTextBox);

      //   #######################################################################################################################
      //   ####################################################   WEBSOCKET   ####################################################
      //   #######################################################################################################################

      getId().then(res => {
        if (!ws)
        {
            user_id = res;
            console.log(gameMode);
            ws = new WebSocket(`wss://${host}:8000/api/pong/${gameMode}?roomID=${roomID}&username=${username}&terminal=${isTerminal}&game_id=${dataTournament.game_id}&match=${dataTournament.match}&round=${dataTournament.round}&isTournament=${isTournament}&user_id=${user_id}&mode=${mode}`);
            wsRef.current = ws;
        }

        ws.onopen = () => { console.log('Successfully connected to server'); };

        ws.onmessage = (message) =>
        {
          const server_packet = JSON.parse(message.data);

          rightPaddle.position.y = server_packet.player2Y;
          leftPaddle.position.y = server_packet.player1Y;
          ball.position.x = server_packet.ballX;
          ball.position.y = server_packet.ballY;
          Player1Score.text = server_packet.player1Score + "";
          Player2Score.text = server_packet.player2Score + "";
          if (Player1Name.text == "Player1")
            Player1Name.text = server_packet.player1Name + "";
          if (Player2Name.text == "Player2")
            Player2Name.text = server_packet.player2Name + "";
          explosionX = server_packet.explosionX;
          explosionY = server_packet.explosionY;
          endGame = server_packet.shouldStop;

          if (Status = ENUM_STATUS.pause)
            changeGameVisual();

          if (endGame)
          {
            if (dataTournament.username != undefined)
              navigate(`/tournament/${dataTournament.game_id}`, { state : {fromStartGame : true, finish : true, roomID : dataTournament.game_id, username : username, matchPlayed : dataTournament.match , roundPlayed : dataTournament.round}});
            else
              navigate(-1);
          }

          createExplosion(ball.position, {r1 : 0, g1 : 1, b1 : 0}, {r2 : 0, g2 : 1, b2 : 0}, 0.5, 2, 0.1, 0.2, 200);
          if (explosionX  != undefined && explosionY != undefined)
            createExplosion(new BABYLON.Vector3(explosionX, explosionY, 0), {r1 : 1, g1 : 0, b1 : 0}, {r2 : 1, g2 : 0.1, b2 : 0.1}, 10, 20, 1, 5, 700);
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
      });
        return () =>
      {
          engine.dispose();
          window.removeEventListener("resize", handleResize);
          window.removeEventListener("keydown", handleKeyDown);
          window.removeEventListener("keyup", handleKeyUp);
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)
            wsRef.current.close(1000, "Page quittée");
          roomID = undefined;
          fromStartGame = undefined;
      };
    }
  }, [username]);

  return (
    <div className="bg-white flex items-center justify-center min-h-screen pt-[0px]" style={{ overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100vh", outline: "none"}}
      />
    </div>
  );
};

export default BabylonPage;