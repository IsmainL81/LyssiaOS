import { OrbitControls } from "@react-three/drei";

export default function Controls() {
  return (
    <OrbitControls
      enablePan={false}
      minDistance={2}
      maxDistance={5}
    />
  );
}