import "../styles/Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="logo">
        🤖 Lyssia OS V1
      </div>

      <nav>
        <button>Dashboard</button>
        <button>Avatar</button>
        <button>IA</button>
        <button>Robot</button>
        <button>Caméra</button>
        <button>Paramètres</button>
      </nav>
    </header>
  );
}