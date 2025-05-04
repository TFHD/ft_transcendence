import React from 'react';
import { useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import BB from '../components/babylonImports';
const BabylonScene = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Engine and Scene declarations
    const engine = new BB.Engine(canvasRef.current, true);
    const scene = new BB.Scene(engine);

    // Black background, fades with the black css background
    scene.clearColor = new BB.Color4(0.0, 0.0, 0.0, 1.0);

    // Camera control
    const camera = new BB.ArcRotateCamera(
      "camera",
      Math.PI / 2, Math.PI / 4, 4,
      new BB.Vector3(0, 0, 0), scene
    );
    camera.attachControl(canvasRef.current, true);
    camera.lowerRadiusLimit = 1.7;
    camera.upperRadiusLimit = 6;
    camera.lowerBetaLimit = 0;
    camera.upperBetaLimit = Math.PI;
    camera.angularSensibilityX = 4000;
    camera.angularSensibilityY = 4000;
    camera.inertia = 0.9;

    // disable lateral movement
    camera.inputs.attached.pointers.buttons = [0];

    const CUBE = BB.MeshBuilder.CreateBox("registerHouse", {width:0.5, height:0.5, depth:0.5}, scene);
    CUBE.position = new BB.Vector3(0, 0.9, 0);

    const cubeMaterial = new BB.StandardMaterial("cubeMat", scene);
    cubeMaterial.diffuseColor = new BB.Color3(1, 1, 1);

    CUBE.material = cubeMaterial;
    CUBE.isPickable = true;
    CUBE.actionManager = new BB.ActionManager(scene);

    CUBE.actionManager.registerAction(
      new BB.InterpolateValueAction(
              BB.ActionManager.OnPointerOverTrigger,
              CUBE.material,
              "diffuseColor",
            BB.Color3.Red(),
            100
        )
    );
    CUBE.actionManager.registerAction(
      new BB.InterpolateValueAction(
          BB.ActionManager.OnPointerOutTrigger,
          CUBE.material,
          "diffuseColor",
          BB.Color3.White(),
          100
      )
    );

    CUBE.actionManager.registerAction(
      new BB.ExecuteCodeAction(
        BB.ActionManager.OnPickTrigger,
        function(evt) {
          if (camera.radius > 2) {
          const zoomTargetRadius = 2;
          const zoomTargetPosition = CUBE.position.clone();
          const duration = 500;
          const startTarget = camera.target.clone();
          const startRadius = camera.radius;
          let startTime = performance.now();
    
          const animate = (now: number) => {

            const t = Math.min((now - startTime) / duration, 1);
            camera.target = BB.Vector3.Lerp(startTarget, zoomTargetPosition, t);
            if (t < 1) requestAnimationFrame(animate);
            else { startTime = performance.now(); requestAnimationFrame(animate2); }
          };

          const animate2 = (now: number) => {

            const t = Math.min((now - startTime) / duration, 1);
            camera.radius = startRadius + (zoomTargetRadius - startRadius) * t;
            if (t < 1) requestAnimationFrame(animate2);
          };
    
          requestAnimationFrame(animate);
        } else {

          const duration = 100;
          let startTime = performance.now();
          const animate3 = (now: number) => {

            const t = Math.min((now - startTime) / duration, 1);
            mainLight.intensity -= t * 2;
            planet_pbr._emissiveIntensity -= t * 2;
            
            if (t < 1) requestAnimationFrame(animate3);
            else navigate("/pong");
          };
          requestAnimationFrame(animate3);
          starsParticles.dispose();
        }
      }
      )
    );

    const planet = BB.MeshBuilder.CreateSphere("planet", { diameter: 2, segments: 128 }, scene);
    // planet.renderingGroupId = 2;

    const planet_pbr = new BB.PBRMaterial("planet.pbr", scene);
    
    planet_pbr.albedoTexture = new BB.Texture("../../assets/albedo_veins.png", scene);
    planet_pbr.emissiveTexture = new BB.Texture("../../assets/emissive_veins.png", scene);
    planet_pbr.metallicTexture = new BB.Texture("../../assets/metallic.png", scene);
    planet_pbr.emissiveColor = new BB.Color3(1, 1, 1); // White glow
    planet_pbr.emissiveIntensity = 0.8;
    planet.material = planet_pbr;

    var starsParticles = new BB.ParticleSystem("starsParticles", 500, scene);
    starsParticles.particleTexture = new BB.Texture("https://raw.githubusercontent.com/PatrickRyanMS/BabylonJStextures/master/ParticleSystems/Sun/T_Star.png", scene);

    var stars = BB.MeshBuilder.CreateBox("emitter", {size : 0.01, width : 0.01, height: 0.01}, scene);

    var starsEmitter = new BB.SphereParticleEmitter();
    starsEmitter.radius = 10;
    starsEmitter.radiusRange = 0; // emit only from shape surface

    starsParticles.emitter = stars; // the starting object, the emitter
    starsParticles.particleEmitterType = starsEmitter;
    starsParticles.color1 = new BB.Color4(0.898, 0.737, 0.718, 1.0);
    starsParticles.color2 = new BB.Color4(0.584, 0.831, 0.894, 1.0);
    starsParticles.minSize = 0.15;
    starsParticles.maxSize = 0.3;
    starsParticles.minLifeTime = 99999;
    starsParticles.maxLifeTime = 99999;
    starsParticles.manualEmitCount = 500;
    starsParticles.maxEmitPower = 0.0;
    starsParticles.blendMode = BB.ParticleSystem.BLENDMODE_STANDARD;
    starsParticles.gravity = new BB.Vector3(0, 0, 0);
    starsParticles.minAngularSpeed = 0.0;
    starsParticles.maxAngularSpeed = 0.0;
    starsParticles.minEmitPower = 0.0;
    starsParticles.maxAngularSpeed = 0.0;
    starsParticles.isBillboardBased = true;
    starsParticles.renderingGroupId = 0;
    starsParticles.start();

    const mainLight = new BB.HemisphericLight("mainLight", new BB.Vector3(-1, 1, 0), scene);
    mainLight.intensity = 0.8;

    const glow = new BB.GlowLayer("glow", scene, {
      mainTextureFixedSize: 1024,
      blurKernelSize:      64
    });
    glow.intensity = 1.4;

    const pipeline = new BB.DefaultRenderingPipeline(
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
    const pulseAmplitude = 0.09;  // Original: 0.05
    const rotationSpeed = 0.003;  // Original: 0.002

    let id = 0;

    /**
     * Spawns a planet of diameter `d` at a random position with distance > 4 from (0,0,0).
     * @param d        Diameter of the planet
     * @param maxDist  Maximum radial distance for placement (default: 50)
     */
    const generate_planet = (d: number, maxDist: number = 50) => {
      // 1. Pick a random radius r in [minR, maxDist]
      const minR = 6 + d / 2; 
      const r = minR + Math.random() * (maxDist - minR);
    
      // 2. Uniform direction on sphere
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;             // azimuth
      const phi   = Math.acos(2 * v - 1);         // inclination
    
      // 3. Convert spherical → Cartesian
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
    
      // 4. Create and position the sphere
      const name = `planet_${id++}`;
      const p = BB.MeshBuilder.CreateSphere(name, { diameter: d, segments: 128 }, scene);
      p.position = new BB.Vector3(x, y, z);
      p.rotation = new BB.Vector3(
        Math.random() * Math.PI * 2,   // random yaw
        Math.random() * Math.PI * 2,   // random pitch
        Math.random() * Math.PI * 2    // random roll
      );

      p.material = planet_pbr;
    
      return p;
    };

    for (let i = 0; i < 100; i++) {
      const diameter = 0.5 + Math.random() * 0.5; // between 0.5 and 2.5
      generate_planet(diameter);
    }

    scene.onBeforeRenderObservable.add(() => {
      // Calculate pulse using sine wave
      pulseTime += (engine.getDeltaTime() ) / 1000;
      const pulse = Math.sin(pulseTime * 1.8) * pulseAmplitude;
      
      // Apply to both emissive intensity and bloom
      glow.intensity = baseIntensity + pulse + 0.3;
      // pipeline.bloomWeight = 0.2 + (pulse * 2);

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
    <div className="bg-black flex items-center justify-center min-h-screen pt-[0px]">
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100vh", outline: "none"}}
      />
    </div>
  );
};

export default BabylonScene;