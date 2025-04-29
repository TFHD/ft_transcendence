// Scene and main camera setup

/*
const engine = new BB.Engine(canvasRef.current, true);
const scene = new BB.Scene(engine);
scene.clearColor = new BB.Vector4(0, 0, 0, 1);

const camera = new BB.ArcRotateCamera(
  "camera",
  Math.PI / 2, Math.PI / 4, 4,
  new BB.Vector3(0, 0, 0), scene
);
camera.attachControl(canvasRef.current, true);
camera.lowerRadiusLimit = 10;
camera.upperRadiusLimit = 10;
camera.lowerBetaLimit = Math.PI / 2 - 0.2;
camera.upperBetaLimit = Math.PI / 2 + 0.2;
camera.angularSensibilityX = 1500;
camera.inertia = 0.9;
camera.useAutoRotationBehavior = true;
*/

    /*
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
    haloMesh.layerMask = 0x1;

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
*/