import Navbar from "./components/Navbar";
import Avatar3D from "./components/Avatar3D";

function App() {

  return (

    <>

      <Navbar/>

      <div
      style={{
        display:"grid",
        gridTemplateColumns:"60% 40%",
        height:"calc(100vh - 70px)",
        background:"#090d18"
      }}
      >

        <div>

            <Avatar3D/>

        </div>

        <div
        style={{
            color:"white",
            padding:"40px"
        }}
        >

            <h1>Tableau de bord Lyssia</h1>

            <hr/>

            <h3>IA</h3>

            <p>🟢 Connectée</p>

            <h3>Vision</h3>

            <p>🟡 En attente</p>

            <h3>Robot</h3>

            <p>🔴 Déconnecté</p>

        </div>

      </div>

    </>

  );

}

export default App;