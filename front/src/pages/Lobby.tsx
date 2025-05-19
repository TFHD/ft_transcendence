import React, {useState} from 'react';
import { useEffect, useRef } from "react";
import axios from 'axios';
import { createObjectClickable, setActions, CreateDynamicText } from '../components/LobbyAssets';
import { useNavigate } from 'react-router-dom';
import { CheckToken } from '../components/CheckConnection';
import {BABYLON, GUI, LOADERS} from '../components/babylonImports'

const host = window.location.hostname;

const BabylonScene = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(`https://${host}:8000/api/auth/logout`, undefined, {
        withCredentials: true,
        headers: {
          'Content-Type': ''
        }
      });
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  const handleSearch = () => {
    navigate(`/search/${search}`);
  };
  
  useEffect(() => {

    CheckToken().then(res => {
      if (!res)
        navigate("/");
    });

    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = new BABYLON.Scene(engine);

    scene.clearColor = new BABYLON.Color4(0.0, 0.0, 0.0, 1.0);

    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      -Math.PI / 2, Math.PI / 4, 4,
      new BABYLON.Vector3(0, 0.3, 0), scene
    );
    camera.attachControl(canvasRef.current, true);
    camera.lowerRadiusLimit = 1.7;
    camera.upperRadiusLimit = 6;
    camera.lowerBetaLimit = 0;
    camera.upperBetaLimit = Math.PI;
    camera.angularSensibilityX = 4000;
    camera.angularSensibilityY = 4000;
    camera.inertia = 0.9;

    camera.inputs.attached.pointers.buttons = [0];

    const mainLight = new BABYLON.HemisphericLight("mainLight", new BABYLON.Vector3(-1, 1, 0), scene);
    mainLight.intensity = 0.7;

    const fuse1 = createObjectClickable("/assets/", "red_big_space_ship.glb", scene, new BABYLON.Vector3(0.3, 0.96, 0), new BABYLON.Vector3(0.25, 0.25, 0.25), new BABYLON.Vector3(0, Math.PI, -Math.PI * 1.9));
    const fuse2 = createObjectClickable("/assets/", "red_big_space_ship.glb", scene, new BABYLON.Vector3(0.76, 0.65, 0), new BABYLON.Vector3(0.25, 0.25, 0.25), new BABYLON.Vector3(0, Math.PI, Math.PI / 4));
    const fuse3 = createObjectClickable("/assets/", "red_big_space_ship.glb", scene, new BABYLON.Vector3(-0.76, 0.65, 0), new BABYLON.Vector3(0.25, 0.25, 0.25), new BABYLON.Vector3(0, Math.PI, -Math.PI / 4));
    const fuse4 = createObjectClickable("/assets/", "red_big_space_ship.glb", scene, new BABYLON.Vector3(-0.3, 0.96, 0), new BABYLON.Vector3(0.25, 0.25, 0.25), new BABYLON.Vector3(0, Math.PI, Math.PI * 1.9));
    
    const planet = BABYLON.MeshBuilder.CreateSphere("planet", { diameter: 2, segments: 128 }, scene);

    const planet_pbr = new BABYLON.PBRMaterial("planet.pbr", scene);
    
    planet_pbr.albedoTexture = new BABYLON.Texture("/assets/albedo_veins.png", scene);
    planet_pbr.emissiveTexture = new BABYLON.Texture("/assets/emissive_veins.png", scene);
    planet_pbr.metallicTexture = new BABYLON.Texture("/assets/metallic.png", scene);
    planet_pbr.emissiveColor = new BABYLON.Color3(1, 1, 1);
    planet_pbr.emissiveIntensity = 0.8;
    planet.material = planet_pbr;

    var starsParticles = new BABYLON.ParticleSystem("starsParticles", 500, scene);
    starsParticles.particleTexture = new BABYLON.Texture("https://raw.githubusercontent.com/PatrickRyanMS/BabylonJStextures/master/ParticleSystems/Sun/T_Star.png", scene);

    var stars = BABYLON.MeshBuilder.CreateBox("emitter", {size : 0.01, width : 0.01, height: 0.01}, scene);

    var starsEmitter = new BABYLON.SphereParticleEmitter();
    starsEmitter.radius = 10;
    starsEmitter.radiusRange = 0;

    starsParticles.emitter = stars;
    starsParticles.particleEmitterType = starsEmitter;
    starsParticles.color1 = new BABYLON.Color4(0.898, 0.737, 0.718, 1.0);
    starsParticles.color2 = new BABYLON.Color4(0.584, 0.831, 0.894, 1.0);
    starsParticles.minSize = 0.15;
    starsParticles.maxSize = 0.3;
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

    setActions(fuse1, "/start-game-practice", camera, mainLight, planet_pbr, starsParticles, navigate);
    setActions(fuse2, "/start-game-multiplayer", camera, mainLight, planet_pbr, starsParticles, navigate);
    setActions(fuse3, "/settings", camera, mainLight, planet_pbr, starsParticles, navigate);
    setActions(fuse4, "/pong/solo", camera, mainLight, planet_pbr, starsParticles, navigate);
    CreateDynamicText(scene, new BABYLON.Vector3(0.45, 1.4, 0), new BABYLON.Vector3(Math.PI / 2, Math.PI, 0), "        Practice      ");
    CreateDynamicText(scene, new BABYLON.Vector3(1.15, 0.98, 0), new BABYLON.Vector3(Math.PI / 2, Math.PI, 0), "        Multi   ");
    CreateDynamicText(scene, new BABYLON.Vector3(-0.45, 1.4, 0), new BABYLON.Vector3(Math.PI / 2, Math.PI, 0), "    Solo     ");
    CreateDynamicText(scene, new BABYLON.Vector3(-1.1, 1, 0), new BABYLON.Vector3(Math.PI / 2, Math.PI, 0), "    Options        ");

    const glow = new BABYLON.GlowLayer("glow", scene, {
      mainTextureFixedSize: 1024,
      blurKernelSize:      64
    });
    glow.intensity = 1.4;

    const pipeline = new BABYLON.DefaultRenderingPipeline(
      "defaultPipeline",
      true,
      scene,
      [camera]
    );
    pipeline.bloomEnabled           = true;
    pipeline.fxaaEnabled            = true;
    pipeline.imageProcessingEnabled = true;
    pipeline.bloomThreshold         = 0.3;
    pipeline.bloomWeight            = 0.2;
    pipeline.bloomKernel            = 128;
    pipeline.bloomScale             = 0.8;

    let pulseTime = 0;
    const baseIntensity = 0.1;
    const pulseAmplitude = 0.09;
    const rotationSpeed = 0.003;

    let id = 0;

    /**
     * Spawns a planet of diameter `d` at a random position with distance > 4 from (0,0,0).
     * @param d        Diameter of the planet
     * @param maxDist  Maximum radial distance for placement (default: 50)
     */
    const generate_planet = (d: number, maxDist: number = 50) => {
      const minR = 6 + d / 2; 
      const r = minR + Math.random() * (maxDist - minR);
    
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi   = Math.acos(2 * v - 1);
    
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
    
      const name = `planet_${id++}`;
      const p = BABYLON.MeshBuilder.CreateSphere(name, { diameter: d, segments: 128 }, scene);
      p.position = new BABYLON.Vector3(x, y, z);
      p.rotation = new BABYLON.Vector3(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      p.material = planet_pbr;
    
      return p;
    };

    // for (let i = 0; i < 100; i++) {
    //   const diameter = 0.5 + Math.random() * 0.5;
    //   generate_planet(diameter);
    // }

    scene.onBeforeRenderObservable.add(() => {
      pulseTime += (engine.getDeltaTime() ) / 1000;
      const pulse = Math.sin(pulseTime * 1.8) * pulseAmplitude;
      glow.intensity = baseIntensity + pulse + 0.3;

    });

    engine.runRenderLoop(() => {
      scene.render();
    });
    
    const handleResize = () => { engine.resize(); };
    window.addEventListener("resize", handleResize);

    return () => {
      engine.dispose();
      window.removeEventListener("resize", handleResize);
    };
  
  }, []);

  return (
    <div className="bg-black flex items-center justify-center min-h-screen pt-[0px] relative">
    <div className="absolute top-5 left-5 z-10">
      <button
        onClick={handleLogout}
        className="flex items-center bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
        </svg>
        Log Out
      </button>
    </div>
      <div className="absolute top-5 right-5 z-10">
        <div className="absolute top-1 right-5 z-10">
          <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
            <svg
              className="w-5 h-5 text-white mr-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.48-4.48A7 7 0 1110 3a7 7 0 018.13 9.17z" />
            </svg>
            <input
              type="text"
              maxLength={42}
              placeholder="Rechercher un profil..."
              className="bg-transparent outline-none text-white placeholder-white w-40 sm:w-64"
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && search != "") {
                  handleSearch();
                }
              }}
            />
          </div>
        </div>
      </div>
  
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100vh", outline: "none"}}
      />
    </div>
  );
};

export default BabylonScene;