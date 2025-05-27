import React from 'react';
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom'
import {BABYLON, GUI, LOADERS} from '../components/babylonImports'
import { CheckToken, getUsername, getId } from '../components/CheckConnection'
import { connectGateWaySocket, getGatewaySocket, closeGateWaySocket} from '../components/GatewaySocket'

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
    const [initData] = useState(() => ({
    fromStartGame: location.state?.fromStartGame,
    roomID: location.state?.roomID,
    isTournament: location.state?.isTournament,
    mode: location.state?.mode,
    dataTournament: {
      username: location.state?.username,
      match: location.state?.match,
      round: location.state?.round,
      game_id: location.state?.game_id,
    }
  }));

  useEffect(() => {
    if (initData.dataTournament.username != undefined)
      setUsername(initData.dataTournament.username);
    else {
      getUsername().then(res => {
        setUsername(res);
      });
    }
    getId().then(res => {user_id = res;});
    if (initData.fromStartGame)
      navigate(location.pathname, { replace: true, state: undefined });
  }, []);

  useEffect(() => {
    if (username === "default") return;
    CheckToken().then(res => {
    if (!res) { navigate("/"); closeGateWaySocket(); } 
    if (!getGatewaySocket()) {
      connectGateWaySocket(`https://${host}:8000/api/gateway`); }
    });

    if (gameMode != "solo" && gameMode != "duo" && gameMode != "practice")
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

      const navigateChoose = (gameMode : string) => {
        if (gameMode == "duo")
          navigate("/start-game-multiplayer");
        else if (gameMode == "solo")
          navigate("/lobby");
        else
          navigate("/start-game-practice");
      }

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
        rect.alpha = 0.7;
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
        // --- STYLE MODERN ---
        label.fontFamily = "Orbitron, Exo, Arial";
        label.shadowColor = "#000";
        label.shadowBlur = 8;
        label.outlineWidth = 4;
        label.outlineColor = "#000";
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
        if (event.key == "Escape") {
          navigateChoose(gameMode);
        }
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
      scene.clearColor = new BABYLON.Color4(0.08, 0.09, 0.13, 1); // CHANGED: fond anthracite doux

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

      const Player1Name = createTextBox("Player1", 32, 25, 25, "#F4D35E", GUI.Control.HORIZONTAL_ALIGNMENT_LEFT, GUI.Control.VERTICAL_ALIGNMENT_TOP, true); // jaune pastel
      Player1Name.fontFamily = "Orbitron, Exo, Arial";
      Player1Name.shadowColor = "#000";
      Player1Name.shadowBlur = 8;
      Player1Name.outlineWidth = 4;
      Player1Name.outlineColor = "#000";

      const Player2Name = createTextBox("Player2", 32, 25, -25, "#3FA7D6", GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT, GUI.Control.VERTICAL_ALIGNMENT_TOP, true); // bleu clair
      Player2Name.fontFamily = "Orbitron, Exo, Arial";
      Player2Name.shadowColor = "#000";
      Player2Name.shadowBlur = 8;
      Player2Name.outlineWidth = 4;
      Player2Name.outlineColor = "#000";

      const Player1Score = createTextBox("0", 42, 55, 25, "#08D9D6", GUI.Control.HORIZONTAL_ALIGNMENT_LEFT, GUI.Control.VERTICAL_ALIGNMENT_TOP, true); // bleu néon
      Player1Score.fontFamily = "Orbitron, Exo, Arial";
      Player1Score.shadowColor = "#000";
      Player1Score.shadowBlur = 10;

      const Player2Score = createTextBox("0", 42, 55, -25, "#FF2E63", GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT, GUI.Control.VERTICAL_ALIGNMENT_TOP, true); // rose néon
      Player2Score.fontFamily = "Orbitron, Exo, Arial";
      Player2Score.shadowColor = "#000";
      Player2Score.shadowBlur = 10;

      const PauseTextBox = createTextBox(ENUM_STATUS.pause, 70, 0, 0, "#F4D35E", GUI.Control.HORIZONTAL_ALIGNMENT_CENTER, GUI.Control.VERTICAL_ALIGNMENT_CENTER, false);
      PauseTextBox.fontFamily = "Orbitron, Exo, Arial";
      PauseTextBox.shadowColor = "#000";
      PauseTextBox.shadowBlur = 12;

      const PauseBackgroundBox = createBackgroundBox("400px", "120px", "#222A35", 0, 30, false); // gris bleuté foncé, arrondi

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

      const paddlePBRLeft = new BABYLON.PBRMaterial("paddlePBRLeft", scene);
      paddlePBRLeft.albedoColor = new BABYLON.Color3(0.1, 0.85, 0.82);
      paddlePBRLeft.alpha = 0.95;
      paddlePBRLeft.metallic = 0.2;
      paddlePBRLeft.roughness = 0.6;
      paddlePBRLeft.reflectivityColor = new BABYLON.Color3(0.1, 0.2, 0.2);
      
      const paddlePBRRight = new BABYLON.PBRMaterial("paddlePBRRight", scene);
      paddlePBRRight.albedoColor = new BABYLON.Color3(0.98, 0.18, 0.38);
      paddlePBRRight.alpha = 0.95;
      paddlePBRRight.metallic = 0.2;
      paddlePBRRight.roughness = 0.6;
      paddlePBRRight.reflectivityColor = new BABYLON.Color3(0.2, 0.1, 0.15);

      const leftPaddle = BABYLON.MeshBuilder.CreateCapsule("leftPaddle", { height: 5, radius: 0.55 }, scene);
      leftPaddle.position = new BABYLON.Vector3(-20, 0, 0);
      leftPaddle.material = paddlePBRLeft;

      const rightPaddle = BABYLON.MeshBuilder.CreateCapsule("rightPaddle", { height: 5, radius: 0.55 }, scene);
      rightPaddle.position = new BABYLON.Vector3(20, 0, 0);
      rightPaddle.material = paddlePBRRight;

      const ballMaterial = new BABYLON.StandardMaterial("ballMat", scene);
      ballMaterial.diffuseColor = new BABYLON.Color3(0.97, 0.93, 0.36);
      ballMaterial.emissiveColor = new BABYLON.Color3(1, 1, 0.4);
      ballMaterial.specularColor = new BABYLON.Color3(1, 1, 0.7);

      const ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1.2 }, scene);
      ball.position = new BABYLON.Vector3(0, 0, 0);
      ball.material = ballMaterial;
      const gl = new BABYLON.GlowLayer("glow", scene);
      gl.addIncludedOnlyMesh(ball);

      const wallMaterial = new BABYLON.StandardMaterial("wallMat", scene);
      wallMaterial.diffuseColor = new BABYLON.Color3(0.15, 0.18, 0.21);
      wallMaterial.alpha = 0.7;

      const topWall = BABYLON.MeshBuilder.CreateBox("topWall", {width: 45, height : WALL_HEIGHT, depth: 5}, scene);
      topWall.position = new BABYLON.Vector3(0, 11, 0);
      topWall.material = wallMaterial;
      topWall.isPickable = false;
      topWall.edgesWidth = 2.0;
      topWall.edgesColor = new BABYLON.Color4(0.7, 0.7, 0.7, 1);

      const bottomWall = BABYLON.MeshBuilder.CreateBox("bottomWall", {width: 45, height: WALL_HEIGHT, depth: 5}, scene);
      bottomWall.position = new BABYLON.Vector3(0, -11, 0);
      bottomWall.material = wallMaterial;
      bottomWall.isPickable = false;
      bottomWall.edgesWidth = 2.0;
      bottomWall.edgesColor = new BABYLON.Color4(0.7, 0.7, 0.7, 1);

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
            ws = new WebSocket(`wss://${host}:8000/api/pong/${gameMode}?roomID=${initData.roomID}&username=${username}&terminal=${isTerminal}&game_id=${initData.dataTournament.game_id}&match=${initData.dataTournament.match}&round=${initData.dataTournament.round}&isTournament=${initData.isTournament}&user_id=${user_id}&mode=${initData.mode}`);
            wsRef.current = ws;
        }

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
            if (dataTournament.game_id != undefined)
              navigate(`/tournament/${dataTournament.game_id}`, { state : {fromStartGame : true, finish : true, roomID : dataTournament.game_id, username : username, matchPlayed : dataTournament.match , roundPlayed : dataTournament.round}});
            else
              navigateChoose(gameMode);
          }

          createExplosion(ball.position, {r1 : 0, g1 : 1, b1 : 0}, {r2 : 0, g2 : 1, b2 : 0}, 0.5, 2, 0.1, 0.2, 200);
          if (explosionX  != undefined && explosionY != undefined)
            createExplosion(new BABYLON.Vector3(explosionX, explosionY, 0), {r1 : 1, g1 : 0, b1 : 0}, {r2 : 1, g2 : 0.1, b2 : 0.1}, 10, 20, 1, 5, 700);
        };

        ws.onclose = (event) =>
        {
          ws = null;
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