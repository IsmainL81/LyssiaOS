export default function LyssiaModel() {
  return (
    <mesh position={[0, 1, 0]} castShadow>
      <sphereGeometry args={[0.6, 64, 64]} />
      <meshStandardMaterial color="#d9c3a4" />
    </mesh>
  );
}