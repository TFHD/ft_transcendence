import React from 'react';
import { useEffect, useRef } from "react";
import { AdvancedDynamicTexture, TextBlock, Control } from "@babylonjs/gui";
import BB from '../components/babylonImports';
const BabylonScene = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Engine and Scene declarations
    const engine = new BB.Engine(canvasRef.current, true);
    const scene = new BB.Scene(engine);

    // Black background, fades with the black css background
    scene.clearColor = new BB.Vector4(0, 0, 0, 1);

    // Camera control
    const camera = new BB.ArcRotateCamera(
      "camera",
      Math.PI / 2, Math.PI / 4, 4,
      new BB.Vector3(0, 0, 0), scene
    );
    camera.attachControl(canvasRef.current, true);
    camera.lowerRadiusLimit = 6;
    camera.upperRadiusLimit = 6;
    camera.lowerBetaLimit = Math.PI / 2 - (Math.PI / 8);
    camera.upperBetaLimit = Math.PI / 2 + (Math.PI / 8);
    camera.angularSensibilityX = 4000;
    camera.angularSensibilityY = 4000;
    camera.inertia = 0.9;

    const CUBE = BB.MeshBuilder.CreateBox("registerHouse", {width:0.5, height:0.5, depth:0.5}, scene);
    CUBE.position = new BB.Vector3(0, 0.9, 0);



    const cubeMaterial = new BB.StandardMaterial("cubeMat", scene);
    cubeMaterial.diffuseColor = new BB.Color4(1, 1, 1);

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
              console.log("Cube clicked!");
          }
      )
    );

    const planet = BB.MeshBuilder.CreateSphere("planet", { diameter: 2, segments: 128 }, scene);
    // planet.renderingGroupId = 2;

    const planet2 = BB.MeshBuilder.CreateSphere("planet2", { diameter: 1, segments: 128 }, scene);
    // planet2.renderingGroupId = 2;
    planet2.position = new BB.Vector3(10, 0, 0);
    

    const planet_pbr = new BB.PBRMaterial("planet.pbr", scene);
    
    planet_pbr.albedoTexture = new BB.Texture("../../assets/albedo_veins.png", scene);
    planet_pbr.normalTexture = new BB.Texture("../../assets/normal_veins.png", scene);
    planet_pbr.emissiveTexture = new BB.Texture("../../assets/emissive_veins.png", scene);
    planet_pbr.roughnessTexture = new BB.Texture("../../assets/roughness_veins.png", scene);
    planet_pbr.metallicTexture = new BB.Texture("../../assets/metallic.png", scene);
    planet_pbr.emissiveColor = new BB.Color3(1, 1, 1); // White glow
    planet_pbr.emissiveIntensity = 1.5;

    planet.material = planet_pbr;

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

    scene.onBeforeRenderObservable.add(() => {
      // Calculate pulse using sine wave
      pulseTime += (engine.getDeltaTime() ) / 1000;
      const pulse = Math.sin(pulseTime * 1.5) * pulseAmplitude;
      
      // Apply to both emissive intensity and bloom
      planet_pbr.emissiveIntensity = baseIntensity + pulse;
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