export default function Home() {
  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>RPIC — API Backend</h1>
      <p>Interface REST disponible sous <code>/api/*</code></p>
      <ul>
        <li><code>POST /api/auth/login</code> — Authentification</li>
        <li><code>GET  /api/triages</code> — Tri des pièces RC/IC</li>
        <li><code>GET  /api/correspondances-set/search?nitg=XXXX</code> — Recherche SET</li>
        <li><code>GET  /api/dashboard</code> — Tableau de bord</li>
      </ul>
    </main>
  );
}
