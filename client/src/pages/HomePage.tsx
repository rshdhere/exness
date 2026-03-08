import { Link } from "react-router-dom";

import { Navbar } from "../components/Navbar";

export function HomePage() {
  return (
    <div className="page-shell">
      <Navbar />

      <main className="home-hero">
        <p className="kicker">Simple crypto simulator</p>
        <h1>Trade smarter with live market data.</h1>
        <p className="muted-text">
          Use the lightweight chart, watch bid/ask updates in real time, and place
          test orders from one screen.
        </p>

        <div className="hero-actions">
          <Link to="/signup" className="btn btn-primary">
            Create account
          </Link>
          <Link to="/signin" className="btn btn-secondary">
            Sign in
          </Link>
        </div>
      </main>
    </div>
  );
}
