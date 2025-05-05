import BB from './babylonImports';


export const createObjectClickable = (
    folder : string,
    file : string,
    scene : BB.Scene,
    position : BB.Vector3,
    scaling : BB.Vector3,
    rotation : BB.Vector3,
    ) => {
const mesh = BB.SceneLoader.ImportMesh(
    "",
    folder,
    file,
    scene,
    (meshes) => {
      const house = meshes[0];
      house.position = position;
      house.scaling = scaling;
      house.rotation = rotation;
      meshes.forEach((mesh) => {
        if (mesh instanceof BB.Mesh && mesh.material) {
          const mat = mesh.material;
          if (mat instanceof BB.PBRMaterial) {
            mat.albedoColor = new BB.Color3(1, 1, 1);
            mat.metallic = 0.8;
            mat.roughness = 0.5;
          }
        }
      });
    },
    null,
    (scene, message, exception) => {
      console.error("Erreur de chargement de la maison :", message, exception);
    }
  );

  const CUBE = BB.MeshBuilder.CreateBox("registerHouse", {width:0.45, height: 1.1, depth:0.45}, scene);
  CUBE.position = new BB.Vector3(position.x + rotation.x, position.y, position.z);
  CUBE.rotation = rotation;

  const cubeMaterial = new BB.StandardMaterial("cubeMat", scene);
  cubeMaterial.diffuseColor = new BB.Color3(1, 1, 1);
  cubeMaterial.alpha = 0;

  CUBE.material = cubeMaterial;
  CUBE.isPickable = true;
  CUBE.actionManager = new BB.ActionManager(scene);
  return CUBE;
};

export const setActions = (ClickableZone : BABYLON.MeshBuilder,
    navigatePage : string,
    camera : BB.ArcRotateCamera,
    light : BB.HemisphericLight, 
    planet : BB.PBRMaterial,
    starsParticles : BB.ParticleSystem,
    navigate: (path: string) => void
    ) => {
    ClickableZone.actionManager.registerAction(
        new BB.ExecuteCodeAction(
          BB.ActionManager.OnPickTrigger,
          function(evt) {
            if (camera.radius > 2 || camera.target.x != ClickableZone.position.x) {
            const zoomTargetRadius = 2;
            const zoomTargetPosition = ClickableZone.position.clone();
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
              light.intensity -= 10;
              planet._emissiveIntensity -= t * 2;
              
              if (t < 1) requestAnimationFrame(animate3);
              else navigate(navigatePage);
            };
            requestAnimationFrame(animate3);
            starsParticles.dispose();
          }
        }
        )
      );
};

export const CreateDynamicText = (
    scene : BB.ArcRotateCamera,
    position : BB.Vector3,
    rotation : BB.Vector3,
    text : string,
    ) => {

    const textRing = BB.MeshBuilder.CreateCylinder("textRing", {
        diameter: 3,
        height: 0.01,
        tessellation: 128
      }, scene);
  
      textRing.position = position;
      textRing.rotation = rotation;
      const textureSize = 1024;
      const dynamicTexture = new BB.DynamicTexture("dynamicTexture", textureSize, scene, true);
      const ctx = dynamicTexture.getContext();
  
      ctx.clearRect(0, 0, textureSize, textureSize);
  
  
  
      const center = textureSize / 2;
      const radius = 100;
      ctx.font = "bold 36px Arial";
      ctx.fillStyle = "white";
  
      const angleStep = (2 * Math.PI) / text.length;
  
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const angle = i * angleStep - Math.PI / 2;
  
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
  
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillText(char, 0, 0);
        ctx.restore();
      }
      dynamicTexture.update();
      const ringMaterial = new BB.StandardMaterial("ringMat", scene);
      ringMaterial.diffuseTexture = dynamicTexture;
      ringMaterial.diffuseTexture.hasAlpha = true;
      ringMaterial.emissiveColor = new BB.Color3(1, 1, 1);
      ringMaterial.backFaceCulling = false;
  
      textRing.material = ringMaterial;
};
