import {
    Engine,
    Scene,
    ArcRotateCamera,
    HemisphericLight,
    DirectionalLight,
    SpotLight,
    PointLight,
    MeshBuilder,
    StandardMaterial,
    Color3,
    Vector3,
    Vector4,
    Matrix,
    Quaternion,
    Animation,
    Sound,
    SceneLoader,
    GlowLayer,
    Texture,
    DefaultRenderingPipeline,
    // Ajoute ici tous les autres imports dont tu as besoin
  } from '@babylonjs/core';

  interface BabylonJS {
    Engine: typeof Engine;
    Scene: typeof Scene;
    ArcRotateCamera: typeof ArcRotateCamera;
    HemisphericLight: typeof HemisphericLight;
    DirectionalLight: typeof DirectionalLight;
    SpotLight: typeof SpotLight;
    PointLight: typeof PointLight;
    MeshBuilder: typeof MeshBuilder;
    StandardMaterial: typeof StandardMaterial;
    Color3: typeof Color3;
    Vector3: typeof Vector3;
    Vector4: typeof Vector4;
    Matrix: typeof Matrix;
    Quaternion: typeof Quaternion;
    Animation: typeof Animation;
    Sound: typeof Sound;
    SceneLoader: typeof SceneLoader;
    GlowLayer: typeof GlowLayer;
    Texture: typeof Texture;
    DefaultRenderingPipeline: typeof DefaultRenderingPipeline;
  }
  
  const BABYLON: BabylonJS = {
    Engine,
    Scene,
    ArcRotateCamera,
    HemisphericLight,
    DirectionalLight,
    SpotLight,
    PointLight,
    MeshBuilder,
    StandardMaterial,
    Color3,
    Vector3,
    Vector4,
    Matrix,
    Quaternion,
    Animation,
    Sound,
    SceneLoader,
    GlowLayer,
    Texture,
    DefaultRenderingPipeline
  };
  
  export default BABYLON;