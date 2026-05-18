import { Link } from 'react-router-dom';
import Logo from './Logo';
import './PublicNav.css';

export default function PublicNav() {
  return (
    <header className="public-nav">
      <div className="container public-nav-inner">
        <Logo />
        <nav className="public-nav-links">
          <Link to="/">Home</Link>
          <Link to="/login">Jobs</Link>
          <Link to="/login">Talent</Link>
          <Link to="/login">Pricing</Link>
        </nav>
        <Link to="/register" className="btn btn-white btn-sm">Get Started</Link>
      </div>
    </header>
  );
}
