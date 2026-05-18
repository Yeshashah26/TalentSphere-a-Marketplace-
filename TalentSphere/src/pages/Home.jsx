import { Link } from 'react-router-dom';
import { ArrowRight, Search, Shield, Zap, Globe, Star, Users } from 'lucide-react';
import PublicNav from '../components/PublicNav';
import './Home.css';

const stats = [
  { value: '10,000+', label: 'ELITE PROFESSIONALS' },
  { value: '500+', label: 'PARTNER ENTERPRISES' },
  { value: '2,500+', label: 'CURATED OPPORTUNITIES' },
  { value: '1,200+', label: 'SUCCESSFUL HIRES' },
];

const features = [
  { icon: Search, title: 'AI-Driven Matchmaking', desc: 'Smart algorithms connect the right talent with the right roles instantly.' },
  { icon: Shield, title: 'Enterprise-Grade Privacy', desc: 'Your data is protected with industry-leading security standards.' },
  { icon: Zap, title: 'Lightning-Fast Hiring', desc: 'Streamlined workflows reduce time-to-hire dramatically.' },
  { icon: Globe, title: 'Global Talent Pool', desc: 'Access professionals and companies from around the world.' },
];

export default function Home() {
  return (
    <div className="starry-bg home-page">
      <PublicNav />
      <section className="hero">
        <div className="container hero-inner">
          <span className="hero-badge"><Star size={14} /> THE ULTIMATE TALENT ECOSYSTEM</span>
          <h1>Where Talent <span className="gradient-text">Meets Opportunity</span></h1>
          <p className="hero-sub">
            An exclusive, dynamic marketplace seamlessly connecting visionary professionals
            with industry-defining organizations.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary">Explore Roles <ArrowRight size={18} /></Link>
            <Link to="/register?role=company" className="btn btn-ghost"><Users size={18} /> Hire Top Talent</Link>
          </div>
        </div>
      </section>
      <section className="stats-section container">
        {stats.map((s) => (
          <div key={s.label} className="stat-item">
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </section>
      <section className="features-section container">
        <h2>Engineered for excellence</h2>
        <p className="section-sub">Powerful tools designed to transform how talent and opportunity connect.</p>
        <div className="features-grid">
          {features.map((f) => (
            <article key={f.title} className="feature-card card">
              <f.icon size={22} className="feature-icon" />
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="container cta-banner">
        <div className="cta-inner">
          <div>
            <h2>Accelerate your journey.</h2>
            <p>Join a curated network of professionals and leading enterprises. Your next big leap forward starts right here.</p>
          </div>
          <Link to="/register" className="btn btn-white">Start Now <ArrowRight size={18} /></Link>
        </div>
      </section>
      <footer className="home-footer container">
        <span>TalentSphere.</span>
        <span>© 2024 TalentSphere Inc. All rights reserved.</span>
      </footer>
    </div>
  );
}
