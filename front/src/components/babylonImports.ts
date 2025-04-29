import {
    Control,
    AdvancedDynamicTexture,
    TextBlock,
    Button,
    Rectangle
  } from '@babylonjs/gui'

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
    Color4,
    Vector3,
    Vector4,
    Matrix,
    Quaternion,
    Animation,
    Sound,
    SceneLoader,
    GlowLayer,
    Scalar,
    ArcRotateCameraKeyboardMoveInput,
    ArcRotateCameraPointersInput,
    KeyboardEventTypes,
    DefaultRenderingPipeline,
    ParticleSystem,
    Texture,
    Ray,
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
    Color4: typeof Color4;
    Vector3: typeof Vector3;
    Vector4: typeof Vector4;
    Matrix: typeof Matrix;
    Quaternion: typeof Quaternion;
    Animation: typeof Animation;
    Sound: typeof Sound;
    SceneLoader: typeof SceneLoader;
    GlowLayer: typeof GlowLayer;
    Control: typeof Control;
    AdvancedDynamicTexture: typeof AdvancedDynamicTexture;
    Scalar: typeof Scalar;
    ArcRotateCameraKeyboardMoveInput: typeof ArcRotateCameraKeyboardMoveInput;
    ArcRotateCameraPointersInput: typeof ArcRotateCameraPointersInput;
    KeyboardEventTypes: typeof KeyboardEventTypes;
    DefaultRenderingPipeline: typeof DefaultRenderingPipeline;
    TextBlock: typeof TextBlock;
    Button: typeof Button;
    ParticleSystem: typeof ParticleSystem;
    Texture: typeof Texture;
    Ray: typeof Ray;
    Rectangle: typeof Rectangle;
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
    Color4,
    Vector3,
    Vector4,
    Matrix,
    Quaternion,
    Animation,
    Sound,
    SceneLoader,
    GlowLayer,
    Control,
    AdvancedDynamicTexture,
    Scalar,
    ArcRotateCameraKeyboardMoveInput,
    ArcRotateCameraPointersInput,
    KeyboardEventTypes,
    DefaultRenderingPipeline,
    TextBlock,
    Button,
    ParticleSystem,
    Texture,
    Ray,
    Rectangle
  };
export default BABYLON;