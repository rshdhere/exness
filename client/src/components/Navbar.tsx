import { Link, NavLink } from "react-router-dom";

type NavbarProps = {
  onLogout?: () => void;
};

export function Navbar({ onLogout }: NavbarProps) {
  return (
    <header className="topbar">
      <Link to="/" className="brand">
        Exness
      </Link>

      <nav className="topbar-nav" aria-label="Main navigation">
        <NavLink to="/" className="topbar-link">
          Home
        </NavLink>
        <NavLink to="/trading" className="topbar-link">
          Trading
        </NavLink>
        {!onLogout ? (
          <>
            <NavLink to="/signin" className="topbar-link">
              Sign in
            </NavLink>
            <NavLink to="/signup" className="topbar-link">
              Sign up
            </NavLink>
          </>
        ) : null}
      </nav>

      {onLogout ? (
        <button type="button" className="btn btn-secondary" onClick={onLogout}>
          Sign out
        </button>
      ) : (
        <span className="status-pill">Guest</span>
      )}
    </header>
  );
}
