import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

function LyssiaModel() {
  const { scene } = useGLTF("/models/lyssia.glb");

  return (
    <primitive
      object={scene}
      scale={1.4}
      position={[0, -1.2, 0]}
    />
  );
}

export default function Avatar3D() {
  return (
    <Canvas camera={{ position: [0, 1.5, 3] }}>
      <ambientLight intensity={2} />
      <directionalLight position={[5, 5, 5]} intensity={2} />

      <LyssiaModel />

      <OrbitControls />
    </Canvas>
  );
}

useGLTF.preload("/models/lyssia.glb");