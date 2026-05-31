//backend/src/app/page.tsx
export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --red:   #b91c1c;
          --red-d: #991b1b;
          --red-l: #fff1f2;
          --red-b: #fecaca;
          --bg:    #f4f2f0;
          --white: #ffffff;
          --ink:   #16110f;
          --ink2:  #3a3633;
          --muted: #6b6560;
          --bord:  #e7e3df;
          --bord2: #d2cdc7;
          --grad:  linear-gradient(120deg, #991b1b 0%, #dc2626 55%, #ef4444 100%);
        }

        html { scroll-behavior: smooth; }
        body {
          font-family: 'DM Sans', sans-serif;
          color: var(--ink);
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
          position: relative;
          background:
            radial-gradient(1100px 620px at 88% -12%, rgba(220,38,38,0.13), transparent 58%),
            radial-gradient(820px 540px at -8% 8%, rgba(220,38,38,0.06), transparent 55%),
            var(--bg);
          background-attachment: fixed;
        }
        /* texture pointillée globale */
        body::before {
          content:''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: radial-gradient(rgba(22,17,15,0.045) 1px, transparent 1px);
          background-size: 22px 22px;
          mask-image: linear-gradient(180deg, transparent, #000 18%, #000 88%, transparent);
        }
        nav, .hero, .main, footer { position: relative; z-index: 1; }

        @keyframes fadeUp { from { opacity:0; transform: translateY(14px); } to { opacity:1; transform: none; } }
        @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        @keyframes caret { 0%,49%{opacity:1;} 50%,100%{opacity:0;} }
        @keyframes float { 0%,100%{ transform: translateY(0); } 50%{ transform: translateY(-9px); } }
        @keyframes sweep { 0%{ transform: translateX(-120%);} 100%{ transform: translateX(120%);} }

        .rise { opacity: 0; animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) forwards; }

        /* ── NAV ─────────────────────────────────────── */
        nav {
          background: rgba(255,255,255,0.78);
          backdrop-filter: saturate(160%) blur(14px);
          -webkit-backdrop-filter: saturate(160%) blur(14px);
          border-bottom: 1px solid var(--bord);
          height: 60px;
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 0 2.5rem;
          position: sticky; top: 0; z-index: 100;
        }
        .nav-left { display: flex; align-items: center; gap: 1rem; }
        .nav-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.3rem; font-weight: 700;
          color: var(--ink); letter-spacing: 0.07em;
          line-height: 1; position: relative; padding-left: 14px;
        }
        .nav-logo::before {
          content:''; position:absolute; left:0; top:50%; transform: translateY(-50%);
          width: 4px; height: 22px; border-radius: 3px; background: var(--grad);
        }
        .nav-logo small {
          display: block; font-family: 'DM Sans', sans-serif;
          font-size: 0.5rem; font-weight: 500;
          letter-spacing: 0.18em; color: var(--muted);
          text-transform: uppercase; margin-top: 2px;
        }
        .nav-sep { width: 1px; height: 20px; background: var(--bord2); }
        .nav-links { display: flex; }
        .nav-link {
          font-size: 0.8rem; font-weight: 500; color: var(--muted);
          text-decoration: none; padding: 0 1rem; height: 60px;
          display: flex; align-items: center; position: relative;
          transition: color 0.18s;
        }
        .nav-link::after {
          content:''; position:absolute; left:1rem; right:1rem; bottom:14px; height:2px;
          background: var(--grad); border-radius:2px;
          transform: scaleX(0); transform-origin: left; transition: transform 0.22s cubic-bezier(.22,1,.36,1);
        }
        .nav-link:hover { color: var(--ink); }
        .nav-link:hover::after { transform: scaleX(1); }
        .nav-right { display: flex; align-items: center; gap: 12px; }
        .s-pill {
          display: flex; align-items: center; gap: 7px;
          font-size: 0.72rem; color: var(--ink2); font-weight: 500;
        }
        .s-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #16a34a; box-shadow: 0 0 0 0 rgba(22,163,74,0.5);
          animation: blink 2.4s ease-in-out infinite;
        }
        .nav-v {
          font-family: 'DM Mono', monospace;
          font-size: 0.66rem; font-weight: 500;
          color: var(--red); background: var(--red-l);
          border: 1px solid var(--red-b);
          padding: 4px 10px; border-radius: 6px;
        }

        /* ── HERO ─────────────────────────────────────── */
        .hero { padding: 3.5rem 2.5rem 2.75rem; }
        .hero-inner {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 1.05fr 0.95fr;
          gap: 3rem; align-items: center;
        }
        .hero-tag {
          display: inline-flex; align-items: center; gap: 9px;
          font-size: 0.66rem; font-weight: 600;
          color: var(--red); letter-spacing: 0.16em;
          text-transform: uppercase; margin-bottom: 1.1rem;
          animation-delay: 0.02s;
        }
        .hero-tag::before {
          content:''; width: 26px; height: 2px; background: var(--grad); border-radius: 1px;
        }
        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.4rem, 4.6vw, 3.7rem);
          font-weight: 700; line-height: 1.02;
          color: var(--ink); margin-bottom: 1.1rem;
          letter-spacing: -0.015em; animation-delay: 0.08s;
        }
        .hero-title .accent {
          background: var(--grad);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
          font-style: italic;
        }
        .hero-desc {
          font-size: 0.95rem; font-weight: 300;
          color: var(--ink2); line-height: 1.75;
          max-width: 460px; margin-bottom: 1.7rem; animation-delay: 0.14s;
        }
        .hero-btns { display: flex; gap: 10px; flex-wrap: wrap; animation-delay: 0.2s; }
        .btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 11px 22px; border-radius: 9px;
          font-size: 0.82rem; font-weight: 600;
          text-decoration: none; border: none; cursor: pointer;
          transition: transform 0.18s cubic-bezier(.22,1,.36,1), box-shadow 0.18s, background 0.18s, color 0.18s, border-color 0.18s;
        }
        .btn-red {
          background: var(--grad); color: white;
          box-shadow: 0 8px 22px -8px rgba(185,28,28,0.55);
        }
        .btn-red:hover { transform: translateY(-2px); box-shadow: 0 14px 30px -10px rgba(185,28,28,0.6); }
        .btn-ghost {
          background: rgba(255,255,255,0.7); color: var(--ink2);
          border: 1px solid var(--bord2); backdrop-filter: blur(6px);
        }
        .btn-ghost:hover { border-color: var(--red); color: var(--red); transform: translateY(-2px); }

        /* STATS strip */
        .stats {
          display: grid; grid-template-columns: repeat(6, 1fr);
          margin-top: 2.25rem;
          border: 1px solid var(--bord);
          border-radius: 14px; overflow: hidden;
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(8px);
          box-shadow: 0 18px 40px -28px rgba(22,17,15,0.35);
          animation-delay: 0.26s;
        }
        .st {
          padding: 16px 14px; text-align: center;
          border-right: 1px solid var(--bord);
          transition: background 0.16s;
        }
        .st:last-child { border-right: none; }
        .st:hover { background: rgba(255,241,242,0.7); }
        .st-n {
          display: block; font-family: 'DM Mono', monospace;
          font-size: 1.5rem; font-weight: 500;
          background: var(--grad); -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; margin-bottom: 4px;
        }
        .st-l {
          font-size: 0.56rem; font-weight: 600; color: var(--muted);
          text-transform: uppercase; letter-spacing: 0.1em;
        }

        /* HERO live card */
        .hero-visual { animation-delay: 0.18s; }
        .live {
          position: relative;
          background: rgba(255,255,255,0.72);
          backdrop-filter: saturate(160%) blur(16px);
          border: 1px solid var(--bord);
          border-radius: 18px; overflow: hidden;
          box-shadow: 0 40px 80px -40px rgba(22,17,15,0.45), 0 4px 14px -6px rgba(22,17,15,0.12);
          animation: float 7s ease-in-out infinite;
        }
        .live::after {
          content:''; position:absolute; top:0; left:0; width:35%; height:100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent);
          animation: sweep 6.5s ease-in-out infinite; pointer-events:none;
        }
        .live-bar {
          display: flex; align-items: center; gap: 6px;
          padding: 11px 16px; background: rgba(244,242,240,0.85);
          border-bottom: 1px solid var(--bord);
        }
        .cd { width: 10px; height: 10px; border-radius: 50%; }
        .cr{background:#ff5f57;} .ca{background:#febc2e;} .cg{background:#28c840;}
        .live-url {
          font-family: 'DM Mono', monospace; font-size: 0.66rem;
          color: var(--muted); margin-left: 8px; letter-spacing: 0.04em;
        }
        .live-body { padding: 18px 20px; }
        .live-req {
          display: flex; align-items: center; gap: 9px; margin-bottom: 14px;
          font-family: 'DM Mono', monospace; font-size: 0.74rem;
        }
        .live-m {
          background:#dcfce7; color:#166534; font-weight:500;
          padding: 3px 8px; border-radius: 5px; font-size: 0.62rem; letter-spacing: 0.05em;
        }
        .live-path { color: var(--ink2); }
        .live-200 {
          margin-left: auto; font-family:'DM Mono',monospace; font-size:0.62rem;
          color:#16a34a; background:#dcfce7; border:1px solid #bbf7d0;
          padding: 3px 9px; border-radius: 20px; display:flex; align-items:center; gap:5px;
        }
        .live-200 i { width:6px; height:6px; border-radius:50%; background:#16a34a; display:inline-block; }
        .live-json {
          font-family: 'DM Mono', monospace; font-size: 0.74rem; line-height: 1.95;
          background: #faf8f6; border: 1px solid var(--bord);
          border-radius: 10px; padding: 14px 16px; color: var(--ink2);
        }
        .ck { color:#1e40af; } .cs { color:#16a34a; } .cn { color:var(--red); } .cp { color:var(--muted); }
        .caret { display:inline-block; width:7px; height:1em; background:var(--red); vertical-align:-2px; margin-left:2px; animation: caret 1.1s steps(1) infinite; border-radius:1px; }
        .live-foot {
          display:flex; gap:8px; margin-top:14px;
        }
        .chip {
          font-family:'DM Mono',monospace; font-size:0.62rem; color:var(--ink2);
          background: rgba(244,242,240,0.9); border:1px solid var(--bord2);
          padding: 5px 11px; border-radius: 20px;
        }

        /* ── MAIN GRID ────────────────────────────────── */
        .main {
          max-width: 1200px; margin: 0 auto;
          padding: 1rem 2.5rem 4.5rem;
          display: grid; grid-template-columns: 1fr 330px;
          gap: 1.75rem; align-items: start;
        }

        .sh {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 0.85rem;
        }
        .sh-title {
          font-size: 0.66rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.13em; color: var(--ink2);
          display: flex; align-items: center; gap: 8px;
        }
        .sh-title::before {
          content:''; width: 4px; height: 14px; background: var(--grad); border-radius: 2px;
        }
        .sh-count {
          font-family: 'DM Mono', monospace; font-size: 0.63rem; color: var(--muted);
          background: rgba(255,255,255,0.6); border: 1px solid var(--bord);
          padding: 3px 9px; border-radius: 20px;
        }

        /* ENDPOINTS */
        .ep-box {
          background: rgba(255,255,255,0.7); backdrop-filter: blur(8px);
          border: 1px solid var(--bord); border-radius: 14px; overflow: hidden;
          margin-bottom: 1.75rem; box-shadow: 0 18px 40px -30px rgba(22,17,15,0.35);
        }
        .ep-row {
          display: grid; grid-template-columns: 56px 1fr auto;
          align-items: center; gap: 12px;
          padding: 11px 16px; border-bottom: 1px solid var(--bord);
          position: relative; transition: background 0.14s, padding-left 0.18s;
        }
        .ep-row::before {
          content:''; position:absolute; left:0; top:0; bottom:0; width:3px;
          background: var(--grad); transform: scaleY(0); transform-origin: top;
          transition: transform 0.2s cubic-bezier(.22,1,.36,1);
        }
        .ep-row:last-child { border-bottom: none; }
        .ep-row:hover { background: rgba(255,241,242,0.55); padding-left: 22px; }
        .ep-row:hover::before { transform: scaleY(1); }
        .m {
          font-family: 'DM Mono', monospace; font-size: 0.58rem; font-weight: 500;
          padding: 3px 0; border-radius: 5px; text-align: center; letter-spacing: 0.06em;
        }
        .mg { background:#dcfce7; color:#166534; }
        .mp { background:#dbeafe; color:#1e40af; }
        .ep-path {
          font-family: 'DM Mono', monospace; font-size: 0.73rem; color: var(--ink2);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ep-label { font-size: 0.75rem; color: var(--muted); white-space: nowrap; }

        /* DOMAINS */
        .dl {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1px;
          background: var(--bord); border: 1px solid var(--bord);
          border-radius: 14px; overflow: hidden;
          box-shadow: 0 18px 40px -30px rgba(22,17,15,0.35);
        }
        .dl-item {
          background: rgba(255,255,255,0.72); padding: 12px 14px;
          display: flex; align-items: center; gap: 11px;
          transition: background 0.14s, transform 0.14s;
        }
        .dl-item:hover { background: #fff; transform: translateY(-1px); }
        .dl-ico {
          font-size: 0.95rem; width: 30px; height: 30px;
          display: flex; align-items: center; justify-content: center;
          background: var(--red-l); border: 1px solid var(--red-b);
          border-radius: 8px; flex-shrink: 0;
        }
        .dl-name { font-size: 0.78rem; font-weight: 500; color: var(--ink2); flex:1; }
        .dl-c { font-family:'DM Mono',monospace; font-size:0.62rem; color:var(--muted); }

        /* SIDEBAR */
        .card {
          background: rgba(255,255,255,0.72); backdrop-filter: blur(8px);
          border: 1px solid var(--bord); border-radius: 14px; overflow: hidden;
          margin-bottom: 1.25rem; box-shadow: 0 18px 40px -30px rgba(22,17,15,0.32);
        }
        .ch { padding: 12px 16px; background: rgba(244,242,240,0.7); border-bottom: 1px solid var(--bord); }
        .ch-t {
          font-size: 0.63rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.13em; color: var(--ink2);
          display: flex; align-items: center; gap: 7px;
        }
        .ch-t::before { content:''; width: 4px; height: 12px; background: var(--grad); border-radius: 2px; }
        .cb { padding: 16px; }

        .code-block { background: #faf8f6; border: 1px solid var(--bord); border-radius: 9px; overflow: hidden; font-family: 'DM Mono', monospace; }
        .code-bar { display: flex; align-items: center; padding: 8px 13px; gap: 6px; background: rgba(244,242,240,0.85); border-bottom: 1px solid var(--bord); }
        .code-lbl { font-size: 0.6rem; color: var(--muted); margin-left: 7px; letter-spacing: 0.05em; }
        .code-body { padding: 13px; font-size: 0.73rem; line-height: 2; color: var(--ink2); }

        .ir { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--bord); font-size: 0.78rem; }
        .ir:last-child { border-bottom: none; }
        .ir-k { color: var(--muted); }
        .ir-v { font-family:'DM Mono',monospace; font-size:0.71rem; color:var(--ink); font-weight:500; }
        .ir-v.ok { color: #16a34a; }

        .tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .tag {
          font-family: 'DM Mono', monospace; font-size: 0.63rem; color: var(--ink2);
          background: rgba(244,242,240,0.9); border: 1px solid var(--bord2);
          padding: 4px 10px; border-radius: 7px; transition: border-color 0.14s, color 0.14s;
        }
        .tag:hover { border-color: var(--red); color: var(--red); }

        /* FOOTER */
        footer {
          background: rgba(255,255,255,0.7); backdrop-filter: blur(8px);
          border-top: 1px solid var(--bord); padding: 1.3rem 2.5rem;
          display: flex; align-items: center; justify-content: space-between;
          gap: 1rem; flex-wrap: wrap;
        }
        .f-brand { font-family: 'Cormorant Garamond', serif; font-size: 0.95rem; font-weight: 700; color: var(--ink); }
        .f-brand em { color: var(--red); font-style: normal; }
        .f-copy { font-size: 0.72rem; color: var(--muted); }

        /* RESPONSIVE */
        @media (max-width: 980px) {
          .hero-inner { grid-template-columns: 1fr; gap: 2rem; }
          .hero-visual { order: -1; }
        }
        @media (max-width: 900px) {
          nav { padding: 0 1.5rem; }
          .nav-links { display: none; }
          .hero { padding: 2.5rem 1.5rem 2rem; }
          .main { grid-template-columns: 1fr; padding: 1rem 1.5rem 3rem; }
          .ep-row { grid-template-columns: 56px 1fr; }
          .ep-label { display: none; }
          footer { padding: 1.1rem 1.5rem; }
        }
        @media (max-width: 560px) {
          .stats { grid-template-columns: repeat(3, 1fr); }
          .st:nth-child(3) { border-right: none; }
          .st:nth-child(1), .st:nth-child(2), .st:nth-child(3) { border-bottom: 1px solid var(--bord); }
          .dl { grid-template-columns: 1fr; }
          .hero-title { font-size: clamp(2rem, 9vw, 2.6rem); }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav>
        <div className="nav-left">
          <div className="nav-logo">
            RPIC<small>by Renault Group</small>
          </div>
          <div className="nav-sep"/>
          <div className="nav-links">
            {["Gestion des pièces","Expéditions","Correspondances SET","Administration"].map(l=>(
              <a key={l} href="#" className="nav-link">{l}</a>
            ))}
          </div>
        </div>
        <div className="nav-right">
          <div className="s-pill"><div className="s-dot"/>API opérationnelle</div>
          <span className="nav-v">v1.0.0</span>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="hero">
        <div className="hero-inner">
          {/* gauche */}
          <div>
            <div className="hero-tag rise">Interface REST · Technocentre Renault Guyancourt</div>
            <h1 className="hero-title rise">
              Retour des Pièces<br/>
              <span className="accent">Incidentées</span> &amp; Comex
            </h1>
            <p className="hero-desc rise">
              API REST complète pour la gestion des pièces RC/IC — triages,
              correspondances SET auto-apprises, expéditions, alertes délai et logistique.
            </p>
            <div className="hero-btns rise">
              <a href="/api/health" className="btn btn-red">⚡ Vérifier l&apos;état</a>
              <a href="#api" className="btn btn-ghost">Explorer les endpoints →</a>
            </div>
            <div className="stats rise">
              {([["74","Routes API"],["23","Services"],["18","Validators"],["1 281","Lignes schéma"],["v4.0","Prisma"],["JWT","Auth"]] as [string,string][]).map(([n,l])=>(
                <div key={l} className="st">
                  <span className="st-n">{n}</span>
                  <span className="st-l">{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* droite — carte live */}
          <div className="hero-visual rise">
            <div className="live">
              <div className="live-bar">
                <div className="cd cr"/><div className="cd ca"/><div className="cd cg"/>
                <span className="live-url">rpic.renault.io — terminal</span>
              </div>
              <div className="live-body">
                <div className="live-req">
                  <span className="live-m">GET</span>
                  <span className="live-path">/api/dashboard</span>
                  <span className="live-200"><i/>200 · 12 ms</span>
                </div>
                <div className="live-json">
                  <span className="cp">{"{"}</span><br/>
                  &nbsp;&nbsp;<span className="ck">&quot;triagesEnCours&quot;</span><span className="cp">: </span><span className="cn">128</span><span className="cp">,</span><br/>
                  &nbsp;&nbsp;<span className="ck">&quot;alertesRC&quot;</span><span className="cp">: </span><span className="cn">7</span><span className="cp">,</span><br/>
                  &nbsp;&nbsp;<span className="ck">&quot;expeditionsJour&quot;</span><span className="cp">: </span><span className="cn">34</span><span className="cp">,</span><br/>
                  &nbsp;&nbsp;<span className="ck">&quot;setAutoApprises&quot;</span><span className="cp">: </span><span className="cs">&quot;98.4%&quot;</span><span className="cp">,</span><br/>
                  &nbsp;&nbsp;<span className="ck">&quot;status&quot;</span><span className="cp">: </span><span className="cs">&quot;ok&quot;</span><span className="caret"/><br/>
                  <span className="cp">{"}"}</span>
                </div>
                <div className="live-foot">
                  <span className="chip">temps réel</span>
                  <span className="chip">JWT sécurisé</span>
                  <span className="chip">auto-SET</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="main" id="api">

        {/* col gauche */}
        <div>
          <div className="sh">
            <span className="sh-title">Endpoints principaux</span>
            <span className="sh-count">12 routes</span>
          </div>
          <div className="ep-box">
            {([
              ["POST","/api/auth/login","Authentification JWT"],
              ["POST","/api/auth/refresh","Renouvellement du token"],
              ["GET", "/api/triages","Liste paginée RC/IC"],
              ["POST","/api/triages","Créer un tri — auto-SET"],
              ["GET", "/api/correspondances-set/search?nitg=XXXX","Recherche SET (endpoint central)"],
              ["POST","/api/correspondances-set/:id/confirmer","Confirmer une correspondance"],
              ["GET", "/api/alertes-rc","Alertes délai 7j actives"],
              ["POST","/api/expeditions","Créer expédition DHL/TRANS"],
              ["POST","/api/triages/:id/caffuter","Caffuter une pièce IC"],
              ["POST","/api/retours-expedition","Saisir un retour"],
              ["GET", "/api/dashboard","KPIs temps réel"],
              ["GET", "/api/health","Sonde monitoring"],
            ] as [string,string,string][]).map(([m,p,d])=>(
              <div key={p} className="ep-row">
                <span className={`m ${m==="GET"?"mg":"mp"}`}>{m}</span>
                <code className="ep-path">{p}</code>
                <span className="ep-label">{d}</span>
              </div>
            ))}
          </div>

          <div className="sh">
            <span className="sh-title">Domaines métier</span>
            <span className="sh-count">16 domaines</span>
          </div>
          <div className="dl">
            {([
              ["🔐","Auth","4 routes"],["🔧","Triages RC/IC","6 routes"],
              ["🔍","Correspondances SET","7 routes"],["⚠️","Alertes RC","4 routes"],
              ["📦","Expéditions","4 routes"],["↩️","Retours","4 routes"],
              ["🏭","Réceptions","3 routes"],["🚨","Anomalies","5 routes"],
              ["🗂️","Pièces logistique","3 routes"],["😴","Congés","4 routes"],
              ["👤","Utilisateurs","4 routes"],["📊","Stats & Dashboard","2 routes"],
              ["📬","Notifications","4 routes"],["🛡️","Audit logs","1 route"],
              ["📧","Mail logs","2 routes"],["📄","Mentions légales","4 routes"],
            ] as [string,string,string][]).map(([i,n,c])=>(
              <div key={n} className="dl-item">
                <div className="dl-ico">{i}</div>
                <span className="dl-name">{n}</span>
                <span className="dl-c">{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* sidebar */}
        <div>
          <div className="card">
            <div className="ch"><span className="ch-t">Sonde de santé</span></div>
            <div className="cb">
              <div className="code-block">
                <div className="code-bar">
                  <div className="cd cr"/><div className="cd ca"/><div className="cd cg"/>
                  <span className="code-lbl">GET /api/health — 200 OK</span>
                </div>
                <div className="code-body">
                  <span className="cp">{"{"}</span><br/>
                  &nbsp;&nbsp;<span className="ck">&quot;status&quot;</span><span className="cp">: </span><span className="cs">&quot;ok&quot;</span><span className="cp">,</span><br/>
                  &nbsp;&nbsp;<span className="ck">&quot;db&quot;</span><span className="cp">: {"{"}</span><br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="ck">&quot;latencyMs&quot;</span><span className="cp">: </span><span className="cn">12</span><br/>
                  &nbsp;&nbsp;<span className="cp">{"}"}</span><span className="cp">,</span><br/>
                  &nbsp;&nbsp;<span className="ck">&quot;uptime&quot;</span><span className="cp">: </span><span className="cn">3600</span><br/>
                  <span className="cp">{"}"}</span>
                </div>
              </div>
              <a href="/api/health" className="btn btn-ghost" style={{marginTop:"11px",width:"100%",justifyContent:"center",fontSize:"0.76rem"}}>
                Ouvrir /api/health →
              </a>
            </div>
          </div>

          <div className="card">
            <div className="ch"><span className="ch-t">Informations</span></div>
            <div className="cb">
              {([
                ["Projet","RPIC Renault"],["Version","1.0.0"],
                ["Framework","Next.js 14"],["ORM","Prisma v5"],
                ["Base","PostgreSQL"],["Auth","JWT + Refresh"],
                ["Statut","✓ Opérationnel"],
              ] as [string,string][]).map(([k,v])=>(
                <div key={k} className="ir">
                  <span className="ir-k">{k}</span>
                  <span className={`ir-v${k==="Statut"?" ok":""}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="ch"><span className="ch-t">Stack technique</span></div>
            <div className="cb">
              <div className="tags">
                {["Next.js 14","TypeScript","Prisma 5","PostgreSQL","Neon","JWT","Zod","Bcrypt","Nodemailer","node-cron"].map(t=>(
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer>
        <span className="f-brand">RPIC <em>·</em> by Renault Group</span>
        <span className="f-copy">Technocentre Guyancourt — API REST v1.0.0</span>
        <span className="f-copy">Next.js · Prisma · PostgreSQL</span>
      </footer>
    </>
  );
}