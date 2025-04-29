import React from 'react';
import { useEffect, useRef } from "react";
import BABYLON from '../components/babylonImports';
const BabylonScene = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    //toutes les valeurs const du jeu
    const INIT_SPEED_BALL_X = 0.1;
    const INIT_SPEED_BALL_Y = 0.1;
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
    const createWall = (name: string, width: number, height: number, depth: number, position: BABYLON.Vector3, color : BABYLON.Color3) => {
      const wall = BABYLON.MeshBuilder.CreateBox(name, { width, height, depth }, scene);
      wall.position = position;
      const wallMaterial = new BABYLON.StandardMaterial(name + "Mat", scene);
      wallMaterial.diffuseColor = color;
      wall.material = wallMaterial;
      return wall;
    };

    //Fonction qui update la position de la balle et gère aussi son angle en fonction du Y de la raquette
    //sur laquelle elle est frappée
    const updateAnglePosBall = (ball: BABYLON.Mesh, paddle: BABYLON.Mesh) => {
      const paddleHalfHeight = 2.5; // 2.5 car 5 / 2 = 2.5 :)
      const withinXRange = Math.abs(ball.position.x - paddle.position.x) <= 0.5;
      const withinYRange = Math.abs(ball.position.y - paddle.position.y) <= paddleHalfHeight;
    
      if (withinXRange && withinYRange) {

        const relativeIntersectY = ball.position.y - paddle.position.y;
        const normalizedRelativeY = relativeIntersectY / paddleHalfHeight;
        const bounceAngle = normalizedRelativeY * Math.PI / 4;
        const direction = ballVelocity.x > 0 ? -1 : 1;
        const speed = ballVelocity.length() * SPEED_MULTIPLIER;
    
        ballVelocity.x = direction * speed * Math.cos(bounceAngle);
        ballVelocity.y = speed * Math.sin(bounceAngle);
      }
    };

    const updateBall = () => {
      ball.position.addInPlace(ballVelocity);
      if (ball.position.y > MAX_BALL_Y || ball.position.y < MIN_BALL_Y) {
        ballVelocity.y = -ballVelocity.y;
      }
      updateAnglePosBall(ball, leftPaddle);
      updateAnglePosBall(ball, rightPaddle);
      if (ball.position.x > MAX_BALL_X || ball.position.x < MIN_BALL_X) {
        ball.position = new BABYLON.Vector3(0, 0, 0);
        ballVelocity = new BABYLON.Vector3(INIT_SPEED_BALL_X, INIT_SPEED_BALL_Y, 0);
      }
    };

    //Fonctions movePaddle + smoothMovePaddles permettent de moove les raquettes en changeant leurs positions Y
    const movePaddle = (direction: number, bool : number) => {
      if (bool == 1) {
        let newTarget = leftPaddle.position.y + SPEED * direction;
        if (newTarget >= PADDLE_MIN_Y && newTarget <= PADDLE_MAX_Y)
          leftPaddle.position.y = newTarget;
      }
      else {
        let newTarget = rightPaddle.position.y + SPEED * direction;
        if (newTarget >= PADDLE_MIN_Y && newTarget <= PADDLE_MAX_Y)
          rightPaddle.position.y = newTarget;
      }
    };

    const smoothMovePaddles = () => {
      if (keyState.ArrowUp) movePaddle(1, 0);
      if (keyState.ArrowDown) movePaddle(-1, 0);
      if (keyState.w) movePaddle(1, 1);
      if (keyState.s) movePaddle(-1, 1);
    };

    //Fonction pour les touches qui sont préssées
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key in keyState) {
        keyState[event.key] = true;
      }
    };

    //Fonction pour les touches qui ne sont plus préssées
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key in keyState) {
        keyState[event.key] = false;
      }
    };

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


    camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");

    //En gros ça me clc dès que je click sur le canvas bah je peux rotate avec les touches du clavier
    //dcp je les enleve (et c'est chiant)
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
    light.intensity = 1;

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

    //Creation des murs
    createWall("topWall", 45, WALL_HEIGHT, WALL_DEPTH, new BABYLON.Vector3(0, 11, 0), new BABYLON.Color3(0.5, 0.5, 0.5));
    createWall("bottomWall", 45, WALL_HEIGHT, WALL_DEPTH, new BABYLON.Vector3(0, -11, 0), new BABYLON.Color3(0.5, 0.5, 0.5));
    createWall("leftWall", WALL_THICKNESS, 23, WALL_DEPTH, new BABYLON.Vector3(-22, 0, 0), new BABYLON.Color3(0.5, 0.5, 0.5));
    createWall("rightWall", WALL_THICKNESS, 23, WALL_DEPTH, new BABYLON.Vector3(22, 0, 0), new BABYLON.Color3(0.5, 0.5, 0.5));
    createWall("back", 43, 23, 1, new BABYLON.Vector3(0, 0, 20.5), new BABYLON.Color3(0, 0, 1));

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    //Je créer une loop render un peu comme la Macro genre add_loop_hook()
    engine.runRenderLoop(() => {
      updateBall();
      smoothMovePaddles();
      scene.render();
    });

    const handleResize = () => { engine.resize(); };
    window.addEventListener("resize", handleResize);

    return () => {
      engine.dispose();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    //style={{ overflow: "hidden" }} c'est pour cacher le surplus de la page
    <div className="bg-black flex items-center justify-center min-h-screen pt-[0px]" style={{ overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        // outiline "none" c'est pour desactiver le contour blanc pas beau du canvas quand on clique dessus hein Remi :)
        style={{ width: "100%", height: "100vh", outline: "none"}}
      />
    </div>
  );
};

export default BabylonScene;