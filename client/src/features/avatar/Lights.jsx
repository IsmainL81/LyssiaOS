export default function Lights() {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight
        position={[3, 5, 3]}
        intensity={2}
        castShadow
      />
    </>
  );
}