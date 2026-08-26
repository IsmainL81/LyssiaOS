import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

function LyssiaModel() {
  const { scene } = useGLTF("/models/lyssia.glb");

  return (
    <primitive
      object={scene}
      position={[0, 0, 0]}
    />
  );
}

export default function Avatar3D() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "calc(100vh - 64px)",
        background:
          "radial-gradient(circle at 50% 30%, #172b43 0%, #0b1220 70%)",
      }}
    >
      <Canvas camera={{ position: [0, 1.5, 3] }}>
        <ambientLight intensity={2} />
        <directionalLight position={[5, 5, 5]} intensity={2} />

        <LyssiaModel />

        <OrbitControls />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/lyssia.glb");