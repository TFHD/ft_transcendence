import {
    Engine,
    Scene,
    ArcRotateCamera,
    FreeCamera,
    HemisphericLight,
    DirectionalLight,
    SpotLight,
    PointLight,
    MeshBuilder,
    StandardMaterial,
    Color3,
    Color4,
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
    PBRMaterial,
    FresnelParameters,
    HDRCubeTexture,
    HighlightLayer,
    SSAO2RenderingPipeline,
    ActionManager,
    InterpolateValueAction,
    ExecuteCodeAction,
    // Ajoute ici tous les autres imports dont tu as besoin
  } from '@babylonjs/core';

  interface BabylonJS {
    Engine: typeof Engine;
    Scene: typeof Scene;
    ArcRotateCamera: typeof ArcRotateCamera;
    FreeCamera: typeof FreeCamera;
    HemisphericLight: typeof HemisphericLight;
    DirectionalLight: typeof DirectionalLight;
    SpotLight: typeof SpotLight;
    PointLight: typeof PointLight;
    MeshBuilder: typeof MeshBuilder;
    StandardMaterial: typeof StandardMaterial;
    Color3: typeof Color3;
    Color4: typeof Color4;
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
    PBRMaterial: typeof PBRMaterial;
    FresnelParameters: typeof FresnelParameters;
    HDRCubeTexture: typeof HDRCubeTexture;
    HighlightLayer: typeof HighlightLayer;
    SSAO2RenderingPipeline: typeof SSAO2RenderingPipeline;
    ActionManager: typeof ActionManager;
    InterpolateValueAction: typeof InterpolateValueAction;
    ExecuteCodeAction: typeof ExecuteCodeAction;
  }
  
  const BABYLON: BabylonJS = {
    Engine,
    Scene,
    ArcRotateCamera,
    FreeCamera,
    HemisphericLight,
    DirectionalLight,
    SpotLight,
    PointLight,
    MeshBuilder,
    StandardMaterial,
    Color3,
    Color4,
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
    PBRMaterial,
    FresnelParameters,
    HDRCubeTexture,
    HighlightLayer,
    SSAO2RenderingPipeline,
    ActionManager,
    InterpolateValueAction,
    ExecuteCodeAction,
  };
  
  export default BABYLON;