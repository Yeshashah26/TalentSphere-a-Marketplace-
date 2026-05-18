import { Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="logo">
      <span className="logo-icon"><Briefcase size={18} /></span>
      <span className="logo-text">TalentSphere</span>
    </Link>
  );
}
