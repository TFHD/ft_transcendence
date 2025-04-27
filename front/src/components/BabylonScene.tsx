import React from 'react';
import { useEffect, useRef } from "react";
import BABYLON from '../components/babylonImports';
const BabylonScene = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Vector4(0, 0, 0, 1);

    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      Math.PI / 2, Math.PI / 4, 4,
      new BABYLON.Vector3(0, 0, 0), scene
    );
    camera.attachControl(canvasRef.current, true);

    const sphere = BABYLON.MeshBuilder.CreateSphere("planet", { diameter: 2 }, scene);
    sphere.renderingGroupId = 2;

    const blackMaterial = new BABYLON.StandardMaterial("blackMat", scene);
    // blackMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    blackMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    blackMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);
    blackMaterial.ambientColor = new BABYLON.Color3(0, 0, 0);

    // blackMaterial.disableLighting = true;
    
    sphere.material = blackMaterial;
    
    const outlineMesh = sphere.clone("outline");
    outlineMesh.scaling = sphere.scaling.multiplyByFloats(1.02, 1.02, 1.02);
    outlineMesh.renderingGroupId = 1;

    const outlineMat = new BABYLON.StandardMaterial("outlineMat", scene);
    outlineMat.disableLighting = true;
    outlineMat.backFaceCulling = false;
    outlineMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
    outlineMesh.material = outlineMat;
    
    const glow = new BABYLON.GlowLayer("glow", scene);
    glow.intensity = 0.9;
    
    glow.customEmissiveColorSelector = function(mesh, subMesh, material, result) {
      if (mesh.name === "planet") {
        result.set(0, 0, 0, 0);
        return true;
      }
      return false;
    };

    new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 0.5, 0), scene);
    engine.runRenderLoop(() => { scene.render(); });
    const handleResize = () => { engine.resize(); };
    window.addEventListener("resize", handleResize);
    return () => { engine.dispose(); window.removeEventListener("resize", handleResize); };
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