import React from 'react';
import { useEffect, useRef } from "react";
import { AdvancedDynamicTexture, TextBlock, Control } from "@babylonjs/gui";
import BB from '../components/babylonImports';
const BabylonScene = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BB.Engine(canvasRef.current, true);
    const scene = new BB.Scene(engine);
    scene.clearColor = new BB.Vector4(0, 0, 0, 1);

    const camera = new BB.ArcRotateCamera(
      "camera",
      Math.PI / 2, Math.PI / 4, 4,
      new BB.Vector3(0, 0, 0), scene
    );
    camera.attachControl(canvasRef.current, true);
    camera.lowerRadiusLimit = 4;
    camera.upperRadiusLimit = 4;
    camera.lowerBetaLimit = Math.PI / 2 - 0.2;
    camera.upperBetaLimit = Math.PI / 2 + 0.2;
    camera.angularSensibilityX = 1500;
    camera.inertia = 0.9;
    camera.useAutoRotationBehavior = true;

    const FIXEDcamera = new BB.ArcRotateCamera(
      "FIXEDcamera",
      Math.PI / 2, Math.PI / 4, 4,
      new BB.Vector3(0, 0, 0), scene
    );
    FIXEDcamera.attachControl(canvasRef.current, true);
    FIXEDcamera.lowerRadiusLimit = 4;
    FIXEDcamera.upperRadiusLimit = 4;
    FIXEDcamera.lowerBetaLimit = Math.PI / 2 - 0.2;
    FIXEDcamera.upperBetaLimit = Math.PI / 2 + 0.2;
    FIXEDcamera.angularSensibilityX = 1500;
    FIXEDcamera.inertia = 0.9;
    FIXEDcamera.useAutoRotationBehavior = true;

    const sphere = BB.MeshBuilder.CreateSphere("planet", { diameter: 2, segments: 64 }, scene);
    sphere.renderingGroupId = 2;
    
    const sphereMaterial = new BB.StandardMaterial("darkMat", scene);
    sphereMaterial.diffuseColor = new BB.Color3(0.1, 0.1, 0.1);
    sphereMaterial.specularColor = new BB.Color3(0.05, 0.05, 0.05);
    sphereMaterial.specularPower = 32;

    sphere.material = sphereMaterial;

    const haloMaterial = new BB.StandardMaterial("haloMat", scene);
    haloMaterial.emissiveColor = new BB.Color3(1, 1, 1);
    haloMaterial.alpha = 0.0;
    haloMaterial.disableLighting = true;
    haloMaterial.backFaceCulling = false;
    
    const haloMesh = BB.MeshBuilder.CreateTorus("halo", {
      diameter: 3.5,
      thickness: 0.06,
      tessellation: 64,
    }, scene);
    haloMesh.material = haloMaterial;
    haloMesh.renderingGroupId = 2;

    const haloMesh2 = BB.MeshBuilder.CreateTorus("halo2", {
      diameter: 2.08,
      thickness: 0.06,
      tessellation: 64,
    }, scene);
    haloMesh2.material = haloMaterial;
    haloMesh2.renderingGroupId = 2;

    const glow = new BB.GlowLayer("glow", scene, {
      mainTextureFixedSize: 1024,
      blurKernelSize: 64
    });
    glow.intensity = 0.7;
    glow.customEmissiveColorSelector = function(mesh, subMesh, material, result) {
      if (mesh.name === "halo") {
        result.set(0, 1, 1, 1);
        return true;
      }
      if (mesh.name === "halo2") {
        result.set(0, 1, 1, 1);
        return true;
      }
      result.set(0.05, 0.05, 0.05, 0.05);
      return true;
    };

    const pipeline = new BB.DefaultRenderingPipeline("defaultPipeline", true, scene, [camera]);
    
    if (pipeline.bloom) {
      pipeline.bloomEnabled = true;
      pipeline.bloomThreshold = 0.3;
      pipeline.bloomWeight = 0.7;
      pipeline.bloomKernel = 128;
      pipeline.bloomScale = 0.1;
    }

    const mainLight = new BB.DirectionalLight("mainLight", new BB.Vector3(0, 0, 1), scene);
    mainLight.intensity = 0.7;

    const gui = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

    const label = new TextBlock();
    label.text = "Transcendence";
    label.color = "white";
    label.fontSize = 48;
    label.top = "-45%";    // you can also use pixels: label.topInPixels = 20;
    label.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    label.verticalAlignment   = Control.VERTICAL_ALIGNMENT_TOP;
    
    gui.addControl(label);

    scene.beforeRender = function() {
      const cameraDirection = camera.getTarget().subtract(camera.position).normalize();
      mainLight.direction = cameraDirection.scale(-1);
      
      camera.alpha += scene.getEngine().getDeltaTime() * 0.0005;

      haloMesh.rotation.x = Math.PI / 2;
      haloMesh2.rotation.x = Math.PI / 3;
    };
    
    engine.runRenderLoop(() => {
      scene.render();
    });
    
    const handleResize = () => {
      engine.resize();
    };
    
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
        style={{ width: "95%", height: "70%" }}
      />
    </div>
  );
};

export default BabylonScene;