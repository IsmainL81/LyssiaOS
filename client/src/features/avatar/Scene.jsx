import Camera from "./Camera";
import Lights from "./Lights";
import Ground from "./Ground";
import LyssiaModel from "./LyssiaModel";
import Controls from "./Controls";

export default function Scene() {
  return (
    <>
      <Camera />
      <Lights />
      <Ground />
      <LyssiaModel />
      <Controls />
    </>
  );
}